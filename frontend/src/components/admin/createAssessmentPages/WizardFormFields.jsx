import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

// ---------------------------------------------------------------------------
// Shared field primitives (label, text/date/select/number inputs, checkbox,
// and the dropdown-style assessment-name field). Every wizard step —
// General Info, Version Settings, Grade Mapping, Structure, etc. — pulls
// these from here so styling stays consistent in one place.
// ---------------------------------------------------------------------------

export const FieldLabel = ({ children, required }) => (
  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
    {children}
    {required && <span className={cn(adminTheme.text.danger, "ml-0.5")}>*</span>}
  </label>
);

export const TextInput = ({ id, value, onChange, placeholder, disabled, required = false, error }) => (
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

// Dropdown-style Assessment Name field:
// - Click the field to open a list of existing names (click one to select it).
// - At the bottom of the same panel, type a new name and press Enter (or
//   click "Add") to insert it into the list. This only ADDS the option —
//   it does not select it. The user must then click it to actually choose it.
export const AssessmentNameField = ({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  onAddOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectOption = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  // Adding a new name now also selects it immediately — the field shows it
  // as the current value right after Enter/Add, no second click needed.
  const handleAddNewName = () => {
    const trimmed = newNameInput.trim();
    if (!trimmed) return;

    onAddOption?.(trimmed);
    onChange({ target: { value: trimmed } });
    setNewNameInput("");
    setIsOpen(false);
  };

  const handleNewNameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddNewName();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between text-sm",
          adminTheme.radius.md,
          adminTheme.border.default,
          "border bg-white px-3 text-left",
          value ? "text-slate-900" : "text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
          error && "border-red-300 focus:ring-red-200"
        )}
      >
        <span className="truncate">{value || placeholder || "Select Assessment Name"}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400">No names yet — add one below.</p>
            )}
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => handleSelectOption(option)}
                className={cn(
                  "flex min-h-9 w-full items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50",
                  option === value ? "bg-slate-50 font-medium text-slate-900" : "text-slate-700"
                )}
              >
                <span className="truncate">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 p-2">
            <input
              type="text"
              value={newNameInput}
              onChange={(event) => setNewNameInput(event.target.value)}
              onKeyDown={handleNewNameKeyDown}
              placeholder="Type a new name and press Enter..."
              className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <button
              type="button"
              onClick={handleAddNewName}
              disabled={!newNameInput.trim()}
              className="inline-flex h-8 shrink-0 items-center rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export const DateInput = ({ id, value, onChange, error }) => (
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

export const SelectInput = ({ id, value, onChange, options, required = false, error }) => (
  <div>
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className={cn(
        "h-11 w-full text-sm",
        adminTheme.radius.md,
        adminTheme.border.default,
        "border bg-white px-3 text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
        error && "border-red-300 focus:ring-red-200"
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

export const NumberInput = ({ id, value, onChange, icon: Icon, suffix, error }) => (
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
        className={cn(
          "h-11 w-full text-sm",
          adminTheme.radius.md,
          adminTheme.border.default,
          "border text-slate-900",
          Icon ? "pl-9" : "pl-3",
          suffix ? "pr-9" : "pr-3",
          "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
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

export const Checkbox = ({ id, checked, onChange, title, description }) => (
  <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
    />
    <span>
      <span className="block text-sm font-medium text-slate-900">{title}</span>
      {description && <span className="block text-xs text-slate-400">{description}</span>}
    </span>
  </label>
);