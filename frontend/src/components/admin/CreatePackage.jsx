import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, IdCard, CheckCircle2, Plus, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createPackage, resetPackageState } from "@/slices/packageSlice";
import { fetchAssessmentsWithVersions } from "@/slices/interpretationSlice";

const MAX_FEATURES = 5;
const MAX_DELIVERABLES = 5;

const formatPrice = (price) =>
  price === "" || price === null || price === undefined || Number.isNaN(Number(price))
    ? "—"
    : `₹${Number(price).toLocaleString("en-IN")}`;

const emptyPackageForm = () => ({
  id: null,
  name: "",
  price: "",
  description: "",
  assessmentVersionId: "",
  features: [""],
  deliverables: [""],
});

// Same grouping used by Package.jsx's version filter — duplicated here so
// this file works standalone at /s-admin/create-package without depending
// on Package.jsx being mounted.
const buildAssessmentGroups = (assessments) => {
  if (!Array.isArray(assessments)) return [];

  return assessments.map((assessment) => ({
    id: String(assessment.public_id ?? assessment.id),
    name: assessment.assessment_name ?? "Assessment",
    versions: (Array.isArray(assessment.versions) ? assessment.versions : []).map((version) => ({
      id: String(version.id),
      version_number: version.version_number,
      version_name: version.version_name,
      section_count: version.section_count,
    })),
  }));
};

// ---- Shared bits -----------------------------------------------------------

const SectionCard = ({ icon: Icon, title, statusBadge, children }) => (
  <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {statusBadge}
    </div>
    {children}
  </div>
);

const FieldLabel = ({ children }) => (
  <Label className="mb-2 block text-sm font-semibold text-slate-700">{children}</Label>
);

// Editable list used for both Features and Deliverables — an input per row
// with a detached trash button, plus an "add" affordance while under the cap.
const EditableList = ({ label, items, max, readOnly, onChange, onAdd, onRemove, placeholder }) => (
  <div>
    <div className="mb-2 flex items-center justify-between">
      <FieldLabel>{label}</FieldLabel>
      <span className={adminTheme.card.subtitle}>
        {items.filter(Boolean).length}/{max}
      </span>
    </div>

    <div className="space-y-3">
      {items.map((value, index) => (
        <div key={index} className="flex items-center gap-3">
          <Input
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={placeholder}
            className={cn(
              "h-11 flex-1 rounded-lg text-sm",
              adminTheme.border.default,
              readOnly && "bg-slate-50 text-slate-500"
            )}
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={items.length === 1}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition",
                adminTheme.border.default,
                "bg-slate-50 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
              )}
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>

    {!readOnly && items.length < max && (
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        <Plus className="h-3.5 w-3.5" />
        Add {label.toLowerCase().replace(/s$/, "")}
      </button>
    )}
  </div>
);

// Grouped assessment-version select — a single native <select> with
// <optgroup> per assessment, styled to read like a bordered field rather
// than a browser-default dropdown.
const AssessmentVersionSelect = ({ value, onChange, groups, loading, readOnly }) => {
  const selectedLabel = useMemo(() => {
    for (const group of groups) {
      const match = group.versions.find((v) => v.id === value);
      if (match) {
        return [group.name, match.version_number, match.version_name].filter(Boolean).join(" · ");
      }
    }
    return "";
  }, [groups, value]);

  if (readOnly) {
    return (
      <div
        className={cn(
          "w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-700",
          adminTheme.border.default,
          "bg-slate-50"
        )}
      >
        {selectedLabel || "—"}
      </div>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={cn(
        "w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900",
        adminTheme.border.default,
        "focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900/10",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      <option value="" disabled>
        {loading ? "Loading assessments…" : "Select an assessment version"}
      </option>
      {groups.map((group) => (
        <optgroup key={group.id} label={group.name}>
          {group.versions.map((version) => (
            <option key={version.id} value={version.id}>
              {[version.version_number, version.version_name].filter(Boolean).join(" · ") ||
                "Version"}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

// ---- Success dialog ---------------------------------------------------------

export const PackagePublishedDialog = ({ open, mode, summary, onBackToList, onViewDetails }) => {
  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onBackToList()}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-xl">
        <div className="px-6 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {mode === "edit" ? "Package Successfully Updated" : "Package Successfully Published"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            &quot;{summary.name}&quot; is now live and available for enrollment.
          </p>

          <div className={cn("mt-5 rounded-xl border p-4 text-left", adminTheme.border.default, adminTheme.surface.subtle)}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Summary
            </p>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Package Name</dt>
                <dd className="font-semibold text-slate-900">{summary.name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Default Price</dt>
                <dd className="font-bold text-emerald-600">{formatPrice(summary.price)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    LIVE
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-lg border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onBackToList}
            >
              Back to List
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---- Page -------------------------------------------------------------------

/**
 * Works two ways:
 *
 * 1. STANDALONE — mounted at the /s-admin/create-package route with no
 *    props (see App.jsx). Manages its own form state, fetches assessment
 *    versions, dispatches createPackage itself, and navigates back to
 *    /s-admin/packages when done.
 *
 * 2. CONTROLLED — rendered by Package.jsx for Edit/View, driven entirely by
 *    props (form, setForm, onSave, onBack, mode, loading, assessmentGroups,
 *    versionsLoading) exactly like the old AddPackageModal/PackageFormPage.
 *
 * Which mode it's in is inferred from whether `form` was passed as a prop.
 */
const CreatePackage = (props) => {
  const isControlled = props.form !== undefined;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading: reduxLoading, success, error } = useSelector((state) => state.package);
  const { assessments, assessmentsLoading } = useSelector((state) => state.interpretation);

  const [localForm, setLocalForm] = useState(emptyPackageForm);
  const [localMode, setLocalMode] = useState("create"); // flips to "view" after a standalone publish
  const [publishedSummary, setPublishedSummary] = useState(null);

  const internalAssessmentGroups = useMemo(() => buildAssessmentGroups(assessments), [assessments]);

  const form = isControlled ? props.form : localForm;
  const setForm = isControlled ? props.setForm : setLocalForm;
  const mode = isControlled ? props.mode ?? "create" : localMode;
  const loading = isControlled ? props.loading : reduxLoading;
  const assessmentGroups = isControlled ? props.assessmentGroups : internalAssessmentGroups;
  const versionsLoading = isControlled ? props.versionsLoading : assessmentsLoading;

  const readOnly = mode === "view";
  const isEdit = mode === "edit";

  // Standalone only: fetch assessment versions and clear any stale
  // create/update flags left over from a previous visit.
  useEffect(() => {
    if (isControlled) return;
    dispatch(fetchAssessmentsWithVersions());
    dispatch(resetPackageState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled]);

  const handleBack = useCallback(() => {
    if (isControlled) {
      props.onBack?.();
      return;
    }
    navigate("/s-admin/packages");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, props.onBack, navigate]);

  const handleSave = useCallback(() => {
    if (isControlled) {
      props.onSave?.();
      return;
    }

    const cleanFeatures = form.features.map((f) => f.trim()).filter(Boolean);
    const cleanDeliverables = form.deliverables.map((d) => d.trim()).filter(Boolean);

    const featureFields = {};
    for (let i = 0; i < MAX_FEATURES; i += 1) {
      featureFields[`package_features${i + 1}`] = cleanFeatures[i] ?? "";
    }
    const deliverableFields = {};
    for (let i = 0; i < MAX_DELIVERABLES; i += 1) {
      deliverableFields[`package_deliverable${i + 1}`] = cleanDeliverables[i] ?? "";
    }

    dispatch(
      createPackage({
        package_name: form.name.trim(),
        package_price: Number(form.price),
        assessment_version: Number(form.assessmentVersionId),
        package_description: form.description?.trim() || "",
        ...featureFields,
        ...deliverableFields,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, form, dispatch]);

  // Standalone only: once createPackage succeeds, snapshot what was
  // published (for the summary dialog) and reset the redux flag. Controlled
  // mode leaves success handling to Package.jsx.
  useEffect(() => {
    if (isControlled || !success) return;
    setPublishedSummary({ name: form.name, price: form.price });
    dispatch(resetPackageState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, success, dispatch]);

  const updateField = useCallback(
    (field, value) => setForm((prev) => ({ ...prev, [field]: value })),
    [setForm]
  );

  const updateListItem = useCallback(
    (key) => (index, value) =>
      setForm((prev) => {
        const next = [...prev[key]];
        next[index] = value;
        return { ...prev, [key]: next };
      }),
    [setForm]
  );

  const addListItem = useCallback(
    (key, max) => () =>
      setForm((prev) => (prev[key].length >= max ? prev : { ...prev, [key]: [...prev[key], ""] })),
    [setForm]
  );

  const removeListItem = useCallback(
    (key) => (index) =>
      setForm((prev) => {
        if (prev[key].length === 1) return prev;
        return { ...prev, [key]: prev[key].filter((_, i) => i !== index) };
      }),
    [setForm]
  );

  const canSave =
    !readOnly &&
    form.name.trim().length > 0 &&
    form.price !== "" &&
    !Number.isNaN(Number(form.price)) &&
    Boolean(form.assessmentVersionId);

  return (
    <div className={cn("min-h-screen", adminTheme.surface.page)}>
      {/* Sticky top bar — breadcrumb + primary actions */}
      <div className={cn("sticky top-0 z-20 border-b bg-white", adminTheme.border.default)}>
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-3 py-4 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-slate-50",
                adminTheme.border.default
              )}
              aria-label="Back to packages"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500" />
            </button>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">Packages</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900">
                {mode === "create"
                  ? "Create Package"
                  : `${mode === "view" ? "View" : "Edit"}: ${form.name || "Untitled Package"}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-9 rounded-lg border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Discard Changes
              </Button>
            )}
            {!readOnly && (
              <Button
                type="button"
                onClick={handleSave}
                disabled={!canSave || loading}
                className="h-9 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving…" : isEdit ? "Save & Update" : "Publish Package"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1100px] space-y-5 px-3 py-6 sm:px-4 lg:px-6">
        {isEdit && (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-sm text-indigo-700">
              <span className="font-bold">Editing an existing package.</span> Changes here update
              the live listing; price adjustments only apply to new enrollments.
            </p>
          </div>
        )}

        {!isControlled && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {typeof error === "string" ? error : "Something went wrong while saving this package."}
          </div>
        )}

        <SectionCard
          icon={IdCard}
          title="Basic Information"
          statusBadge={
            form.status ? (
              <span className={adminTheme.badge.positive}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {form.status}
              </span>
            ) : null
          }
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Package Name</FieldLabel>
              <Input
                value={form.name}
                readOnly={readOnly}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. University Prep Pro"
                className={cn(
                  "h-11 rounded-lg text-sm",
                  adminTheme.border.default,
                  readOnly && "bg-slate-50 text-slate-500"
                )}
              />
            </div>

            <div>
              <FieldLabel>Default Price (INR)</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  readOnly={readOnly}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="0"
                  className={cn(
                    "h-11 rounded-lg pl-7 text-sm",
                    adminTheme.border.default,
                    readOnly && "bg-slate-50 text-slate-500"
                  )}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <FieldLabel>Primary Assessment</FieldLabel>
              <AssessmentVersionSelect
                value={form.assessmentVersionId}
                onChange={(value) => updateField("assessmentVersionId", value)}
                groups={assessmentGroups}
                loading={versionsLoading}
                readOnly={readOnly}
              />
            </div>

            <div className="sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={form.description}
                readOnly={readOnly}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Short description shown to students on the package listing…"
                rows={3}
                className={cn(
                  "rounded-lg text-sm",
                  adminTheme.border.default,
                  readOnly && "bg-slate-50 text-slate-500"
                )}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={CheckCircle2} title="Features & Deliverables">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <EditableList
              label="Included Features"
              items={form.features}
              max={MAX_FEATURES}
              readOnly={readOnly}
              onChange={updateListItem("features")}
              onAdd={addListItem("features", MAX_FEATURES)}
              onRemove={removeListItem("features")}
              placeholder="e.g. Comprehensive Personality Test"
            />
            <EditableList
              label="Deliverables"
              items={form.deliverables}
              max={MAX_DELIVERABLES}
              readOnly={readOnly}
              onChange={updateListItem("deliverables")}
              onAdd={addListItem("deliverables", MAX_DELIVERABLES)}
              onRemove={removeListItem("deliverables")}
              placeholder="e.g. Career Interest Mapping Report"
            />
          </div>
        </SectionCard>

        {!readOnly && (
          <div className="flex items-center justify-end gap-3 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-10 rounded-lg border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave || loading}
              className="h-10 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : isEdit ? "Save & Update" : "Publish Package"}
            </Button>
          </div>
        )}
      </main>

      {/* Standalone-only success dialog. In controlled mode, Package.jsx
          renders its own PackagePublishedDialog after an edit succeeds. */}
      {!isControlled && (
        <PackagePublishedDialog
          open={Boolean(publishedSummary)}
          mode="create"
          summary={publishedSummary}
          onBackToList={() => navigate("/s-admin/packages")}
          onViewDetails={() => {
            setLocalMode("view");
            setPublishedSummary(null);
          }}
        />
      )}
    </div>
  );
};

export default CreatePackage;