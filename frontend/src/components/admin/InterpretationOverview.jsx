import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  ClipboardList,
  Pencil,
  Eye,
  FileClock,
  ChevronLeft,
  ChevronRight,
  Archive,
  Trash2,
  CheckCircle2,
  X,
  Inbox,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterpretationRulesByVersion } from "@/slices/interpretationSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---- Constants -------------------------------------------------------------

const INTERPRETATION_STATUS_META = {
  DRAFT: { label: "Draft", badge: "bg-amber-50 text-amber-700" },
  PUBLISHED: { label: "Published", badge: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Archived", badge: "bg-slate-100 text-slate-500" },
};

// Backend calls a published/live interpretation rule `ACTIVE`; the admin UI
// uses the clearer label `Published` for that same state.
const normalizeInterpretationStatus = (status) => {
  const normalized = String(status ?? "DRAFT").toUpperCase();
  return normalized === "ACTIVE" ? "PUBLISHED" : normalized;
};

// Used whenever the API sends back a status value that isn't one of the
// three keys above (unexpected casing, a new status, or a missing field)
// so the row renders instead of throwing on `statusMeta.badge`.
const FALLBACK_STATUS_META = { label: "Unknown", badge: "bg-slate-100 text-slate-500" };

const ASSESSMENT_TYPE_LABELS = {
  CAREER: "Career",
  APTITUDE: "Aptitude",
  INTEREST: "Interest",
  PERSONALITY: "Personality",
  PSYCHOMETRIC: "Psychometric",
};

const INTERPRETATION_LIST_TABS = ["All", "Published", "Draft", "Archived"];
const PAGE_SIZE_OPTIONS = [5, 10, 25];

// ---- PDF export --------------------------------------------------------------

// Builds and downloads a PDF summary of every interpretation currently
// loaded (not just the current page/tab) — one row per assessment_version.
const downloadRuleSummaryPdf = (interpretations) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("Interpretation Rule Summary", 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()} · ${interpretations.length} version(s)`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [[
      "Assessment",
      "Type",
      "Version",
      "Sections",
      "Subsections",
      "Rules",
      "Status",
      "Last Updated",
    ]],
    body: interpretations.map((item) => [
      item.assessmentName ?? "—",
      ASSESSMENT_TYPE_LABELS[item.assessmentType] ?? item.assessmentType ?? "—",
      item.versionName ? `${item.version} · ${item.versionName}` : item.version ?? "—",
      item.sectionsCount ?? 0,
      item.subsectionsCount ?? 0,
      item.rulesCount ?? 0,
      (INTERPRETATION_STATUS_META[item.status] ?? FALLBACK_STATUS_META).label,
      item.updatedAt ?? "—",
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42] }, // slate-900
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`interpretation-rule-summary-${stamp}.pdf`);
};

// ---- Small building blocks --------------------------------------------------

const RowCheckbox = ({ checked, indeterminate = false, onChange, label }) => {
  const ref = useCallback(
    (node) => {
      if (node) node.indeterminate = indeterminate;
    },
    [indeterminate]
  );

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="h-[18px] w-[18px] rounded-[4px] border-2 border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
    />
  );
};

const BULK_ACTION_COPY = {
  publish: {
    title: "Publish selected interpretations?",
    body: (count) => `${count} item${count === 1 ? "" : "s"} will go live and start applying to new student reports immediately.`,
    confirmLabel: "Publish",
    tone: "default",
  },
  archive: {
    title: "Archive selected interpretations?",
    body: (count) => `${count} item${count === 1 ? "" : "s"} will be moved out of active use. You can still find ${count === 1 ? "it" : "them"} under Archived.`,
    confirmLabel: "Archive",
    tone: "default",
  },
  delete: {
    title: "Delete selected interpretations?",
    body: (count) => `${count} item${count === 1 ? "" : "s"} will be permanently deleted. This can't be undone.`,
    confirmLabel: "Delete",
    tone: "danger",
  },
};

