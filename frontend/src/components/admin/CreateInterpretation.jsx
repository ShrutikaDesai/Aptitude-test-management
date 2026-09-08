import { useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  PuzzleIcon,
  Users2,
  MessageSquare,
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Check,
  Layers,
  Sparkles,
  Star,
  GraduationCap,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

import ReviewInterpretationStep from "./createInterpretation/ReviewInterpretationStep";
import ReportPreview from "./createInterpretation/ReportPreview";

// ---------------------------------------------------------------------------
// Theme merge
//
// Exported so ReportPreview.jsx can reuse the same styling without a third
// shared file.
// ---------------------------------------------------------------------------

export const theme = {
  ...adminTheme,

  surface: {
    canvasAlt: "bg-slate-100",
    ...adminTheme.surface,
  },

  border: {
    dashed: "border-2 border-dashed border-slate-200",
    dashedHover: "hover:border-slate-300 hover:bg-slate-50",
    ...adminTheme.border,
  },

  text: {
    linkStrong: "text-sm font-bold text-slate-700 hover:text-slate-900",
    ...adminTheme.text,
  },

  nav: {
    listItemActive: "bg-slate-900 text-white shadow-sm",
    listItemInactive: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    countBadgeActive: "bg-white/20 text-white",
    countBadgeInactive: "bg-slate-100 text-slate-500",
    ...adminTheme.nav,
  },

  button: {
    iconGhostOnTint:
      "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-600",
    ...adminTheme.button,
  },

  dropdown: {
    panel: "rounded-lg border border-slate-200 bg-white p-1 shadow-xl",
    itemHover:
      "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50",
    itemActive: "bg-slate-50 font-semibold text-slate-900",
    itemDangerHover:
      "flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm text-red-600 hover:bg-red-50",
    separator: "my-1 h-px bg-slate-100",
    ...adminTheme.dropdown,
  },

  input: {
    searchPill: "h-10 rounded-full border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:bg-white",
    textareaCard: "rounded-xl border-slate-200 text-sm",
    inlineNumber: "border-none bg-transparent text-center font-bold text-slate-900 focus:outline-none",
    ...adminTheme.input,
  },

  badge: {
    pillPositive:
      "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600",
    pillNeutral:
      "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-500",
    ...adminTheme.badge,
  },

  chart: {
    tierBars: ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-green-600"],
    tierTrack: "bg-slate-100",
    ...adminTheme.chart,
  },

  actionButton: {
    tertiary:
      "inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200",
    softChip:
      "flex shrink-0 items-center gap-3 rounded-2xl bg-slate-100 px-6 py-4 text-slate-900 transition-colors hover:bg-slate-200",
    ...adminTheme.actionButton,
  },

  rating: {
    tones: {
      emerald: { solid: "bg-emerald-500", hex: "#10B981", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
      amber: { solid: "bg-amber-500", hex: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
      blue: { solid: "bg-blue-500", hex: "#3B82F6", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
      red: { solid: "bg-red-500", hex: "#EF4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
      teal: { solid: "bg-teal-500", hex: "#14B8A6", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
      slate: { solid: "bg-slate-400", hex: "#94A3B8", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600" },
      ...adminTheme.rating?.tones,
    },
    tagPill:
      adminTheme.rating?.tagPill ??
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white",
  },

  iconSwatch: {
    tones: {
      amber: "text-amber-600 bg-amber-50",
      indigo: "text-indigo-600 bg-indigo-50",
      emerald: "text-emerald-600 bg-emerald-50",
      rose: "text-red-600 bg-red-50",
      blue: "text-blue-600 bg-blue-50",
      purple: "text-purple-600 bg-purple-50",
      ...adminTheme.iconSwatch?.tones,
    },
  },

  reportDocument: {
    header: "bg-gradient-to-r from-sky-600 to-blue-700 text-white",
    eyebrow: "text-xs font-semibold uppercase tracking-wide text-sky-100",
    heading: "mt-1 font-serif text-2xl font-bold",
    subtext: "mt-1 text-sm text-sky-100",
    sectionHeading: "font-serif text-lg font-semibold text-sky-700",
    sectionIcon: "h-4 w-4 text-sky-600",
    namePill: "inline-block rounded-md bg-sky-500 px-4 py-2 font-serif text-sm font-semibold text-white",
    ratingLine: "font-serif text-sm italic text-rose-600",
    bodyHeading: "text-sm font-bold text-slate-900",
    bodyText: "mt-1 text-sm leading-relaxed text-sky-800",
    actionIcon: "mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500",
    footer: "flex flex-wrap items-center justify-between gap-2 bg-sky-600 px-6 py-3 text-xs font-medium text-sky-50",
    ...adminTheme.reportDocument,
  },
};

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const ASSESSMENT_VERSIONS = [
  {
    id: "career-g10-v1",
    name: "Career Assessment",
    versionNumber: "V1.0",
    status: "Published",
    sections: [
      {
        id: "cognitive",
        name: "Cognitive",
        subsections: [
          { id: "numerical-reasoning", label: "Numerical Reasoning", icon: Brain },
          { id: "logical-deduction", label: "Logical Deduction", icon: PuzzleIcon },
        ],
      },
      {
        id: "behavioral",
        name: "Behavioral",
        subsections: [{ id: "collaboration-score", label: "Collaboration Score", icon: Users2 }],
      },
    ],
  },
  {
    id: "career-g8-v1",
    name: "Career Assessment",
    versionNumber: "V1.0",
    status: "Draft",
    sections: [
      {
        id: "cognitive",
        name: "Cognitive",
        subsections: [{ id: "verbal-ability", label: "Verbal Ability", icon: Brain }],
      },
      {
        id: "interest",
        name: "Interest",
        subsections: [{ id: "riasec-investigative", label: "RIASEC – Investigative", icon: MessageSquare }],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Rating bank
// ---------------------------------------------------------------------------

const RATING_BANK = [
  { id: "expert", label: "Expert", tone: "emerald" },
  { id: "proficient", label: "Proficient", tone: "amber" },
  { id: "beginner", label: "Beginner", tone: "blue" },
  { id: "critical-gap", label: "Critical Gap", tone: "red" },
  { id: "strong-collaborator", label: "Strong Collaborator", tone: "teal" },
  { id: "developing", label: "Developing", tone: "slate" },
];

export const toneOf = (rating) => theme.rating.tones[rating?.tone] ?? theme.rating.tones.slate;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const ICON_OPTIONS = [
  { key: "star", icon: Star, tone: "amber" },
  { key: "graduation", icon: GraduationCap, tone: "indigo" },
  { key: "trending", icon: TrendingUp, tone: "emerald" },
  { key: "target", icon: Target, tone: "rose" },
  { key: "book", icon: BookOpen, tone: "blue" },
  { key: "award", icon: Award, tone: "purple" },
];

export const iconForKey = (key) => ICON_OPTIONS.find((o) => o.key === key) ?? ICON_OPTIONS[0];

const iconToneClass = (toneKey) => theme.iconSwatch.tones[toneKey] ?? theme.iconSwatch.tones.amber;

// ---------------------------------------------------------------------------
// Subsection details
// ---------------------------------------------------------------------------

const SUBSECTION_DETAILS = {
  "numerical-reasoning": {
    title: "Numerical Reasoning",
    status: "Validated",
    description: "Define performance thresholds and corresponding feedback for this dimension.",
    rules: [
      {
        id: "r1",
        minimum_score: 80,
        maximum_score: 100,
        rating: RATING_BANK[0],
        title: "Outstanding Numerical Ability",
        performance_analysis:
          "The candidate demonstrates exceptional mathematical agility, with the ability to solve complex quantitative problems quickly and accurately.",
        report_icon: "trending",
        recommended_actions: [
          { id: "a1", icon: "star", text: "Assign to high-impact data strategy projects or lead roles in financial planning." },
          { id: "a2", icon: "graduation", text: "Fast-track through technical onboarding for quantitative analysis modules." },
        ],
      },
      {
        id: "r2",
        minimum_score: 40,
        maximum_score: 79,
        rating: RATING_BANK[1],
        title: "Solid Numerical Ability",
        performance_analysis: "Solid grasp of core concepts, with room to sharpen edge cases.",
        report_icon: "book",
        recommended_actions: [{ id: "a1", icon: "trending", text: "Practice timed numerical drills weekly." }],
      },
    ],
  },

  "logical-deduction": {
    title: "Logical Deduction",
    status: "Draft",
    description: "Define performance thresholds and corresponding feedback for this dimension.",
    rules: [
      {
        id: "r1",
        minimum_score: 50,
        maximum_score: 100,
        rating: RATING_BANK[1],
        title: "",
        performance_analysis: "",
        report_icon: "book",
        recommended_actions: [],
      },
    ],
  },

  "collaboration-score": {
    title: "Collaboration Score",
    status: "Validated",
    description: "Define performance thresholds and corresponding feedback for this dimension.",
    rules: [
      {
        id: "r1",
        minimum_score: 70,
        maximum_score: 100,
        rating: RATING_BANK[4],
        title: "",
        performance_analysis: "",
        report_icon: "star",
        recommended_actions: [],
      },
      {
        id: "r2",
        minimum_score: 30,
        maximum_score: 69,
        rating: RATING_BANK[5],
        title: "",
        performance_analysis: "",
        report_icon: "target",
        recommended_actions: [],
      },
    ],
  },

  "verbal-ability": {
    title: "Verbal Ability",
    status: "Draft",
    description: "Define performance thresholds and corresponding feedback for this dimension.",
    rules: [
      {
        id: "r1",
        minimum_score: 60,
        maximum_score: 100,
        rating: RATING_BANK[1],
        title: "",
        performance_analysis: "",
        report_icon: "book",
        recommended_actions: [],
      },
    ],
  },

  "riasec-investigative": {
    title: "RIASEC – Investigative",
    status: "Draft",
    description: "Define performance thresholds and corresponding feedback for this dimension.",
    rules: [
      {
        id: "r1",
        minimum_score: 50,
        maximum_score: 100,
        rating: RATING_BANK[4],
        title: "",
        performance_analysis: "",
        report_icon: "target",
        recommended_actions: [],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const coverageGapLabel = (rules) => {
  if (rules.length === 0) {
    return "Configure logic for 0–100% range";
  }

  const lowestMin = Math.min(...rules.map((r) => Number(r.minimum_score)));

  if (lowestMin <= 0) {
    return null;
  }

  return `Configure logic for 0–${lowestMin - 1}% range`;
};

// A subsection counts as "done" for the step tracker once it has rules,
// those rules cover down to 0%, and each one has a rating + write-up.
const isSubsectionComplete = (rules) => {
  if (!rules || rules.length === 0) return false;
  if (coverageGapLabel(rules)) return false;
  return rules.every((r) => r.rating && r.performance_analysis?.trim());
};

const makeRuleId = () => `r_${Math.random().toString(36).slice(2, 9)}`;

export const matchRuleForScore = (rules, score) => {
  const n = Number(score);

  return rules.find((r) => n >= Number(r.minimum_score) && n <= Number(r.maximum_score)) ?? null;
};

export const REPORT_TIER_LABELS = ["Needs Improvement", "Fair", "Good", "Very Good", "Excellent"];

export const tierIndexForScore = (score) => {
  const n = Number(score);

  return Math.min(4, Math.max(0, Math.floor(n / 20)));
};

const usePopover = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return { open, setOpen, ref };
};

// ---------------------------------------------------------------------------
// Assessment version picker
//
// `value` may now be null (nothing picked yet) — in that state the button
// renders a dashed "required" outline and a placeholder label instead of a
// version name. `autoFocus` lets the gating screen below put real keyboard
// focus on this control the moment it mounts, instead of leaving focus
// stranded on <body>.
// ---------------------------------------------------------------------------

const AssessmentVersionPicker = ({ value, onSelect, autoFocus = false }) => {
  const { open, setOpen, ref } = usePopover();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      buttonRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-shadow",
          value ? theme.border.default : "border-2 border-dashed border-slate-300",
          theme.surface.card,
          theme.surface.hover,
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
        )}
      >
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", theme.brand.logoBg)}>
          <Layers className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm font-semibold", value ? theme.text.primary : "text-slate-400")}>
            {value ? value.name : "Select assessment version"}
          </span>

          <span className={cn("block truncate text-xs", theme.text.muted)}>
            {value ? `${value.versionNumber} · ${value.status}` : "Required to continue"}
          </span>
        </span>

        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", theme.text.muted, open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox" className={cn("absolute left-0 top-full z-30 mt-2 w-full", theme.dropdown.panel)}>
          {ASSESSMENT_VERSIONS.map((version) => {
            const isActive = version.id === value?.id;

            return (
              <button
                key={version.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(version);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  theme.surface.hover,
                  isActive && "bg-slate-50"
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className={cn("text-sm font-semibold", theme.text.primary)}>{version.name}</span>

                  {isActive && <Check className={cn("h-3.5 w-3.5", theme.text.secondary)} />}
                </span>

                <span className={cn("text-xs", theme.text.muted)}>
                  {version.versionNumber} · {version.status} · {version.sections.length} sections
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sidebar subsection step item
//
// Now doubles as a step tracker row: a numbered circle that turns into a
// checkmark once that subsection's rules are complete.
// ---------------------------------------------------------------------------

const SubsectionListItem = ({ item, stepNumber, complete, active, ruleCount, onSelect }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
        active ? theme.nav.listItemActive : theme.nav.listItemInactive
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors",
          complete
            ? "border-emerald-500 bg-emerald-500 text-white"
            : active
              ? "border-white/70 text-white"
              : "border-slate-300 text-slate-400"
        )}
      >
        {complete ? <Check className="h-3 w-3" /> : stepNumber}
      </span>

      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />

      <span className="min-w-0 flex-1 truncate">{item.label}</span>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
          active ? theme.nav.countBadgeActive : theme.nav.countBadgeInactive
        )}
      >
        {ruleCount} {ruleCount === 1 ? "Rule" : "Rules"}
      </span>
    </button>
  );
};

// ---------------------------------------------------------------------------
// Rating picker
// ---------------------------------------------------------------------------

const RatingTagPicker = ({ value, onSelect }) => {
  const { open, setOpen, ref } = usePopover();
  const tone = toneOf(value);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} className={cn(theme.rating.tagPill, tone.solid)}>
        {value?.label ?? "Select rating"}

        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox" className={cn("absolute left-0 top-full z-20 mt-2 w-48", theme.dropdown.panel)}>
          {RATING_BANK.map((rating) => {
            const isActive = rating.id === value?.id;
            const rowTone = toneOf(rating);

            return (
              <button
                key={rating.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(rating);
                  setOpen(false);
                }}
                className={cn(theme.dropdown.itemHover, isActive && theme.dropdown.itemActive)}
              >
                <span className={cn("h-2 w-2 rounded-full", rowTone.solid)} />

                {rating.label}

                {isActive && <Check className={cn("ml-auto h-3.5 w-3.5", theme.text.secondary)} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Icon picker
// ---------------------------------------------------------------------------

const IconPicker = ({ value, onSelect, size = "h-9 w-9" }) => {
  const { open, setOpen, ref } = usePopover();
  const current = iconForKey(value);
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn("flex items-center justify-center rounded-lg", size, iconToneClass(current.tone))}
        aria-label="Change icon"
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className={cn("absolute left-0 top-full z-20 mt-1 flex gap-1", theme.dropdown.panel)}>
          {ICON_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSelect(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-transform hover:scale-105",
                  iconToneClass(opt.tone)
                )}
              >
                <OptIcon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Row menu
// ---------------------------------------------------------------------------

const RowMenu = ({ onDuplicate, onDelete }) => {
  const { open, setOpen, ref } = usePopover();

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} className={theme.button.iconGhostOnTint} aria-label="More options">
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className={cn("absolute right-0 top-full z-20 mt-2 w-44", theme.dropdown.panel)}>
          <button
            type="button"
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
            className={theme.dropdown.itemHover}
          >
            <Copy className="mr-2 h-3.5 w-3.5" />
            Duplicate rule
          </button>

          <div className={theme.dropdown.separator} />

          <button
            type="button"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className={theme.dropdown.itemDangerHover}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete rule
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Recommended action
// ---------------------------------------------------------------------------

const RecommendedActionCard = ({ action, onChange, onRemove }) => {
  const [editing, setEditing] = useState(!action.text);

  return (
    <div className={cn("group flex gap-3 rounded-xl p-2.5", theme.surface.subtle)}>
      <IconPicker value={action.icon} onSelect={(icon) => onChange({ icon })} size="h-8 w-8" />

      <div className="min-w-0 flex-1">
        {editing ? (
          <Textarea
            autoFocus
            value={action.text}
            onChange={(e) => onChange({ text: e.target.value })}
            onBlur={() => setEditing(false)}
            placeholder="Describe the recommended action..."
            className={cn("min-h-[64px]", theme.border.default, theme.surface.card, "text-sm")}
          />
        ) : (
          <p
            role="button"
            tabIndex={0}
            onClick={() => setEditing(true)}
            className={cn("cursor-text text-sm leading-relaxed", theme.text.link)}
          >
            {action.text || <span className={cn("italic", theme.text.muted)}>Click to describe this action…</span>}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} aria-label="Edit recommendation" className={theme.button.iconGhost}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove recommendation"
          className={cn(theme.button.iconGhost, "hover:text-red-500")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Rule card
// ---------------------------------------------------------------------------

const RangeRuleCard = ({ rule, onChange, onDuplicate, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const tone = toneOf(rule.rating);
  const recommendedActions = rule.recommended_actions ?? [];

  const updateActions = (updater) => {
    onChange({
      ...rule,
      recommended_actions: updater(recommendedActions),
    });
  };

  const addAction = () => {
    updateActions((prev) => [...prev, { id: makeRuleId(), icon: "star", text: "" }]);
  };

  const updateAction = (id, patch) => {
    updateActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAction = (id) => {
    updateActions((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl border", tone.border, theme.surface.card)}>
      <div className={cn("flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5", tone.bg)}>
        <span className={cn("text-sm font-bold", theme.text.primary)}>If score is</span>

        <div className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5", tone.border, theme.surface.card)}>
          <input
            type="number"
            min={0}
            max={100}
            value={rule.minimum_score}
            onChange={(e) => onChange({ ...rule, minimum_score: e.target.value })}
            className={cn("w-10 text-base", theme.input.inlineNumber)}
          />

          <span className={theme.text.muted}>—</span>

          <input
            type="number"
            min={0}
            max={100}
            value={rule.maximum_score}
            onChange={(e) => onChange({ ...rule, maximum_score: e.target.value })}
            className={cn("w-15 text-base", theme.input.inlineNumber)}
          />

          <span className={cn("text-sm font-medium", theme.text.muted)}>%</span>
        </div>

        <span className="hidden h-6 w-px shrink-0 bg-slate-200/80 sm:block" />

        <span className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>Tag:</span>

        <RatingTagPicker value={rule.rating} onSelect={(rating) => onChange({ ...rule, rating })} />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? "Collapse rule" : "Expand rule"}
            className={theme.button.iconGhostOnTint}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <RowMenu onDuplicate={() => onDuplicate(rule.id)} onDelete={() => onDelete(rule.id)} />
        </div>
      </div>

      {expanded && (
        <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
                Performance Interpretation
              </p>

              <Textarea
                value={rule.performance_analysis}
                onChange={(e) => onChange({ ...rule, performance_analysis: e.target.value })}
                placeholder="Describe what this score range means..."
                className={cn("mt-1.5 min-h-[120px]", theme.input.textareaCard)}
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
                Recommended Actions
              </p>

              <button type="button" onClick={addAction} className={cn("inline-flex items-center gap-1", theme.text.linkStrong)}>
                <Plus className="h-3.5 w-3.5" />
                Add recommendation
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {recommendedActions.length === 0 ? (
                <p className={cn("rounded-xl px-4 py-5 text-center text-xs", theme.border.dashed, theme.text.muted)}>
                  No recommended actions yet — add one above.
                </p>
              ) : (
                recommendedActions.map((action) => (
                  <RecommendedActionCard
                    key={action.id}
                    action={action}
                    onChange={(patch) => updateAction(action.id, patch)}
                    onRemove={() => removeAction(action.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Add rule slot
// ---------------------------------------------------------------------------

const AddRangeRuleSlot = ({ label, onAdd }) => (
  <button
    type="button"
    onClick={onAdd}
    className={cn(
      "flex w-full flex-col items-center justify-center gap-2 rounded-xl py-10 text-center transition-colors",
      theme.border.dashed,
      theme.border.dashedHover
    )}
  >
    <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", theme.surface.subtle, theme.text.secondary)}>
      <Plus className="h-5 w-5" />
    </span>

    <span className={cn("text-sm font-semibold", theme.text.primary)}>Add Range Rule</span>

    {label && <span className={cn("text-xs", theme.text.muted)}>{label}</span>}
  </button>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const CreateInterpretation = () => {
  // No version is preselected — the picker starts empty and must be chosen
  // before anything else renders (see the gating screen below).
  const [activeVersionId, setActiveVersionId] = useState(null);
  const activeVersion = activeVersionId
    ? ASSESSMENT_VERSIONS.find((v) => v.id === activeVersionId)
    : null;

  // -------------------------------------------------------------------------
  // VIEW FLOW
  //
  // builder -> report -> review
  // -------------------------------------------------------------------------

  const [view, setView] = useState("builder");

  // -------------------------------------------------------------------------
  // Mobile sidebar drawer
  // -------------------------------------------------------------------------

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Ordered, flattened list of every subsection across every section of the
  // active version — this is the sequence the step-by-step builder walks
  // through, one subsection "page" at a time.
  // -------------------------------------------------------------------------

  const flatSteps = useMemo(() => {
    if (!activeVersion) return [];
    return activeVersion.sections.flatMap((section) =>
      section.subsections.map((sub) => ({ ...sub, sectionId: section.id, sectionName: section.name }))
    );
  }, [activeVersion]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeId = flatSteps[activeStepIndex]?.id ?? null;
  const [filter, setFilter] = useState("");

  // -------------------------------------------------------------------------
  // Rules
  // -------------------------------------------------------------------------

  const [subsectionRules, setSubsectionRules] = useState(() =>
    Object.fromEntries(Object.entries(SUBSECTION_DETAILS).map(([id, d]) => [id, d.rules]))
  );

  // -------------------------------------------------------------------------
  // Report sample scores
  // -------------------------------------------------------------------------

  const [sampleScores, setSampleScores] = useState({});

  const handleSampleScoreChange = (subsectionId, value) => {
    setSampleScores((prev) => ({ ...prev, [subsectionId]: value }));
  };

  // -------------------------------------------------------------------------
  // Change assessment version
  // -------------------------------------------------------------------------

  const handleVersionSelect = (version) => {
    setActiveVersionId(version.id);
    setFilter("");
    setActiveStepIndex(0);
    setView("builder");
  };

  // -------------------------------------------------------------------------
  // Active detail
  // -------------------------------------------------------------------------

  const detail = activeId ? SUBSECTION_DETAILS[activeId] : null;
  const rules = activeId ? subsectionRules[activeId] ?? [] : [];
  const isLastStep = flatSteps.length > 0 && activeStepIndex === flatSteps.length - 1;

  // -------------------------------------------------------------------------
  // Rule updater
  // -------------------------------------------------------------------------

  const setRulesForActive = (updater) => {
    if (!activeId) return;

    setSubsectionRules((prev) => ({
      ...prev,
      [activeId]: typeof updater === "function" ? updater(prev[activeId] ?? []) : updater,
    }));
  };

  const updateRule = (updated) => {
    setRulesForActive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // -------------------------------------------------------------------------
  // Duplicate rule
  // -------------------------------------------------------------------------

  const duplicateRule = (id) => {
    setRulesForActive((prev) => {
      const source = prev.find((r) => r.id === id);
      if (!source) return prev;

      const index = prev.findIndex((r) => r.id === id);

      const copy = {
        ...source,
        id: makeRuleId(),
        recommended_actions: (source.recommended_actions ?? []).map((a) => ({
          ...a,
          id: makeRuleId(),
        })),
      };

      const next = [...prev];
      next.splice(index + 1, 0, copy);

      return next;
    });
  };

  // -------------------------------------------------------------------------
  // Delete rule
  // -------------------------------------------------------------------------

  const deleteRule = (id) => {
    setRulesForActive((prev) => prev.filter((r) => r.id !== id));
  };

  // -------------------------------------------------------------------------
  // Add rule
  // -------------------------------------------------------------------------

  const addRule = () => {
    setRulesForActive((prev) => {
      const lowestMin = prev.length ? Math.min(...prev.map((r) => Number(r.minimum_score))) : 100;
      const newMax = Math.max(lowestMin - 1, 0);

      const newRule = {
        id: makeRuleId(),
        minimum_score: 0,
        maximum_score: newMax,
        rating: RATING_BANK[0],
        title: "",
        performance_analysis: "",
        report_icon: "star",
        recommended_actions: [],
      };

      return [...prev, newRule];
    });
  };

  // -------------------------------------------------------------------------
  // Step navigation — "Save and Next" always saves the current subsection's
  // rules first, then either moves to the next subsection or, from the
  // last one, on to the Report step.
  // -------------------------------------------------------------------------

  const handleStepSaveAndNext = () => {
    console.log("Saving interpretation for subsection:", {
      assessmentVersionId: activeVersion.id,
      subsectionId: activeId,
      rules,
    });

    // TODO:
    // await saveInterpretationApi(...)

    if (isLastStep) {
      setView("report");
    } else {
      setActiveStepIndex((prev) => Math.min(flatSteps.length - 1, prev + 1));
    }
  };

  const handleStepBack = () => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  // -------------------------------------------------------------------------
  // STEP 2
  // Report -> Review
  // -------------------------------------------------------------------------

  const handleReportSaveAndNext = () => {
    console.log("Saving report configuration:", {
      assessmentVersionId: activeVersion.id,
      sampleScores,
      rules: subsectionRules,
    });

    // TODO:
    // await saveReportConfigurationApi(...)

    setView("review");
  };

  // -------------------------------------------------------------------------
  // STEP 3
  // Publish
  // -------------------------------------------------------------------------

  const handlePublish = async () => {
    try {
      console.log("Publishing interpretation:", {
        assessmentVersionId: activeVersion.id,
        rules: subsectionRules,
        sampleScores,
      });

      // TODO:
      // await publishInterpretationApi(...)

      // After successful API response:
      alert("Interpretation published successfully.");
    } catch (error) {
      console.error("Failed to publish interpretation", error);
    }
  };

  // -------------------------------------------------------------------------
  // Jump directly to a given subsection's step (used by the sidebar list
  // and by "Edit" from the Review step) — keeps activeStepIndex in sync.
  // -------------------------------------------------------------------------

  const goToStepById = (id) => {
    const index = flatSteps.findIndex((step) => step.id === id);
    if (index !== -1) {
      setActiveStepIndex(index);
      setView("builder");
      setSidebarOpen(false);
    }
  };

  // -------------------------------------------------------------------------
  // Sidebar filter
  // -------------------------------------------------------------------------

  const filteredSections = useMemo(() => {
    if (!activeVersion) return [];
    return activeVersion.sections
      .map((section) => ({
        ...section,
        subsections: section.subsections.filter((sub) =>
          sub.label.toLowerCase().includes(filter.toLowerCase())
        ),
      }))
      .filter((section) => section.subsections.length > 0);
  }, [activeVersion, filter]);

  // -------------------------------------------------------------------------
  // GATE — nothing else renders until an assessment version is chosen.
  // Shown as a mandatory modal (dark backdrop + centered dialog) rather than
  // a plain page — there's no close button and no backdrop-click dismissal,
  // since picking a version is required before the interpretation page can
  // show at all. The picker is autofocused so keyboard/screen-reader users
  // land there immediately instead of focus sitting nowhere on the page.
  // -------------------------------------------------------------------------

  if (!activeVersion) {
    return (
      <div className={cn("flex h-full items-center justify-center", theme.surface.page)}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-gate-title"
        >
          <div
            className={cn(
              "w-full max-w-md rounded-2xl border p-6 text-center shadow-2xl sm:p-8",
              theme.border.default,
              theme.surface.card
            )}
          >
            <div className={cn("mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white", theme.brand.logoBg)}>
              <Layers className="h-5 w-5" />
            </div>

            <h2 id="assessment-gate-title" className="mt-4 text-lg font-bold text-slate-900">
              Select an assessment to begin
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Choose the assessment version you want to configure interpretation rules for. This is
              required before you can continue.
            </p>

            <div className="mt-5 text-left">
              <AssessmentVersionPicker value={null} onSelect={handleVersionSelect} autoFocus />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  const progressPercent = flatSteps.length
    ? Math.round((activeStepIndex / flatSteps.length) * 100)
    : 0;

  const sidebarContent = (
    <>
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <AssessmentVersionPicker value={activeVersion} onSelect={handleVersionSelect} />
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:hidden", theme.surface.hover, theme.text.muted)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {view === "builder" && flatSteps.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>
                Step {activeStepIndex + 1} of {flatSteps.length}
              </span>
              <span>{progressPercent}%</span>
            </div>

            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="relative">
          <Search className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", theme.text.muted)} />

          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter subsections..."
            className={cn("pl-9", theme.input.searchPill)}
          />
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {filteredSections.length === 0 && (
          <p className={cn("px-1 text-sm", theme.text.muted)}>No subsections match "{filter}".</p>
        )}

        {filteredSections.map((section) => (
          <div key={section.id}>
            <p className={cn("mb-2 px-1", theme.nav.groupLabel)}>{section.name}</p>

            <div className="space-y-1">
              {section.subsections.map((item) => {
                const stepNumber = flatSteps.findIndex((step) => step.id === item.id) + 1;

                return (
                  <SubsectionListItem
                    key={item.id}
                    item={item}
                    stepNumber={stepNumber}
                    complete={isSubsectionComplete(subsectionRules[item.id])}
                    active={view === "builder" && item.id === activeId}
                    ruleCount={subsectionRules[item.id]?.length ?? 0}
                    onSelect={goToStepById}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div className={cn("flex h-full overflow-hidden", theme.surface.page)}>
      {/* ================================================================ */}
      {/* SIDEBAR — desktop: static column. mobile: slide-over drawer.    */}
      {/* ================================================================ */}

      <aside
        className={cn(
          "hidden w-72 shrink-0 flex-col border-r md:flex",
          theme.border.default,
          theme.surface.card
        )}
      >
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <aside
            className={cn(
              "absolute inset-y-0 left-0 flex w-[85%] max-w-72 flex-col shadow-xl",
              theme.surface.card
            )}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ================================================================ */}
      {/* MAIN COLUMN                                                      */}
      {/* ================================================================ */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}

        <header
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4",
            theme.border.default,
            theme.surface.card
          )}
        >
          {/* Header title */}
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open dimensions menu"
              className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:hidden", theme.surface.hover, theme.text.muted)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              {view === "builder" && (
                <>
                  <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                    {flatSteps[activeStepIndex]?.label ?? "Interpretation Rules"}
                  </h1>

                  <p className="hidden text-xs text-slate-400 sm:block">
                    {flatSteps.length > 0
                      ? `Step ${activeStepIndex + 1} of ${flatSteps.length} · ${flatSteps[activeStepIndex]?.sectionName}`
                      : "Configure score-based performance interpretation"}
                  </p>
                </>
              )}

              {view === "report" && (
                <>
                  <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">Report Preview</h1>

                  <p className="hidden text-xs text-slate-400 sm:block">Preview how the interpretation will appear in the student report</p>
                </>
              )}

              {view === "review" && (
                <>
                  <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">Review & Publish</h1>

                  <p className="hidden text-xs text-slate-400 sm:block">Review your interpretation configuration before publishing</p>
                </>
              )}
            </div>
          </div>

          {/* Header buttons */}
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            {/* ====================================================== */}
            {/* BUILDER HEADER — Back / Save & Next, one subsection at */}
            {/* a time.                                                */}
            {/* ====================================================== */}

            {view === "builder" && (
              <>
                {activeStepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-center sm:flex-none"
                    onClick={handleStepBack}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}

                <Button
                  type="button"
                  className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")}
                  onClick={handleStepSaveAndNext}
                  disabled={!activeId}
                >
                  {isLastStep ? "Save and Continue to Report" : "Save and Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* ====================================================== */}
            {/* REPORT HEADER                                          */}
            {/* ====================================================== */}

            {view === "report" && (
              <>
                <Button type="button" variant="outline" className="flex-1 justify-center sm:flex-none" onClick={() => setView("builder")}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden xs:inline">Back to Edit</span>
                  <span className="xs:hidden">Back</span>
                </Button>

                <Button type="button" className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")} onClick={handleReportSaveAndNext}>
                  Save and Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* ====================================================== */}
            {/* REVIEW HEADER                                          */}
            {/* ====================================================== */}

            {view === "review" && (
              <>
                <Button type="button" variant="outline" className="flex-1 justify-center sm:flex-none" onClick={() => setView("report")}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden xs:inline">Back to Report</span>
                  <span className="xs:hidden">Back</span>
                </Button>

                <Button type="button" className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")} onClick={handlePublish}>
                  <Sparkles className="h-4 w-4" />
                  Publish
                </Button>
              </>
            )}
          </div>
        </header>

        {/* ============================================================ */}
        {/* REPORT                                                        */}
        {/* ============================================================ */}

        {view === "report" ? (
          <ReportPreview
            activeVersion={activeVersion}
            subsectionRules={subsectionRules}
            sampleScores={sampleScores}
            onScoreChange={handleSampleScoreChange}
            onBack={() => setView("builder")}
            onSaveAndNext={handleReportSaveAndNext}
          />
        ) : view === "review" ? (
          /* ========================================================== */
          /* REVIEW                                                     */
          /* ========================================================== */

          <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.subtle)}>
            <div className="mx-auto max-w-6xl">
              <ReviewInterpretationStep
                activeVersion={activeVersion}
                subsectionRules={subsectionRules}
                onGoToBuilder={() => setView("builder")}
                onEditSubsection={(id) => goToStepById(id)}
                onPublish={handlePublish}
              />
            </div>
          </main>
        ) : (
          /* ========================================================== */
          /* BUILDER — one subsection "page" at a time                  */
          /* ========================================================== */

          <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.subtle)}>
            {!detail ? (
              <div className={cn("mx-auto max-w-4xl rounded-xl py-16 text-center text-sm", theme.border.dashed, theme.text.muted)}>
                Select a subsection from the sidebar to configure its rules.
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-6">
                {/* Builder heading */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className={cn("text-xl font-extrabold tracking-tight sm:text-2xl", theme.text.primary)}>{detail.title}</h2>

                      <span className={cn(detail.status === "Validated" ? theme.badge.pillPositive : theme.badge.pillNeutral)}>
                        {detail.status}
                      </span>
                    </div>

                    <p className={cn("mt-2 max-w-md text-sm sm:text-base", theme.text.secondary)}>{detail.description}</p>
                  </div>

                  <button type="button" onClick={addRule} className={cn(theme.actionButton.softChip, "w-full sm:w-auto")}>
                    <Plus className="h-5 w-5" />

                    <span className="text-left text-base font-bold leading-tight">
                      Add
                      <br />
                      Range Rule
                    </span>
                  </button>
                </div>

                {/* Rules */}
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <RangeRuleCard key={rule.id} rule={rule} onChange={updateRule} onDuplicate={duplicateRule} onDelete={deleteRule} />
                  ))}

                  <AddRangeRuleSlot label={coverageGapLabel(rules)} onAdd={addRule} />
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default CreateInterpretation;


// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Brain,
//   PuzzleIcon,
//   Users2,
//   MessageSquare,
//   Search,
//   Plus,
//   ChevronDown,
//   ChevronLeft,
//   ChevronUp,
//   MoreVertical,
//   Pencil,
//   Copy,
//   Trash2,
//   Check,
//   Layers,
//   Sparkles,
//   Star,
//   GraduationCap,
//   TrendingUp,
//   Target,
//   BookOpen,
//   Award,
//   ArrowRight,
//   Menu,
//   X,
// } from "lucide-react";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { adminTheme } from "@/theme/adminTheme";

// import ReviewInterpretationStep from "./createInterpretation/ReviewInterpretationStep";
// import ReportPreview from "./createInterpretation/ReportPreview";

// // ---------------------------------------------------------------------------
// // Theme merge
// //
// // Exported so ReportPreview.jsx can reuse the same styling without a third
// // shared file.
// // ---------------------------------------------------------------------------

// export const theme = {
//   ...adminTheme,

//   surface: {
//     canvasAlt: "bg-slate-100",
//     ...adminTheme.surface,
//   },

//   border: {
//     dashed: "border-2 border-dashed border-slate-200",
//     dashedHover: "hover:border-slate-300 hover:bg-slate-50",
//     ...adminTheme.border,
//   },

//   text: {
//     linkStrong: "text-sm font-bold text-slate-700 hover:text-slate-900",
//     ...adminTheme.text,
//   },

//   nav: {
//     listItemActive: "bg-slate-900 text-white shadow-sm",
//     listItemInactive: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
//     countBadgeActive: "bg-white/20 text-white",
//     countBadgeInactive: "bg-slate-100 text-slate-500",
//     ...adminTheme.nav,
//   },

//   button: {
//     iconGhostOnTint:
//       "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-600",
//     ...adminTheme.button,
//   },

//   dropdown: {
//     panel: "rounded-lg border border-slate-200 bg-white p-1 shadow-xl",
//     itemHover:
//       "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50",
//     itemActive: "bg-slate-50 font-semibold text-slate-900",
//     itemDangerHover:
//       "flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm text-red-600 hover:bg-red-50",
//     separator: "my-1 h-px bg-slate-100",
//     ...adminTheme.dropdown,
//   },

//   input: {
//     searchPill: "h-10 rounded-full border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:bg-white",
//     textareaCard: "rounded-xl border-slate-200 text-sm",
//     inlineNumber: "border-none bg-transparent text-center font-bold text-slate-900 focus:outline-none",
//     ...adminTheme.input,
//   },

//   badge: {
//     pillPositive:
//       "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600",
//     pillNeutral:
//       "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-500",
//     ...adminTheme.badge,
//   },

//   chart: {
//     tierBars: ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-green-600"],
//     tierTrack: "bg-slate-100",
//     ...adminTheme.chart,
//   },

//   actionButton: {
//     tertiary:
//       "inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200",
//     softChip:
//       "flex shrink-0 items-center gap-3 rounded-2xl bg-slate-100 px-6 py-4 text-slate-900 transition-colors hover:bg-slate-200",
//     ...adminTheme.actionButton,
//   },

//   rating: {
//     tones: {
//       emerald: { solid: "bg-emerald-500", hex: "#10B981", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
//       amber: { solid: "bg-amber-500", hex: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
//       blue: { solid: "bg-blue-500", hex: "#3B82F6", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
//       red: { solid: "bg-red-500", hex: "#EF4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
//       teal: { solid: "bg-teal-500", hex: "#14B8A6", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
//       slate: { solid: "bg-slate-400", hex: "#94A3B8", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600" },
//       ...adminTheme.rating?.tones,
//     },
//     tagPill:
//       adminTheme.rating?.tagPill ??
//       "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white",
//   },

//   iconSwatch: {
//     tones: {
//       amber: "text-amber-600 bg-amber-50",
//       indigo: "text-indigo-600 bg-indigo-50",
//       emerald: "text-emerald-600 bg-emerald-50",
//       rose: "text-red-600 bg-red-50",
//       blue: "text-blue-600 bg-blue-50",
//       purple: "text-purple-600 bg-purple-50",
//       ...adminTheme.iconSwatch?.tones,
//     },
//   },

//   reportDocument: {
//     header: "bg-gradient-to-r from-sky-600 to-blue-700 text-white",
//     eyebrow: "text-xs font-semibold uppercase tracking-wide text-sky-100",
//     heading: "mt-1 font-serif text-2xl font-bold",
//     subtext: "mt-1 text-sm text-sky-100",
//     sectionHeading: "font-serif text-lg font-semibold text-sky-700",
//     sectionIcon: "h-4 w-4 text-sky-600",
//     namePill: "inline-block rounded-md bg-sky-500 px-4 py-2 font-serif text-sm font-semibold text-white",
//     ratingLine: "font-serif text-sm italic text-rose-600",
//     bodyHeading: "text-sm font-bold text-slate-900",
//     bodyText: "mt-1 text-sm leading-relaxed text-sky-800",
//     actionIcon: "mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500",
//     footer: "flex flex-wrap items-center justify-between gap-2 bg-sky-600 px-6 py-3 text-xs font-medium text-sky-50",
//     ...adminTheme.reportDocument,
//   },
// };

// // ---------------------------------------------------------------------------
// // Static config
// // ---------------------------------------------------------------------------

// const ASSESSMENT_VERSIONS = [
//   {
//     id: "career-g10-v1",
//     name: "Career Assessment",
//     versionNumber: "V1.0",
//     status: "Published",
//     sections: [
//       {
//         id: "cognitive",
//         name: "Cognitive",
//         subsections: [
//           { id: "numerical-reasoning", label: "Numerical Reasoning", icon: Brain },
//           { id: "logical-deduction", label: "Logical Deduction", icon: PuzzleIcon },
//         ],
//       },
//       {
//         id: "behavioral",
//         name: "Behavioral",
//         subsections: [{ id: "collaboration-score", label: "Collaboration Score", icon: Users2 }],
//       },
//     ],
//   },
//   {
//     id: "career-g8-v1",
//     name: "Career Assessment",
//     versionNumber: "V1.0",
//     status: "Draft",
//     sections: [
//       {
//         id: "cognitive",
//         name: "Cognitive",
//         subsections: [{ id: "verbal-ability", label: "Verbal Ability", icon: Brain }],
//       },
//       {
//         id: "interest",
//         name: "Interest",
//         subsections: [{ id: "riasec-investigative", label: "RIASEC – Investigative", icon: MessageSquare }],
//       },
//     ],
//   },
// ];

// // ---------------------------------------------------------------------------
// // Rating bank
// // ---------------------------------------------------------------------------

// const RATING_BANK = [
//   { id: "expert", label: "Expert", tone: "emerald" },
//   { id: "proficient", label: "Proficient", tone: "amber" },
//   { id: "beginner", label: "Beginner", tone: "blue" },
//   { id: "critical-gap", label: "Critical Gap", tone: "red" },
//   { id: "strong-collaborator", label: "Strong Collaborator", tone: "teal" },
//   { id: "developing", label: "Developing", tone: "slate" },
// ];

// export const toneOf = (rating) => theme.rating.tones[rating?.tone] ?? theme.rating.tones.slate;

// // ---------------------------------------------------------------------------
// // Icons
// // ---------------------------------------------------------------------------

// const ICON_OPTIONS = [
//   { key: "star", icon: Star, tone: "amber" },
//   { key: "graduation", icon: GraduationCap, tone: "indigo" },
//   { key: "trending", icon: TrendingUp, tone: "emerald" },
//   { key: "target", icon: Target, tone: "rose" },
//   { key: "book", icon: BookOpen, tone: "blue" },
//   { key: "award", icon: Award, tone: "purple" },
// ];

// export const iconForKey = (key) => ICON_OPTIONS.find((o) => o.key === key) ?? ICON_OPTIONS[0];

// const iconToneClass = (toneKey) => theme.iconSwatch.tones[toneKey] ?? theme.iconSwatch.tones.amber;

// // ---------------------------------------------------------------------------
// // Subsection details
// // ---------------------------------------------------------------------------

// const SUBSECTION_DETAILS = {
//   "numerical-reasoning": {
//     title: "Numerical Reasoning",
//     status: "Validated",
//     description: "Define performance thresholds and corresponding feedback for this dimension.",
//     rules: [
//       {
//         id: "r1",
//         minimum_score: 80,
//         maximum_score: 100,
//         rating: RATING_BANK[0],
//         title: "Outstanding Numerical Ability",
//         performance_analysis:
//           "The candidate demonstrates exceptional mathematical agility, with the ability to solve complex quantitative problems quickly and accurately.",
//         report_icon: "trending",
//         recommended_actions: [
//           { id: "a1", icon: "star", text: "Assign to high-impact data strategy projects or lead roles in financial planning." },
//           { id: "a2", icon: "graduation", text: "Fast-track through technical onboarding for quantitative analysis modules." },
//         ],
//       },
//       {
//         id: "r2",
//         minimum_score: 40,
//         maximum_score: 79,
//         rating: RATING_BANK[1],
//         title: "Solid Numerical Ability",
//         performance_analysis: "Solid grasp of core concepts, with room to sharpen edge cases.",
//         report_icon: "book",
//         recommended_actions: [{ id: "a1", icon: "trending", text: "Practice timed numerical drills weekly." }],
//       },
//     ],
//   },

//   "logical-deduction": {
//     title: "Logical Deduction",
//     status: "Draft",
//     description: "Define performance thresholds and corresponding feedback for this dimension.",
//     rules: [
//       {
//         id: "r1",
//         minimum_score: 50,
//         maximum_score: 100,
//         rating: RATING_BANK[1],
//         title: "",
//         performance_analysis: "",
//         report_icon: "book",
//         recommended_actions: [],
//       },
//     ],
//   },

//   "collaboration-score": {
//     title: "Collaboration Score",
//     status: "Validated",
//     description: "Define performance thresholds and corresponding feedback for this dimension.",
//     rules: [
//       {
//         id: "r1",
//         minimum_score: 70,
//         maximum_score: 100,
//         rating: RATING_BANK[4],
//         title: "",
//         performance_analysis: "",
//         report_icon: "star",
//         recommended_actions: [],
//       },
//       {
//         id: "r2",
//         minimum_score: 30,
//         maximum_score: 69,
//         rating: RATING_BANK[5],
//         title: "",
//         performance_analysis: "",
//         report_icon: "target",
//         recommended_actions: [],
//       },
//     ],
//   },

//   "verbal-ability": {
//     title: "Verbal Ability",
//     status: "Draft",
//     description: "Define performance thresholds and corresponding feedback for this dimension.",
//     rules: [
//       {
//         id: "r1",
//         minimum_score: 60,
//         maximum_score: 100,
//         rating: RATING_BANK[1],
//         title: "",
//         performance_analysis: "",
//         report_icon: "book",
//         recommended_actions: [],
//       },
//     ],
//   },

//   "riasec-investigative": {
//     title: "RIASEC – Investigative",
//     status: "Draft",
//     description: "Define performance thresholds and corresponding feedback for this dimension.",
//     rules: [
//       {
//         id: "r1",
//         minimum_score: 50,
//         maximum_score: 100,
//         rating: RATING_BANK[4],
//         title: "",
//         performance_analysis: "",
//         report_icon: "target",
//         recommended_actions: [],
//       },
//     ],
//   },
// };

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// const coverageGapLabel = (rules) => {
//   if (rules.length === 0) {
//     return "Configure logic for 0–100% range";
//   }

//   const lowestMin = Math.min(...rules.map((r) => Number(r.minimum_score)));

//   if (lowestMin <= 0) {
//     return null;
//   }

//   return `Configure logic for 0–${lowestMin - 1}% range`;
// };

// const makeRuleId = () => `r_${Math.random().toString(36).slice(2, 9)}`;

// export const matchRuleForScore = (rules, score) => {
//   const n = Number(score);

//   return rules.find((r) => n >= Number(r.minimum_score) && n <= Number(r.maximum_score)) ?? null;
// };

// export const REPORT_TIER_LABELS = ["Needs Improvement", "Fair", "Good", "Very Good", "Excellent"];

// export const tierIndexForScore = (score) => {
//   const n = Number(score);

//   return Math.min(4, Math.max(0, Math.floor(n / 20)));
// };

// const usePopover = () => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     if (!open) return;

//     const handleClick = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };

//     const handleKey = (e) => {
//       if (e.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClick);
//     document.addEventListener("keydown", handleKey);

//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//       document.removeEventListener("keydown", handleKey);
//     };
//   }, [open]);

//   return { open, setOpen, ref };
// };

// // ---------------------------------------------------------------------------
// // Assessment version picker
// // ---------------------------------------------------------------------------

// const AssessmentVersionPicker = ({ value, onSelect }) => {
//   const { open, setOpen, ref } = usePopover();

//   return (
//     <div className="relative" ref={ref}>
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className={cn(
//           "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left",
//           theme.border.default,
//           theme.surface.card,
//           theme.surface.hover
//         )}
//       >
//         <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", theme.brand.logoBg)}>
//           <Layers className="h-4 w-4" />
//         </span>

//         <span className="min-w-0 flex-1">
//           <span className={cn("block truncate text-sm font-semibold", theme.text.primary)}>{value.name}</span>

//           <span className={cn("block truncate text-xs", theme.text.muted)}>
//             {value.versionNumber} · {value.status}
//           </span>
//         </span>

//         <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", theme.text.muted, open && "rotate-180")} />
//       </button>

//       {open && (
//         <div role="listbox" className={cn("absolute left-0 top-full z-30 mt-2 w-full", theme.dropdown.panel)}>
//           {ASSESSMENT_VERSIONS.map((version) => {
//             const isActive = version.id === value.id;

//             return (
//               <button
//                 key={version.id}
//                 type="button"
//                 role="option"
//                 aria-selected={isActive}
//                 onClick={() => {
//                   onSelect(version);
//                   setOpen(false);
//                 }}
//                 className={cn(
//                   "flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors",
//                   theme.surface.hover,
//                   isActive && "bg-slate-50"
//                 )}
//               >
//                 <span className="flex w-full items-center justify-between gap-2">
//                   <span className={cn("text-sm font-semibold", theme.text.primary)}>{version.name}</span>

//                   {isActive && <Check className={cn("h-3.5 w-3.5", theme.text.secondary)} />}
//                 </span>

//                 <span className={cn("text-xs", theme.text.muted)}>
//                   {version.versionNumber} · {version.status} · {version.sections.length} sections
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------------------------------------------------------------------
// // Sidebar subsection item
// // ---------------------------------------------------------------------------

// const SubsectionListItem = ({ item, active, ruleCount, onSelect }) => {
//   const Icon = item.icon;

//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(item.id)}
//       className={cn(
//         "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
//         active ? theme.nav.listItemActive : theme.nav.listItemInactive
//       )}
//     >
//       <span className="flex items-center gap-2.5 truncate">
//         <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />

//         <span className="truncate">{item.label}</span>
//       </span>

//       <span
//         className={cn(
//           "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
//           active ? theme.nav.countBadgeActive : theme.nav.countBadgeInactive
//         )}
//       >
//         {ruleCount} {ruleCount === 1 ? "Rule" : "Rules"}
//       </span>
//     </button>
//   );
// };

// // ---------------------------------------------------------------------------
// // Rating picker
// // ---------------------------------------------------------------------------

// const RatingTagPicker = ({ value, onSelect }) => {
//   const { open, setOpen, ref } = usePopover();
//   const tone = toneOf(value);

//   return (
//     <div className="relative" ref={ref}>
//       <button type="button" onClick={() => setOpen((prev) => !prev)} className={cn(theme.rating.tagPill, tone.solid)}>
//         {value?.label ?? "Select rating"}

//         <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
//       </button>

//       {open && (
//         <div role="listbox" className={cn("absolute left-0 top-full z-20 mt-2 w-48", theme.dropdown.panel)}>
//           {RATING_BANK.map((rating) => {
//             const isActive = rating.id === value?.id;
//             const rowTone = toneOf(rating);

//             return (
//               <button
//                 key={rating.id}
//                 type="button"
//                 role="option"
//                 aria-selected={isActive}
//                 onClick={() => {
//                   onSelect(rating);
//                   setOpen(false);
//                 }}
//                 className={cn(theme.dropdown.itemHover, isActive && theme.dropdown.itemActive)}
//               >
//                 <span className={cn("h-2 w-2 rounded-full", rowTone.solid)} />

//                 {rating.label}

//                 {isActive && <Check className={cn("ml-auto h-3.5 w-3.5", theme.text.secondary)} />}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------------------------------------------------------------------
// // Icon picker
// // ---------------------------------------------------------------------------

// const IconPicker = ({ value, onSelect, size = "h-9 w-9" }) => {
//   const { open, setOpen, ref } = usePopover();
//   const current = iconForKey(value);
//   const CurrentIcon = current.icon;

//   return (
//     <div className="relative" ref={ref}>
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className={cn("flex items-center justify-center rounded-lg", size, iconToneClass(current.tone))}
//         aria-label="Change icon"
//       >
//         <CurrentIcon className="h-4 w-4" />
//       </button>

//       {open && (
//         <div className={cn("absolute left-0 top-full z-20 mt-1 flex gap-1", theme.dropdown.panel)}>
//           {ICON_OPTIONS.map((opt) => {
//             const OptIcon = opt.icon;

//             return (
//               <button
//                 key={opt.key}
//                 type="button"
//                 onClick={() => {
//                   onSelect(opt.key);
//                   setOpen(false);
//                 }}
//                 className={cn(
//                   "flex h-7 w-7 items-center justify-center rounded-md transition-transform hover:scale-105",
//                   iconToneClass(opt.tone)
//                 )}
//               >
//                 <OptIcon className="h-3.5 w-3.5" />
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------------------------------------------------------------------
// // Row menu
// // ---------------------------------------------------------------------------

// const RowMenu = ({ onDuplicate, onDelete }) => {
//   const { open, setOpen, ref } = usePopover();

//   return (
//     <div className="relative" ref={ref}>
//       <button type="button" onClick={() => setOpen((prev) => !prev)} className={theme.button.iconGhostOnTint} aria-label="More options">
//         <MoreVertical className="h-4 w-4" />
//       </button>

//       {open && (
//         <div className={cn("absolute right-0 top-full z-20 mt-2 w-44", theme.dropdown.panel)}>
//           <button
//             type="button"
//             onClick={() => {
//               onDuplicate();
//               setOpen(false);
//             }}
//             className={theme.dropdown.itemHover}
//           >
//             <Copy className="mr-2 h-3.5 w-3.5" />
//             Duplicate rule
//           </button>

//           <div className={theme.dropdown.separator} />

//           <button
//             type="button"
//             onClick={() => {
//               onDelete();
//               setOpen(false);
//             }}
//             className={theme.dropdown.itemDangerHover}
//           >
//             <Trash2 className="mr-2 h-3.5 w-3.5" />
//             Delete rule
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------------------------------------------------------------------
// // Recommended action
// // ---------------------------------------------------------------------------

// const RecommendedActionCard = ({ action, onChange, onRemove }) => {
//   const [editing, setEditing] = useState(!action.text);

//   return (
//     <div className={cn("group flex gap-3 rounded-xl p-2.5", theme.surface.subtle)}>
//       <IconPicker value={action.icon} onSelect={(icon) => onChange({ icon })} size="h-8 w-8" />

//       <div className="min-w-0 flex-1">
//         {editing ? (
//           <Textarea
//             autoFocus
//             value={action.text}
//             onChange={(e) => onChange({ text: e.target.value })}
//             onBlur={() => setEditing(false)}
//             placeholder="Describe the recommended action..."
//             className={cn("min-h-[64px]", theme.border.default, theme.surface.card, "text-sm")}
//           />
//         ) : (
//           <p
//             role="button"
//             tabIndex={0}
//             onClick={() => setEditing(true)}
//             className={cn("cursor-text text-sm leading-relaxed", theme.text.link)}
//           >
//             {action.text || <span className={cn("italic", theme.text.muted)}>Click to describe this action…</span>}
//           </p>
//         )}
//       </div>

//       <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
//         {!editing && (
//           <button type="button" onClick={() => setEditing(true)} aria-label="Edit recommendation" className={theme.button.iconGhost}>
//             <Pencil className="h-3.5 w-3.5" />
//           </button>
//         )}

//         <button
//           type="button"
//           onClick={onRemove}
//           aria-label="Remove recommendation"
//           className={cn(theme.button.iconGhost, "hover:text-red-500")}
//         >
//           <Trash2 className="h-3.5 w-3.5" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // ---------------------------------------------------------------------------
// // Rule card
// // ---------------------------------------------------------------------------

// const RangeRuleCard = ({ rule, onChange, onDuplicate, onDelete }) => {
//   const [expanded, setExpanded] = useState(true);
//   const tone = toneOf(rule.rating);
//   const recommendedActions = rule.recommended_actions ?? [];

//   const updateActions = (updater) => {
//     onChange({
//       ...rule,
//       recommended_actions: updater(recommendedActions),
//     });
//   };

//   const addAction = () => {
//     updateActions((prev) => [...prev, { id: makeRuleId(), icon: "star", text: "" }]);
//   };

//   const updateAction = (id, patch) => {
//     updateActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
//   };

//   const removeAction = (id) => {
//     updateActions((prev) => prev.filter((a) => a.id !== id));
//   };

//   return (
//     <div className={cn("overflow-hidden rounded-2xl border", tone.border, theme.surface.card)}>
//       <div className={cn("flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5", tone.bg)}>
//         <span className={cn("text-sm font-bold", theme.text.primary)}>If score is</span>

//         <div className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5", tone.border, theme.surface.card)}>
//           <input
//             type="number"
//             min={0}
//             max={100}
//             value={rule.minimum_score}
//             onChange={(e) => onChange({ ...rule, minimum_score: e.target.value })}
//             className={cn("w-10 text-base", theme.input.inlineNumber)}
//           />

//           <span className={theme.text.muted}>—</span>

//           <input
//             type="number"
//             min={0}
//             max={100}
//             value={rule.maximum_score}
//             onChange={(e) => onChange({ ...rule, maximum_score: e.target.value })}
//             className={cn("w-10 text-base", theme.input.inlineNumber)}
//           />

//           <span className={cn("text-sm font-medium", theme.text.muted)}>%</span>
//         </div>

//         <span className="hidden h-6 w-px shrink-0 bg-slate-200/80 sm:block" />

//         <span className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>Tag:</span>

//         <RatingTagPicker value={rule.rating} onSelect={(rating) => onChange({ ...rule, rating })} />

//         <div className="ml-auto flex items-center gap-1">
//           <button
//             type="button"
//             onClick={() => setExpanded((prev) => !prev)}
//             aria-label={expanded ? "Collapse rule" : "Expand rule"}
//             className={theme.button.iconGhostOnTint}
//           >
//             {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//           </button>

//           <RowMenu onDuplicate={() => onDuplicate(rule.id)} onDelete={() => onDelete(rule.id)} />
//         </div>
//       </div>

//       {expanded && (
//         <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2">
//           <div className="space-y-3">
//             <div>
//               <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
//                 Performance Interpretation
//               </p>

//               <Textarea
//                 value={rule.performance_analysis}
//                 onChange={(e) => onChange({ ...rule, performance_analysis: e.target.value })}
//                 placeholder="Describe what this score range means..."
//                 className={cn("mt-1.5 min-h-[120px]", theme.input.textareaCard)}
//               />
//             </div>
//           </div>

//           <div>
//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
//                 Recommended Actions
//               </p>

//               <button type="button" onClick={addAction} className={cn("inline-flex items-center gap-1", theme.text.linkStrong)}>
//                 <Plus className="h-3.5 w-3.5" />
//                 Add recommendation
//               </button>
//             </div>

//             <div className="mt-2 space-y-2">
//               {recommendedActions.length === 0 ? (
//                 <p className={cn("rounded-xl px-4 py-5 text-center text-xs", theme.border.dashed, theme.text.muted)}>
//                   No recommended actions yet — add one above.
//                 </p>
//               ) : (
//                 recommendedActions.map((action) => (
//                   <RecommendedActionCard
//                     key={action.id}
//                     action={action}
//                     onChange={(patch) => updateAction(action.id, patch)}
//                     onRemove={() => removeAction(action.id)}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------------------------------------------------------------------
// // Add rule slot
// // ---------------------------------------------------------------------------

// const AddRangeRuleSlot = ({ label, onAdd }) => (
//   <button
//     type="button"
//     onClick={onAdd}
//     className={cn(
//       "flex w-full flex-col items-center justify-center gap-2 rounded-xl py-10 text-center transition-colors",
//       theme.border.dashed,
//       theme.border.dashedHover
//     )}
//   >
//     <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", theme.surface.subtle, theme.text.secondary)}>
//       <Plus className="h-5 w-5" />
//     </span>

//     <span className={cn("text-sm font-semibold", theme.text.primary)}>Add Range Rule</span>

//     {label && <span className={cn("text-xs", theme.text.muted)}>{label}</span>}
//   </button>
// );

// // ---------------------------------------------------------------------------
// // Main Page
// // ---------------------------------------------------------------------------

// const CreateInterpretation = () => {
//   const [activeVersionId, setActiveVersionId] = useState(ASSESSMENT_VERSIONS[0].id);
//   const activeVersion = ASSESSMENT_VERSIONS.find((v) => v.id === activeVersionId);

//   // -------------------------------------------------------------------------
//   // VIEW FLOW
//   //
//   // builder -> report -> review
//   // -------------------------------------------------------------------------

//   const [view, setView] = useState("builder");

//   // -------------------------------------------------------------------------
//   // Mobile sidebar drawer
//   // -------------------------------------------------------------------------

//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // -------------------------------------------------------------------------
//   // Active subsection
//   // -------------------------------------------------------------------------

//   const firstSubsectionId = activeVersion.sections[0]?.subsections[0]?.id ?? null;
//   const [activeId, setActiveId] = useState(firstSubsectionId);
//   const [filter, setFilter] = useState("");

//   // -------------------------------------------------------------------------
//   // Rules
//   // -------------------------------------------------------------------------

//   const [subsectionRules, setSubsectionRules] = useState(() =>
//     Object.fromEntries(Object.entries(SUBSECTION_DETAILS).map(([id, d]) => [id, d.rules]))
//   );

//   // -------------------------------------------------------------------------
//   // Report sample scores
//   // -------------------------------------------------------------------------

//   const [sampleScores, setSampleScores] = useState({});

//   const handleSampleScoreChange = (subsectionId, value) => {
//     setSampleScores((prev) => ({ ...prev, [subsectionId]: value }));
//   };

//   // -------------------------------------------------------------------------
//   // Change assessment version
//   // -------------------------------------------------------------------------

//   const handleVersionSelect = (version) => {
//     setActiveVersionId(version.id);
//     setFilter("");
//     setActiveId(version.sections[0]?.subsections[0]?.id ?? null);
//     setView("builder");
//   };

//   // -------------------------------------------------------------------------
//   // Active detail
//   // -------------------------------------------------------------------------

//   const detail = activeId ? SUBSECTION_DETAILS[activeId] : null;
//   const rules = activeId ? subsectionRules[activeId] ?? [] : [];

//   // -------------------------------------------------------------------------
//   // Rule updater
//   // -------------------------------------------------------------------------

//   const setRulesForActive = (updater) => {
//     if (!activeId) return;

//     setSubsectionRules((prev) => ({
//       ...prev,
//       [activeId]: typeof updater === "function" ? updater(prev[activeId] ?? []) : updater,
//     }));
//   };

//   const updateRule = (updated) => {
//     setRulesForActive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
//   };

//   // -------------------------------------------------------------------------
//   // Duplicate rule
//   // -------------------------------------------------------------------------

//   const duplicateRule = (id) => {
//     setRulesForActive((prev) => {
//       const source = prev.find((r) => r.id === id);
//       if (!source) return prev;

//       const index = prev.findIndex((r) => r.id === id);

//       const copy = {
//         ...source,
//         id: makeRuleId(),
//         recommended_actions: (source.recommended_actions ?? []).map((a) => ({
//           ...a,
//           id: makeRuleId(),
//         })),
//       };

//       const next = [...prev];
//       next.splice(index + 1, 0, copy);

//       return next;
//     });
//   };

//   // -------------------------------------------------------------------------
//   // Delete rule
//   // -------------------------------------------------------------------------

//   const deleteRule = (id) => {
//     setRulesForActive((prev) => prev.filter((r) => r.id !== id));
//   };

//   // -------------------------------------------------------------------------
//   // Add rule
//   // -------------------------------------------------------------------------

//   const addRule = () => {
//     setRulesForActive((prev) => {
//       const lowestMin = prev.length ? Math.min(...prev.map((r) => Number(r.minimum_score))) : 100;
//       const newMax = Math.max(lowestMin - 1, 0);

//       const newRule = {
//         id: makeRuleId(),
//         minimum_score: 0,
//         maximum_score: newMax,
//         rating: RATING_BANK[0],
//         title: "",
//         performance_analysis: "",
//         report_icon: "star",
//         recommended_actions: [],
//       };

//       return [...prev, newRule];
//     });
//   };

//   // -------------------------------------------------------------------------
//   // STEP 1
//   // Interpretation Builder -> Report
//   // -------------------------------------------------------------------------

//   const handleSaveAndNext = () => {
//     console.log("Saving interpretation:", {
//       assessmentVersionId: activeVersion.id,
//       rules: subsectionRules,
//     });

//     // TODO:
//     // await saveInterpretationApi(...)

//     setView("report");
//   };

//   // -------------------------------------------------------------------------
//   // STEP 2
//   // Report -> Review
//   // -------------------------------------------------------------------------

//   const handleReportSaveAndNext = () => {
//     console.log("Saving report configuration:", {
//       assessmentVersionId: activeVersion.id,
//       sampleScores,
//       rules: subsectionRules,
//     });

//     // TODO:
//     // await saveReportConfigurationApi(...)

//     setView("review");
//   };

//   // -------------------------------------------------------------------------
//   // STEP 3
//   // Publish
//   // -------------------------------------------------------------------------

//   const handlePublish = async () => {
//     try {
//       console.log("Publishing interpretation:", {
//         assessmentVersionId: activeVersion.id,
//         rules: subsectionRules,
//         sampleScores,
//       });

//       // TODO:
//       // await publishInterpretationApi(...)

//       // After successful API response:
//       alert("Interpretation published successfully.");
//     } catch (error) {
//       console.error("Failed to publish interpretation", error);
//     }
//   };

//   // -------------------------------------------------------------------------
//   // Sidebar filter
//   // -------------------------------------------------------------------------

//   const filteredSections = useMemo(() => {
//     return activeVersion.sections
//       .map((section) => ({
//         ...section,
//         subsections: section.subsections.filter((sub) =>
//           sub.label.toLowerCase().includes(filter.toLowerCase())
//         ),
//       }))
//       .filter((section) => section.subsections.length > 0);
//   }, [activeVersion, filter]);

//   // -------------------------------------------------------------------------
//   // RENDER
//   // -------------------------------------------------------------------------

//   const sidebarContent = (
//     <>
//       <div className="space-y-3 border-b border-slate-100 p-4">
//         <div className="flex items-center gap-2">
//           <div className="min-w-0 flex-1">
//             <AssessmentVersionPicker value={activeVersion} onSelect={handleVersionSelect} />
//           </div>

//           <button
//             type="button"
//             onClick={() => setSidebarOpen(false)}
//             aria-label="Close menu"
//             className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:hidden", theme.surface.hover, theme.text.muted)}
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         <div className="relative">
//           <Search className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", theme.text.muted)} />

//           <Input
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             placeholder="Filter dimensions..."
//             className={cn("pl-9", theme.input.searchPill)}
//           />
//         </div>
//       </div>

//       <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
//         {filteredSections.length === 0 && (
//           <p className={cn("px-1 text-sm", theme.text.muted)}>No dimensions match "{filter}".</p>
//         )}

//         {filteredSections.map((section) => (
//           <div key={section.id}>
//             <p className={cn("mb-2 px-1", theme.nav.groupLabel)}>{section.name}</p>

//             <div className="space-y-1">
//               {section.subsections.map((item) => (
//                 <SubsectionListItem
//                   key={item.id}
//                   item={item}
//                   active={view === "builder" && item.id === activeId}
//                   ruleCount={subsectionRules[item.id]?.length ?? 0}
//                   onSelect={(id) => {
//                     setActiveId(id);
//                     setView("builder");
//                     setSidebarOpen(false);
//                   }}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}
//       </nav>
//     </>
//   );

//   return (
//     <div className={cn("flex h-full overflow-hidden", theme.surface.page)}>
//       {/* ================================================================ */}
//       {/* SIDEBAR — desktop: static column. mobile: slide-over drawer.    */}
//       {/* ================================================================ */}

//       <aside
//         className={cn(
//           "hidden w-72 shrink-0 flex-col border-r md:flex",
//           theme.border.default,
//           theme.surface.card
//         )}
//       >
//         {sidebarContent}
//       </aside>

//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 md:hidden">
//           <div
//             className="absolute inset-0 bg-slate-900/40"
//             onClick={() => setSidebarOpen(false)}
//             aria-hidden="true"
//           />

//           <aside
//             className={cn(
//               "absolute inset-y-0 left-0 flex w-[85%] max-w-72 flex-col shadow-xl",
//               theme.surface.card
//             )}
//           >
//             {sidebarContent}
//           </aside>
//         </div>
//       )}

//       {/* ================================================================ */}
//       {/* MAIN COLUMN                                                      */}
//       {/* ================================================================ */}

//       <div className="flex min-w-0 flex-1 flex-col">
//         {/* ============================================================ */}
//         {/* HEADER                                                        */}
//         {/* ============================================================ */}

//         <header
//           className={cn(
//             "flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4",
//             theme.border.default,
//             theme.surface.card
//           )}
//         >
//           {/* Header title */}
//           <div className="flex min-w-0 items-center gap-2">
//             <button
//               type="button"
//               onClick={() => setSidebarOpen(true)}
//               aria-label="Open dimensions menu"
//               className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:hidden", theme.surface.hover, theme.text.muted)}
//             >
//               <Menu className="h-5 w-5" />
//             </button>

//             <div className="min-w-0">
//               {view === "builder" && (
//                 <>
//                   <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">Interpretation Rules</h1>

//                   <p className="hidden text-xs text-slate-400 sm:block">Configure score-based performance interpretation</p>
//                 </>
//               )}

//               {view === "report" && (
//                 <>
//                   <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">Report Preview</h1>

//                   <p className="hidden text-xs text-slate-400 sm:block">Preview how the interpretation will appear in the student report</p>
//                 </>
//               )}

//               {view === "review" && (
//                 <>
//                   <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">Review & Publish</h1>

//                   <p className="hidden text-xs text-slate-400 sm:block">Review your interpretation configuration before publishing</p>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Header buttons */}
//           <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
//             {/* ====================================================== */}
//             {/* BUILDER HEADER                                         */}
//             {/* ====================================================== */}

//             {view === "builder" && (
//               <Button type="button" className={cn(theme.actionButton.primary, "w-full justify-center sm:w-auto")} onClick={handleSaveAndNext}>
//                 Save and Next
//                 <ArrowRight className="h-4 w-4" />
//               </Button>
//             )}

//             {/* ====================================================== */}
//             {/* REPORT HEADER                                          */}
//             {/* ====================================================== */}

//             {view === "report" && (
//               <>
//                 <Button type="button" variant="outline" className="flex-1 justify-center sm:flex-none" onClick={() => setView("builder")}>
//                   <ChevronLeft className="h-4 w-4" />
//                   <span className="hidden xs:inline">Back to Edit</span>
//                   <span className="xs:hidden">Back</span>
//                 </Button>

//                 <Button type="button" className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")} onClick={handleReportSaveAndNext}>
//                   Save and Next
//                   <ArrowRight className="h-4 w-4" />
//                 </Button>
//               </>
//             )}

//             {/* ====================================================== */}
//             {/* REVIEW HEADER                                          */}
//             {/* ====================================================== */}

//             {view === "review" && (
//               <>
//                 <Button type="button" variant="outline" className="flex-1 justify-center sm:flex-none" onClick={() => setView("report")}>
//                   <ChevronLeft className="h-4 w-4" />
//                   <span className="hidden xs:inline">Back to Report</span>
//                   <span className="xs:hidden">Back</span>
//                 </Button>

//                 <Button type="button" className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")} onClick={handlePublish}>
//                   <Sparkles className="h-4 w-4" />
//                   Publish
//                 </Button>
//               </>
//             )}
//           </div>
//         </header>

//         {/* ============================================================ */}
//         {/* REPORT                                                        */}
//         {/* ============================================================ */}

//         {view === "report" ? (
//           <ReportPreview
//             activeVersion={activeVersion}
//             subsectionRules={subsectionRules}
//             sampleScores={sampleScores}
//             onScoreChange={handleSampleScoreChange}
//             onBack={() => setView("builder")}
//             onSaveAndNext={handleReportSaveAndNext}
//           />
//         ) : view === "review" ? (
//           /* ========================================================== */
//           /* REVIEW                                                     */
//           /* ========================================================== */

//           <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.subtle)}>
//             <div className="mx-auto max-w-6xl">
//               <ReviewInterpretationStep
//                 activeVersion={activeVersion}
//                 subsectionRules={subsectionRules}
//                 onGoToBuilder={() => setView("builder")}
//                 onEditSubsection={(id) => {
//                   setActiveId(id);
//                   setView("builder");
//                 }}
//                 onPublish={handlePublish}
//               />
//             </div>
//           </main>
//         ) : (
//           /* ========================================================== */
//           /* BUILDER                                                    */
//           /* ========================================================== */

//           <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.subtle)}>
//             {!detail ? (
//               <div className={cn("mx-auto max-w-4xl rounded-xl py-16 text-center text-sm", theme.border.dashed, theme.text.muted)}>
//                 Select a dimension from the sidebar to configure its rules.
//               </div>
//             ) : (
//               <div className="mx-auto max-w-4xl space-y-6">
//                 {/* Builder heading */}
//                 <div className="flex flex-wrap items-start justify-between gap-4">
//                   <div>
//                     <div className="flex flex-wrap items-center gap-3">
//                       <h2 className={cn("text-xl font-extrabold tracking-tight sm:text-2xl", theme.text.primary)}>{detail.title}</h2>

//                       <span className={cn(detail.status === "Validated" ? theme.badge.pillPositive : theme.badge.pillNeutral)}>
//                         {detail.status}
//                       </span>
//                     </div>

//                     <p className={cn("mt-2 max-w-md text-sm sm:text-base", theme.text.secondary)}>{detail.description}</p>
//                   </div>

//                   <button type="button" onClick={addRule} className={cn(theme.actionButton.softChip, "w-full sm:w-auto")}>
//                     <Plus className="h-5 w-5" />

//                     <span className="text-left text-base font-bold leading-tight">
//                       Add
//                       <br />
//                       Range Rule
//                     </span>
//                   </button>
//                 </div>

//                 {/* Rules */}
//                 <div className="space-y-4">
//                   {rules.map((rule) => (
//                     <RangeRuleCard key={rule.id} rule={rule} onChange={updateRule} onDuplicate={duplicateRule} onDelete={deleteRule} />
//                   ))}

//                   <AddRangeRuleSlot label={coverageGapLabel(rules)} onAdd={addRule} />
//                 </div>
//               </div>
//             )}
//           </main>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateInterpretation;