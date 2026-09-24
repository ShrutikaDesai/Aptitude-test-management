import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Pencil,
  Sparkles,
  FileText,
  Layers,
  ChevronRight,
  Star,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getCoverageGap = (rules) => {
  if (!rules?.length) {
    return "Configure 0–100% range";
  }

  const sorted = [...rules].sort(
    (a, b) => Number(a.minimum_score) - Number(b.minimum_score)
  );

  const lowestMin = Number(sorted[0]?.minimum_score ?? 0);

  if (lowestMin > 0) {
    return `Configure 0–${lowestMin - 1}% range`;
  }

  return null;
};

const isRuleComplete = (rule) => {
  return Boolean(
    rule.minimum_score !== "" &&
      rule.maximum_score !== "" &&
      rule.rating &&
      rule.performance_analysis?.trim()
  );
};

const getRuleStatus = (rule) => {
  if (isRuleComplete(rule)) {
    return "Complete";
  }

  return "Needs attention";
};

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------

const SummaryRow = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <div className="mt-1 text-sm font-medium text-slate-900">
      {children}
    </div>
  </div>
);

const EditButton = ({ onClick, children = "Edit" }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(adminTheme.actionButton.secondary, "shrink-0")}
  >
    <Pencil className="h-3.5 w-3.5" />
    {children}
  </button>
);

// ---------------------------------------------------------------------------
// Assessment summary
// ---------------------------------------------------------------------------

