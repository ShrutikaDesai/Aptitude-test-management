import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Layers,
  Clock,
  GraduationCap,
  ListChecks,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssessmentDetailSlice, resetAssessmentDetail } from "@/slices/assessmentSlice";
import { hydrateWizardFromDetail, ASSESSMENT_TYPE_LABELS } from "./CreateAssessment";

// ============================================================================
// PAGE: ViewAssessment — read-only, single-page summary of a published /
// archived assessment. Reached from AssessmentOverview's "View" (eye) action:
//   /s-admin/view-assessment/:id
// ============================================================================

const STATUS_META = {
  DRAFT: { label: "Draft", badge: "bg-amber-50 text-amber-700" },
  PUBLISHED: { label: "Published", badge: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Archived", badge: "bg-slate-100 text-slate-500" },
};

// Number of questions shown per subsection before collapsing behind
// "Show all" — subsections can have 400+ mapped questions, so we never
// render the full list until the admin actually asks to see it.
const QUESTION_PREVIEW_COUNT = 8;
const QUESTION_LIST_MAX_HEIGHT = "max-h-96"; // scroll container cap once expanded

const SummaryRow = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <div className="mt-1.5 text-sm font-semibold text-slate-900">{children}</div>
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

const StatChip = ({ label, value }) => (
  <div className={cn(adminTheme.radius.lg, "border border-slate-100 bg-white px-4 py-3 shadow-sm")}>
    <p className="text-lg font-bold text-slate-900">{value}</p>
    <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
  </div>
);

// A single subsection's question list. Collapsed by default whenever there
// are more than QUESTION_PREVIEW_COUNT items — nothing beyond the preview
// gets rendered into the DOM until the admin clicks "Show all".
const SubsectionQuestionList = ({ items }) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const needsToggle = items.length > QUESTION_PREVIEW_COUNT;
  const visibleItems = expanded || !needsToggle ? items : items.slice(0, QUESTION_PREVIEW_COUNT);

  return (
    <div className="mt-2">
      <ul
        className={cn(
          "space-y-1.5",
          expanded && cn(QUESTION_LIST_MAX_HEIGHT, "overflow-y-auto pr-1")
        )}
      >
        {visibleItems.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-xs text-slate-500">
            <ListChecks className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            <span className="font-mono text-slate-400">{item.questionCode}</span>
            <span className="truncate">{item.questionText || "Untitled question"}</span>
          </li>
        ))}
      </ul>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Show all {items.length} questions
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ViewAssessment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();

  const { detail, detailLoading, detailError } = useSelector((state) => state.assessment);

  useEffect(() => {
    if (id) dispatch(fetchAssessmentDetailSlice(id));
    return () => dispatch(resetAssessmentDetail());
  }, [dispatch, id]);

  const hydrated = useMemo(() => (detail ? hydrateWizardFromDetail(detail) : null), [detail]);

  const rawAssessment = detail?.results?.data?.assessment ?? detail?.data?.assessment ?? detail?.assessment ?? {};

  // Status priority: trust whatever AssessmentOverview passed via nav state
  // (it comes straight from the list API and is known-correct) over
  // whatever this detail-GET response happens to have — that endpoint is
  // the draft builder's GET and doesn't reliably expose status.
  const status =
    location.state?.status ??
    rawAssessment?.status ??
    (rawAssessment?.is_draft ? "DRAFT" : "PUBLISHED");
  const statusMeta = STATUS_META[status] ?? STATUS_META.PUBLISHED;

  const handleBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/s-admin/assessment-overview");
  };

  if (detailError) {
    return (
      <div className={cn("flex min-h-screen flex-col items-center justify-center gap-3", adminTheme.surface.page)}>
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-red-600">
          {typeof detailError === "string" ? detailError : "Failed to load this assessment."}
        </p>
        <button type="button" onClick={handleBack} className={adminTheme.actionButton.secondary}>
          Back to Overview
        </button>
      </div>
    );
  }

  if (detailLoading || !hydrated) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center gap-2 text-slate-400", adminTheme.surface.page)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading assessment...
      </div>
    );
  }

  const { form, grades, sections, blueprintItems } = hydrated;

  const gradeLabels = grades.reduce((acc, g) => {
    acc[g.grade] = g.grade;
    return acc;
  }, {});

  const totalSubsections = sections.reduce((sum, s) => sum + s.subsections.length, 0);
  const totalQuestions = blueprintItems.length;
  const countsBySubsection = blueprintItems.reduce((acc, item) => {
    (acc[item.subsectionId] ||= []).push(item);
    return acc;
  }, {});

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
            <span className="text-sm font-semibold text-slate-900">{form.name || "Untitled Assessment"}</span>
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider", statusMeta.badge)}>
              {statusMeta.label}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">Version {form.versionNumber || "—"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] space-y-4 px-4 py-5 sm:px-5 lg:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Sections" value={sections.length} />
          <StatChip label="Subsections" value={totalSubsections} />
          <StatChip label="Questions Mapped" value={totalQuestions} />
          <StatChip label="Duration (mins)" value={form.duration || "—"} />
        </div>

        <SectionCard title="Assessment Details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SummaryRow label="Name">{form.name || "—"}</SummaryRow>
            <SummaryRow label="Short Name">{form.shortName || "—"}</SummaryRow>
            <SummaryRow label="Type">
              {form.type ? (
                <span className={adminTheme.badge.neutral}>{ASSESSMENT_TYPE_LABELS[form.type]}</span>
              ) : "—"}
            </SummaryRow>
            <SummaryRow label="Language">{form.language}</SummaryRow>
            {form.description && (
              <div className="sm:col-span-2">
                <SummaryRow label="Internal Description">
                  <span className="font-normal text-slate-700">{form.description}</span>
                </SummaryRow>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Version Settings" icon={Clock}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SummaryRow label="Version Name">{form.versionName || "—"}</SummaryRow>
            <SummaryRow label="Duration">{form.duration} mins</SummaryRow>
            <SummaryRow label="Effective From">{form.effectiveFrom || "—"}</SummaryRow>
            <SummaryRow label="Effective To">{form.effectiveTo || "—"}</SummaryRow>
            <SummaryRow label="Allow Resume">{form.allowResume ? "Yes" : "No"}</SummaryRow>
            <SummaryRow label="Allow Review">{form.allowReview ? "Yes" : "No"}</SummaryRow>
            <SummaryRow label="Randomize Sections">{form.randomizeSections ? "Yes" : "No"}</SummaryRow>
            <SummaryRow label="Show Result Immediately">{form.showResultImmediately ? "Yes" : "No"}</SummaryRow>
          </div>
          {form.instructions && (
            <div className="mt-5">
              <SummaryRow label="Candidate Instructions">
                <span className="font-normal text-slate-700">{form.instructions}</span>
              </SummaryRow>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Grade & Board Mapping" icon={GraduationCap}>
          {grades.length === 0 ? (
            <p className="text-sm text-slate-400">No grade mapping configured.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {grades.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm font-semibold text-slate-900">{gradeLabels[g.grade] || g.grade}</span>
                  <span className="text-xs font-medium text-slate-400">{g.board}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Structure & Question Mapping" icon={Layers}>
          {sections.length === 0 ? (
            <p className="text-sm text-slate-400">No sections defined.</p>
          ) : (
            <div className="space-y-6">
              {sections.map((section, sIndex) => (
                <div key={section.id}>
                  <p className="text-sm font-bold text-slate-900">
                    {String(sIndex + 1).padStart(2, "0")}. {section.name}
                  </p>
                  <div className="mt-3 space-y-4 border-l-2 border-slate-100 pl-4">
                    {section.subsections.map((sub) => {
                      const items = (countsBySubsection[sub.id] || []).sort(
                        (a, b) => a.sequenceNo - b.sequenceNo
                      );
                      return (
                        <div key={sub.id}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">{sub.name}</p>
                            <span className={cn(adminTheme.badge.neutral)}>
                              {items.length} question{items.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <SubsectionQuestionList items={items} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </main>
    </div>
  );
};

export default ViewAssessment;