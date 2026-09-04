import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

const AddTagModal = ({ open, mode, form, setForm, onClose, onSave, loading }) => {
  if (!open || !form) return null;

  const isEdit = mode === "edit";

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(adminTheme.card.base, "w-full max-w-md p-5")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-modal-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="tag-modal-title" className="text-base font-semibold text-slate-900">
              {isEdit ? "Edit Tag" : "Add Tag"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isEdit ? "Update this tag's name below." : "Create a new tag for use across assessments."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="tag-name" className="mb-1 block text-xs font-medium text-slate-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="tag-name"
              type="text"
              value={form.tag_name}
              onChange={handleChange("tag_name")}
              placeholder="e.g. Quantitative Reasoning"
              required
              className={adminTheme.input.base ?? adminTheme.input.search}
            />
          </div>

         

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className={adminTheme.actionButton.secondary}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.tag_name?.trim()}
              className={cn(adminTheme.actionButton.primary, "disabled:cursor-not-allowed disabled:opacity-60")}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Tag"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTagModal;