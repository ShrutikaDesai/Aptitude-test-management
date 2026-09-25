import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Download,
  Package as PackageIcon,
  Pencil,
  Eye,
  Trash2,
  X,
  Inbox,
  ListChecks,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import AddPackageModal from "../admin/modal/AddPackageModal";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  createPackage,
  updatePackage,
  deletePackage,
  fetchPackages,
  resetPackageState,
} from "@/slices/packageSlice";
import { fetchAssessmentsWithVersions } from "@/slices/interpretationSlice";
import Skeleton from "../ui/Skeleton";

// ---- Constants ---------------------------------------------------------

const MAX_FEATURES = 5;
const MAX_DELIVERABLES = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 25];

const PRICE_RANGE_OPTIONS = [
  { id: "all", label: "Any price" },
  { id: "under-1500", label: "Under ₹1,500" },
  { id: "1500-2500", label: "₹1,500 – ₹2,500" },
  { id: "above-2500", label: "Above ₹2,500" },
];

const matchesPriceRange = (price, rangeId) => {
  if (rangeId === "under-1500") return price < 1500;
  if (rangeId === "1500-2500") return price >= 1500 && price <= 2500;
  if (rangeId === "above-2500") return price > 2500;
  return true;
};

const formatPrice = (price) =>
  price === "" || price === null || price === undefined
    ? "—"
    : `₹${Number(price).toLocaleString("en-IN")}`;

const emptyPackageForm = () => ({
  id: null,
  name: "",
  price: "",
  description: "",
  assessmentVersionId: "",
  gradeId: "",
  features: [""],
  deliverables: [""],
});

// Normalizes a package record coming from the API (flat package_featuresN /
// package_deliverableN keys, package_name / package_price / package_description,
// and a plain numeric assessment_version) into the shape the table/modal
// expect (camelCase, arrays always present).
const normalizePackage = (pkg) => {
  const features = [];
  for (let i = 1; i <= MAX_FEATURES; i += 1) {
    const value = pkg[`package_features${i}`];
    if (value) features.push(value);
  }

  const deliverables = [];
  for (let i = 1; i <= MAX_DELIVERABLES; i += 1) {
    const value = pkg[`package_deliverable${i}`];
    if (value) deliverables.push(value);
  }

  // GET returns flat `grade_id` + `grade_name`. `grade` may also come back as
  // a plain id or a nested object ({ id, grade_name }), so handle all shapes.
  const rawGrade = pkg.grade ?? pkg.grade_id ?? "";
  const gradeId =
    rawGrade && typeof rawGrade === "object"
      ? String(rawGrade.id ?? rawGrade.public_id ?? "")
      : rawGrade === null || rawGrade === undefined
      ? ""
      : String(rawGrade);

  const gradeName =
    pkg.grade_name ??
    (rawGrade && typeof rawGrade === "object" ? rawGrade.grade_name ?? rawGrade.name : "") ??
    "";

  return {
    id: pkg.id ?? pkg._id ?? pkg.package_id ?? "",
    publicId: pkg.public_id ?? "",
    name: pkg.package_name ?? pkg.name ?? "",
    price: pkg.package_price ?? pkg.price ?? "",
    description: pkg.package_description ?? pkg.description ?? "",
    // API sends assessment_version as a plain number (e.g. 175), matching
    // the version `id` used in versionOptions/assessmentGroups — stringify
    // so lookups by id (which compare strings) still match.
    assessmentVersionId:
      pkg.assessment_version !== undefined && pkg.assessment_version !== null
        ? String(pkg.assessment_version)
        : pkg.assessment_version_id ?? pkg.assessmentVersionId ?? "",
    gradeId,
    gradeName: gradeName ? String(gradeName) : "",
    status: pkg.status ?? "",
    features: features.length ? features : [""],
    deliverables: deliverables.length ? deliverables : [""],
  };
};

// Flat {id, label} list — used for the table's version filter <select>,
// where a plain dropdown is fine (no card styling needed there).
// Uses the version's numeric `id` (not public_id), since that's what the
// backend expects for assessment_version.
const flattenAssessmentVersions = (assessments) => {
  if (!Array.isArray(assessments)) return [];
  const options = [];

  assessments.forEach((assessment) => {
    const versions = Array.isArray(assessment.versions) ? assessment.versions : [];
    const assessmentName = assessment.assessment_name ?? "Assessment";

    versions.forEach((version) => {
      const versionId = version.id;
      if (versionId === undefined || versionId === null) return;

      const parts = [assessmentName, version.version_number, version.version_name].filter(
        Boolean
      );

      options.push({
        id: String(versionId),
        label: parts.join(" · "),
      });
    });
  });

  return options;
};

// Grouped shape for the AssessmentVersionPicker card-style dropdown:
// [{ id, name, versions: [{ id, version_number, version_name, section_count }] }]
// NOTE: each version's `id` here is the numeric id (e.g. 175) — this is what
// gets stored as form.assessmentVersionId and sent as assessment_version
// in the create/update payload. The assessment group's own `id` is only used
// as a React key and is unrelated to the version id sent to the backend.
const buildAssessmentGroups = (assessments) => {
  if (!Array.isArray(assessments)) return [];

  return assessments.map((assessment) => ({
    id: String(assessment.public_id ?? assessment.id),
    name: assessment.assessment_name ?? "Assessment",
    versions: (Array.isArray(assessment.versions) ? assessment.versions : []).map((version) => ({
      id: String(version.id),
      version_number: version.version_number,
      version_name: version.version_name,
      section_count: version.section_count,
    })),
  }));
};

// ---- Tooltip ---------------------------------------------------------------
//
// Lightweight CSS-only tooltip (no extra state/portal) — shows `content`
// below the trigger on hover/focus. `content` can be any node (e.g. a
// bullet list); if it's empty/null the trigger renders with no tooltip.

const Tooltip = ({ content, children }) => {
  const isEmpty =
    content === null ||
    content === undefined ||
    (Array.isArray(content) && content.length === 0) ||
    (typeof content === "string" && content.trim() === "");

  if (isEmpty) return children;

  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[260px] -translate-x-1/2",
          "rounded-md bg-slate-900 px-3 py-2 text-left text-xs leading-relaxed text-white shadow-lg",
          "opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
        )}
      >
        {content}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
      </span>
    </span>
  );
};

// ---- Top bar -------------------------------------------------------------

const TopBar = ({ onNewPackage, onExport }) => (
  <div className={cn("border-b bg-white", adminTheme.border.default)}>
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-start justify-between gap-4 px-3 py-5 sm:px-4 lg:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <PackageIcon className="h-5 w-5 text-slate-400" />
          Package Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Bundle assessments into sellable packages — set pricing, features, and
          deliverables from one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onNewPackage} className={adminTheme.actionButton.primary}>
          <Plus className="h-4 w-4" />
          New Package
        </button>
        <button type="button" onClick={onExport} className={adminTheme.actionButton.secondary}>
          <Download className="h-4 w-4" />
          Export Packages
        </button>
      </div>
    </div>
  </div>
);

// ---- Delete confirm dialog -------------------------------------------------

const ConfirmDeleteDialog = ({ pkg, onConfirm, onCancel, loading }) => {
  if (!pkg) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={cn(adminTheme.card.base, "w-full max-w-sm p-5")}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <p className="text-base font-semibold text-slate-900">Delete this package?</p>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{pkg.name}</span> will be permanently
          deleted. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={adminTheme.actionButton.secondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Table row -------------------------------------------------------------

const PackageRow = ({ pkg, srNo, onEdit, onView, onDelete, versionLabel }) => (
  <tr className={adminTheme.table.row}>
    <td className={cn(adminTheme.table.cell, "font-medium text-slate-900")}>{srNo}</td>
    <td className={adminTheme.table.cell}>{pkg.name}</td>
    <td className={adminTheme.table.cellMuted}>{formatPrice(pkg.price)}</td>
    <td className={adminTheme.table.cellMuted}>{versionLabel(pkg.assessmentVersionId)}</td>
    <td className={adminTheme.table.cellMuted}>{pkg.gradeName || "—"}</td>
    <td className={adminTheme.table.cellMuted}>
      <Tooltip
        content={
          pkg.features.filter(Boolean).length ? (
            <ul className="space-y-0.5">
              {pkg.features.filter(Boolean).map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
            </ul>
          ) : null
        }
      >
        <span className={cn(adminTheme.badge.neutral, "gap-1 cursor-default")} tabIndex={0}>
          <ListChecks className="h-3 w-3" />
          {pkg.features.filter(Boolean).length}/{MAX_FEATURES}
        </span>
      </Tooltip>
    </td>
    <td className={adminTheme.table.cellMuted}>
      <Tooltip
        content={
          pkg.deliverables.filter(Boolean).length ? (
            <ul className="space-y-0.5">
              {pkg.deliverables.filter(Boolean).map((deliverable, i) => (
                <li key={i}>• {deliverable}</li>
              ))}
            </ul>
          ) : null
        }
      >
        <span className={cn(adminTheme.badge.neutral, "gap-1 cursor-default")} tabIndex={0}>
          <Boxes className="h-3 w-3" />
          {pkg.deliverables.filter(Boolean).length}/{MAX_DELIVERABLES}
        </span>
      </Tooltip>
    </td>
    <td className={adminTheme.table.cellMuted}>
      <Tooltip content={pkg.description ? <span className="whitespace-pre-wrap">{pkg.description}</span> : null}>
        <span className="line-clamp-1 max-w-[220px] cursor-default" tabIndex={0}>
          {pkg.description || "—"}
        </span>
      </Tooltip>
    </td>
    <td className={cn(adminTheme.table.cell, "text-right")}>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onView(pkg)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <Eye className="h-3.5 w-3.5" />
          {/* View */}
        </button>
        <button
          type="button"
          onClick={() => onEdit(pkg)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          {/* Edit */}
        </button>
        {/* <button
          type="button"
          onClick={() => onDelete(pkg)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button> */}
      </div>
    </td>
  </tr>
);

// Skeleton row shown in place of real rows while packages are (re)loading.
// Column widths loosely mirror PackageRow so the table doesn't jump around.
const PackageRowSkeleton = () => (
  <tr className={adminTheme.table.row}>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-6 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-32 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-16 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-36 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-10 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-5 w-14 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-5 w-14 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-40 rounded-md" />
    </td>
    <td className={cn(adminTheme.table.cell, "text-right")}>
      <Skeleton className="ml-auto h-3.5 w-16 rounded-md" />
    </td>
  </tr>
);

// ---- Pagination -------------------------------------------------------------

const TablePagination = ({
  page,
  pageCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalRows,
  rangeStart,
  rangeEnd,
}) => (
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
      <span>{totalRows === 0 ? "0 of 0" : `${rangeStart}–${rangeEnd} of ${totalRows}`}</span>
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

// ---- List card -------------------------------------------------------------
//
// `loading` keeps the whole card (search box, filters, pagination) mounted
// and only swaps the <tbody> rows for skeleton placeholders — instead of the
// old behavior of the parent page unmounting this entire card and showing a
// bare "Loading packages…" text block on every fetch/refetch.

const PackagesListCard = ({ packages, onEdit, onView, onDelete, versionOptions, loading }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [versionFilter, setVersionFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const versionLabel = useCallback(
    (id) => versionOptions.find((v) => v.id === id)?.label ?? "—",
    [versionOptions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((pkg) => {
      const matchesQuery =
        !q ||
        pkg.name.toLowerCase().includes(q) ||
        String(pkg.id).toLowerCase().includes(q) ||
        (pkg.description || "").toLowerCase().includes(q);
      const matchesVersion = versionFilter === "all" || pkg.assessmentVersionId === versionFilter;
      const matchesPrice = matchesPriceRange(Number(pkg.price) || 0, priceFilter);
      return matchesQuery && matchesVersion && matchesPrice;
    });
  }, [packages, query, versionFilter, priceFilter]);

  const hasActiveFilters = versionFilter !== "all" || priceFilter !== "all";

  const clearFilters = useCallback(() => {
    setVersionFilter("all");
    setPriceFilter("all");
  }, []);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setPage(1);
  }, []);

  const handleVersionFilterChange = useCallback((value) => {
    setVersionFilter(value);
    setPage(1);
  }, []);

  const handlePriceFilterChange = useCallback((value) => {
    setPriceFilter(value);
    setPage(1);
  }, []);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return (
    <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={adminTheme.card.title}>Packages</p>
          {/* <p className={adminTheme.card.subtitle}>
            {filtered.length} of {packages.length} total
          </p> */}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by name, ID, description..."
              className={adminTheme.input.search}
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition",
              filtersOpen || hasActiveFilters
                ? "border-slate-300 bg-slate-100 text-slate-900"
                : cn(adminTheme.border.default, "bg-white text-slate-700 hover:bg-slate-50")
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {[versionFilter !== "all", priceFilter !== "all"].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div
          className={cn(
            "mt-3 flex flex-wrap items-end gap-3 rounded-lg border p-3",
            adminTheme.surface.subtle,
            adminTheme.border.default
          )}
        >
          <div className="min-w-[200px]">
            <label className="text-xs text-slate-400">Assessment Version</label>
            <select
              value={versionFilter}
              onChange={(e) => handleVersionFilterChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="all">All versions</option>
              {versionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="text-xs text-slate-400">Price</label>
            <select
              value={priceFilter}
              onChange={(e) => handlePriceFilterChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {PRICE_RANGE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 pb-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1020px] border-collapse">
          <thead>
            <tr>
              <th className={adminTheme.table.headerCell}>Sr No</th>
              <th className={adminTheme.table.headerCell}>Name</th>
              <th className={adminTheme.table.headerCell}>Price</th>
              <th className={adminTheme.table.headerCell}>Assessment Version</th>
              <th className={adminTheme.table.headerCell}>Grade</th>
              <th className={adminTheme.table.headerCell}>Features</th>
              <th className={adminTheme.table.headerCell}>Deliverables</th>
              <th className={adminTheme.table.headerCell}>Description</th>
              <th className={cn(adminTheme.table.headerCell, "text-right")}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <PackageRowSkeleton key={`skeleton-${i}`} />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox className="h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-base font-semibold text-slate-700">
                      {packages.length === 0 ? "No packages available" : "No matching packages"}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      {packages.length === 0
                        ? "Create your first package to start bundling assessments for students."
                        : "Try adjusting your search or filters."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((pkg, index) => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  srNo={rangeStart + index}
                  onEdit={onEdit}
                  onView={onView}
                  onDelete={onDelete}
                  versionLabel={versionLabel}
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

const Package = () => {
  const dispatch = useDispatch();

  const { packages: rawPackages, packagesLoading, loading, success, error } = useSelector(
    (state) => state.package
  );
  const { assessments, assessmentsLoading } = useSelector((state) => state.interpretation);

  const packages = useMemo(() => rawPackages.map(normalizePackage), [rawPackages]);
  const versionOptions = useMemo(() => flattenAssessmentVersions(assessments), [assessments]);
  const assessmentGroups = useMemo(() => buildAssessmentGroups(assessments), [assessments]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" | "edit" | "view"
  const [form, setForm] = useState(emptyPackageForm());

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchAssessmentsWithVersions());
  }, [dispatch]);

  const openCreate = useCallback(() => {
    setForm(emptyPackageForm());
    setDialogMode("create");
    setDialogOpen(true);
  }, []);

  // `...pkg` already carries gradeId (set in normalizePackage), so the
  // Grade dropdown in the modal prefills on edit/view.
  const openEdit = useCallback((pkg) => {
    setForm({
      ...pkg,
      price: String(pkg.price ?? ""),
      gradeId: String(pkg.gradeId ?? ""),
      features: pkg.features.length ? [...pkg.features].slice(0, MAX_FEATURES) : [""],
      deliverables: pkg.deliverables.length ? [...pkg.deliverables] : [""],
    });
    setDialogMode("edit");
    setDialogOpen(true);
  }, []);

  const openView = useCallback((pkg) => {
    setForm({
      ...pkg,
      price: String(pkg.price ?? ""),
      gradeId: String(pkg.gradeId ?? ""),
      features: pkg.features.length ? [...pkg.features].slice(0, MAX_FEATURES) : [""],
      deliverables: pkg.deliverables.length ? [...pkg.deliverables] : [""],
    });
    setDialogMode("view");
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setForm(emptyPackageForm());
    dispatch(resetPackageState());
  }, [dispatch]);

  const handleSave = useCallback(() => {
    if (!form) return;

    const cleanFeatures = form.features.map((f) => f.trim()).filter(Boolean);
    const cleanDeliverables = form.deliverables.map((d) => d.trim()).filter(Boolean);

    // Backend expects flat package_features1..5 / package_deliverable1..5
    // keys instead of arrays — pad/truncate to MAX_FEATURES/MAX_DELIVERABLES
    // slots, filling unused slots with "".
    const featureFields = {};
    for (let i = 0; i < MAX_FEATURES; i += 1) {
      featureFields[`package_features${i + 1}`] = cleanFeatures[i] ?? "";
    }

    const deliverableFields = {};
    for (let i = 0; i < MAX_DELIVERABLES; i += 1) {
      deliverableFields[`package_deliverable${i + 1}`] = cleanDeliverables[i] ?? "";
    }

    const payload = {
      package_name: form.name.trim(),
      package_price: Number(form.price),
      assessment_version: Number(form.assessmentVersionId),
      package_description: form.description?.trim() || "",
      // Backend key is `grade` — selected grade's value, or null if none.
      grade: form.gradeId ? Number(form.gradeId) : null,
      ...featureFields,
      ...deliverableFields,
    };

    if (dialogMode === "edit") {
      dispatch(updatePackage({ id: form.id, payload }));
    } else {
      dispatch(createPackage(payload));
    }
  }, [dispatch, dialogMode, form]);

  // Close the dialog automatically once create/update succeeds, then
  // refetch so the table reflects what was actually saved (rather than
  // relying on optimistic local state).
  useEffect(() => {
    if (success) {
      setDialogOpen(false);
      setForm(emptyPackageForm());
      dispatch(resetPackageState());
      dispatch(fetchPackages());
    }
  }, [success, dispatch]);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    setDeleting(true);
    dispatch(deletePackage(pendingDelete.id)).finally(() => {
      setDeleting(false);
      setPendingDelete(null);
    });
  }, [dispatch, pendingDelete]);

  const handleExportPdf = useCallback(() => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Package Overview", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated ${new Date().toLocaleDateString("en-IN")}`, 14, 21);

    const rows = packages.map((pkg, index) => [
      index + 1,
      pkg.name || "—",
      formatPrice(pkg.price),
      versionOptions.find((v) => v.id === pkg.assessmentVersionId)?.label ?? "—",
      pkg.gradeName || "—",
      pkg.features.filter(Boolean).join(", ") || "—",
      pkg.deliverables.filter(Boolean).join(", ") || "—",
      pkg.description || "—",
    ]);

    autoTable(doc, {
      startY: 26,
      head: [
        [
          "Sr No",
          "Name",
          "Price",
          "Assessment Version",
          "Grade",
          "Features",
          "Deliverables",
          "Description",
        ],
      ],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 32 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 15 },
        5: { cellWidth: 50 },
        6: { cellWidth: 50 },
        7: { cellWidth: 55 },
      },
    });

    doc.save(`packages-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [packages, versionOptions]);

  return (
    <div className={cn("min-h-screen", adminTheme.surface.page)}>
      <TopBar onNewPackage={openCreate} onExport={handleExportPdf} />

      <main className="mx-auto max-w-[1600px] space-y-4 px-3 py-6 sm:px-4 lg:px-0">
        <PackagesListCard
          packages={packages}
          onEdit={openEdit}
          onView={openView}
          onDelete={setPendingDelete}
          versionOptions={versionOptions}
          loading={packagesLoading}
        />
      </main>

      <AddPackageModal
        open={dialogOpen}
        mode={dialogMode}
        form={form}
        setForm={setForm}
        onClose={closeDialog}
        onSave={handleSave}
        loading={loading}
        assessmentGroups={assessmentGroups}
        versionsLoading={assessmentsLoading}
      />

      <ConfirmDeleteDialog
        pkg={pendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />

      {error && (
        <div className="fixed bottom-4 right-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 shadow">
          {typeof error === "string" ? error : "Something went wrong."}
        </div>
      )}
    </div>
  );
};

export default Package;