import { ChevronLeft, ArrowRight, FileText, Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  theme,
  iconForKey,
  matchRuleForScore,
  tierIndexForScore,
  REPORT_TIER_LABELS,
} from "../CreateInterpretation";

// ---------------------------------------------------------------------------
// Score tier chart
// ---------------------------------------------------------------------------

const ScoreTierChart = ({ tierIndex }) => (
  <div className="flex flex-col gap-1">
    {REPORT_TIER_LABELS.slice()
      .reverse()
      .map((label, i) => {
        const rowIndex = REPORT_TIER_LABELS.length - 1 - i;
        const filled = rowIndex <= tierIndex;

        return (
          <div key={label} className="flex items-center gap-2">
            <span className={cn("w-24 shrink-0 text-right text-[11px] sm:w-28", theme.text.muted)}>
              {label}
            </span>

            <span
              className={cn(
                "h-3 flex-1 rounded-sm",
                filled ? theme.chart.tierBars[rowIndex] : theme.chart.tierTrack
              )}
            />
          </div>
        );
      })}
  </div>
);

// ---------------------------------------------------------------------------
// Report preview card for a single subsection
// ---------------------------------------------------------------------------

const ReportPreviewSubsectionCard = ({ item, rules, sampleScore, onScoreChange }) => {
  const matched = matchRuleForScore(rules, sampleScore);
  const tierIndex = tierIndexForScore(sampleScore);
  const stars = tierIndex + 1;

  return (
    <div className={cn("overflow-hidden rounded-lg border", theme.border.default, theme.surface.card)}>
      <div
        className={cn(
          "flex items-center justify-end gap-2 border-b border-dashed px-4 py-1.5 sm:px-5",
          theme.border.default,
          theme.surface.subtle
        )}
      >
        <label className={cn("text-[11px] font-medium", theme.text.muted)} htmlFor={`score-${item.id}`}>
          Preview score
        </label>

        <Input
          id={`score-${item.id}`}
          type="number"
          min={0}
          max={100}
          value={sampleScore}
          onChange={(e) => onScoreChange(item.id, e.target.value)}
          className={cn("h-7 w-14 text-center text-xs font-semibold", theme.text.link)}
        />

        <span className={cn("text-[11px] font-medium", theme.text.muted)}>%</span>
      </div>

      <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <span className={theme.reportDocument.namePill}>{item.label}</span>

          <ScoreTierChart tierIndex={tierIndex} />
        </div>

        <div
          className={cn(
            "space-y-3 border-t pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0",
            theme.border.default
          )}
        >
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("h-4 w-4", i < stars ? "fill-amber-400 text-amber-400" : "text-slate-200")}
              />
            ))}
          </div>

          {!matched ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              No rule covers a score of {sampleScore}% yet — this range is unconfigured, so the report
              has nothing to print here.
            </p>
          ) : (
            <>
              <p className={theme.reportDocument.ratingLine}>
                Your Rating in {item.label} is {matched.rating.label}
                {matched.title ? ` — ${matched.title}` : ""}.
              </p>

              <div>
                <p className={theme.reportDocument.bodyHeading}>Strengths &amp; Shortfalls</p>

                <p className={theme.reportDocument.bodyText}>
                  {matched.performance_analysis || (
                    <span className={cn("italic", theme.text.muted)}>
                      No performance analysis written yet.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className={theme.reportDocument.bodyHeading}>Recommended Actions</p>

                {matched.recommended_actions?.length ? (
                  <ul className="mt-1 space-y-1.5">
                    {matched.recommended_actions.map((action) => {
                      const { icon: ActionIcon } = iconForKey(action.icon);

                      return (
                        <li
                          key={action.id}
                          className={cn(
                            "flex items-start gap-2 text-sm leading-relaxed",
                            theme.reportDocument.bodyText.replace("mt-1 ", "")
                          )}
                        >
                          <ActionIcon className={theme.reportDocument.actionIcon} />

                          <span>{action.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className={cn("mt-1 text-sm italic", theme.text.muted)}>
                    No recommended actions written yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Report Preview Page
// ---------------------------------------------------------------------------

const ReportPreview = ({
  activeVersion,
  subsectionRules,
  sampleScores,
  onScoreChange,
  onBack,
  onSaveAndNext,
}) => {
  return (
    <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.canvasAlt)}>
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Report actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold",
              theme.text.secondary,
              "hover:text-slate-900"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to rule builder
          </button>

          <Button type="button" className={cn(theme.actionButton.primary, "w-full justify-center sm:w-auto")} onClick={onSaveAndNext}>
            Save and Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Document */}
        <div className={cn("overflow-hidden rounded-xl border shadow-sm", theme.border.default, theme.surface.card)}>
          <div className={cn("px-4 py-5 sm:px-8 sm:py-6", theme.reportDocument.header)}>
            <p className={theme.reportDocument.eyebrow}>
              {activeVersion.name} · {activeVersion.versionNumber}
            </p>

            <h2 className={cn(theme.reportDocument.heading, "text-xl sm:text-2xl")}>Report Preview</h2>

            <p className={theme.reportDocument.subtext}>
              This is how each ability's rating, strengths &amp; shortfalls, and recommended actions
              will render in the student's PDF report.
            </p>
          </div>

          <div className="space-y-8 p-4 sm:p-6 md:p-8">
            {activeVersion.sections.map((section) => (
              <div key={section.id} className="space-y-4">
                <div className={cn("flex items-center gap-2 border-b pb-2", theme.border.default)}>
                  <FileText className={theme.reportDocument.sectionIcon} />

                  <h3 className={theme.reportDocument.sectionHeading}>{section.name}</h3>
                </div>

                <div className="space-y-5">
                  {section.subsections.map((item) => (
                    <ReportPreviewSubsectionCard
                      key={item.id}
                      item={item}
                      rules={subsectionRules[item.id] ?? []}
                      sampleScore={sampleScores[item.id] ?? 75}
                      onScoreChange={onScoreChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={cn(theme.reportDocument.footer, "px-4 sm:px-6")}>
            <span>Sample Student · ID - PREVIEW-00000 · 12th Std · Test date: --</span>

            <span>Help-Line 000-000-0000</span>
          </div>
        </div>

        <p className={cn("text-center text-xs", theme.text.muted)}>
          Preview uses placeholder student data and the scores set above — it does not reflect a real
          submission.
        </p>
      </div>
    </main>
  );
};

export default ReportPreview;