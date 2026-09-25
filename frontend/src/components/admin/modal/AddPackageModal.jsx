import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Loader2, Plus, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import {
  fetchAssessmentVersionGrades,
  resetVersionGrades,
} from "@/slices/questionMappingSlice";

const MAX_FEATURES = 5;
const MAX_DELIVERABLES = 5;

const fieldInput =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400";

const fieldLabel = "mb-1 block text-xs font-medium text-slate-600";

// The grades endpoint's item shape isn't pinned down anywhere yet, so the
// id/label lookups below are deliberately tolerant. Tighten them once you've
// seen a real response (the Grades tab uses `id` + `grade_name`).
const gradeValue = (grade) => String(grade.id ?? grade.public_id ?? grade.grade_id ?? "");
const gradeLabel = (grade) => grade.grade_name ?? grade.name ?? "Untitled grade";

// ---- Assessment Version Picker (inline) ------------------------------------
//
// groups shape:
// [
//   {
//     id: string,            // assessment public_id or id
//     name: string,          // assessment_name
//     versions: [
//       {
//         id: string,             // version public_id (or id)
//         version_number: string,
//         version_name: string,
//         section_count: number,
//       }
//     ]
//   }
// ]

const versionSubtitle = (version) => {
  const parts = [version.version_number, version.version_name].filter(Boolean);
  if (typeof version.section_count === "number") {
    parts.push(`${version.section_count} section${version.section_count === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
};

const AssessmentVersionPicker = ({
  groups = [],
  value,
  onChange,
  disabled = false,
  loading = false,
  placeholder = "Select an assessment version",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selected = useMemo(() => {
    for (const group of groups) {
      const version = group.versions.find((v) => String(v.id) === String(value));
      if (version) return { group, version };
    }
    return null;
  }, [groups, value]);

  const triggerLabel = selected
    ? `${selected.group.name} · ${[selected.version.version_number, selected.version.version_name]
      .filter(Boolean)
      .join(" · ")}`
    : loading
      ? "Loading versions…"
      : placeholder;

  const handleSelect = (versionId) => {
    onChange(String(versionId));
    setOpen(false);
  };

  const isDisabled = disabled || loading;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !isDisabled && setOpen((prev) => !prev)}
        disabled={isDisabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm",
          "focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
          isDisabled && "cursor-not-allowed bg-slate-50 text-slate-400",
          !selected && !isDisabled && "text-slate-400"
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && !isDisabled && (
        <div className="absolute z-20 mt-1 max-h-72 w-full min-w-[18rem] overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {groups.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-400">
              No assessment versions found.
            </p>
          ) : (
            groups.map((group, groupIdx) => (
              <div
                key={group.id}
                className={cn("px-3 py-2", groupIdx !== 0 && "border-t border-slate-100")}
              >
                <p className="text-sm font-semibold text-slate-900">{group.name}</p>
                <div className="mt-1 space-y-0.5">
                  {group.versions.length === 0 ? (
                    <p className="py-1 text-xs text-slate-400">No published versions</p>
                  ) : (
                    group.versions.map((version) => {
                      const isSelected = String(version.id) === String(value);
                      return (
                        <button
                          key={version.id}
                          type="button"
                          onClick={() => handleSelect(version.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded px-1.5 py-1 text-left text-xs text-slate-500 hover:bg-slate-50",
                            isSelected && "bg-slate-100 text-slate-700"
                          )}
                        >
                          <span>{versionSubtitle(version)}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-slate-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ---- Add Package Modal ------------------------------------------------------
//
// Layout: header (fixed) / form body (scrolls) / footer with Cancel + Create
// (fixed). The card itself doesn't scroll — only the middle section does.

const AddPackageModal = ({
  open,
  mode,
  form,
  setForm,
  onClose,
  onSave,
  loading,
  assessmentGroups = [],
  versionsLoading = false,
}) => {
  const dispatch = useDispatch();
  const { versionGrades, versionGradesLoading, versionGradesError } = useSelector(
    (state) => state.questionMapping
  );

  const versionId = form?.assessmentVersionId;

  // Whenever the modal is open and a version is chosen (including when an
  // existing package is opened for edit/view with its version prefilled),
  // load the grades mapped to that version:
  //   GET /asse/assessment-builder/versions/{versionId}/grades/
  // With no version, or once the modal closes, clear the list so stale
  // grades from a previous version never show up.
  //
  // NOTE: these hooks must stay above the early return below.
  useEffect(() => {
    if (open && versionId) {
      dispatch(fetchAssessmentVersionGrades(versionId));
    } else {
      dispatch(resetVersionGrades());
    }
  }, [dispatch, open, versionId]);

  if (!open || !form) return null;

  const isEdit = mode === "edit";
  const isView = mode === "view";

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // Changing the version invalidates the previously picked grade (it may not
  // belong to the new version), so clear it. Re-picking the same version is
  // a no-op.
  const handleVersionChange = (nextVersionId) => {
    setForm((prev) =>
      String(prev.assessmentVersionId) === String(nextVersionId)
        ? prev
        : { ...prev, assessmentVersionId: nextVersionId, gradeId: "" }
    );
  };

  const updateFeature = (index) => (e) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[index] = e.target.value;
      return { ...prev, features: next };
    });
  };

  const addFeature = () => {
    setForm((prev) =>
      prev.features.length >= MAX_FEATURES ? prev : { ...prev, features: [...prev.features, ""] }
    );
  };

  const removeFeature = (index) => {
    setForm((prev) => {
      const next = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: next.length ? next : [""] };
    });
  };

  const updateDeliverable = (index) => (e) => {
    setForm((prev) => {
      const next = [...prev.deliverables];
      next[index] = e.target.value;
      return { ...prev, deliverables: next };
    });
  };

  const addDeliverable = () => {
    setForm((prev) =>
      prev.deliverables.length >= MAX_DELIVERABLES
        ? prev
        : { ...prev, deliverables: [...prev.deliverables, ""] }
    );
  };

  const removeDeliverable = (index) => {
    setForm((prev) => {
      const next = prev.deliverables.filter((_, i) => i !== index);
      return { ...prev, deliverables: next.length ? next : [""] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isView) return;
    onSave();
  };

  // ---- Grade dropdown state ----
  const grades = Array.isArray(versionGrades) ? versionGrades : [];
  const gradesErrorMessage = versionGradesError
    ? typeof versionGradesError === "string"
      ? versionGradesError
      : versionGradesError?.message || "Failed to load grades."
    : "";
  const gradeDisabled = isView || !versionId || versionGradesLoading;

  const gradePlaceholder = !versionId
    ? "Select an assessment version first"
    : versionGradesLoading
      ? "Loading grades…"
      : gradesErrorMessage
        ? "Couldn't load grades"
        : grades.length === 0
          ? "No grades mapped to this version"
          : "Select a grade";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          adminTheme.card.base,
          "flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-modal-title"
      >
        {/* Fixed header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pb-4 pt-5">
          <div>
            <p id="package-modal-title" className="text-base font-semibold text-slate-900">
              {isView ? "View Package" : isEdit ? "Edit Package" : "Add Package"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isView
                ? "Package details."
                : isEdit
                  ? "Update this package's details below."
                  : "Bundle an assessment version into a sellable package."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrollable body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pkg-name" className={fieldLabel}>
                  Package Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="pkg-name"
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="e.g. Career Starter"
                  required
                  disabled={isView}
                  className={cn(fieldInput, isView && "cursor-not-allowed bg-slate-50")}
                />
              </div>

              <div>
                <label htmlFor="pkg-price" className={fieldLabel}>
                  Package Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="pkg-price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange("price")}
                  placeholder="e.g. 1499"
                  required
                  disabled={isView}
                  className={cn(fieldInput, isView && "cursor-not-allowed bg-slate-50")}
                />
              </div>
            </div>

            {/* Assessment Version + Grade on one row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label className={fieldLabel}>
                  Assessment Version <span className="text-red-500">*</span>
                </label>
                <AssessmentVersionPicker
                  groups={assessmentGroups}
                  value={form.assessmentVersionId}
                  onChange={handleVersionChange}
                  disabled={isView}
                  loading={versionsLoading}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="pkg-grade" className={fieldLabel}>
                  Grade
                </label>
                <div className="relative">
                  <select
                    id="pkg-grade"
                    value={form.gradeId ?? ""}
                    onChange={handleChange("gradeId")}
                    disabled={gradeDisabled}
                    className={cn(
                      fieldInput,
                      "appearance-none truncate pr-9",
                      gradeDisabled && "cursor-not-allowed bg-slate-50 text-slate-400"
                    )}
                  >
                    <option value="">{gradePlaceholder}</option>
                    {!versionGradesLoading &&
                      grades.map((grade) => (
                        <option key={gradeValue(grade)} value={gradeValue(grade)}>
                          {gradeLabel(grade)}
                        </option>
                      ))}
                  </select>
                  {versionGradesLoading ? (
                    <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                  ) : (
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  )}
                </div>
                {gradesErrorMessage && !versionGradesLoading && (
                  <p className="mt-1 text-xs text-red-600">{gradesErrorMessage}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="pkg-description" className={fieldLabel}>
                Package Description
              </label>
              <textarea
                id="pkg-description"
                value={form.description}
                onChange={handleChange("description")}
                placeholder="What this package includes and who it's for..."
                disabled={isView}
                className={cn(fieldInput, "min-h-[90px] resize-none", isView && "cursor-not-allowed bg-slate-50")}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className={fieldLabel}>Package Features</p>
                <span className="text-xs text-slate-400">
                  {form.features.length}/{MAX_FEATURES}
                </span>
              </div>
              <div className="space-y-2">
                {form.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={updateFeature(index)}
                      placeholder={`Feature ${index + 1}`}
                      disabled={isView}
                      className={cn(fieldInput, isView && "cursor-not-allowed bg-slate-50")}
                    />
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        aria-label="Remove feature"
                        className={adminTheme.button.iconGhost}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!isView && (
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={form.features.length >= MAX_FEATURES}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add feature
                </button>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className={fieldLabel}>Package Deliverables</p>
                <span className="text-xs text-slate-400">
                  {form.deliverables.length}/{MAX_DELIVERABLES}
                </span>
              </div>
              <div className="space-y-2">
                {form.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={updateDeliverable(index)}
                      placeholder={`Deliverable ${index + 1}`}
                      disabled={isView}
                      className={cn(fieldInput, isView && "cursor-not-allowed bg-slate-50")}
                    />
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        aria-label="Remove deliverable"
                        className={adminTheme.button.iconGhost}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!isView && (
                <button
                  type="button"
                  onClick={addDeliverable}
                  disabled={form.deliverables.length >= MAX_DELIVERABLES}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add deliverable
                </button>
              )}
            </div>
          </div>

          {/* Fixed footer */}
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button type="button" onClick={onClose} className={adminTheme.actionButton.secondary}>
              {isView ? "Close" : "Cancel"}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={loading || !form.name?.trim() || !form.assessmentVersionId}
                className={cn(adminTheme.actionButton.primary, "disabled:cursor-not-allowed disabled:opacity-60")}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Package"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackageModal;