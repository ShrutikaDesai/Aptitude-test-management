import { useState, useEffect, useMemo, useRef } from "react";
import { Trash2, Pencil, GripVertical, Plus, Check, Clock, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

// ---------------------------------------------------------------------------
// Options / constants used only by the Structure step
// ---------------------------------------------------------------------------

// Section and subsection name catalogs both come exclusively from their
// respective APIs (GET /asse/sections/ and GET /asse/subsections/). The
// fetches themselves are dispatched once from CreateAssessment.jsx on
// mount (along with grades) — this component is now purely presentational
// and receives `sectionOptions` / `subsectionOptions` etc. as props. There
// is deliberately no local fallback list for either — if the API call
// hasn't returned yet, the dropdown is just empty until it does.

// sections + nested subsections (Step 4 default/seed state)
// NOTE: previously seeded with sample "Logical Reasoning" / "Numerical
// Aptitude" dummy content. Now starts with a single blank section so users
// build the structure from scratch instead of having to clear sample data.
export const INITIAL_SECTIONS = [
  {
    id: "section-1",
      dbId: null,
    name: "",
    sectionCode: "",
    description: "",
    instructions: "",
    isMandatory: true,
    randomizeQuestions: false,
    subsections: [],
  },
];

// Removes options that are already selected somewhere else, so a section
// (or subsection) name picked in one card/row disappears from every other
// card/row's dropdown — you can't map the same one twice. The placeholder
// ("" value) always stays, and a row keeps seeing its OWN current value in
// its own dropdown (`keepValue`) even though that same value now counts as
// "used" everywhere else.
const excludeUsedOptions = (options, usedValues, keepValue) =>
  options.filter((option) => !option.value || option.value === keepValue || !usedValues.has(option.value));

// ---------------------------------------------------------------------------
// Local field atoms.
//
// NOTE: if your project already keeps FieldLabel / TextInput / SelectInput /
// NumberInput / Checkbox in a shared file (they're also used by the other
// wizard steps in CreateAssessment.jsx), delete this block and import them
// from there instead. They're duplicated here only so this file works
// standalone.
//
// All four input atoms accept a `disabled` prop so individual fields on
// this step can be locked while leaving the Section/Subsection name
// dropdowns editable.
//
// SelectInput additionally accepts a `loading` prop — while true it
// disables the field, swaps the option list for a single "Loading…"
// placeholder, and shows a small spinner inside the field so it's obvious
// data is still in flight (rather than the dropdown just being empty).
// ---------------------------------------------------------------------------

const FieldLabel = ({ children, required }) => (
  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
    {children}
    {required && <span className={cn(adminTheme.text.danger, "ml-0.5")}>*</span>}
  </label>
);

const TextInput = ({ id, value, onChange, placeholder, disabled, required = false, error }) => (
  <div>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cn(
        "h-11 w-full text-sm",
        adminTheme.radius.md,
        adminTheme.border.default,
        "border px-3 text-slate-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
        disabled && "cursor-not-allowed bg-slate-50 text-slate-400",
        error && "border-red-300 focus:ring-red-200"
      )}
    />
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const SelectInput = ({
  id,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  loading = false,
}) => (
  <div>
    <div className="relative">
      <select
        id={id}
        value={loading ? "" : value}
        onChange={onChange}
        required={required}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          "h-11 w-full text-sm",
          adminTheme.radius.md,
          adminTheme.border.default,
          "border bg-white px-3 text-slate-900",
          loading && "pr-9",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
          (disabled || loading) && "cursor-not-allowed bg-slate-50 text-slate-400",
          error && "border-red-300 focus:ring-red-200"
        )}
      >
        {loading ? (
          <option value="">Loading…</option>
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </select>
      {loading && (
        <Loader2
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
          aria-hidden="true"
        />
      )}
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const NumberInput = ({ id, value, onChange, icon: Icon, suffix, error, disabled = false }) => (
  <div>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        id={id}
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "h-11 w-full text-sm",
          adminTheme.radius.md,
          adminTheme.border.default,
          "border text-slate-900",
          Icon ? "pl-9" : "pl-3",
          suffix ? "pr-9" : "pr-3",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
          disabled && "cursor-not-allowed bg-slate-50 text-slate-400",
          error && "border-red-300 focus:ring-red-200"
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const Checkbox = ({ id, checked, onChange, title, description, disabled = false }) => (
  <label
    htmlFor={id}
    className={cn("flex items-start gap-3", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 disabled:cursor-not-allowed"
    />
    <span>
      <span className="block text-sm font-medium text-slate-900">{title}</span>
      {description && <span className="block text-xs text-slate-400">{description}</span>}
    </span>
  </label>
);

// ---------------------------------------------------------------------------
// Subsection row
// ---------------------------------------------------------------------------

const SubsectionRow = ({
  subsection,
  isNew,
  subsectionOptions,
  subsectionCodeByName,
    subsectionIdByName, 
  subsectionDescriptionByName,
  subsectionInstructionsByName,
  subsectionTimeLimitByName,
  subsectionQuestionLimitByName,
  subsectionRandomizeByName,
  isLoadingSubsections,
  onFieldChange,
  onRequestRemove,
}) => {
  const [isEditing, setIsEditing] = useState(isNew);

  // Picking a subsection name from the API-backed list fills in every
  // read-only detail field from that subsection's master record — code,
  // dimension, description, instructions, time limit, question limit, and
  // randomize flag. The user can't hand-edit any of these (they're
  // disabled), so this is the only way they get populated.
  const handleSubsectionNameChange = (selectedName) => {
    onFieldChange(subsection.id, "name", selectedName);

    // Real backend id — this is what actually goes into the publish payload.
    const matchedId = subsectionIdByName?.[selectedName];
    onFieldChange(subsection.id, "dbId", matchedId != null ? matchedId : null);

    const matchedCode = subsectionCodeByName?.[selectedName];
    if (matchedCode != null) onFieldChange(subsection.id, "subsectionCode", matchedCode);

    const matchedDescription = subsectionDescriptionByName?.[selectedName];
    if (matchedDescription != null) onFieldChange(subsection.id, "description", matchedDescription);

    const matchedInstructions = subsectionInstructionsByName?.[selectedName];
    if (matchedInstructions != null) onFieldChange(subsection.id, "instructions", matchedInstructions);

    const matchedTimeLimit = subsectionTimeLimitByName?.[selectedName];
    if (matchedTimeLimit != null) onFieldChange(subsection.id, "timeLimitMinutes", matchedTimeLimit);

    const matchedQuestionLimit = subsectionQuestionLimitByName?.[selectedName];
    if (matchedQuestionLimit != null) onFieldChange(subsection.id, "questionLimit", matchedQuestionLimit);

    const matchedRandomize = subsectionRandomizeByName?.[selectedName];
    if (matchedRandomize != null) onFieldChange(subsection.id, "randomizeQuestions", matchedRandomize);
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 border border-dashed p-3.5 transition-colors",
        adminTheme.border.default,
        adminTheme.radius.lg,
        !isEditing && "hover:border-slate-300"
      )}
    >
      {isEditing ? (
        <div className="min-w-0 flex-1 space-y-3 pr-16">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <FieldLabel>Subsection Name</FieldLabel>
              <SelectInput
                id={`${subsection.id}-name`}
                value={subsection.name}
                onChange={(e) => handleSubsectionNameChange(e.target.value)}
                options={subsectionOptions}
                loading={isLoadingSubsections}
              />
            </div>
            <div className="sm:col-span-3">
              <FieldLabel>Subsection Code</FieldLabel>
              <TextInput
                id={`${subsection.id}-code`}
                value={subsection.subsectionCode}
                onChange={(e) => onFieldChange(subsection.id, "subsectionCode", e.target.value)}
                placeholder="PATTERN"
                disabled
              />
            </div>
            <div className="sm:col-span-4">
              <FieldLabel>Time Limit</FieldLabel>
              <NumberInput
                id={`${subsection.id}-timeLimit`}
                icon={Clock}
                suffix="min"
                value={subsection.timeLimitMinutes ?? 0}
                onChange={(e) => onFieldChange(subsection.id, "timeLimitMinutes", e.target.value)}
                disabled
              />
            </div>
          </div>
          <div>
            <FieldLabel>Question Limit</FieldLabel>
            <NumberInput
              id={`${subsection.id}-limit`}
              value={subsection.questionLimit}
              onChange={(e) => onFieldChange(subsection.id, "questionLimit", e.target.value)}
              disabled
            />
          </div>
          <div>
            <FieldLabel>Short Description</FieldLabel>
            <TextInput
              id={`${subsection.id}-description`}
              value={subsection.description}
              onChange={(e) => onFieldChange(subsection.id, "description", e.target.value)}
              placeholder="Short description"
              disabled
            />
          </div>
          <div>
            <FieldLabel>Instructions</FieldLabel>
            <textarea
              id={`${subsection.id}-instructions`}
              rows={3}
              value={subsection.instructions}
              onChange={(e) => onFieldChange(subsection.id, "instructions", e.target.value)}
              placeholder="Add subsection instructions for students"
              disabled
              className={cn(
                "w-full resize-none text-sm",
                adminTheme.radius.md,
                adminTheme.border.default,
                "border px-3 py-2 text-slate-900 placeholder:text-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
                "cursor-not-allowed bg-slate-50 text-slate-400"
              )}
            />
          </div>
          <div className="sm:col-span-6">
            <Checkbox
              id={`${subsection.id}-randomize`}
              checked={subsection.randomizeQuestions}
              onChange={(e) => onFieldChange(subsection.id, "randomizeQuestions", e.target.checked)}
              title="Randomize questions"
              description="Shuffle question order within this subsection."
              disabled
            />
          </div>
        </div>
      ) : (
        <div className="min-w-0 flex-1 pr-16">
          <p className="truncate text-sm font-semibold text-slate-900">
            {subsection.name || "Untitled Subsection"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {subsection.description || "No description added yet."}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {subsection.instructions || "No instructions added yet."}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {subsection.timeLimitMinutes || 0} min
            </span>
            <span className="text-slate-300">&bull;</span>
            <span>Max {subsection.questionLimit || 0} questions</span>
            {subsection.randomizeQuestions && (
              <>
                <span className="text-slate-300">&bull;</span>
                <span>Randomized</span>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute right-3 top-3 flex shrink-0 items-center gap-1 transition-opacity",
          isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        {isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-md p-1.5 text-emerald-600 transition hover:bg-emerald-50"
            aria-label="Done editing subsection"
          >
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit subsection"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRequestRemove(subsection.id)}
          className="rounded-md p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete subsection"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const AddSubsectionButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-center gap-1.5 border border-dashed p-3.5 text-sm font-medium text-slate-400",
      "hover:border-slate-300 hover:text-slate-600",
      adminTheme.border.default,
      adminTheme.radius.lg
    )}
  >
    <Plus className="h-3.5 w-3.5" />
    Add Subsection
  </button>
);

// ---------------------------------------------------------------------------
// Section card
//
// NOTE: this used to manage its own `isEditing` state locally (seeded from
// an `isNew` flag), so multiple section cards could be expanded at once.
// It's now a controlled component — `isOpen` / `onToggleOpen` are owned by
// the parent (StructureStep) so only one section card can be expanded at a
// time (accordion behavior).
// ---------------------------------------------------------------------------

const SectionCard = ({
  section,
  isOpen,
  onToggleOpen,
  newSubsectionIds,
  sectionOptions,
  sectionCodeByName,
    sectionIdByName, 
  sectionDescriptionByName,
  sectionInstructionsByName,
  sectionMandatoryByName,
  isLoadingSections,
  subsectionOptions,
    subsectionIdByName,
  subsectionCodeByName,
  subsectionDescriptionByName,
  subsectionInstructionsByName,
  subsectionTimeLimitByName,
  subsectionQuestionLimitByName,
  subsectionRandomizeByName,
  isLoadingSubsections,
  usedSubsectionNames,
  onFieldChange,
  onRequestRemove,
  onAddSubsection,
  onSubsectionFieldChange,
  onRequestRemoveSubsection,
}) => {
  const isEditing = isOpen;
  const questionLimitTotal = section.subsections.reduce(
    (sum, sub) => sum + (Number(sub.questionLimit) || 0),
    0
  );

  // Picking a section name from the API-backed list fills in every
  // read-only detail field from that section's master record — code,
  // description, instructions, and the mandatory flag. All of these fields
  // are disabled, so this is the only way they get populated.
   const handleSectionNameChange = (selectedName) => {
    onFieldChange(section.id, "name", selectedName);

    // Real backend id — this is what actually goes into the publish payload.
    const matchedId = sectionIdByName?.[selectedName];
    onFieldChange(section.id, "dbId", matchedId != null ? matchedId : null);

    const matchedCode = sectionCodeByName?.[selectedName];
    if (matchedCode != null) onFieldChange(section.id, "sectionCode", matchedCode);

    const matchedDescription = sectionDescriptionByName?.[selectedName];
    if (matchedDescription != null) onFieldChange(section.id, "description", matchedDescription);

    const matchedInstructions = sectionInstructionsByName?.[selectedName];
    if (matchedInstructions != null) onFieldChange(section.id, "instructions", matchedInstructions);

    const matchedMandatory = sectionMandatoryByName?.[selectedName];
    if (matchedMandatory != null) onFieldChange(section.id, "isMandatory", matchedMandatory);
  };

  return (
    <div className={cn(adminTheme.card.base, adminTheme.shadow.sm, "group relative p-5")}>
      <div
        className={cn(
          "absolute right-4 top-4 flex shrink-0 items-center gap-1 transition-opacity",
          isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        {isEditing ? (
          <button
            type="button"
            onClick={onToggleOpen}
            className="rounded-md p-1.5 text-emerald-600 transition hover:bg-emerald-50"
            aria-label="Done editing section"
          >
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleOpen}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit section"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRequestRemove(section.id)}
          className="rounded-md p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex items-start gap-3 pr-16 cursor-pointer"
        onClick={(e) => {
          // Let the edit/delete buttons above handle their own clicks;
          // clicking anywhere else on the header toggles the card.
          if (e.target.closest("button")) return;
          onToggleOpen();
        }}
      >
        <GripVertical className="mt-1 h-4 w-4 shrink-0 cursor-grab text-slate-300" />

        {isEditing ? (
          <div className="min-w-0 flex-1 grid grid-cols-1 gap-3 sm:grid-cols-12" onClick={(e) => e.stopPropagation()}>
            <div className="sm:col-span-9">
              <FieldLabel>Section Name</FieldLabel>
              <SelectInput
                id={`${section.id}-name`}
                value={section.name}
                onChange={(e) => handleSectionNameChange(e.target.value)}
                options={sectionOptions}
                loading={isLoadingSections}
              />
            </div>
            <div className="sm:col-span-3">
              <FieldLabel>Section Code</FieldLabel>
              <TextInput
                id={`${section.id}-code`}
                value={section.sectionCode}
                onChange={(e) => onFieldChange(section.id, "sectionCode", e.target.value)}
                placeholder="APT001"
                disabled
              />
            </div>

            <div className="sm:col-span-12">
              <FieldLabel>Short Description</FieldLabel>
              <TextInput
                id={`${section.id}-description`}
                value={section.description}
                onChange={(e) => onFieldChange(section.id, "description", e.target.value)}
                placeholder="Short description"
                disabled
              />
            </div>

            <div className="sm:col-span-12">
              <FieldLabel>Instructions</FieldLabel>
              <textarea
                id={`${section.id}-instructions`}
                rows={3}
                value={section.instructions}
                onChange={(e) => onFieldChange(section.id, "instructions", e.target.value)}
                placeholder="Add section instructions for students"
                disabled
                className={cn(
                  "w-full resize-none text-sm",
                  adminTheme.radius.md,
                  adminTheme.border.default,
                  "border px-3 py-2 text-slate-900 placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
                  "cursor-not-allowed bg-slate-50 text-slate-400"
                )}
              />
            </div>

            <div className="sm:col-span-6">
              <Checkbox
                id={`${section.id}-mandatory`}
                checked={section.isMandatory}
                onChange={(e) => onFieldChange(section.id, "isMandatory", e.target.checked)}
                title="Mandatory section"
                description="Candidate must attempt this section."
                disabled
              />
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {section.name || "Untitled Section"}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {section.instructions || "No instructions added yet."}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                Up to {questionLimitTotal || 0} Questions
              </span>
              <span className="text-slate-300">&bull;</span>
              <span>{section.isMandatory ? "Mandatory" : "Optional"}</span>
              {section.randomizeQuestions && (
                <>
                  <span className="text-slate-300">&bull;</span>
                  <span>Randomized</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-4 space-y-3 pl-7">
          {section.subsections.map((subsection) => (
            <SubsectionRow
              key={subsection.id}
              subsection={subsection}
              isNew={newSubsectionIds.has(subsection.id)}
              // Exclude every subsection name already used anywhere in the
              // structure (any section, any row) EXCEPT this row's own
              // current value — that's what keeps a picked subsection from
              // showing up again in any other dropdown.
              subsectionOptions={excludeUsedOptions(subsectionOptions, usedSubsectionNames, subsection.name)}
              subsectionCodeByName={subsectionCodeByName}
                subsectionIdByName={subsectionIdByName} 
              subsectionDescriptionByName={subsectionDescriptionByName}
              subsectionInstructionsByName={subsectionInstructionsByName}
              subsectionTimeLimitByName={subsectionTimeLimitByName}
              subsectionQuestionLimitByName={subsectionQuestionLimitByName}
              subsectionRandomizeByName={subsectionRandomizeByName}
              isLoadingSubsections={isLoadingSubsections}
              onFieldChange={(subsectionId, field, value) =>
                onSubsectionFieldChange(section.id, subsectionId, field, value)
              }
              onRequestRemove={(subsectionId) => onRequestRemoveSubsection(section.id, subsectionId)}
            />
          ))}
          <AddSubsectionButton onClick={() => onAddSubsection(section.id)} />
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Public component — Step 4: Structure (sections & subsections)
// ---------------------------------------------------------------------------

const StructureStep = ({
  sections,
  newSubsectionIds,
  sectionOptions,
  sectionCodeByName,
  sectionIdByName,              // NEW
  sectionDescriptionByName,
  sectionInstructionsByName,
  sectionMandatoryByName,
  isLoadingSections,
  subsectionOptions,
  subsectionCodeByName,
  subsectionIdByName,           // NEW
  subsectionDescriptionByName,
  subsectionInstructionsByName,
  subsectionTimeLimitByName,
  subsectionQuestionLimitByName,
  subsectionRandomizeByName,
  isLoadingSubsections,
  onAddSection,
  onRequestRemoveSection,
  onSectionFieldChange,
  onAddSubsection,
  onSubsectionFieldChange,
  onRequestRemoveSubsection,
}) => {
  // Accordion state lives here so only one section card can be expanded at
  // a time. Defaults to the first section being open.
  const [openSectionId, setOpenSectionId] = useState(sections[0]?.id ?? null);
  const prevSectionIdsRef = useRef(sections.map((s) => s.id));

  useEffect(() => {
    const prevIds = prevSectionIdsRef.current;
    const currentIds = sections.map((s) => s.id);
    const addedId = currentIds.find((id) => !prevIds.includes(id));

    if (addedId) {
      // A new section was just added — open it and collapse everything else.
      setOpenSectionId(addedId);
    } else if (openSectionId && !currentIds.includes(openSectionId)) {
      // The previously open section was removed — fall back to the first
      // remaining one (or none, if the list is now empty).
      setOpenSectionId(currentIds[0] ?? null);
    }

    prevSectionIdsRef.current = currentIds;
  }, [sections, openSectionId]);

  const handleToggleSection = (sectionId) => {
    setOpenSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  // Every section name already picked anywhere in this assessment (across
  // all section cards) — used to strip those names out of every OTHER
  // card's dropdown, below. Recomputed whenever the structure changes.
  const usedSectionNames = useMemo(
    () => new Set(sections.map((section) => section.name).filter(Boolean)),
    [sections]
  );

  // Every subsection name already picked anywhere in this assessment —
  // across every section and every subsection row — for the same reason.
  // A subsection picked once (in any section) disappears from every other
  // subsection dropdown, in every section.
  const usedSubsectionNames = useMemo(
    () =>
      new Set(
        sections.flatMap((section) => section.subsections.map((sub) => sub.name)).filter(Boolean)
      ),
    [sections]
  );

  return (
    <div>
      <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
        <h2 className="text-base font-semibold text-slate-900">Sections & Subsections</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define the sections that make up this assessment version, and break each one down into subsections with
          their own dimension, question limit, and instructions.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isOpen={section.id === openSectionId}
            onToggleOpen={() => handleToggleSection(section.id)}
            newSubsectionIds={newSubsectionIds}
            // Exclude every section name already used by another section
            // card — same rule as subsections above, but for this card's
            // own current value the name still shows so it stays selected.
            sectionOptions={excludeUsedOptions(sectionOptions, usedSectionNames, section.name)}
            sectionCodeByName={sectionCodeByName}
              sectionIdByName={sectionIdByName}
            sectionDescriptionByName={sectionDescriptionByName}
            sectionInstructionsByName={sectionInstructionsByName}
            sectionMandatoryByName={sectionMandatoryByName}
            isLoadingSections={isLoadingSections}
            subsectionOptions={subsectionOptions}
              subsectionIdByName={subsectionIdByName} 
            subsectionCodeByName={subsectionCodeByName}
            subsectionDescriptionByName={subsectionDescriptionByName}
            subsectionInstructionsByName={subsectionInstructionsByName}
            subsectionTimeLimitByName={subsectionTimeLimitByName}
            subsectionQuestionLimitByName={subsectionQuestionLimitByName}
            subsectionRandomizeByName={subsectionRandomizeByName}
            isLoadingSubsections={isLoadingSubsections}
            usedSubsectionNames={usedSubsectionNames}
            onFieldChange={onSectionFieldChange}
            onRequestRemove={onRequestRemoveSection}
            onAddSubsection={onAddSubsection}
            onSubsectionFieldChange={onSubsectionFieldChange}
            onRequestRemoveSubsection={onRequestRemoveSubsection}
          />
        ))}

        <button
          type="button"
          onClick={onAddSection}
          className={cn(adminTheme.actionButton.secondary, "w-full justify-center border-dashed")}
        >
          <Plus className="h-4 w-4" />
          Add Section
        </button>
      </div>
    </div>
  );
};

export default StructureStep;