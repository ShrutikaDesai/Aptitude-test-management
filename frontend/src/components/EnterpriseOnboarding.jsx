import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Plus,
  Upload,
  Search,
  Pencil,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Inbox,
  X,
  AlertTriangle,
  FileClock,
  Link2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizationsListSlice } from "../slices/enterpriseOnboardingSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Skeleton from "./ui/Skeleton";

// ---- Constants -------------------------------------------------------------
const ORG_STATUS_META = {
  ACTIVE: { label: "Active", badge: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
  DEACTIVATED: { label: "Deactivated", badge: "bg-red-50 text-red-600" },
  // The onboarding wizard leaves new orgs in status "DRAFT" until Step 3
  // is completed (is_draft: false) — added here so the list page doesn't
  // silently hide the badge for any org that hasn't finished onboarding.
  DRAFT: { label: "Draft", badge: "bg-slate-100 text-slate-500" },
  INACTIVE: { label: "Inactive", badge: "bg-slate-100 text-slate-500" },
};

const ORG_TYPES = [
  { value: "SCHOOL", label: "School" },
  { value: "COLLEGE", label: "College" },
  { value: "COACHING_INSTITUTE", label: "Coaching Institute" },
  { value: "COUNSELLOR", label: "Independent Counsellor" },
  { value: "ENTERPRISE", label: "Enterprise" },
  { value: "NGO", label: "NGO" },
  { value: "FRANCHISE", label: "Franchise" },
];
const ORG_TYPE_LABELS = Object.fromEntries(ORG_TYPES.map((t) => [t.value, t.label]));

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const STAGE_TABS = [
  { key: "all", label: "All" },
  { key: "PUBLISHED", label: "Active" },
  { key: "DRAFT", label: "Draft" },
  { key: "ARCHIVED", label: "Archived" },
];

// ---- API record mapping -----------------------------------------------------
// Maps one record from GET /org/organizations/list/ into the shape this
// table renders. The payload looks like:
//   {
//     id, public_id, organization_code, organization_type, name, short_name,
//     email, phone, website, address, city, state, country, pincode,
//     logo_url, timezone, status, registration_link, created_at, updated_at
//   }
// Notably: there is NO `contact_person` field and NO student-count field
// on this endpoint.

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// Derives the "stage" used by the tab filter (Published/Draft/Archived)
// from `status`, since the list endpoint doesn't return a separate
// `stage` field. Also drives which action icon (Edit vs View) a row gets.
const deriveStage = (org) => {
  if (org.status === "DRAFT") return "DRAFT";
  if (org.status === "DEACTIVATED" || org.status === "INACTIVE") return "ARCHIVED";
  return "PUBLISHED";
};

// No `contact_person` field exists on this endpoint, so the "Contact
// Person" column shows email + phone instead. The Organization Name
// column's subtitle uses `short_name`, not email.
const mapOrganizationRecord = (org) => ({
  id: org.id,
  name: org.name ?? "Untitled organization",
  shortName: org.short_name ?? "Untitled",
  email: org.email ?? "—",
  type: org.organization_type ?? "",
  contact: {
    email: org.email ?? "—",
    phone: org.phone ?? "—",
  },
  createdDate: formatDate(org.created_at),
  students: 0, // TODO: no student-count field on this endpoint yet
  status: org.status ?? "DRAFT",
  stage: deriveStage(org),
  registrationLink: org.registration_link ?? "",
});

// ---- PDF export ---------------------------------------------------------
// Renders whatever's currently filtered (search/type/status) into a
// landscape PDF table — one row per organization, matching the columns
// visible in the on-screen table (minus row actions and the copy-link
// column, since long URLs make the PDF table too wide).
const exportOrganizationsToPdf = (organizations) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("Organizations", 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, 14, 21);

  const rows = organizations.map((org, index) => [
    index + 1,
    org.name,
    org.shortName,
    ORG_TYPE_LABELS[org.type] ?? org.type,
    org.contact.email,
    org.contact.phone,
    org.createdDate,
    ORG_STATUS_META[org.status]?.label ?? org.status,
  ]);

  autoTable(doc, {
    startY: 26,
    head: [["Sr.No", "Organization Name", "Short Name", "Type", "Email", "Phone", "Created Date", "Status"]],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42] }, // slate-900
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
  });

  doc.save(`organizations-${Date.now()}.pdf`);
};

// ---- Small building blocks --------------------------------------------------

const initialsFor = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const OrgAvatar = ({ name }) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
    {initialsFor(name)}
  </div>
);

const StatusBadge = ({ status }) => {
  const meta = ORG_STATUS_META[status] ?? { label: status || "Unknown", badge: "bg-slate-100 text-slate-500" };
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium", meta.badge)}>
      {meta.label}
    </span>
  );
};

// Copies an org's registration link to the clipboard. Shows a dash when
// the org has no link yet (e.g. drafts). stopPropagation keeps the click
// from also triggering the row's navigation to the detail page.
const CopyLinkButton = ({ link }) => {
  const [copied, setCopied] = useState(false);

  // Reset the "Copied" state after a moment.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  if (!link) return <span className="text-slate-300">—</span>;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for non-HTTPS contexts / older browsers.
      const el = document.createElement("textarea");
      el.value = link;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={link}
      aria-label="Copy registration link"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition",
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
};

const FilterSelect = ({ value, onChange, placeholder, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Row is clickable (navigates to the org detail page). Edit/View/Delete
// buttons stopPropagation so they don't also fire the row navigation.
//
// Action icon rule:
// - DRAFT orgs get a Pencil "Edit" icon — takes the user into the same
//   create wizard (CreateEnterprise) but in edit mode, prefilled from
//   GET /org/organizations/:id/draft/.
// - Everything else (PUBLISHED/ACTIVE, ARCHIVED) gets an Eye "View" icon —
//   same destination as clicking the row.
const OrganizationRow = ({ organization, serialNumber, onEdit, onDelete, onView }) => {
  const isDraft = organization.stage === "DRAFT";

  return (
    <tr
      className={cn(adminTheme.table.row, "cursor-pointer")}
      onClick={() => onView(organization)}
    >
      <td className={cn(adminTheme.table.cellMuted, "whitespace-nowrap font-mono text-xs")}>{serialNumber}</td>
      <td className={adminTheme.table.cell}>
        <div className="flex items-center gap-3">
          <OrgAvatar name={organization.name} />
          <div>
            <p className="font-medium text-slate-900 hover:underline">{organization.name}</p>
            <p className="text-xs text-slate-400">{organization.shortName}</p>
          </div>
        </div>
      </td>
      <td className={adminTheme.table.cellMuted}>{ORG_TYPE_LABELS[organization.type] ?? organization.type}</td>
      <td className={adminTheme.table.cellMuted}>
        <p className="text-slate-700">{organization.contact.phone}</p>
        <p className="text-xs text-slate-400">{organization.contact.email}</p>
      </td>
      <td className={cn(adminTheme.table.cellMuted, "whitespace-nowrap")}>{organization.createdDate}</td>
      <td className={adminTheme.table.cellMuted}>{organization.students.toLocaleString()}</td>
      <td className={adminTheme.table.cell}>
        <StatusBadge status={organization.status} />
      </td>
      <td className={adminTheme.table.cell}>
        <CopyLinkButton link={organization.registrationLink} />
      </td>
      <td className={cn(adminTheme.table.cell, "text-right")}>
        <div className="flex items-center justify-end gap-3">
          {isDraft ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(organization);
              }}
              aria-label={`Edit ${organization.name}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView(organization);
              }}
              aria-label={`View ${organization.name}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(organization);
            }}
            aria-label={`Delete ${organization.name}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Skeleton row shown in the table body while the organizations list is
// (re)loading. Column widths loosely mirror OrganizationRow (avatar +
// two-line name block, two-line contact block, badge, link button) so the
// table doesn't visibly jump once real rows swap in.
const OrganizationRowSkeleton = () => (
  <tr className={adminTheme.table.row}>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-6 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-40 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-20 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="h-3 w-32 rounded-md" />
      </div>
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-20 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-3.5 w-10 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-5 w-16 rounded-md" />
    </td>
    <td className={adminTheme.table.cell}>
      <Skeleton className="h-6 w-24 rounded-md" />
    </td>
    <td className={cn(adminTheme.table.cell, "text-right")}>
      <div className="flex items-center justify-end gap-3">
        <Skeleton className="h-3.5 w-3.5 rounded-md" />
        <Skeleton className="h-3.5 w-3.5 rounded-md" />
      </div>
    </td>
  </tr>
);

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

const StageTabs = ({ activeTab, onChange, counts }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {STAGE_TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "inline-flex items-center gap-1.5",
            isActive ? adminTheme.actionButton.pillActive : adminTheme.actionButton.pillInactive
          )}
        >
          {tab.label}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
              isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
            )}
          >
            {counts[tab.key] ?? 0}
          </span>
        </button>
      );
    })}
  </div>
);

const DeleteConfirmModal = ({ organization, onConfirm, onCancel }) => {
  if (!organization) return null;
  return (
    <div
      className={cn("fixed inset-0 flex items-center justify-center px-4", adminTheme.zIndex.drawer, adminTheme.surface.overlay)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-org-title"
    >
      <div className={cn("w-full max-w-sm p-6", adminTheme.radius.xl, adminTheme.shadow.xl, adminTheme.surface.card, "border", adminTheme.border.default)}>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>
        <h3 id="delete-org-title" className="mt-4 text-base font-semibold text-slate-900">
          Delete organization?
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          This will permanently remove <span className="font-medium text-slate-700">{organization.name}</span> and
          all of its data. This action cannot be undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className={adminTheme.actionButton.secondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TopBar = ({ onCreate, onExport }) => (
  <div className={cn("border-b bg-white", adminTheme.border.default)}>
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-start justify-between gap-4 px-3 py-5 sm:px-4 lg:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Building2 className="h-5 w-5 text-slate-400" />
          Organizations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and monitor all registered organizations across the platform.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onExport} className={adminTheme.actionButton.secondary}>
          <Upload className="h-4 w-4" />
          Export
        </button>
        <button type="button" onClick={onCreate} className={adminTheme.actionButton.primary}>
          <Plus className="h-4 w-4" />
          Create Organization
        </button>
      </div>
    </div>
  </div>
);

// ---- Main card ---------------------------------------------------------------
const OrganizationsListCard = ({ onRegisterExport }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Raw list + loading/error state from GET /org/organizations/list/.
  const organizationsRaw = useSelector((state) => state.enterpriseOnboarding.organizationsList);
  const listLoading = useSelector((state) => state.enterpriseOnboarding.organizationsListLoading);
  const listError = useSelector((state) => state.enterpriseOnboarding.organizationsListError);

  useEffect(() => {
    dispatch(fetchOrganizationsListSlice());
  }, [dispatch]);

  // Local, table-shaped copy of the list — seeded from the API and kept
  // here (rather than read straight from Redux on every render) so the
  // existing optimistic "Delete" flow below can drop a row immediately
  // without waiting on a delete endpoint/refetch.
  const [organizations, setOrganizations] = useState([]);
  useEffect(() => {
    setOrganizations(organizationsRaw.map(mapOrganizationRecord));
  }, [organizationsRaw]);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tabCounts = useMemo(() => {
    const counts = { all: organizations.length };
    for (const tab of STAGE_TABS) {
      if (tab.key === "all") continue;
      counts[tab.key] = organizations.filter((org) => org.stage === tab.key).length;
    }
    return counts;
  }, [organizations]);

  // Number of orgs still in DRAFT (onboarding not finished). Drives the
  // "N drafts not yet published" notice under the filters.
  const draftCount = tabCounts.DRAFT ?? 0;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return organizations.filter((org) => {
      const matchesTab = activeTab === "all" || org.stage === activeTab;
      const matchesQuery =
        !query || org.name.toLowerCase().includes(query) || org.email.toLowerCase().includes(query);
      const matchesType = !typeFilter || org.type === typeFilter;
      const matchesStatus = !statusFilter || org.status === statusFilter;
      return matchesTab && matchesQuery && matchesType && matchesStatus;
    });
  }, [organizations, activeTab, search, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);
  const hasActiveFilters = Boolean(search || typeFilter || statusFilter);

  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  }, []);

  const handleDeleteRequest = useCallback((organization) => {
    setPendingDelete(organization);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    // NOTE: optimistic/local-only removal — no delete API has been wired
    // up yet, so this only hides the row until the next list refetch.
    setPendingDelete((current) => {
      if (!current) return null;
      setOrganizations((prev) => prev.filter((org) => org.id !== current.id));
      return null;
    });
  }, []);

  // Edit is only ever offered for DRAFT orgs (see OrganizationRow). It
  // routes into the SAME create wizard (CreateEnterprise) but with the
  // org's id in the URL, which puts that page into edit mode: it fetches
  // GET /org/organizations/:id/draft/ to prefill the form and switches
  // Step 1's submit from POST create to PUT update.
  const handleEdit = useCallback(
    (organization) => {
      navigate(`/s-admin/create-enterprise/${organization.id}`);
    },
    [navigate]
  );

  // Navigates to the org detail route, matching EnterpriseDetail's
  // useParams().orgId. Name is passed via router state so the detail page
  // can show it immediately before its own fetch resolves. Used both by
  // the row click and by the Eye "View" icon on non-draft rows.
  const handleView = useCallback(
    (organization) => {
      navigate(`/s-admin/organizations/${organization.id}`, {
        state: { name: organization.name },
      });
    },
    [navigate]
  );

  // Hands the TopBar's Export button a function bound to whatever is
  // currently filtered, so exporting always reflects the on-screen view
  // (search + type + status), not just the current page.
  //
  // NOTE the double arrow: onRegisterExport is setExportHandler, and
  // setState treats a function argument as an updater — calling it
  // immediately with prevState to compute the next state. A single
  // arrow (`() => exportOrganizationsToPdf(filtered)`) would have React
  // invoke that updater right away, running the export (and triggering
  // a download) on every mount/filter-change instead of storing it.
  // Wrapping it one level deeper makes the updater just RETURN the
  // function, so it's only called later when the button is clicked.
  useEffect(() => {
    onRegisterExport(() => () => exportOrganizationsToPdf(filtered));
  }, [filtered, onRegisterExport]);

  return (
    <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <p className={adminTheme.card.title}>Organizations</p>
        <StageTabs activeTab={activeTab} onChange={handleTabChange} counts={tabCounts} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by name or email..."
            className="h-8 w-56 rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <FilterSelect
          value={typeFilter}
          onChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
          placeholder="Organization Type"
          options={ORG_TYPES}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Draft notice — only on the "All" tab, once the list has loaded
          without error, and only when at least one org is still a draft. */}
      {!listLoading && !listError && activeTab === "all" && draftCount > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <FileClock className="h-3.5 w-3.5" />
          {draftCount} draft{draftCount === 1 ? "" : "s"} not yet published — switch to the Draft tab to pick one up.
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr>
              <th className={adminTheme.table.headerCell}>Sr.No</th>
              <th className={adminTheme.table.headerCell}>Organization Name</th>
              <th className={adminTheme.table.headerCell}>Type</th>
              <th className={adminTheme.table.headerCell}>Contact Person</th>
              <th className={adminTheme.table.headerCell}>Created Date</th>
              <th className={adminTheme.table.headerCell}>Students</th>
              <th className={adminTheme.table.headerCell}>Status</th>
              <th className={adminTheme.table.headerCell}>Registration Link</th>
              <th className={cn(adminTheme.table.headerCell, "text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <OrganizationRowSkeleton key={`skeleton-${i}`} />
              ))
            ) : listError ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-300" />
                    <h3 className="mt-4 text-base font-semibold text-slate-700">Couldn't load organizations</h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      {listError?.message || "Something went wrong while fetching the list. Please try again."}
                    </p>
                    <button
                      type="button"
                      onClick={() => dispatch(fetchOrganizationsListSlice())}
                      className={cn(adminTheme.actionButton.secondary, "mt-4")}
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox className="h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-base font-semibold text-slate-700">No organizations found</h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Try adjusting your filters, or create a new organization to get started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((organization, index) => (
                <OrganizationRow
                  key={organization.id}
                  organization={organization}
                  serialNumber={(safePage - 1) * pageSize + index + 1}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onView={handleView}
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

      <DeleteConfirmModal organization={pendingDelete} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
    </div>
  );
};

// ---- Page -------------------------------------------------------------------

const EnterpriseOnboarding = () => {
  const navigate = useNavigate();

  // Holds whatever export function OrganizationsListCard registered for
  // its current filtered view — TopBar lives outside that card, so this
  // is how its Export button reaches the right data.
  const [exportHandler, setExportHandler] = useState(null);

  const handleCreate = useCallback(() => {
    navigate("/s-admin/create-enterprise");
  }, [navigate]);

  const handleExport = useCallback(() => {
    exportHandler?.();
  }, [exportHandler]);

  return (
    <div className={cn("min-h-screen", adminTheme.surface.page)}>
      <TopBar onCreate={handleCreate} onExport={handleExport} />

      <main className="mx-auto max-w-[1600px] space-y-4 px-3 py-6 sm:px-4 lg:px-0">
        <OrganizationsListCard onRegisterExport={setExportHandler} />
      </main>
    </div>
  );
};

export default EnterpriseOnboarding;