const AssessmentSummaryCard = ({
  activeVersion,
  onEdit,
}) => (
  <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Layers className="h-4 w-4 text-slate-600" />
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            Assessment Details
          </h3>

          <p className="truncate text-xs text-slate-400">
            Assessment version being configured
          </p>
        </div>
      </div>

      <EditButton onClick={onEdit} />
    </div>

    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <SummaryRow label="Assessment">
        {activeVersion?.name || "Untitled Assessment"}
      </SummaryRow>

      <SummaryRow label="Version">
        {activeVersion?.versionNumber || "—"}
      </SummaryRow>

      <SummaryRow label="Status">
        <span
          className={cn(
            adminTheme.badge.neutral,
            activeVersion?.status === "Published" &&
              "bg-emerald-50 text-emerald-700"
          )}
        >
          {activeVersion?.status || "Draft"}
        </span>
      </SummaryRow>

      <SummaryRow label="Sections">
        {activeVersion?.sections?.length || 0}
      </SummaryRow>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Section summary
// ---------------------------------------------------------------------------

const SectionSummaryCard = ({
  section,
  subsectionRules,
  onEditSubsection,
}) => {
  const totalRules = section.subsections.reduce(
    (sum, subsection) =>
      sum + (subsectionRules[subsection.id]?.length || 0),
    0
  );

  const incompleteRules = section.subsections.reduce(
    (sum, subsection) =>
      sum +
      (subsectionRules[subsection.id] || []).filter(
        (rule) => !isRuleComplete(rule)
      ).length,
    0
  );

  return (
    <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
      {/* Section heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            {section.name}
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            {section.subsections.length}{" "}
            {section.subsections.length === 1
              ? "Subsection"
              : "Subsections"}{" "}
            · {totalRules} {totalRules === 1 ? "Rule" : "Rules"}
          </p>
        </div>

        {incompleteRules > 0 ? (
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            {incompleteRules} need attention
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Complete
          </span>
        )}
      </div>

      {/* Subsections */}
      <div className="mt-5 divide-y divide-slate-100">
        {section.subsections.map((subsection) => {
          const rules = subsectionRules[subsection.id] || [];
          const gap = getCoverageGap(rules);

          return (
            <div key={subsection.id} className="py-5 first:pt-0 last:pb-0">
              {/* Subsection header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    {subsection.icon ? (
                      <subsection.icon className="h-4 w-4 text-slate-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {subsection.label}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {rules.length}{" "}
                      {rules.length === 1 ? "interpretation rule" : "interpretation rules"}
                    </p>
                  </div>
                </div>

                <EditButton
                  onClick={() => onEditSubsection(subsection.id)}
                />
              </div>

              {/* Coverage warning */}
              {gap && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {gap}
                </div>
              )}

              {/* Rules */}
              {rules.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {rules.map((rule, index) => (
                    <RuleReviewRow
                      key={rule.id}
                      rule={rule}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                  <p className="text-xs font-medium text-slate-500">
                    No interpretation rules configured.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Rule review row
// ---------------------------------------------------------------------------

const RuleReviewRow = ({ rule, index }) => {
  const complete = isRuleComplete(rule);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        {/* Rule number */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-400">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {rule.minimum_score}% – {rule.maximum_score}%
            </span>

            {rule.rating && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  "bg-slate-900 text-white"
                )}
              >
                {rule.rating.label}
              </span>
            )}

            {complete ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 sm:ml-auto">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 sm:ml-auto">
                <AlertTriangle className="h-3.5 w-3.5" />
                Needs attention
              </span>
            )}
          </div>

          {/* Title */}
          {rule.title && (
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {rule.title}
            </p>
          )}

          {/* Performance */}
          {rule.performance_analysis ? (
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Performance Interpretation
              </p>

              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                {rule.performance_analysis}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs italic text-amber-600">
              Performance interpretation is missing.
            </p>
          )}

          {/* Recommended actions */}
          {rule.action_plan_options?.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recommended Actions
              </p>

              <div className="mt-1.5 space-y-1">
                {rule.action_plan_options.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />

                    <span>
                      {action.text || (
                        <span className="italic text-amber-600">
                          Empty recommendation
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No actions */}
          {!rule.action_plan_options?.length && (
            <p className="mt-3 flex items-center gap-1.5 text-xs italic text-slate-400">
              <Target className="h-3 w-3" />
              No recommended actions configured.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

const ChecklistItem = ({
  title,
  description,
  isComplete,
  isOptional = false,
}) => (
  <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
    {isComplete ? (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
    ) : (
      <Circle
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          isOptional ? "text-slate-300" : "text-amber-500"
        )}
      />
    )}

    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-900">
        {title}

        {isOptional && (
          <span className="ml-1.5 text-xs font-normal text-slate-400">
            (Optional)
          </span>
        )}
      </p>

      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  </div>
);

const ReviewChecklistCard = ({ checklist }) => (
  <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
    <h3 className="text-base font-semibold text-slate-900">
      Publish Checklist
    </h3>

    <div className="mt-2 divide-y divide-slate-100">
      {checklist.map((item) => (
        <ChecklistItem key={item.title} {...item} />
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Publish card
// ---------------------------------------------------------------------------

const PublishCard = ({
  isReady,
  isPublishing,
  onPublish,
}) => {
  const disabled = !isReady || isPublishing;

  return (
    <div className={cn(adminTheme.callout.base, "p-4 sm:p-5")}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-slate-700" />

        <h3 className="text-base font-semibold text-slate-900">
          Ready to Publish?
        </h3>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Once published, these interpretation rules will be used to generate
        candidate performance reports for this assessment version.
      </p>

      <button
        type="button"
        onClick={onPublish}
        disabled={disabled}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
          disabled
            ? "cursor-not-allowed bg-slate-200 text-slate-400"
            : "bg-slate-900 text-white hover:bg-slate-800"
        )}
      >
        <Sparkles className="h-4 w-4" />

        {isPublishing ? "Publishing..." : "Publish Interpretation"}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ReviewInterpretationStep = ({
  activeVersion,
  subsectionRules,
  onGoToBuilder,
  onEditSubsection,
  onPublish,
  isPublishing = false,
}) => {
  const sections = activeVersion?.sections || [];

  // Flatten all rules
  const allRules = sections.flatMap((section) =>
    section.subsections.flatMap(
      (subsection) => subsectionRules[subsection.id] || []
    )
  );

  const totalSubsections = sections.reduce(
    (sum, section) => sum + section.subsections.length,
    0
  );

  const completeRules = allRules.filter(isRuleComplete).length;

  const incompleteRules = allRules.filter(
    (rule) => !isRuleComplete(rule)
  ).length;

  const coverageGaps = sections.flatMap((section) =>
    section.subsections
      .map((subsection) => ({
        subsection,
        gap: getCoverageGap(subsectionRules[subsection.id] || []),
      }))
      .filter((item) => item.gap)
  );

  const checklist = [
    {
      title: "Assessment Version",
      description: activeVersion
        ? `${activeVersion.name} · ${activeVersion.versionNumber}`
        : "Assessment version is not selected.",
      isComplete: Boolean(activeVersion),
    },
    {
      title: "Sections",
      description:
        sections.length > 0
          ? `${sections.length} sections configured.`
          : "Add at least one section.",
      isComplete: sections.length > 0,
    },
    {
      title: "Subsections",
      description:
        totalSubsections > 0
          ? `${totalSubsections} subsections configured.`
          : "Add at least one subsection.",
      isComplete: totalSubsections > 0,
    },
    {
      title: "Interpretation Rules",
      description:
        allRules.length > 0
          ? `${completeRules}/${allRules.length} rules are complete.`
          : "Add at least one interpretation rule.",
      isComplete: allRules.length > 0 && incompleteRules === 0,
    },
    {
      title: "Score Coverage",
      description:
        coverageGaps.length === 0
          ? "All score ranges start from 0%."
          : `${coverageGaps.length} subsection${
              coverageGaps.length === 1 ? "" : "s"
            } have a coverage gap.`,
      isComplete: coverageGaps.length === 0,
    },
  ];

  const isReady =
    checklist
      .filter((item) => !item.isOptional)
      .every((item) => item.isComplete);

  return (
    <div className="space-y-6">
      {/* Top status banner */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium",
          isReady
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        )}
      >
        {isReady ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}

        <span className="min-w-0">
          {isReady
            ? "This interpretation configuration is ready to publish."
            : "A few things still need attention before publishing."}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ============================================================= */}
        {/* LEFT */}
        {/* ============================================================= */}

        <div className="space-y-6 lg:col-span-2">
          {/* Assessment */}
          <AssessmentSummaryCard
            activeVersion={activeVersion}
            onEdit={onGoToBuilder}
          />

          {/* Sections */}
          {sections.length === 0 ? (
            <div
              className={cn(
                adminTheme.card.base,
                adminTheme.card.padding,
                "text-center"
              )}
            >
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No sections configured
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add sections and subsections before configuring interpretation
                rules.
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <SectionSummaryCard
                key={section.id}
                section={section}
                subsectionRules={subsectionRules}
                onEditSubsection={onEditSubsection}
              />
            ))
          )}
        </div>

        {/* ============================================================= */}
        {/* RIGHT */}
        {/* ============================================================= */}

        <div className="space-y-6">
          {/* Quick summary */}
          <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
            <h3 className="text-base font-semibold text-slate-900">
              Configuration Summary
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {sections.length}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Sections
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {totalSubsections}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Subsections
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {allRules.length}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Rules
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p
                  className={cn(
                    "text-2xl font-bold",
                    incompleteRules === 0
                      ? "text-emerald-600"
                      : "text-amber-600"
                  )}
                >
                  {completeRules}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Complete
                </p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <ReviewChecklistCard checklist={checklist} />

          {/* Publish */}
          <PublishCard
            isReady={isReady}
            isPublishing={isPublishing}
            onPublish={onPublish}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewInterpretationStep;
