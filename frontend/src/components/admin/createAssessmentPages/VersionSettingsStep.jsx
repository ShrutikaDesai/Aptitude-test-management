import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import { FieldLabel, TextInput, SelectInput } from "./WizardFormFields";

const Checkbox = ({ id, checked, onChange, title, description }) => (
  <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
    />
    <span>
      <span className="block text-sm font-semibold text-slate-900">{title}</span>
      <span className="block text-xs text-slate-400">{description}</span>
    </span>
  </label>
);

const DateInput = ({ id, value, onChange, error }) => (
  <div>
    <input
      id={id}
      type="date"
      value={value}
      onChange={onChange}
      className={cn(
        "h-11 w-full text-sm",
        adminTheme.radius.md,
        adminTheme.border.default,
        "border px-3 text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
        error && "border-red-300 focus:ring-red-200"
      )}
    />
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const NumberInput = ({ id, value, onChange, suffix, error }) => (
  <div>
    <div className="relative">
      <input
        id={id}
        type="number"
        value={value}
        onChange={onChange}
        className={cn(
          "h-11 w-full text-sm",
          adminTheme.radius.md,
          adminTheme.border.default,
          "border px-3 pr-10 text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
          error && "border-red-300 focus:ring-red-200"
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const VersionSettingsStep = ({
  form,
  onFieldChange,
  validationErrors = {},
  reportTemplateOptions = [{ value: "", label: "Select Report Template" }],
  isLoadingReportTemplates = false,
}) => (
  <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Version Settings</h2>
        <p className="mt-1 text-sm text-slate-400">
          Fill in the assessment version details below and review them carefully before publishing.
        </p>
      </div>
      <span className="text-xs font-semibold text-slate-400">{form.versionNumber || "New Version"}</span>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <FieldLabel required>Version Number</FieldLabel>
        <TextInput
          id="versionNumber"
          value={form.versionNumber}
          onChange={(e) => onFieldChange("versionNumber", e.target.value)}
          placeholder="V1"
          error={validationErrors["version.version_number"]}
          disabled
        />
      </div>

   <div>
        <FieldLabel required>Version Name</FieldLabel>
        <TextInput
          id="versionName"
          value={form.versionName}
          onChange={(e) => onFieldChange("versionName", e.target.value)}
          placeholder="2026 Edition"
          error={validationErrors["version.version_name"]}
        />
      </div>

      <div>
        <FieldLabel required>Effective From</FieldLabel>
        <DateInput
          id="effectiveFrom"
          value={form.effectiveFrom}
          onChange={(e) => onFieldChange("effectiveFrom", e.target.value)}
          error={validationErrors["version.effective_from"]}
        />
      </div>

      <div>
        <FieldLabel>Effective To</FieldLabel>
        <DateInput
          id="effectiveTo"
          value={form.effectiveTo}
          onChange={(e) => onFieldChange("effectiveTo", e.target.value)}
          error={validationErrors["version.effective_to"]}
        />
      </div>

      <div>
        <FieldLabel required>Duration (mins)</FieldLabel>
        <NumberInput
          id="duration"
          value={form.duration}
          onChange={(e) => onFieldChange("duration", e.target.value)}
          error={validationErrors["version.duration_minutes"]}
        />
      </div>

      <div>
        <FieldLabel required>Report Template</FieldLabel>
        <SelectInput
          id="reportTemplateId"
          value={form.reportTemplateId}
          onChange={(e) => onFieldChange("reportTemplateId", e.target.value)}
          options={reportTemplateOptions}
          required
          error={validationErrors["version.report_template_id"]}
        />
        {isLoadingReportTemplates && (
          <p className="mt-1 text-xs text-slate-400">Loading report templates…</p>
        )}
      </div>
    </div>

    <div className="mt-5">
      <FieldLabel>Candidate Instructions</FieldLabel>
      <textarea
        id="instructions"
        rows={3}
        value={form.instructions}
        onChange={(e) => onFieldChange("instructions", e.target.value)}
        placeholder="Shown to the candidate before they start this version, e.g. 'Read each question carefully.'"
        className={cn(
          "w-full resize-none text-sm",
          adminTheme.radius.md,
          adminTheme.border.default,
          "border px-3 py-2.5 text-slate-900 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        )}
      />
    </div>

    <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Runtime Behavior</p>
        <div className="space-y-4">
          <Checkbox
            id="allowResume"
            checked={form.allowResume}
            onChange={(e) => onFieldChange("allowResume", e.target.checked)}
            title="Allow resume"
            description="Candidate can resume an interrupted attempt."
          />
          <Checkbox
            id="allowReview"
            checked={form.allowReview}
            onChange={(e) => onFieldChange("allowReview", e.target.checked)}
            title="Allow review before submission"
            description="Candidate can revisit answers before submitting."
          />
          <Checkbox
            id="randomizeSections"
            checked={form.randomizeSections}
            onChange={(e) => onFieldChange("randomizeSections", e.target.checked)}
            title="Randomize sections"
            description="Shuffle section order per candidate."
          />
        
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Reporting</p>
        <div className="space-y-4">
          <Checkbox
            id="showResultImmediately"
            checked={form.showResultImmediately}
            onChange={(e) => onFieldChange("showResultImmediately", e.target.checked)}
            title="Show result immediately"
            description="Display pass/fail status to candidate after submission."
          />
        </div>
      </div>
    </div>
  </div>
);

export default VersionSettingsStep;