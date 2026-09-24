import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssessmentsWithVersions,
  fetchInterpretationDraftByVersion,
} from "@/slices/interpretationSlice";

import {
  theme,
  normalizeVersion,
  normalizeAssessmentVersions,
  normalizeDraftToSections,
  isSubsectionComplete,
  toneOf,
  colorToneOf,
  iconForKey,
} from "../CreateInterpretation";

// ============================================================================
// PAGE: ViewInterpretation — read-only summary of a published / archived
// interpretation rule set. Reached from InterpretationOverview's "View" (eye)
// action:  /s-admin/view-interpretation?versionId=<assessment_version_id>
//
// IMPORTANT: the section/subsection tree rendered here comes from
// `normalizeDraftToSections(interpretationDraft)` — i.e. straight off the
// interpretation-rules payload, which reliably sends real `section_name` /
// `subsection` strings on every row. It deliberately does NOT use
// `activeVersion.sections` (built from the version-list endpoint) for
// grouping/labels, since that endpoint's subsections don't consistently
// carry section_id/section_name and produced a generic "Assessment
// sections" bucket. `activeVersion` is only used for header info
// (assessment name, version number/name) and the top-level stat counts.
// ============================================================================

const INTERPRETATION_OVERVIEW_ROUTE = "/s-admin/interpretation-overview";

const STATUS_META = {
  DRAFT: { label: "Draft", badge: "bg-amber-50 text-amber-700" },
  PUBLISHED: { label: "Published", badge: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Archived", badge: "bg-slate-100 text-slate-500" },
};

const StatChip = ({ label, value }) => (
  <div className={cn(adminTheme.radius.lg, "border border-slate-100 bg-white px-4 py-3 shadow-sm")}>
    <p className="text-lg font-bold text-slate-900">{value}</p>
    <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className={cn(adminTheme.card.base, adminTheme.card.padding, "bg-white shadow-sm")}>
    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
      {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      {title}
    </h3>
    <div className="mt-5">{children}</div>
  </div>
);

// One read-only range rule row: score band, rating/color, interpretation
// copy, feedback copy, and any action-plan recommendations. Collapsed to a
// summary line by default — expand to see the full text.
const ReadOnlyRuleRow = ({ rule }) => {
  const [expanded, setExpanded] = useState(false);
  const tone = toneOf(rule.rating);
  const cardTone = colorToneOf(rule.display_color) ?? tone;
  const options = rule.action_plan_options ?? [];

  return (
    <div className={cn("overflow-hidden rounded-xl border", cardTone.border)}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn("flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left", cardTone.bg)}
      >
        <span className="text-sm font-bold text-slate-900">
          {rule.minimum_score}–{rule.maximum_score}
        </span>

        <span className={cn(theme.rating.tagPill, rule.rating ? cardTone.solid : "bg-slate-300")}>
          {rule.rating?.label ?? "No rating"}
        </span>

        <span className="ml-auto shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <div className="grid gap-5 border-t border-slate-100 bg-white p-4 sm:p-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Performance Interpretation
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                {rule.performance_analysis || <span className="italic text-slate-400">Not set.</span>}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Feedback</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                {rule.action_plan || <span className="italic text-slate-400">Not set.</span>}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Recommended Action Plan
            </p>

            {options.length === 0 ? (
              <p className="mt-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
                No action plan recommendations configured.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {options.map((opt) => {
                  const OptIcon = iconForKey(opt.icon).icon;
                  return (
                    <li key={opt.id} className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5">
                      <OptIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="text-sm leading-relaxed text-slate-700">
                        {opt.text || <span className="italic text-slate-400">Empty option.</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ViewInterpretation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const versionId = searchParams.get("versionId");

  const {
    assessments,
    assessmentsLoading,
    interpretationDraft,
    interpretationDraftLoading,
    interpretationDraftError,
  } = useSelector((state) => state.interpretation);

  // Header-only info (assessment name, version number/name). Prefer
  // whatever InterpretationOverview already had in memory — same trick
  // CreateInterpretation uses for "Continue Editing" — falling back to
  // sessionStorage for a hard refresh, then to a fresh list fetch as a
  // last resort for a cold direct link.
  const routedVersion = useMemo(() => {
    let routeState = location.state;
    if (!routeState && versionId) {
      try {
        routeState = JSON.parse(sessionStorage.getItem(`interpretation-version-${versionId}`) ?? "null");
      } catch {
        routeState = null;
      }
    }
    if (!routeState?.version) return null;
    const version = normalizeVersion(routeState.assessmentName ?? "Assessment", routeState.version);
    return version.id === String(versionId) ? version : null;
  }, [versionId, location.state]);

  const needsListFallback = !routedVersion && !!versionId;

  useEffect(() => {
    if (needsListFallback) dispatch(fetchAssessmentsWithVersions());
  }, [needsListFallback, dispatch]);

  const listVersion = useMemo(() => {
    if (!needsListFallback) return null;
    return normalizeAssessmentVersions(assessments).find((v) => v.id === String(versionId)) ?? null;
  }, [needsListFallback, assessments, versionId]);

  const activeVersion = routedVersion ?? listVersion;

  // The actual content of the page — the rules themselves — only needs
  // versionId, not activeVersion, so fetch as soon as we have it instead
  // of waiting on the (sometimes flaky) version-list resolution.
  useEffect(() => {
    if (versionId) dispatch(fetchInterpretationDraftByVersion(versionId));
  }, [versionId, dispatch]);

  // Primary render source: section -> subsection -> rules, built directly
  // from the rules payload's own section_name/subsection fields.
  const sections = useMemo(
    () => normalizeDraftToSections(interpretationDraft),
    [interpretationDraft]
  );

  const status = location.state?.status ?? "PUBLISHED";
  const statusMeta = STATUS_META[status] ?? STATUS_META.PUBLISHED;

  const handleBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(INTERPRETATION_OVERVIEW_ROUTE);
  };

  const isLoading = interpretationDraftLoading && sections.length === 0;

  if (!versionId) {
    return (
      <div className={cn("flex min-h-screen flex-col items-center justify-center gap-3", adminTheme.surface.page)}>
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-red-600">No interpretation was specified to view.</p>
        <button type="button" onClick={handleBack} className={adminTheme.actionButton.secondary}>
          Back to Overview
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center gap-2 text-slate-400", adminTheme.surface.page)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading interpretation...
      </div>
    );
  }

  const totalSubsections = sections.reduce((sum, s) => sum + s.subsections.length, 0);
  const totalRules = sections.reduce(
    (sum, s) => sum + s.subsections.reduce((subSum, sub) => subSum + sub.rules.length, 0),
    0
  );
  const completedSubsections = sections.reduce(
    (sum, s) => sum + s.subsections.filter((sub) => isSubsectionComplete(sub.rules)).length,
    0
  );

  const headerName = activeVersion?.name ?? "Interpretation";
  const headerVersionNumber = activeVersion?.versionNumber ?? "—";
  const headerVersionName = activeVersion?.versionName ?? "";

  return (
    <div className={cn("min-h-screen", adminTheme.surface.page)}>
      <header className={cn("sticky top-0 z-50 border-b bg-white shadow-sm", adminTheme.border.default)}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </button>
            <span className="text-sm font-semibold text-slate-900">{headerName}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                statusMeta.badge
              )}
            >
              {statusMeta.label}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {headerVersionNumber}
            {headerVersionName ? ` · ${headerVersionName}` : ""}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] space-y-4 px-4 py-5 sm:px-5 lg:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Sections" value={sections.length} />
          <StatChip label="Subsections" value={totalSubsections} />
          <StatChip label="Range Rules" value={totalRules} />
          <StatChip label="Configured" value={`${completedSubsections}/${totalSubsections}`} />
        </div>

        {interpretationDraftError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {interpretationDraftError?.message || "Failed to load interpretation rules for this version."}
            </span>
          </div>
        )}

        {sections.length === 0 ? (
          <div className={cn(adminTheme.card.base, adminTheme.card.padding, "bg-white text-center text-sm text-slate-400")}>
            No interpretation rules have been configured for this assessment version yet.
          </div>
        ) : (
          sections.map((section, sIndex) => (
            <SectionCard key={section.id} title={`${String(sIndex + 1).padStart(2, "0")}. ${section.name}`} icon={Layers}>
              <div className="space-y-6">
                {section.subsections.map((sub) => {
                  const complete = isSubsectionComplete(sub.rules);
                  const Icon = sub.icon;

                  return (
                    <div key={sub.id} className="border-l-2 border-slate-100 pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
                        <p className="text-sm font-semibold text-slate-900">{sub.label}</p>

                       
                        <span className="ml-auto text-xs font-medium text-slate-400">
                          {sub.rules.length} rule{sub.rules.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {sub.rules.length === 0 ? (
                          <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            <ListChecks className="h-3.5 w-3.5" />
                            No range rules configured for this subsection.
                          </p>
                        ) : (
                          sub.rules
                            .slice()
                            .sort((a, b) => Number(a.minimum_score) - Number(b.minimum_score))
                            .map((rule) => <ReadOnlyRuleRow key={rule.id} rule={rule} />)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ))
        )}
      </main>
    </div>
  );
};

export default ViewInterpretation;