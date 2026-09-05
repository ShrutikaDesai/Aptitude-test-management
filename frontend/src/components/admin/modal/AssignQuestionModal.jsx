
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  X,
  Search,
  CheckCircle2,
  GraduationCap,
  Tag,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

import {
  fetchAssessmentVersionGrades,
  fetchQuestionsByGradeAndTag,
} from "@/slices/questionMappingSlice";

import { fetchTags } from "@/slices/tagSlice";

// ---------------------------------------------------------------------------
// Difficulty styles
// ---------------------------------------------------------------------------

const DIFFICULTY_STYLES = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-red-50 text-red-700",
};

// ---------------------------------------------------------------------------
// Type Badge
// ---------------------------------------------------------------------------

const TypeBadge = ({ type }) => (
  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
    {String(type ?? "").replace(/_/g, " ")}
  </span>
);

// ---------------------------------------------------------------------------
// Difficulty Badge
// ---------------------------------------------------------------------------

const DifficultyBadge = ({ difficulty }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
      DIFFICULTY_STYLES[difficulty] ?? "bg-slate-100 text-slate-600"
    )}
  >
    {difficulty ?? "-"}
  </span>
);

// ---------------------------------------------------------------------------
// Grade Badge
// ---------------------------------------------------------------------------

const GradeBadge = ({ grades, highlightGrade }) => {
  if (!grades || grades.length === 0) return null;

  const normalizedGrades = grades.map((grade) => String(grade));

  const isOffGrade =
    highlightGrade != null &&
    !normalizedGrades.includes(String(highlightGrade));

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        isOffGrade
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600"
      )}
      title={
        isOffGrade
          ? "Not tagged for the current assessment version's grade"
          : undefined
      }
    >
      <GraduationCap className="h-3 w-3" />

      {normalizedGrades.length === 1
        ? `Grade ${normalizedGrades[0]}`
        : `Grades ${normalizedGrades.join(", ")}`}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Tag Badge
// ---------------------------------------------------------------------------

const TagBadge = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-indigo-600">
      <Tag className="h-3 w-3" />
      {tags.join(", ")}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Modal Shell
// ---------------------------------------------------------------------------

const ModalShell = ({
  open,
  onClose,
  children,
  maxWidth = "max-w-4xl",
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          adminTheme.card.base,
          adminTheme.shadow.xl,
          "w-full max-h-[85vh] overflow-hidden p-0 flex flex-col",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Multi Select Filter
// ---------------------------------------------------------------------------

const MultiSelectFilter = ({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  formatOption = (value) => value,
  allLabel = "All",
  emptyOptionsMessage = "No options available.",
  highlightValue,
  highlightSuffix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleValue = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange([]);
  };

  const triggerLabel =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? formatOption(selected[0])
        : `${selected.length} selected`;

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </span>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-8 items-center gap-1.5 text-sm font-semibold",
            adminTheme.radius.md,
            adminTheme.border.default,
            "border bg-white px-2 text-slate-900",
            "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
            selected.length > 0 && "border-slate-900"
          )}
        >
          <span className="max-w-[9rem] truncate">{triggerLabel}</span>

          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {selected.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Clear ${label} filter`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full z-20 mt-1.5 max-h-56 w-56 overflow-y-auto p-1.5",
            adminTheme.card.base,
            adminTheme.shadow.xl,
            adminTheme.border.default,
            "border"
          )}
        >
          {options.length === 0 ? (
            <p className="p-2 text-xs text-slate-400">
              {emptyOptionsMessage}
            </p>
          ) : (
            options.map((option) => {
              const isChecked = selected.includes(option);

              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleValue(option)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                  />

                  <span className="flex-1 truncate">
                    {formatOption(option)}

                    {highlightValue != null &&
                      option === highlightValue &&
                      highlightSuffix ? (
                      <span className="text-slate-400">
                        {" "}
                        {highlightSuffix}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Filter Chip
// ---------------------------------------------------------------------------

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1 text-xs font-semibold text-slate-700">
    {label}

    <button
      type="button"
      onClick={onRemove}
      className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-900"
      aria-label={`Remove ${label} filter`}
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

// ---------------------------------------------------------------------------
// Filter Chips
// ---------------------------------------------------------------------------

const FilterChips = ({ groups, onClearAll }) => {
  const hasAny = groups.some((group) => group.values.length > 0);

  if (!hasAny) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {groups.map((group) =>
        group.values.map((value) => (
          <FilterChip
            key={`${group.key}-${value}`}
            label={`${group.label}: ${group.formatValue(value)}`}
            onRemove={() => group.onRemoveValue(value)}
          />
        ))
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Assign Question Modal
// ---------------------------------------------------------------------------

const AssignQuestionModal = ({
  open,
  subsection,
  versionId,
  versionGrade,
  availableQuestions,
  onClose,
  onAdd,
}) => {
  const dispatch = useDispatch();

  const {
    versionGrades,
    versionGradesLoading,
    questionsByGradeTag,
    questionsByGradeTagLoading,
  } = useSelector((state) => state.questionMapping);

  const { tags: tagMasterList, tagsLoading } = useSelector(
    (state) => state.tag
  );

  const [search, setSearch] = useState("");

  const [gradeFilters, setGradeFilters] = useState(
    versionGrade ? [String(versionGrade)] : []
  );

  const [tagFilters, setTagFilters] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  // -------------------------------------------------------------------------
  // Fetch version grades
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (open && versionId) {
      void dispatch(fetchAssessmentVersionGrades(versionId));
    }
  }, [open, versionId, dispatch]);

  // -------------------------------------------------------------------------
  // Fetch tags
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (open) {
      void dispatch(fetchTags());
    }
  }, [open, dispatch]);

  // -------------------------------------------------------------------------
  // Fetch questions by Grade + Tag
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (gradeFilters.length === 0 || tagFilters.length === 0) {
      return;
    }

    dispatch(
      fetchQuestionsByGradeAndTag({
        gradeIds: gradeFilters,
        tagIds: tagFilters,
      })
    );
  }, [gradeFilters, tagFilters, dispatch]);

  // -------------------------------------------------------------------------
  // Grade options
  // -------------------------------------------------------------------------

  const gradeOptions = useMemo(
    () =>
      (Array.isArray(versionGrades) ? versionGrades : []).map((g) =>
        String(g.grade_id)
      ),
    [versionGrades]
  );

  // -------------------------------------------------------------------------
  // Grade labels
  // -------------------------------------------------------------------------

  const gradeLabelById = useMemo(
    () =>
      (Array.isArray(versionGrades) ? versionGrades : []).reduce(
        (acc, g) => {
          acc[String(g.grade_id)] =
            g.grade_name ?? `Grade ${g.grade_id}`;

          return acc;
        },
        {}
      ),
    [versionGrades]
  );

  // -------------------------------------------------------------------------
  // Tag labels
  // -------------------------------------------------------------------------

  const tagLabelById = useMemo(
    () =>
      (Array.isArray(tagMasterList) ? tagMasterList : []).reduce(
        (acc, t) => {
          acc[String(t.id)] =
            t.tag_name ?? t.name ?? `Tag ${t.id}`;

          return acc;
        },
        {}
      ),
    [tagMasterList]
  );

  // -------------------------------------------------------------------------
  // Tag options
  // -------------------------------------------------------------------------

  const tagOptions = useMemo(
    () =>
      (Array.isArray(tagMasterList) ? tagMasterList : [])
        .map((t) => String(t.id))
        .filter(Boolean),
    [tagMasterList]
  );

  // -------------------------------------------------------------------------
  // Re-sync filters when modal opens
  // -------------------------------------------------------------------------

  const [lastOpen, setLastOpen] = useState(false);

  if (open && !lastOpen) {
    setLastOpen(true);

    setGradeFilters(
      versionGrade ? [String(versionGrade)] : []
    );

    setTagFilters([]);
  } else if (!open && lastOpen) {
    setLastOpen(false);
  }

  const hasBothFilters =
    gradeFilters.length > 0 && tagFilters.length > 0;

  // -------------------------------------------------------------------------
  // Filter questions
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const sourceQuestions = hasBothFilters
      ? questionsByGradeTag
      : availableQuestions;

    return (
      Array.isArray(sourceQuestions) ? sourceQuestions : []
    ).filter((question) => {
      const matchesSearch =
        !q ||
        String(question.id ?? "")
          .toLowerCase()
          .includes(q) ||
        String(question.question_text ?? "")
          .toLowerCase()
          .includes(q);

      return matchesSearch;
    });
  }, [
    hasBothFilters,
    questionsByGradeTag,
    availableQuestions,
    search,
  ]);

  // -------------------------------------------------------------------------
  // Select question
  // -------------------------------------------------------------------------

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // -------------------------------------------------------------------------
  // Close
  // -------------------------------------------------------------------------

  const handleClose = () => {
    setSearch("");
    setSelectedIds([]);
    onClose();
  };

  // -------------------------------------------------------------------------
  // Add
  // -------------------------------------------------------------------------

  const handleAdd = () => {
    onAdd(selectedIds);

    setSearch("");
    setSelectedIds([]);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      maxWidth="max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Assign Questions
          </h3>

          <p className="mt-0.5 text-sm text-slate-500">
            From the Question Library into{" "}
            <span className="font-semibold text-slate-700">
              {subsection?.name}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-2.5 border-b border-slate-100 p-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Item ID or prompt content..."
            className={cn(
              "h-10 w-full pl-9 pr-3 text-sm",
              adminTheme.radius.md,
              adminTheme.border.default,
              "border bg-slate-50 text-slate-900 placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            )}
          />
        </div>

        {/* Grade + Tags */}
        <div className="flex flex-wrap items-center gap-4">
          <MultiSelectFilter
            label="Grade"
            icon={GraduationCap}
            options={gradeOptions}
            selected={gradeFilters}
            onChange={setGradeFilters}
            formatOption={(grade) =>
              gradeLabelById[grade] ?? `Grade ${grade}`
            }
            allLabel="All Grades"
            emptyOptionsMessage={
              versionGradesLoading
                ? "Loading grades…"
                : "No grades mapped to this version."
            }
            highlightValue={String(versionGrade)}
            highlightSuffix="(this version)"
          />

          <MultiSelectFilter
            label="Tags"
            icon={Tag}
            options={tagOptions}
            selected={tagFilters}
            onChange={setTagFilters}
            formatOption={(tagId) =>
              tagLabelById[tagId] ?? `Tag ${tagId}`
            }
            allLabel="All Tags"
            emptyOptionsMessage={
              tagsLoading
                ? "Loading tags…"
                : "No tags available."
            }
          />
        </div>

        {/* Filter chips */}
        <FilterChips
          groups={[
            {
              key: "grade",
              label: "Grade",
              values: gradeFilters,
              formatValue: (grade) =>
                gradeLabelById[grade] ?? `Grade ${grade}`,
              onRemoveValue: (grade) =>
                setGradeFilters((prev) =>
                  prev.filter((g) => g !== grade)
                ),
            },
            {
              key: "tag",
              label: "Tag",
              values: tagFilters,
              formatValue: (tagId) =>
                tagLabelById[tagId] ?? `Tag ${tagId}`,
              onRemoveValue: (tagId) =>
                setTagFilters((prev) =>
                  prev.filter((t) => t !== tagId)
                ),
            },
          ]}
          onClearAll={() => {
            setGradeFilters([]);
            setTagFilters([]);
          }}
        />
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-4">
        {questionsByGradeTagLoading && hasBothFilters ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Loading questions…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            {!hasBothFilters
              ? "Select at least one Grade and one Tag to load matching questions."
              : "No questions match the selected Grade/Tag combination."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((question, index) => {
              const isSelected = selectedIds.includes(question.id);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => toggleSelect(question.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition",
                    isSelected
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {/* Checkbox */}
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2",
                      isSelected
                        ? "border-slate-900 bg-slate-900"
                        : "border-slate-300"
                    )}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </span>

                  {/* Question content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">

                      {/* Serial Number */}
                      <span className="text-xs font-semibold text-slate-400">
                        {index + 1}
                      </span>

                      <TypeBadge type={question.question_type} />

                      <DifficultyBadge
                        difficulty={question.difficulty_level}
                      />

                      <GradeBadge
                        grades={question.grade_ids ?? []}
                        highlightGrade={versionGrade}
                      />

                      <TagBadge
                        tags={(question.tag_ids ?? []).map(
                          (tagId) => tagLabelById[tagId] ?? tagId
                        )}
                      />
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {question.question_text}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-slate-400">
                    {question.default_marks} pt
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 p-4">
        <span className="text-sm font-medium text-slate-500">
          {selectedIds.length} selected
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className={adminTheme.actionButton.secondary}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={selectedIds.length === 0}
            className={cn(
              adminTheme.actionButton.primary,
              selectedIds.length === 0 &&
              "cursor-not-allowed opacity-50"
            )}
          >
            <Plus className="h-4 w-4" />

            Assign{" "}
            {selectedIds.length > 0
              ? selectedIds.length
              : ""}{" "}
            Question
            {selectedIds.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default AssignQuestionModal;
