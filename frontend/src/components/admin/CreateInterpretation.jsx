import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

import ReviewInterpretationStep from "./createInterpretation/ReviewInterpretationStep";
import ReportPreview from "./createInterpretation/ReportPreview";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssessmentsWithVersions,
  createInterpretationRules,
  updateInterpretationRules,
  fetchInterpretationDraftByVersion,
} from "@/slices/interpretationSlice";

// ---------------------------------------------------------------------------
// Route to return to when the admin backs out of this page entirely.
// TODO: update this to match whatever path InterpretationOverview is
// actually mounted at in your router config.
// ---------------------------------------------------------------------------
const INTERPRETATION_OVERVIEW_ROUTE = "/s-admin/interpretation-overview";

// ---------------------------------------------------------------------------
// Theme merge
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
// Rating bank
// ---------------------------------------------------------------------------

const RATING_BANK = [
  { id: "excellent", label: "Excellent", tone: "emerald", min: 19, max: 21 },
  { id: "very-good", label: "Very Good", tone: "teal", min: 16, max: 18 },
  { id: "good", label: "Good", tone: "blue", min: 12, max: 15 },
  { id: "fair", label: "Fair", tone: "amber", min: 8, max: 11 },
  { id: "needs-improvement", label: "Needs Improvement", tone: "red", min: 0, max: 7 },
];

export const toneOf = (rating) => theme.rating.tones[rating?.tone] ?? theme.rating.tones.slate;

const COLOR_OPTIONS = [
  { key: "emerald", label: "Emerald" },
  { key: "amber", label: "Amber" },
  { key: "blue", label: "Blue" },
  { key: "red", label: "Red" },
  { key: "teal", label: "Teal" },
  { key: "slate", label: "Slate" },
];

export const colorToneOf = (colorKey) => theme.rating.tones[colorKey] ?? null;

const ICON_OPTIONS = [
  { key: "star", icon: Star, tone: "amber" },
  { key: "graduation", icon: GraduationCap, tone: "indigo" },
  { key: "trending", icon: TrendingUp, tone: "emerald" },
  { key: "target", icon: Target, tone: "rose" },
  { key: "book", icon: BookOpen, tone: "blue" },
  { key: "award", icon: Award, tone: "purple" },
];

const MAX_ACTION_PLAN_RECOMMENDATIONS = 5;

export const iconForKey = (key) => ICON_OPTIONS.find((o) => o.key === key) ?? ICON_OPTIONS[0];

const iconToneClass = (toneKey) => theme.iconSwatch.tones[toneKey] ?? theme.iconSwatch.tones.amber;

const SUBSECTION_ICON_BANK = [Brain, PuzzleIcon, Users2, MessageSquare];

const SUBSECTION_ICON_KEYWORDS = [
  { test: /numer|math|quant/i, icon: Brain },
  { test: /logic|deduct|reason/i, icon: PuzzleIcon },
  { test: /collab|team|social/i, icon: Users2 },
  { test: /verbal|interest|riasec|communicat/i, icon: MessageSquare },
];

