import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  Plus,
  Trash2,
  Info,
  Hash,
  Layers,
  ListTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import AssignQuestionModal from "../modal/AssignQuestionModal";

// ---------------------------------------------------------------------------
// Mock question bank, grouped by dimension code (matches subsections.dimension_id
// / DIMENSION_OPTIONS values from CreateAssessment.jsx: LOGICAL, NUMERICAL, etc).
//
// TODO: this is local mock data by design (per product decision) — swap for a
// real question-library fetch, e.g. GET /questions?dimension=<code>, once that
// endpoint exists. Everything downstream (BlueprintItemRow, payload shape)
// already treats "available questions" as an opaque list, so wiring a real
// fetch later should only mean replacing `getQuestionBank(dimensionId)` below.
// ---------------------------------------------------------------------------
const MOCK_QUESTION_BANK_BY_DIMENSION = {
  LOGICAL: [
    { id: "LR-1108", prompt: "Complete the series: 2, 6, 12, 20, __", type: "SHORT_TEXT", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "LR-0233", prompt: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops Lazzles?", type: "TRUE_FALSE", difficulty: "EASY", defaultMarks: 1, defaultNegative: 0 },
    { id: "LR-0389", prompt: "Two statements are followed by two conclusions. Which conclusion logically follows?", type: "SHORT_TEXT", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "LR-0466", prompt: "Identify the next number in the pattern: 5, 11, 23, 47, __", type: "SHORT_TEXT", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "LR-0501", prompt: "All squares are rectangles. Some rectangles are not squares. Which conclusion is valid?", type: "TRUE_FALSE", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0 },
    { id: "LRJ-0301", prompt: "Complete the series: 3, 6, 9, 12, __", type: "SHORT_TEXT", difficulty: "EASY", defaultMarks: 1, defaultNegative: 0 },
  ],
  NUMERICAL: [
    { id: "NA-0421", prompt: "Solve for x: 2x² + 5x − 3 = 0", type: "INTEGER", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "NA-0912", prompt: "If 15 workers finish a task in 12 days, how many days for 20 workers?", type: "INTEGER", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "NA-0187", prompt: "A train 120m long crosses a pole in 8 seconds. Find its speed in km/h.", type: "INTEGER", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "NA-0640", prompt: "Simplify: (3/4) ÷ (9/16)", type: "SHORT_TEXT", difficulty: "EASY", defaultMarks: 1, defaultNegative: 0 },
    { id: "NA-0733", prompt: "A shopkeeper marks an item 40% above cost and sells at 10% discount. Find profit %.", type: "INTEGER", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
  ],
  VERBAL: [
    { id: "VA-2230", prompt: "Analyze the tone conveyed in the given passage.", type: "LONG_TEXT", difficulty: "HARD", defaultMarks: 2, defaultNegative: 0 },
    { id: "VA-0455", prompt: 'Choose the word most similar in meaning to "Ephemeral."', type: "SINGLE_CHOICE", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "VA-0522", prompt: "Fill in the blank with the most appropriate preposition.", type: "SINGLE_CHOICE", difficulty: "EASY", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "VA-0617", prompt: "Identify the sentence with correct subject-verb agreement.", type: "SINGLE_CHOICE", difficulty: "EASY", defaultMarks: 1, defaultNegative: 0.25 },
  ],
  SPATIAL: [
    { id: "AR-2044", prompt: "Identify the odd figure among the given set.", type: "IMAGE_SELECTION", difficulty: "EASY", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "AR-0781", prompt: "Identify the figure that completes the given sequence.", type: "IMAGE_SELECTION", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "SR-0201", prompt: "Rotate the given shape 90° clockwise and select the correct match.", type: "IMAGE_SELECTION", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0.25 },
    { id: "SR-0342", prompt: "Count the number of triangles in the given figure.", type: "INTEGER", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0 },
  ],
  INVESTIGATIVE: [
    { id: "RI-0101", prompt: "I enjoy investigating how things work and solving technical puzzles.", type: "LIKERT_5", difficulty: "EASY", defaultMarks: 0, defaultNegative: 0 },
    { id: "RI-0102", prompt: "I like conducting experiments to test a hypothesis.", type: "LIKERT_5", difficulty: "EASY", defaultMarks: 0, defaultNegative: 0 },
    { id: "RI-0103", prompt: "I prefer analyzing data over presenting it to a group.", type: "LIKERT_5", difficulty: "EASY", defaultMarks: 0, defaultNegative: 0 },
  ],
  CONSCIENTIOUSNESS: [
    { id: "OC-0201", prompt: "I stay organized and follow through on my commitments.", type: "LIKERT_5", difficulty: "EASY", defaultMarks: 0, defaultNegative: 0 },
    { id: "OC-0202", prompt: "I remain calm even in high-pressure situations.", type: "LIKERT_5", difficulty: "EASY", defaultMarks: 0, defaultNegative: 0 },
  ],
  SOCIAL: [
    { id: "SJ-0154", prompt: "A group member disagrees with the plan during a timed group task. Best response?", type: "SINGLE_CHOICE", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0 },
    { id: "SJ-0210", prompt: "You are given conflicting instructions by two supervisors. What's your first step?", type: "SINGLE_CHOICE", difficulty: "HARD", defaultMarks: 1, defaultNegative: 0 },
    { id: "SJ-0312", prompt: "A client is unhappy about a delay outside your control. How do you respond?", type: "SINGLE_CHOICE", difficulty: "MEDIUM", defaultMarks: 1, defaultNegative: 0 },
  ],
};

const getQuestionBank = (dimensionId) => MOCK_QUESTION_BANK_BY_DIMENSION[dimensionId] ?? [];

const ALL_QUESTIONS_BY_ID = Object.values(MOCK_QUESTION_BANK_BY_DIMENSION)
  .flat()
  .reduce((acc, q) => ({ ...acc, [q.id]: q }), {});

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// ---- Small building blocks -------------------------------------------------

const DIFFICULTY_STYLES = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-red-50 text-red-700",
};

const TypeBadge = ({ type }) => (
  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
    {type.replace(/_/g, " ")}
  </span>
);

const DifficultyBadge = ({ difficulty }) => (
  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", DIFFICULTY_STYLES[difficulty])}>
    {difficulty}
  </span>
);

// disabled: renders a non-interactive, muted-looking switch that still
// reflects `checked` but ignores clicks — used where a field is read-only
// here but still meaningful to show (e.g. Mandatory, locked post-assignment).
const Switch = ({ checked, onChange, label, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    aria-disabled={disabled}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
      checked ? "bg-slate-900" : "bg-slate-200",
      disabled && "cursor-not-allowed opacity-50"
    )}
  >
    <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition", checked ? "translate-x-4.5" : "translate-x-1")} />
  </button>
);

const InlineNumberInput = ({ value, onChange, min = 0, step = 0.5, disabled = false }) => (
  <input
    type="number"
    value={value}
    min={min}
    step={step}
    disabled={disabled}
    onChange={(e) => onChange(Number(e.target.value))}
    className={cn(
      "h-8 w-16 rounded-md border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10",
      disabled && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
    )}
  />
);

// ---- Structure tree (left rail) -------------------------------------------

const StructureTree = ({ sections, countsBySubsection, selectedSubsectionId, onSelectSubsection }) => (
  <div className={cn(adminTheme.card.base, "overflow-hidden")}>
    <div className="border-b border-slate-100 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        <ListTree className="h-3.5 w-3.5" />
        Assessment Structure
      </p>
    </div>
    <div className="max-h-[520px] overflow-y-auto p-2">
      {sections.map((section) => (
        <div key={section.id} className="mb-1">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Layers className="h-3.5 w-3.5" />
            {section.name || "Untitled Section"}
          </div>
          {section.subsections.length === 0 && (
            <p className="px-3 pb-1 text-xs text-slate-300">No subsections yet</p>
          )}
          {section.subsections.map((sub) => {
            const count = countsBySubsection[sub.id] ?? 0;
            const limit = Number(sub.questionLimit) || 0;
            const isSelected = sub.id === selectedSubsectionId;
            const isOverLimit = limit > 0 && count > limit;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubsection(sub.id, section.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  isSelected ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="truncate font-medium">{sub.name || "Untitled Subsection"}</span>
                <span
                  className={cn(
                    "ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    isSelected ? "bg-white/15 text-white" : isOverLimit ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {/* {count}/{limit} */}
                    {count}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

// ---- One mapped question row -----------------------------------------------

// Note: Visible field has been removed entirely (no toggle, no eye icon).
// Marks, Negative, and Mandatory are still displayed but are read-only —
// they render disabled so their current values stay visible without being
// editable from this row.
const BlueprintItemRow = ({ item, question, index, total, onMoveUp, onMoveDown, onRemove }) => {
  const displayCode = item.questionCode || question?.id || item.questionId;
  const displayPrompt = item.questionText || question?.prompt;

  return (
    <div className={cn(adminTheme.card.base, "p-4")}>
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
          <GripVertical className="h-4 w-4 text-slate-300" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
            {item.sequenceNo}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">{displayCode}</span>
            {question && <TypeBadge type={question.type} />}
            {question && <DifficultyBadge difficulty={question.difficulty} />}
          </div>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">
            {displayPrompt ?? "Question no longer in the library — remove or replace this mapping."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Marks
              <InlineNumberInput value={item.marksOverride} onChange={() => {}} disabled />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Negative
              <InlineNumberInput value={item.negativeMarksOverride} onChange={() => {}} disabled />
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Switch checked={item.isMandatory} onChange={() => {}} label="Mandatory" disabled />
              Mandatory
            </label>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(item.id)}
            disabled={index === 0}
            className={cn("rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900", index === 0 && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400")}
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(item.id)}
            disabled={index === total - 1}
            className={cn("rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900", index === total - 1 && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400")}
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onRemove(item.id)} className="mt-1 rounded-md p-1 text-slate-300 hover:bg-red-50 hover:text-red-600" aria-label="Remove from blueprint">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Pagination bar ---------------------------------------------------

const PaginationBar = ({ currentPage, totalPages, totalCount, pageSize, onPageChange, onPageSizeChange }) => {
  if (totalCount === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={cn(adminTheme.card.base, "flex flex-wrap items-center justify-between gap-3 px-4 py-3")}>
      <p className="text-xs font-medium text-slate-500">
        Showing <span className="font-semibold text-slate-900">{startItem}–{endItem}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalCount}</span> mapped questions
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={cn("rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900", currentPage === 1 && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400")}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn("rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900", currentPage === 1 && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400")}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[80px] text-center text-xs font-semibold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn("rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900", currentPage === totalPages && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400")}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn("rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900", currentPage === totalPages && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400")}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Step -------------------------------------------------------------

const QuestionMappingStep = ({ sections, blueprintItems, versionId, onAddQuestions, onFieldChange, onToggleVisibility, onRequestRemove, onMoveItem }) => {
  const firstSection = sections[0];
  const firstSubsection = firstSection?.subsections?.[0];

  const [selectedSectionId, setSelectedSectionId] = useState(firstSection?.id ?? null);
  const [selectedSubsectionId, setSelectedSubsectionId] = useState(firstSubsection?.id ?? null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Pagination state — lives here since 500+ mapped questions in one
  // subsection would otherwise render 500+ BlueprintItemRow cards at once.
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? firstSection;
  const selectedSubsection = selectedSection?.subsections.find((s) => s.id === selectedSubsectionId) ?? firstSubsection;

  const countsBySubsection = useMemo(() => {
    const counts = {};
    blueprintItems.forEach((item) => {
      counts[item.subsectionId] = (counts[item.subsectionId] ?? 0) + 1;
    });
    return counts;
  }, [blueprintItems]);

  const subsectionItems = useMemo(
    () =>
      blueprintItems
        .filter((item) => item.subsectionId === selectedSubsection?.id)
        .sort((a, b) => a.sequenceNo - b.sequenceNo),
    [blueprintItems, selectedSubsection?.id]
  );

  const totalPages = Math.max(1, Math.ceil(subsectionItems.length / pageSize));

  // Reset to page 1 whenever the selected subsection changes, and clamp
  // down if the current page no longer exists (e.g. after removing items).
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubsection?.id]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return subsectionItems.slice(start, start + pageSize);
  }, [subsectionItems, currentPage, pageSize]);

  const mappedQuestionIds = useMemo(() => new Set(subsectionItems.map((item) => item.questionId)), [subsectionItems]);

  const availableQuestions = useMemo(() => {
    const bank = getQuestionBank(selectedSubsection?.dimensionId);
    return bank.filter((q) => !mappedQuestionIds.has(q.id));
  }, [selectedSubsection?.dimensionId, mappedQuestionIds]);

  const handleSelectSubsection = (subsectionId, sectionId) => {
    setSelectedSubsectionId(subsectionId);
    setSelectedSectionId(sectionId);
    setIsAssignOpen(false);
  };

  const handleAdd = (questions) => {
    onAddQuestions(selectedSection.id, selectedSubsection.id, questions);
    setIsAssignOpen(false);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (sections.length === 0) {
    return (
      <div className={cn(adminTheme.card.base, adminTheme.card.padding, "flex flex-col items-center justify-center gap-3 py-14 text-center")}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <ListTree className="h-6 w-6 text-slate-400" />
        </span>
        <p className="text-sm font-semibold text-slate-900">No structure defined yet</p>
        <p className="max-w-sm text-sm text-slate-400">Go back to Step 4 and add at least one section and subsection before mapping questions.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
        <h2 className="text-lg font-semibold text-slate-900">Map Questions to Structure</h2>
        <p className={cn(adminTheme.card.subtitle, "mt-1")}>
          Assign question-bank items into each subsection you defined in Step 4, in the order candidates will see them.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
          <StructureTree sections={sections} countsBySubsection={countsBySubsection} selectedSubsectionId={selectedSubsection?.id} onSelectSubsection={handleSelectSubsection} />
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {selectedSection?.name || "Untitled Section"}
                  <ChevronRight className="h-3.5 w-3.5" />
                  {selectedSubsection?.name || "Untitled Subsection"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedSubsection?.name || "Untitled Subsection"}</h3>
              </div>
              <button type="button" onClick={() => setIsAssignOpen(true)} className={adminTheme.actionButton.primary} disabled={!selectedSubsection}>
                <Plus className="h-4 w-4" />
                Assign Questions
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                <Hash className="mr-1 inline h-3 w-3" />
                {subsectionItems.length} questions mapped for this subsection.
              </span>
            </div>
          </div>

          {subsectionItems.length === 0 ? (
            <div className={cn(adminTheme.card.base, adminTheme.card.padding, "flex flex-col items-center justify-center gap-3 py-14 text-center")}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <ListTree className="h-6 w-6 text-slate-400" />
              </span>
              <p className="text-sm font-semibold text-slate-900">No questions mapped yet</p>
              <p className="max-w-sm text-sm text-slate-400">
                Assign questions from the library into {selectedSubsection?.name || "this subsection"} to build out this part of the assessment.
              </p>
            </div>
          ) : (
            <>
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={subsectionItems.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />

              <div className="space-y-3">
                {paginatedItems.map((item) => {
                  // Global index/total (not page-local) so move up/down
                  // and the disabled-at-edges logic stay correct across pages.
                  const globalIndex = subsectionItems.findIndex((i) => i.id === item.id);
                  return (
                    <BlueprintItemRow
                      key={item.id}
                      item={item}
                      question={ALL_QUESTIONS_BY_ID[item.questionId]}
                      index={globalIndex}
                      total={subsectionItems.length}
                      onMoveUp={() => onMoveItem(item.id, "up")}
                      onMoveDown={() => onMoveItem(item.id, "down")}
                      onRemove={onRequestRemove}
                    />
                  );
                })}
              </div>

              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={subsectionItems.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      </div>

      <AssignQuestionModal
        open={isAssignOpen && Boolean(selectedSubsection)}
        subsection={selectedSubsection}
        versionId={versionId}
        versionGrade={null}
        availableQuestions={availableQuestions}
        assignedQuestionIds={Array.from(mappedQuestionIds)}
        onClose={() => setIsAssignOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default QuestionMappingStep;