// Blocking confirmation modal shown before any bulk action actually runs.
// `action` is null when closed, or one of the BULK_ACTION_COPY keys.
const ConfirmBulkActionDialog = ({ action, count, onConfirm, onCancel }) => {
  if (!action) return null;
  const copy = BULK_ACTION_COPY[action];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={cn(adminTheme.card.base, "w-full max-w-sm p-5")}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-action-title"
      >
        <p id="bulk-action-title" className="text-base font-semibold text-slate-900">
          {copy.title}
        </p>
        <p className="mt-2 text-sm text-slate-500">{copy.body(count)}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={adminTheme.actionButton.secondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-white",
              copy.tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Top bar: page title on the left, action buttons on the right — matching
// the pattern used on AssessmentOverview.
const TopBar = ({ onDownloadSummary, downloadDisabled }) => {
  const navigate = useNavigate();

  const handleNewInterpretation = useCallback(() => {
    navigate("/s-admin/create-interpretation");
  }, [navigate]);

  return (
    <div className={cn("border-b bg-white", adminTheme.border.default)}>
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-start justify-between gap-4 px-3 py-5 sm:px-4 lg:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <ClipboardList className="h-5 w-5 text-slate-400" />
            Interpretation Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Score-range rule sets that power every assessment's report — create, publish, and
            manage from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleNewInterpretation} className={adminTheme.actionButton.primary}>
            <Plus className="h-4 w-4" />
            New Interpretation
          </button>
          <button
            type="button"
            onClick={onDownloadSummary}
            disabled={downloadDisabled}
            className={cn(
              adminTheme.actionButton.secondary,
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <Download className="h-4 w-4" />
            Download Rule Summary
          </button>
        </div>
      </div>
    </div>
  );
};

// Single row in the interpretations list — one row per assessment_version.
// Drafts get a Pencil ("Continue Editing") action since they route back
// into the rule builder; published and archived versions get a read-only
// Eye ("View") action instead.
const InterpretationListRow = ({ interpretation, onOpen, selected, onToggleSelect }) => {
  // Falls back to FALLBACK_STATUS_META instead of crashing when the API
  // sends a status value that isn't DRAFT / PUBLISHED / ARCHIVED.
  const statusMeta = INTERPRETATION_STATUS_META[interpretation.status] ?? FALLBACK_STATUS_META;
  const isDraft = interpretation.status === "DRAFT";

  return (
    <tr className={cn(adminTheme.table.row, selected && "bg-indigo-50/40")}>
      <td className={cn(adminTheme.table.cell, "w-10")}>
        <RowCheckbox
          checked={selected}
          onChange={() => onToggleSelect(interpretation.id)}
          label={`Select ${interpretation.assessmentName}`}
        />
      </td>
      <td className={cn(adminTheme.table.cell, "font-medium text-slate-900")}>
        {interpretation.assessmentName}
      </td>
      <td className={adminTheme.table.cell}>
        <span className={cn(adminTheme.badge.neutral, "uppercase")}>
          {ASSESSMENT_TYPE_LABELS[interpretation.assessmentType] ?? interpretation.assessmentType}
        </span>
      </td>
      <td className={adminTheme.table.cellMuted}>
        {interpretation.version}
        {interpretation.versionName ? ` · ${interpretation.versionName}` : ""}
      </td>
      <td className={adminTheme.table.cellMuted}>{interpretation.sectionsCount}</td>
      <td className={adminTheme.table.cellMuted}>{interpretation.subsectionsCount}</td>
      <td className={adminTheme.table.cellMuted}>{interpretation.rulesCount}</td>
      <td className={adminTheme.table.cell}>
        <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium", statusMeta.badge)}>
          {statusMeta.label}
        </span>
      </td>
      <td className={cn(adminTheme.table.cellMuted, "whitespace-nowrap")}>{interpretation.updatedAt}</td>
      <td className={cn(adminTheme.table.cell, "text-right")}>
        <button
          type="button"
          onClick={() => onOpen(interpretation)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {isDraft ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {isDraft ? "Continue Editing" : "View"}
        </button>
      </td>
    </tr>
  );
};

// Pagination bar: page-size selector on the left, page controls on the
// right. Kept as its own component so it can be reused by other admin
// tables (same as AssessmentOverview's TablePagination).
const TablePagination = ({ page, pageCount, pageSize, onPageChange, onPageSizeChange, totalRows, rangeStart, rangeEnd }) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span>Rows per page</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>

    <div className="flex items-center gap-4 text-sm text-slate-500">
      <span>
        {totalRows === 0 ? "0 of 0" : `${rangeStart}–${rangeEnd} of ${totalRows}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[64px] text-center text-xs font-medium text-slate-600">
          Page {pageCount === 0 ? 0 : page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
);

// `interpretations`, `loading`, and `error` are now owned by the parent
// (InterpretationOverview) instead of being fetched here, so the same data
// can also feed the "Download Rule Summary" PDF button in the TopBar.
const InterpretationsListCard = ({ interpretations, loading, error }) => {
  const navigate = useNavigate();

  const [tab, setTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [pendingAction, setPendingAction] = useState(null); // null | "publish" | "archive" | "delete"

  const filtered = useMemo(() => {
    const byTab = (() => {
      switch (tab) {
        case "Published":
          return interpretations.filter((item) => item.status === "PUBLISHED");
        case "Draft":
          return interpretations.filter((item) => item.status === "DRAFT");
        case "Archived":
          return interpretations.filter((item) => item.status === "ARCHIVED");
        default:
          return interpretations;
      }
    })();

    const query = searchQuery.trim().toLowerCase();
    if (!query) return byTab;

    return byTab.filter((item) => {
      const haystack = [
        item.assessmentName,
        item.versionName,
        item.version,
        ASSESSMENT_TYPE_LABELS[item.assessmentType] ?? item.assessmentType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [interpretations, tab, searchQuery]);


  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  const draftCount = useMemo(
    () => interpretations.filter((a) => a.status === "DRAFT").length,
    [interpretations]
  );

  // Selection is tracked by id across the whole filtered set, not just the
  // current page, so a bulk action can act on everything the admin picked
  // even after they paginate away.
  const pageIds = useMemo(() => paginated.map((a) => a.id), [paginated]);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected;

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [allOnPageSelected, pageIds]);

  const handleTabChange = useCallback((next) => {
    setTab(next);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleConfirmBulkAction = useCallback(() => {
    // TODO: wire up to real publish/archive/delete API calls, then
    // dispatch(fetchInterpretationRulesByVersion()) again to refresh.
    setSelectedIds(new Set());
    setPendingAction(null);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  // Every row here is an assessment_version, so interpretation.id *is*
  // the version id CreateInterpretation needs. NOTE: the param name has
  // to match what CreateInterpretation reads (`versionId`) — not `id` —
  // or the builder silently falls back to the "select an assessment"
  // gate instead of opening the draft.
  const handleOpen = useCallback(
    (interpretation) => {
      if (!interpretation.id) return;

      sessionStorage.setItem(
        `interpretation-version-${interpretation.id}`,
        JSON.stringify({
          assessmentName: interpretation.assessmentName,
          version: interpretation.versionData,
        })
      );

      const isDraft = interpretation.status === "DRAFT";
      const destination = isDraft ? "/s-admin/create-interpretation" : "/s-admin/view-interpretation";

      navigate(`${destination}?versionId=${encodeURIComponent(interpretation.id)}`, {
        state: {
          assessmentName: interpretation.assessmentName,
          version: interpretation.versionData,
          status: interpretation.status,
        },
      });
    },
    [navigate]
  );

  const emptyState = {
    All: {
      title: "No interpretations available",
      description: "There are no interpretation rule sets available at the moment.",
    },
    Draft: {
      title: "No draft interpretations available",
      description: "You don't have any draft interpretations. Create a new one to get started.",
    },
    Published: {
      title: "No published interpretations available",
      description: "There are no published interpretations yet. Publish one to make it available.",
    },
    Archived: {
      title: "No archived interpretations available",
      description: "There are no archived interpretations.",
    },
  };

  return (
    <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={adminTheme.card.title}>Interpretations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by assessment or version..."
              className="w-56 rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 sm:w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-50 p-1">
            {INTERPRETATION_LIST_TABS.map((option) => {
              const count =
                option === "All"
                  ? interpretations.length
                  : interpretations.filter((a) => a.status.toUpperCase() === option.toUpperCase()).length;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleTabChange(option)}
                  className={cn(
                    option === tab ? adminTheme.actionButton.pillActive : adminTheme.actionButton.pillInactive,
                    "inline-flex items-center gap-1.5"
                  )}
                >
                  {option === "Draft" && <FileClock className="h-3.5 w-3.5" />}
                  {option}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-bold",
                      option === tab ? "bg-white/20" : "bg-slate-200/70 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error?.message || "Failed to load interpretations. Please refresh and try again."}</span>
        </div>
      )}

      {tab === "All" && draftCount > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <FileClock className="h-3.5 w-3.5" />
          {draftCount} draft{draftCount === 1 ? "" : "s"} not yet published — switch to the Draft tab to pick one up.
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold">
              {selectedIds.size} item{selectedIds.size === 1 ? "" : "s"} selected
            </span>
            <span className="h-4 w-px shrink-0 bg-white/20" />
            <button
              type="button"
              onClick={() => setPendingAction("publish")}
              className="inline-flex items-center gap-1.5 font-semibold text-white/90 hover:text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Publish
            </button>
            <button
              type="button"
              onClick={() => setPendingAction("archive")}
              className="inline-flex items-center gap-1.5 font-semibold text-white/90 hover:text-white"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
            <button
              type="button"
              onClick={() => setPendingAction("delete")}
              className="inline-flex items-center gap-1.5 font-semibold text-white/90 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Clear selection"
            className="shrink-0 rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ConfirmBulkActionDialog
        action={pendingAction}
        count={selectedIds.size}
        onConfirm={handleConfirmBulkAction}
        onCancel={() => setPendingAction(null)}
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              <th className={cn(adminTheme.table.headerCell, "w-10")}>
                <RowCheckbox
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected}
                  onChange={handleToggleSelectPage}
                  label="Select all rows on this page"
                />
              </th>
              <th className={adminTheme.table.headerCell}>Assessment</th>
              <th className={adminTheme.table.headerCell}>Type</th>
              <th className={adminTheme.table.headerCell}>Version</th>
              <th className={adminTheme.table.headerCell}>Sections</th>
              <th className={adminTheme.table.headerCell}>Subsections</th>
              <th className={adminTheme.table.headerCell}>Rules</th>
              <th className={adminTheme.table.headerCell}>Status</th>
              <th className={adminTheme.table.headerCell}>Last Updated</th>
              <th className={cn(adminTheme.table.headerCell, "text-right")}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading interpretations...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox className="h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-base font-semibold text-slate-700">{emptyState[tab].title}</h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">{emptyState[tab].description}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((interpretation) => (
                <InterpretationListRow
                  key={interpretation.id}
                  interpretation={interpretation}
                  selected={selectedIds.has(interpretation.id)}
                  onToggleSelect={handleToggleSelect}
                  onOpen={handleOpen}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={safePage}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        totalRows={filtered.length}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
    </div>
  );
};

// ---- Page -------------------------------------------------------------------

// Data-fetching and the assessments[].versions[] → one-row-per-version
// flattening now live here (moved out of InterpretationsListCard) so both
// the table and the TopBar's "Download Rule Summary" button share the same
// `interpretations` array — the PDF always reflects every loaded version,
// not just whatever tab/page happens to be visible.
const InterpretationOverview = () => {
  const dispatch = useDispatch();

  const {
    interpretationList,
    interpretationListLoading,
    interpretationListError,
  } = useSelector((state) => state.interpretation);

  useEffect(() => {
    dispatch(fetchInterpretationRulesByVersion());
  }, [dispatch]);

  const interpretations = useMemo(() => {
    const assessments = Array.isArray(interpretationList) ? interpretationList : [];

    return assessments.flatMap((assessment) =>
      (assessment.versions ?? []).map((version) => {
        const subsections = version.subsections ?? [];
        // The list API may name this either `id`, `assessment_version_id`, or
        // `version_id`. This exact value is used by Continue Editing to open
        // the saved draft, so never build a URL with an undefined id.
        const versionId = version.id ?? version.assessment_version_id ?? version.version_id;
        const rulesCount = subsections.reduce(
          (sum, sub) => sum + (sub.rule_count ?? sub.rules?.length ?? 0),
          0
        );
        // Interpretation state belongs to the rules, not the assessment
        // version. A version can be PUBLISHED while its interpretation rules
        // are still being edited as DRAFT.
        const ruleStatuses = subsections
          .flatMap((sub) => sub.rules ?? [])
          .map((rule) => normalizeInterpretationStatus(rule.status))
          .filter(Boolean);
        const interpretationStatus = ruleStatuses.includes("DRAFT")
          ? "DRAFT"
          : ruleStatuses[0] ?? normalizeInterpretationStatus(version.status);

        return {
          id: String(versionId ?? ""),
          assessmentName: assessment.assessment_name,
          assessmentType: assessment.assessment_type,
          version: version.version_number,
          versionName: version.version_name,
          versionData: version,
          sectionsCount: version.section_count ?? 0,
          subsectionsCount: version.subsection_count ?? subsections.length,
          rulesCount,
          status: interpretationStatus,
          updatedAt: version.updated_at ? new Date(version.updated_at).toLocaleString() : "—",
        };
      })
    );
  }, [interpretationList]);

  const handleDownloadSummary = useCallback(() => {
    if (!interpretations.length) return;
    downloadRuleSummaryPdf(interpretations);
  }, [interpretations]);

  return (
    <div className={cn("min-h-screen", adminTheme.surface.page)}>
      <TopBar onDownloadSummary={handleDownloadSummary} downloadDisabled={interpretations.length === 0} />

      <main className="mx-auto max-w-[1600px] space-y-4 px-3 py-6 sm:px-4 lg:px-0">
        <InterpretationsListCard
          interpretations={interpretations}
          loading={interpretationListLoading}
          error={interpretationListError}
        />
      </main>
    </div>
  );
};

export default InterpretationOverview;