const resolveSubsectionIcon = (name = "") => {
  const match = SUBSECTION_ICON_KEYWORDS.find((entry) => entry.test.test(name));
  if (match) return match.icon;

  const hash = Array.from(String(name)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return SUBSECTION_ICON_BANK[hash % SUBSECTION_ICON_BANK.length];
};

const normalizeSubsection = (raw) => {
  const id = String(raw?.subsection_id ?? raw?.id ?? raw?.uuid ?? "");
  const label = raw?.subsection_name ?? raw?.label ?? raw?.name ?? raw?.title ?? "Untitled";

  return {
    id,
    label,
    questionCount: raw?.question_count ?? 0,
    icon: resolveSubsectionIcon(label),
  };
};

const normalizeSection = (raw) => {
  const id = String(raw?.id ?? raw?.section_id ?? raw?.uuid ?? "");
  const name = raw?.name ?? raw?.section_name ?? raw?.title ?? "Untitled Section";
  const subsectionsRaw = raw?.subsections ?? raw?.sub_sections ?? raw?.subSections ?? [];

  return {
    id,
    name,
    subsections: subsectionsRaw.map(normalizeSubsection),
  };
};

export const normalizeVersion = (assessmentName, rawVersion) => {
  const id = String(rawVersion?.id ?? rawVersion?.assessment_version_id ?? rawVersion?.version_id ?? rawVersion?.uuid ?? "");
  const versionNumber =
    rawVersion?.versionNumber ?? rawVersion?.version_number ?? rawVersion?.version ?? "V1.0";
  const versionName =
    rawVersion?.versionName ?? rawVersion?.version_name ?? rawVersion?.name ?? String(versionNumber);
  const status = rawVersion?.status ?? rawVersion?.state ?? "Draft";
  const sectionsRaw = rawVersion?.sections ?? rawVersion?.assessment_sections ?? [];
  const directSubsections = rawVersion?.subsections ?? rawVersion?.sub_sections ?? [];
  const sections = sectionsRaw.length
    ? sectionsRaw.map(normalizeSection)
    : directSubsections.length
      ? [{
        id: `version-${id}-subsections`,
        name: rawVersion?.section_name ?? "Assessment sections",
        subsections: directSubsections.map(normalizeSubsection),
      }]
      : [];

  return {
    id,
    name: assessmentName,
    versionNumber: String(versionNumber),
    versionName,
    status,
    sections,
  };
};

export const normalizeAssessmentVersions = (assessments) => {
  if (!Array.isArray(assessments)) return [];

  return assessments.flatMap((assessment) => {
    const assessmentName = assessment?.name ?? assessment?.assessment_name ?? assessment?.title ?? "Untitled Assessment";
    const versions = assessment?.versions ?? assessment?.assessment_versions ?? [assessment];

    return versions.map((version) => normalizeVersion(assessmentName, version));
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const coverageGapLabel = (rules) => {
  if (rules.length === 0) {
    return "Configure logic for 0–100 range";
  }

  const lowestMin = Math.min(...rules.map((r) => Number(r.minimum_score)));

  if (lowestMin <= 0) {
    return null;
  }

  return `Configure logic for 0–${lowestMin - 1} range`;
};

const getScoreRangeError = (rule) => {
  const minValue = rule.minimum_score;
  const maxValue = rule.maximum_score;
  if (minValue === "" || minValue === null || maxValue === "" || maxValue === null) {
    return "Enter both minimum and maximum scores.";
  }

  const min = Number(minValue);
  const max = Number(maxValue);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "Scores must be valid numbers.";
  if (min < 0 || max < 0) return "Scores cannot be negative.";
  if (max <= min) return "Maximum score must be greater than minimum score.";
  return null;
};

const getOverlappingRangeError = (rules) => {
  const validRanges = (rules ?? [])
    .filter((rule) => !getScoreRangeError(rule))
    .map((rule) => ({ min: Number(rule.minimum_score), max: Number(rule.maximum_score) }))
    .sort((a, b) => a.min - b.min);

  for (let index = 1; index < validRanges.length; index += 1) {
    if (validRanges[index].min <= validRanges[index - 1].max) {
      return "Some score ranges overlap. Please adjust the minimum or maximum score so each range is separate.";
    }
  }

  return null;
};

const getDuplicateRatingError = (rules) => {
  const ratings = new Set();

  for (const rule of rules ?? []) {
    const ratingKey = String(rule.rating?.id ?? rule.rating?.label ?? "").trim().toLowerCase();
    if (!ratingKey) continue;
    if (ratings.has(ratingKey)) {
      return "Each score range needs a different rating tag. Please choose another tag.";
    }
    ratings.add(ratingKey);
  }

  return null;
};

const getRuleErrors = (rule) => {
  const errors = [];

  if (getScoreRangeError(rule)) errors.push("valid score range");
  if (!rule.rating) errors.push("rating tag");
  if (!rule.display_color) errors.push("color");
  if (!rule.performance_analysis?.trim()) errors.push("performance interpretation");
  if (!rule.action_plan?.trim()) errors.push("action plan");

  return errors;
};

const isRuleValid = (rule) => getRuleErrors(rule).length === 0;

export const isSubsectionComplete = (rules) => {
  if (!rules || rules.length === 0) return false;
  if (coverageGapLabel(rules)) return false;
  if (getOverlappingRangeError(rules)) return false;
  if (getDuplicateRatingError(rules)) return false;
  return rules.every(isRuleValid);
};

const getSubsectionBlockReason = (rules) => {
  if (!rules || rules.length === 0) {
    return "Add at least one range rule before continuing.";
  }

  const gap = coverageGapLabel(rules);
  if (gap) {
    return `Score range isn't fully covered — ${gap.toLowerCase()}.`;
  }

  const overlap = getOverlappingRangeError(rules);
  if (overlap) return overlap;

  const duplicateRating = getDuplicateRatingError(rules);
  if (duplicateRating) return duplicateRating;

  const invalidRule = rules.find((r) => !isRuleValid(r));
  if (invalidRule) {
    const missing = getRuleErrors(invalidRule).join(", ");
    return `Complete all required fields (${missing}) on every rule before continuing.`;
  }

  return null;
};

const makeRuleId = () => `r_${Math.random().toString(36).slice(2, 9)}`;

const makeDefaultRule = () => ({
  id: makeRuleId(),
  minimum_score: 0,
  maximum_score: 99,
  rating: null,
  display_color: null,
  title: "",
  performance_analysis: "",
  action_plan: "",
  report_icon: "star",
  action_plan_options: [{ id: makeRuleId(), icon: "star", text: "" }],
});

const makeDefaultSubsectionRules = () => [makeDefaultRule()];

export const matchRuleForScore = (rules, score) => {
  const n = Number(score);

  return rules.find((r) => n >= Number(r.minimum_score) && n <= Number(r.maximum_score)) ?? null;
};

export const REPORT_TIER_LABELS = ["Needs Improvement", "Fair", "Good", "Very Good", "Excellent"];

export const tierIndexForScore = (score) => {
  const n = Number(score);

  return Math.min(4, Math.max(0, Math.floor(n / 20)));
};

const actionPlanOptionFields = (options = []) => {
  const fields = {};

  options.forEach((opt, idx) => {
    if (opt.text?.trim()) {
      fields[`action_plan_option${idx + 1}`] = opt.text.trim();
    }
  });

  return fields;
};

// `rule.serverId` (when present) is the primary key the backend already
// knows about for this row. It's included on outgoing payloads so a
// bulk-update call can match rows instead of the API creating duplicates.
const buildSubsectionBulkPayload = ({ assessmentVersionId, subsectionId, rules, isDraft }) => ({
  assessment_version_id: Number(assessmentVersionId),
  is_draft: isDraft,
  subsections: rules.map((rule) => ({
    ...(rule.serverId ? { id: rule.serverId } : {}),
    subsection_id: Number(subsectionId),
    min_score: Number(rule.minimum_score),
    max_score: Number(rule.maximum_score),
    rating: rule.rating?.label ?? "",
    performance_analysis: rule.performance_analysis,
    action_plan: rule.action_plan,
    ...actionPlanOptionFields(rule.action_plan_options),
    display_color: colorToneOf(rule.display_color)?.hex ?? rule.display_color,
  })),
});

// ---------------------------------------------------------------------------
// Draft prefill helpers
//
// The draft GET endpoint (`fetchInterpretationDraftByVersion`) returns rows
// shaped like the *outgoing* bulk payload (min_score / max_score / rating
// as a label string / display_color as a hex / action_plan_option1..N).
// These functions invert that shape back into what the rule cards expect,
// and are deliberately defensive about the response envelope since the
// exact wrapper (`{ data: [...] }` vs `{ subsections: [...] }` vs a bare
// array) isn't pinned down yet — tighten once the real payload is known.
// ---------------------------------------------------------------------------

const RATING_BY_LABEL = RATING_BANK.reduce((acc, rating) => {
  acc[rating.label.toLowerCase()] = rating;
  return acc;
}, {});

const colorKeyForHex = (hex) => {
  if (!hex) return null;
  const normalized = String(hex).toLowerCase();
  const entry = Object.entries(theme.rating.tones).find(
    ([, tone]) => tone.hex?.toLowerCase() === normalized
  );
  return entry?.[0] ?? null;
};

// Turns one interpretation-rule row from the draft GET endpoint into the
// local rule shape used by RangeRuleCard. `serverId` is kept separate from
// the local `id` (a React key) so a later save knows this row already
// exists in the backend and should be updated, not created again.
const normalizeDraftRule = (raw) => {
  const ratingLabel = raw?.rating ?? raw?.rating_label ?? "";
  const rating = RATING_BY_LABEL[String(ratingLabel).trim().toLowerCase()] ?? null;
  const display_color =
    (raw?.display_color && colorKeyForHex(raw.display_color)) ?? rating?.tone ?? null;

  const action_plan_options = Object.keys(raw || {})
    .map((key) => key.match(/^action_plan_option(\d+)$/))
    .filter(Boolean)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((match) => raw[match[0]])
    .filter((text) => text?.trim())
    .map((text) => ({ id: makeRuleId(), icon: "star", text }));

  return {
    id: makeRuleId(),
    serverId: raw?.id ?? raw?.rule_id ?? raw?.interpretation_rule_id ?? null,
    subsectionId: String(raw?.subsection_id ?? raw?.subsectionId ?? ""),
    sectionId: raw?.section_id != null ? String(raw.section_id) : null,
    // Real names straight off the rules payload — this is the source of
    // truth for display labels, since the version-list endpoint's
    // subsections don't reliably carry section_id/section_name.
    sectionName: raw?.section_name ?? raw?.sectionName ?? null,
    subsectionLabel: raw?.subsection ?? raw?.subsection_name ?? raw?.subsectionName ?? null,
    minimum_score: raw?.min_score ?? raw?.minimum_score ?? 0,
    maximum_score: raw?.max_score ?? raw?.maximum_score ?? 0,
    rating,
    display_color,
    title: raw?.title ?? "",
    performance_analysis: raw?.performance_analysis ?? "",
    action_plan: raw?.action_plan ?? "",
    report_icon: raw?.report_icon ?? "star",
    action_plan_options,
  };
};

// Groups normalized draft rules by subsection id, matching the shape of
// local `subsectionRules` state (`{ [subsectionId]: Rule[] }`).
export const normalizeDraftToSubsectionRules = (draft) => {
  const rows = draft?.data ?? draft?.subsections ?? draft ?? [];
  if (!Array.isArray(rows)) return {};

  return rows.reduce((acc, raw) => {
    const rule = normalizeDraftRule(raw);
    if (!rule.subsectionId) return acc;
    acc[rule.subsectionId] = [...(acc[rule.subsectionId] ?? []), rule];
    return acc;
  }, {});
};

// Builds a full section -> subsection -> rules tree directly from the
// rules payload, using the section_name / subsection strings the backend
// actually sends on every row. This is what ViewInterpretation renders
// from — it never depends on the version-list endpoint's section grouping.
export const normalizeDraftToSections = (draft) => {
  const rows = draft?.data ?? draft?.subsections ?? draft ?? [];
  if (!Array.isArray(rows)) return [];

  const sectionMap = new Map();

  rows.forEach((raw) => {
    const rule = normalizeDraftRule(raw);
    if (!rule.subsectionId) return;

    const sectionId = rule.sectionId ?? "unassigned";
    const sectionName = rule.sectionName ?? "Untitled Section";

    if (!sectionMap.has(sectionId)) {
      sectionMap.set(sectionId, { id: sectionId, name: sectionName, subsectionMap: new Map() });
    }
    const section = sectionMap.get(sectionId);

    if (!section.subsectionMap.has(rule.subsectionId)) {
      section.subsectionMap.set(rule.subsectionId, {
        id: rule.subsectionId,
        label: rule.subsectionLabel ?? "Untitled",
        icon: resolveSubsectionIcon(rule.subsectionLabel ?? ""),
        rules: [],
      });
    }
    section.subsectionMap.get(rule.subsectionId).rules.push(rule);
  });

  return Array.from(sectionMap.values()).map((section) => ({
    id: section.id,
    name: section.name,
    subsections: Array.from(section.subsectionMap.values()),
  }));
};

// A subsection "has persisted rules" once at least one of its rows carries
// a serverId — i.e. it's already been saved at least once, so the next
// save should PUT/update rather than POST/create.
const hasPersistedRules = (rules) => (rules ?? []).some((r) => r.serverId);

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
// ---------------------------------------------------------------------------

const AssessmentVersionPicker = ({ value, onSelect, versions, loading, autoFocus = false }) => {
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
        disabled={loading}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-shadow",
          value ? theme.border.default : "border-2 border-dashed border-slate-300",
          theme.surface.card,
          theme.surface.hover,
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30",
          loading && "cursor-not-allowed opacity-60"
        )}
      >
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", theme.brand.logoBg)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
        </span>

        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm font-semibold", value ? theme.text.primary : "text-slate-400")}>
            {loading ? "Loading assessments..." : value ? value.name : "Select assessment version"}
          </span>

          <span className={cn("block truncate text-xs", theme.text.muted)}>
            {value ? `${value.versionNumber} · ${value.versionName}` : loading ? "Fetching from server" : "Required to continue"}
          </span>
        </span>

        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", theme.text.muted, open && "rotate-180")} />
      </button>

      {open && !loading && (
        <div role="listbox" className={cn("absolute left-0 top-full z-30 mt-2 w-full max-h-48 overflow-y-auto", theme.dropdown.panel)}>
          {versions.length === 0 && (
            <p className={cn("px-2.5 py-2 text-sm", theme.text.muted)}>No assessment versions found.</p>
          )}

          {versions.map((version) => {
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
                  {version.versionNumber} · {version.versionName} · {version.sections.length} sections
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
// ---------------------------------------------------------------------------

const SubsectionListItem = ({ item, stepNumber, complete, active, ruleCount, onSelect }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.key)}
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

const RatingTagPicker = ({ value, onSelect, invalid = false }) => {
  const { open, setOpen, ref } = usePopover();
  const tone = toneOf(value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          theme.rating.tagPill,
          value ? tone.solid : "bg-slate-300",
          invalid && !value && "ring-2 ring-offset-1 ring-red-400"
        )}
      >
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
// Color picker
// ---------------------------------------------------------------------------

const ColorPicker = ({ value, onSelect, invalid = false }) => {
  const { open, setOpen, ref } = usePopover();
  const current = colorToneOf(value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select display color"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow ring-1",
          current ? current.solid : "bg-white",
          invalid && !current ? "ring-2 ring-red-400" : "ring-slate-200"
        )}
      >
        {!current && <span className="h-3 w-3 rounded-full border border-dashed border-slate-300" />}
      </button>

      {open && (
        <div className={cn("absolute left-0 top-full z-20 mt-2 flex items-center gap-1.5 p-2", theme.dropdown.panel)}>
          {COLOR_OPTIONS.map((opt) => {
            const optTone = theme.rating.tones[opt.key];
            const isActive = opt.key === value;

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSelect(opt.key);
                  setOpen(false);
                }}
                aria-label={opt.label}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:scale-110",
                  optTone.solid,
                  isActive && "ring-2 ring-offset-1 ring-slate-900"
                )}
              >
                {isActive && <Check className="h-3 w-3 text-white" />}
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
// Action plan option
// ---------------------------------------------------------------------------

const ActionPlanOptionCard = ({ option, onChange, onRemove, invalid = false }) => {
  const [editing, setEditing] = useState(!option.text);

  return (
    <div className={cn("group flex gap-3 rounded-xl p-2.5", theme.surface.subtle)}>
      <IconPicker value={option.icon} onSelect={(icon) => onChange({ icon })} size="h-8 w-8" />

      <div className="min-w-0 flex-1">
        {editing ? (
          <Textarea
            autoFocus
            value={option.text}
            onChange={(e) => onChange({ text: e.target.value })}
            onBlur={() => setEditing(false)}
            placeholder="Describe this action plan option..."
            className={cn(
              "min-h-[64px]",
              invalid && !option.text?.trim() ? "border-red-300 focus-visible:ring-red-300" : theme.border.default,
              theme.surface.card,
              "text-sm"
            )}
          />
        ) : (
          <p
            role="button"
            tabIndex={0}
            onClick={() => setEditing(true)}
            className={cn("cursor-text text-sm leading-relaxed", theme.text.link)}
          >
            {option.text || <span className={cn("italic", theme.text.muted)}>Click to describe this option…</span>}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} aria-label="Edit option" className={theme.button.iconGhost}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove option"
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

const RangeRuleCard = ({ rule, onChange, onDuplicate, onDelete, showErrors, hasDuplicateRating }) => {
  const [expanded, setExpanded] = useState(true);
  const tone = toneOf(rule.rating);
  const cardTone = colorToneOf(rule.display_color) ?? tone;
  const actionPlanOptions = rule.action_plan_options ?? [];
  const errors = getRuleErrors(rule);
  const displayErrors = showErrors ? errors : [];
  const scoreRangeError = getScoreRangeError(rule);

  const updateOptions = (updater) => {
    onChange({
      ...rule,
      action_plan_options: updater(actionPlanOptions),
    });
  };

  const addOption = () => {
    if (actionPlanOptions.length >= MAX_ACTION_PLAN_RECOMMENDATIONS) return;
    updateOptions((prev) => [...prev, { id: makeRuleId(), icon: "star", text: "" }]);
  };

  const updateOption = (id, patch) => {
    updateOptions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeOption = (id) => {
    updateOptions((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        displayErrors.length > 0 ? "border-red-300" : cardTone.border,
        theme.surface.card
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5", cardTone.bg)}>
        <span className={cn("text-sm font-bold", theme.text.primary)}>If score is</span>

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5",
            showErrors && scoreRangeError ? "border-red-400" : cardTone.border,
            theme.surface.card
          )}
        >
          <input
            type="number"
            min={0}
            value={rule.minimum_score}
            onChange={(e) => onChange({ ...rule, minimum_score: e.target.value })}
            className={cn("w-10 text-base", theme.input.inlineNumber)}
          />

          <span className={theme.text.muted}>—</span>

          <input
            type="number"
            min={0}
            value={rule.maximum_score}
            onChange={(e) => onChange({ ...rule, maximum_score: e.target.value })}
            className={cn("w-15 text-base", theme.input.inlineNumber)}
          />
        </div>

        {showErrors && scoreRangeError && (
          <p className="w-full text-xs font-medium text-red-600">{scoreRangeError}</p>
        )}

        <span className="hidden h-6 w-px shrink-0 bg-slate-200/80 sm:block" />

        <span className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
          Tag<span className="text-red-500">*</span>:
        </span>

        <RatingTagPicker
          value={rule.rating}
          onSelect={(rating) => onChange({ ...rule, rating, display_color: rating.tone })}
          invalid={showErrors && (!rule.rating || hasDuplicateRating)}
        />

        {showErrors && hasDuplicateRating && (
          <p className="w-full text-xs font-medium text-red-600">
            Choose a different rating tag for this score range.
          </p>
        )}

        <span className="hidden h-6 w-px shrink-0 bg-slate-200/80 sm:block" />

        <span className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
          Color<span className="text-red-500">*</span>:
        </span>

        <ColorPicker
          value={rule.display_color}
          onSelect={(display_color) => onChange({ ...rule, display_color })}
          invalid={showErrors && !rule.display_color}
        />

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
          <div className="space-y-5">
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
                Performance Interpretation<span className="text-red-500">*</span>
              </p>

              <Textarea
                value={rule.performance_analysis}
                onChange={(e) => onChange({ ...rule, performance_analysis: e.target.value })}
                placeholder="Describe what this score range means..."
                className={cn(
                  "mt-1.5 min-h-[120px]",
                  showErrors && !rule.performance_analysis?.trim()
                    ? "border-red-300 focus-visible:ring-red-300"
                    : theme.input.textareaCard
                )}
              />

              {showErrors && !rule.performance_analysis?.trim() && (
                <p className="mt-1 text-xs font-medium text-red-500">This field is required.</p>
              )}
            </div>

            <div>
              <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
                Feedback<span className="text-red-500">*</span>
              </p>

              <Textarea
                value={rule.action_plan}
                onChange={(e) => onChange({ ...rule, action_plan: e.target.value })}
                placeholder="Describe the overall feedback for this score range..."
                className={cn(
                  "mt-1.5 min-h-[100px]",
                  showErrors && !rule.action_plan?.trim()
                    ? "border-red-300 focus-visible:ring-red-300"
                    : theme.input.textareaCard
                )}
              />

              {showErrors && !rule.action_plan?.trim() && (
                <p className="mt-1 text-xs font-medium text-red-500">This field is required.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-xs font-bold uppercase tracking-wide", theme.text.muted)}>
                Recommended Action Plan
              </p>

              <button
                type="button"
                onClick={addOption}
                disabled={actionPlanOptions.length >= MAX_ACTION_PLAN_RECOMMENDATIONS}
                className={cn(
                  "inline-flex items-center gap-1",
                  theme.text.linkStrong,
                  actionPlanOptions.length >= MAX_ACTION_PLAN_RECOMMENDATIONS && "cursor-not-allowed opacity-50"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add recommendation 
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {actionPlanOptions.length === 0 ? (
                <p className={cn("rounded-xl px-4 py-5 text-center text-xs", theme.border.dashed, theme.text.muted)}>
                  No action plan recommendation yet — add one above.
                </p>
              ) : (
                actionPlanOptions.map((option) => (
                  <ActionPlanOptionCard
                    key={option.id}
                    option={option}
                    onChange={(patch) => updateOption(option.id, patch)}
                    onRemove={() => removeOption(option.id)}
                    invalid={false}
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
// Publish confirmation dialog
// ---------------------------------------------------------------------------

const PublishConfirmDialog = ({ open, onConfirm, onCancel, isPublishing }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={cn("relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl", theme.border.default, theme.surface.card)}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="publish-confirm-title"
      >
        <div className={cn("mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white", theme.brand.logoBg)}>
          <Sparkles className="h-5 w-5" />
        </div>

        <h2 id="publish-confirm-title" className="mt-4 text-center text-lg font-bold text-slate-900">
          Publish this interpretation?
        </h2>

        <p className="mt-1.5 text-center text-sm text-slate-500">
          This will go live and start applying to new student reports immediately. You can still
          make changes and republish later.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={isPublishing} className={theme.actionButton.secondary}>
            Cancel
          </button>

          <Button type="button" className={theme.actionButton.primary} onClick={onConfirm} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Yes, Publish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const CreateInterpretation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    assessments,
    assessmentsLoading,
    assessmentsError,
    interpretationDraft,
    interpretationDraftLoading,
    interpretationDraftError,
    updateInterpretationRulesLoading,
  } = useSelector((state) => state.interpretation);

  useEffect(() => {
    dispatch(fetchAssessmentsWithVersions());
  }, [dispatch]);

  const assessmentVersions = useMemo(() => normalizeAssessmentVersions(assessments), [assessments]);

  // Seed from the URL so a page reload (or landing here with ?versionId=)
  // resolves straight back to the chosen version instead of showing the
  // "select assessment" gate again. This is also how "Continue Editing"
  // from the Overview list opens straight into a given draft — Overview
  // navigates to `/s-admin/create-interpretation?versionId=<assessment_version_id>`,
  // and that id is what feeds the draft GET below.
  const [activeVersionId, setActiveVersionId] = useState(() => searchParams.get("versionId"));

  const routedVersion = useMemo(() => {
    let routeState = location.state;
    if (!routeState && activeVersionId) {
      try {
        routeState = JSON.parse(sessionStorage.getItem(`interpretation-version-${activeVersionId}`) ?? "null");
      } catch {
        routeState = null;
      }
    }

    if (!routeState?.version) return null;
    const version = normalizeVersion(routeState.assessmentName ?? "Assessment", routeState.version);
    return version.id === String(activeVersionId) ? version : null;
  }, [activeVersionId, location.state]);

  const activeVersion = activeVersionId
    ? assessmentVersions.find((v) => v.id === String(activeVersionId)) ?? routedVersion
    : null;

  // Only treat a versionId as "stale" once assessments have actually
  // finished loading — otherwise a valid versionId from the URL gets
  // wiped out during the brief window before the fetch resolves.
  useEffect(() => {
    if (assessmentsLoading) return;

    if (
      activeVersionId &&
      !routedVersion &&
      !assessmentVersions.find((v) => v.id === String(activeVersionId))
    ) {
      setActiveVersionId(null);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("versionId");
          return next;
        },
        { replace: true }
      );
    }
  }, [assessmentVersions, activeVersionId, assessmentsLoading, routedVersion, setSearchParams]);

  const [view, setView] = useState("builder");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Each step's `key` is composite (`sectionId::subsectionId`) because the
  // *same* subsection can legitimately be reused under more than one
  // section. Keying local state by subsection id alone would make two
  // different sections silently share one rule set. `id` below stays the
  // raw subsection id, since that's what the save/publish payload needs.
  const flatSteps = useMemo(() => {
    if (!activeVersion) return [];
    return activeVersion.sections.flatMap((section) =>
      section.subsections.map((sub) => ({
        ...sub,
        sectionId: section.id,
        sectionName: section.name,
        key: `${section.id}::${sub.id}`,
      }))
    );
  }, [activeVersion]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeKey = flatSteps[activeStepIndex]?.key ?? null;
  const [filter, setFilter] = useState("");

  // Keyed by `step.key` (section + subsection), NOT by subsection id alone
  // — see the comment on `flatSteps` above.
  const [subsectionRules, setSubsectionRules] = useState({});

  // Seeds a blank default rule for any subsection that doesn't have rules
  // yet. Runs first; the draft-prefill effect below overrides these
  // defaults once the draft for the active version has loaded.
  useEffect(() => {
    setSubsectionRules((prev) => {
      const next = { ...prev };
      let changed = false;

      flatSteps.forEach((step) => {
        if (!(step.key in next)) {
          next[step.key] = makeDefaultSubsectionRules();
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [flatSteps]);

  const [showStepErrors, setShowStepErrors] = useState(false);

  const [isSavingStep, setIsSavingStep] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Controls the "are you sure?" dialog shown before the Publish button
  // actually fires the PUT bulk-update call with is_draft: false.
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const [sampleScores, setSampleScores] = useState({});

  const handleSampleScoreChange = (subsectionId, value) => {
    setSampleScores((prev) => ({ ...prev, [subsectionId]: value }));
  };

  // Tracks which version's draft has already been applied to local state,
  // so the prefill effect only runs once per version (and doesn't stomp on
  // edits the admin is actively making).
  const draftAppliedForVersionRef = useRef(null);

  // ---------------------------------------------------------------------
  // "Continue Editing" flow:
  // Overview navigates here with ?versionId=<assessment_version_id>.
  // As soon as that id resolves to a real `activeVersion`, fire the draft
  // GET (`GET /asse/interpretation-rules/version/:versionId/` via
  // fetchInterpretationDraftByVersion) so the builder can prefill.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!activeVersion) return;
    dispatch(fetchInterpretationDraftByVersion(activeVersion.id));
  }, [activeVersion?.id, dispatch]);

  // Prefill subsectionRules from the draft response, once per version.
  // Only overrides subsections the draft actually has data for — anything
  // else falls back to the blank default seeded above, so a subsection
  // with no saved rules yet still opens with a fresh rule card.
  //
  // CAVEAT: `fetchInterpretationDraftByVersion` returns rows keyed only by
  // `subsection_id` (per `normalizeDraftToSubsectionRules`). If the backend
  // truly cannot distinguish "this subsection's rules under Section A" from
  // "the same subsection's rules under Section B" (i.e. it doesn't also
  // store a section_id per interpretation rule), the *saved* draft will
  // still collide across sections even though local editing below is now
  // kept separate via `step.key`. If a subsection is genuinely reused
  // across sections with rules that must differ, the backend model needs a
  // section-aware identifier too — confirm with the API before relying on
  // this for that case.
  useEffect(() => {
    if (!activeVersion) return;
    if (interpretationDraftLoading) return;
    if (flatSteps.length === 0) return;
    if (draftAppliedForVersionRef.current === activeVersion.id) return;

    const draftRulesBySubsectionId = normalizeDraftToSubsectionRules(interpretationDraft);

    setSubsectionRules((prev) => {
      const next = { ...prev };
      flatSteps.forEach((step) => {
        const draftRules = draftRulesBySubsectionId[step.id];
        next[step.key] = draftRules?.length ? draftRules : next[step.key] ?? makeDefaultSubsectionRules();
      });
      return next;
    });

    draftAppliedForVersionRef.current = activeVersion.id;
  }, [activeVersion, interpretationDraft, interpretationDraftLoading, flatSteps]);

  // Navigate back to the interpretation list. Used by the header "Back"
  // button on the first step, and by the gate modal's own back link.
  const handleBackToOverview = () => {
    navigate(INTERPRETATION_OVERVIEW_ROUTE);
  };

  const handleVersionSelect = (version) => {
    // Allow the draft for the newly-picked version to be applied fresh.
    draftAppliedForVersionRef.current = null;

    setActiveVersionId(version.id);
    setFilter("");
    setActiveStepIndex(0);
    setShowStepErrors(false);
    setSaveError(null);
    setView("builder");

    // `replace: true` so picking a version doesn't add its own entry to
    // browser history — pressing back from anywhere in the builder goes
    // straight to wherever the admin was before landing on this page,
    // and reloading resolves the version from the URL instead of
    // re-showing the gate.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("versionId", version.id);
        return next;
      },
      { replace: true }
    );
  };

  const activeStep = flatSteps[activeStepIndex] ?? null;
  const rules = activeKey ? subsectionRules[activeKey] ?? [] : [];

  const detail = activeStep
    ? {
      title: activeStep.label,
      status: isSubsectionComplete(rules) ? "Validated" : "Draft",
      description: "Define performance thresholds and corresponding feedback for this dimension.",
    }
    : null;

  const isLastStep = flatSteps.length > 0 && activeStepIndex === flatSteps.length - 1;
  const blockReason = getSubsectionBlockReason(rules);

  const setRulesForActive = (updater) => {
    if (!activeKey) return;

    setSubsectionRules((prev) => ({
      ...prev,
      [activeKey]: typeof updater === "function" ? updater(prev[activeKey] ?? []) : updater,
    }));
  };

  const updateRule = (updated) => {
    setRulesForActive((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const duplicateRule = (id) => {
    setRulesForActive((prev) => {
      const source = prev.find((r) => r.id === id);
      if (!source) return prev;

      const index = prev.findIndex((r) => r.id === id);

      const copy = {
        ...source,
        id: makeRuleId(),
        // A duplicate is a brand-new row from the backend's point of view.
        serverId: null,
        action_plan_options: (source.action_plan_options ?? []).map((a) => ({
          ...a,
          id: makeRuleId(),
        })),
      };

      const next = [...prev];
      next.splice(index + 1, 0, copy);

      return next;
    });
  };

  const deleteRule = (id) => {
    setRulesForActive((prev) => prev.filter((r) => r.id !== id));
  };

  const addRule = () => {
    setRulesForActive((prev) => {
      const lowestMin = prev.length ? Math.min(...prev.map((r) => Number(r.minimum_score))) : 100;
      const newMax = Math.max(lowestMin - 1, 0);

      const newRule = {
        id: makeRuleId(),
        serverId: null,
        minimum_score: 0,
        maximum_score: newMax,
        rating: null,
        display_color: null,
        title: "",
        performance_analysis: "",
        action_plan: "",
        report_icon: "star",
        action_plan_options: [],
      };

      return [...prev, newRule];
    });
  };

  const handleStepSaveAndNext = async () => {
    if (blockReason) {
      setShowStepErrors(true);
      return;
    }

    const payload = buildSubsectionBulkPayload({
      assessmentVersionId: activeVersion.id,
      subsectionId: activeStep.id,
      rules,
      isDraft: true,
    });

    setIsSavingStep(true);
    setSaveError(null);

    try {
      // Once a subsection has at least one persisted row, keep updating it
      // instead of creating duplicates on every subsequent save.
      const saveThunk = hasPersistedRules(rules) ? updateInterpretationRules : createInterpretationRules;
      await dispatch(saveThunk(payload)).unwrap();

      const draftResult = await dispatch(fetchInterpretationDraftByVersion(activeVersion.id)).unwrap();
      const freshRules = normalizeDraftToSubsectionRules(draftResult)[activeStep.id] ?? [];

      // Positional match to pick up server-assigned ids for rows that were
      // just created for the first time. Swap for an id-based match if the
      // API starts echoing back a client-side reference instead.
      setSubsectionRules((prev) => ({
        ...prev,
        [activeKey]: (prev[activeKey] ?? []).map((rule, idx) => ({
          ...rule,
          serverId: freshRules[idx]?.serverId ?? rule.serverId ?? null,
        })),
      }));

      setShowStepErrors(false);

      if (isLastStep) {
        // Previously routed to the Report Preview step first:
        // setView("report");
        // Per request, skip the report preview and go straight to Review & Publish.
        setView("review");
      } else {
        setActiveStepIndex((prev) => Math.min(flatSteps.length - 1, prev + 1));
      }
    } catch (error) {
      console.error("Failed to save/fetch interpretation draft", error);

      setSaveError(
        typeof error === "string"
          ? error
          : error?.response?.data?.message || error?.message || "Failed to save this subsection. Please try again."
      );
    } finally {
      setIsSavingStep(false);
    }
  };

  // First step's "Back" now exits to the Overview page instead of being a
  // disabled no-op; every later step still just steps back one subsection.
  const handleStepBack = () => {
    if (activeStepIndex === 0) {
      handleBackToOverview();
      return;
    }

    setShowStepErrors(false);
    setSaveError(null);
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  const firstInvalidStep = useMemo(() => {
    return flatSteps.find((step) => getSubsectionBlockReason(subsectionRules[step.key])) ?? null;
  }, [flatSteps, subsectionRules]);

  const handleReportSaveAndNext = () => {
    if (firstInvalidStep) {
      alert(`"${firstInvalidStep.label}" still has required fields missing. Please complete it before continuing.`);
      return;
    }

    console.log("Saving report configuration:", {
      assessmentVersionId: activeVersion.id,
      sampleScores,
      rules: subsectionRules,
    });

    setView("review");
  };

  // Entry point for both Publish buttons (header + Review screen).
  // Validates first, then opens the confirmation dialog instead of firing
  // the API call directly — the actual PUT only happens once the admin
  // confirms in PublishConfirmDialog.
  const handlePublishClick = () => {
    if (firstInvalidStep) {
      alert(`"${firstInvalidStep.label}" still has required fields missing. Please complete it before publishing.`);
      return;
    }

    setShowPublishConfirm(true);
  };

  // Publish calls the PUT bulk-update endpoint
  // (`/asse/interpretation-rules/bulk-update/`) for every subsection, since
  // by the time an admin reaches Publish every rule has already been saved
  // at least once as a draft via handleStepSaveAndNext. Only called from
  // the confirmation dialog's "Yes, Publish" button.
  const handlePublish = async () => {
    if (firstInvalidStep) {
      alert(`"${firstInvalidStep.label}" still has required fields missing. Please complete it before publishing.`);
      return;
    }

    try {
      const payload = {
        assessment_version_id: Number(activeVersion.id),
        is_draft: false,
        subsections: flatSteps.flatMap((step) =>
          buildSubsectionBulkPayload({
            assessmentVersionId: activeVersion.id,
            subsectionId: step.id,
            rules: subsectionRules[step.key] ?? [],
            isDraft: false,
          }).subsections
        ),
      };

      await dispatch(updateInterpretationRules(payload)).unwrap();

      setShowPublishConfirm(false);
      alert("Interpretation published successfully.");
      navigate(INTERPRETATION_OVERVIEW_ROUTE);
    } catch (error) {
      console.error("Failed to publish interpretation", error);
      setShowPublishConfirm(false);
      alert(
        typeof error === "string"
          ? error
          : error?.response?.data?.message || error?.message || "Failed to publish. Please try again."
      );
    }
  };

  const goToStepByKey = (key) => {
    const index = flatSteps.findIndex((step) => step.key === key);
    if (index !== -1) {
      setShowStepErrors(false);
      setSaveError(null);
      setActiveStepIndex(index);
      setView("builder");
      setSidebarOpen(false);
    }
  };

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

  if (!activeVersion) {
    // "Continue Editing" deep-links here with ?versionId=... — never show
    // the "select assessment" gate while we still have a versionId to
    // resolve. This covers the whole window before assessmentVersions has
    // loaded (and briefly loaded-but-not-yet-matched), so the admin never
    // sees the picker flash before landing on their draft. Once
    // assessmentVersions resolves and finds the match, activeVersion is set
    // and this branch is skipped entirely — the existing
    // fetchInterpretationDraftByVersion + prefill effects then populate
    // subsectionRules automatically, dropping the admin straight into
    // edit mode. The gate below only renders once activeVersionId has been
    // genuinely cleared — either there was never a versionId (fresh
    // "Create Interpretation" flow), or the stale-id effect above confirmed
    // it doesn't match anything real after assessments finished loading.
    if (activeVersionId) {
      return (
        <div className={cn("flex h-full items-center justify-center", theme.surface.page)}>
          <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading your interpretation draft...
          </div>
        </div>
      );
    }

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
              "relative min-h-[480px] w-full max-w-2xl rounded-2xl border p-8 text-center shadow-2xl sm:p-10",
              theme.border.default,
              theme.surface.card
            )}
          >
            <button
              type="button"
              onClick={handleBackToOverview}
              className={cn(
                "absolute left-4 top-4 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold",
                theme.text.muted,
                theme.surface.hover
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className={cn("mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white", theme.brand.logoBg)}>
              {assessmentsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Layers className="h-5 w-5" />}
            </div>

            <h2 id="assessment-gate-title" className="mt-4 text-lg font-bold text-slate-900">
              Select an assessment to begin
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Choose the assessment version you want to configure interpretation rules for. This is
              required before you can continue.
            </p><br></br>

            {assessmentsError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {assessmentsError?.message || "Failed to load assessments. Please refresh and try again."}
                </span>
              </div>
            )}

            {!assessmentsLoading && !assessmentsError && assessmentVersions.length === 0 && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No assessment versions were returned by the server.
              </div>
            )}

            <div className="mt-5 text-left">
              <AssessmentVersionPicker
                value={null}
                onSelect={handleVersionSelect}
                versions={assessmentVersions}
                loading={assessmentsLoading}
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = flatSteps.length
    ? Math.round((activeStepIndex / flatSteps.length) * 100)
    : 0;

  const sidebarContent = (
    <>
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {/* Once a version is active — whether picked from the gate on a
                fresh "New Interpretation" flow, or opened straight via
                "Continue Editing" — there's no reason to keep showing a
                switcher. Static info only; to work on a different version,
                go back to the Overview list and open it from there. */}
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
                theme.border.default,
                theme.surface.card
              )}
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", theme.brand.logoBg)}>
                <Layers className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm font-semibold", theme.text.primary)}>
                  {activeVersion.name}
                </span>
                <span className={cn("block truncate text-xs", theme.text.muted)}>
                  {activeVersion.versionNumber} · {activeVersion.versionName}
                </span>
              </span>
            </div>
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

        {interpretationDraftLoading && (
          <p className={cn("flex items-center gap-1.5 text-xs font-medium", theme.text.muted)}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading saved draft...
          </p>
        )}

        {interpretationDraftError && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {interpretationDraftError?.message || "Failed to load the saved draft."}
          </p>
        )}

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
                const itemKey = `${section.id}::${item.id}`;
                const stepNumber = flatSteps.findIndex((step) => step.key === itemKey) + 1;

                return (
                  <SubsectionListItem
                    key={itemKey}
                    item={{ ...item, key: itemKey }}
                    stepNumber={stepNumber}
                    complete={isSubsectionComplete(subsectionRules[itemKey])}
                    active={view === "builder" && itemKey === activeKey}
                    ruleCount={subsectionRules[itemKey]?.length ?? 0}
                    onSelect={goToStepByKey}
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
      <PublishConfirmDialog
        open={showPublishConfirm}
        onConfirm={handlePublish}
        onCancel={() => setShowPublishConfirm(false)}
        isPublishing={updateInterpretationRulesLoading}
      />

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

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4",
            theme.border.default,
            theme.surface.card
          )}
        >
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
                <button
                  type="button"
                  onClick={handleStepBack}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
                    theme.text.primary,
                    theme.surface.hover
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
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

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            {view === "builder" && (
              <Button
                type="button"
                className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")}
                onClick={handleStepSaveAndNext}
                disabled={!activeKey || isSavingStep}
              >
                {isSavingStep ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isLastStep ? "Save and Continue to Review" : "Save and Next"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}

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

            {view === "review" && (
              <>
                <Button type="button" variant="outline" className="flex-1 justify-center sm:flex-none" onClick={() => setView("report")}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden xs:inline">Back to Report</span>
                  <span className="xs:hidden">Back</span>
                </Button>

                <Button
                  type="button"
                  className={cn(theme.actionButton.primary, "flex-1 justify-center sm:flex-none")}
                  onClick={handlePublishClick}
                  disabled={updateInterpretationRulesLoading}
                >
                  {updateInterpretationRulesLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Publish
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </header>

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
          <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.subtle)}>
            <div className="mx-auto max-w-6xl">
              <ReviewInterpretationStep
                activeVersion={activeVersion}
                subsectionRules={subsectionRules}
                onGoToBuilder={() => setView("builder")}
                onEditSubsection={(key) => goToStepByKey(key)}
                onPublish={handlePublishClick}
                isPublishing={updateInterpretationRulesLoading}
              />
            </div>
          </main>
        ) : (
          <main className={cn("flex-1 overflow-y-auto p-3 sm:p-6", theme.surface.subtle)}>
            {!detail ? (
              <div className={cn("mx-auto max-w-4xl rounded-xl py-16 text-center text-sm", theme.border.dashed, theme.text.muted)}>
                Select a subsection from the sidebar to configure its rules.
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className={cn("text-xl font-extrabold tracking-tight sm:text-2xl", theme.text.primary)}>{detail.title}</h2>

                      <span className={cn(detail.status === "Validated" ? theme.badge.pillPositive : theme.badge.pillNeutral)}>
                        {detail.status}
                      </span>
                    </div>

                    <p className={cn("mt-2 max-w-md text-sm sm:text-base", theme.text.secondary)}>{detail.description}</p>
                    {activeStep?.sectionName && (
                      <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wide", theme.text.muted)}>
                        {activeStep.sectionName}
                      </p>
                    )}
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

                {showStepErrors && blockReason && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{blockReason}</span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {rules.map((rule) => (
                    <RangeRuleCard
                      key={rule.id}
                      rule={rule}
                      onChange={updateRule}
                      onDuplicate={duplicateRule}
                      onDelete={deleteRule}
                      showErrors={showStepErrors}
                      hasDuplicateRating={Boolean(
                        rule.rating &&
                          rules.filter(
                            (otherRule) =>
                              String(otherRule.rating?.id ?? otherRule.rating?.label ?? "").toLowerCase() ===
                              String(rule.rating?.id ?? rule.rating?.label ?? "").toLowerCase()
                          ).length > 1
                      )}
                    />
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
