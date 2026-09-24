import { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Upload,
  Download,
  Link2,
  Package,
  ShieldCheck,
  Ban,
  Mail,
  Phone,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Flame,
  Inbox,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/theme/adminTheme";

// NOTE: this page renders in place of the org-detail route your table row
// links to (e.g. /s-admin/organizations/:orgId). It's built entirely from
// adminTheme — no blue/indigo accents anywhere, including the parts that
// were blue in the reference screenshots (the package tile, role badges,
// buttons, chart bars). Local mock data below stands in for a real fetch
// (e.g. a redux slice keyed by orgId) so the page renders standalone.

// ---- Constants -------------------------------------------------------------

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "members", label: "Admins & Members" },
  { key: "packages", label: "Assigned Packages" },
  { key: "students", label: "Students" },
  { key: "links", label: "Registration Links" },
  { key: "logs", label: "Activity Logs" },
];

const ORG_STATUS_META = {
  ACTIVE: { label: "Active", badge: adminTheme.badge.positive },
  PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
  DEACTIVATED: { label: "Deactivated", badge: adminTheme.badge.negative },
};

const MEMBER_ROLE_META = {
  ORG_ADMIN: { label: "Org Admin", className: "bg-slate-900 text-white" },
  COUNSELLOR: { label: "Counsellor", className: "bg-slate-100 text-slate-700" },
  STAFF: { label: "Staff", className: "border border-slate-200 text-slate-600" },
};

const initialsFor = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

// ---- Mock data ---------------------------------------------------------
// Keyed by id so navigating from any row shows that org's name; every other
// field is shared mock detail. Swap this for a real fetch keyed on orgId.

const buildOrgDetail = (orgId, fallbackName) => {
  const name = fallbackName || "Harbor High School";
  return {
    id: orgId,
    name,
    status: "ACTIVE",
    info: {
      legalName: `${name} Education Trust`,
      orgType: "Secondary Education Institute",
      website: "https://harborhigh.edu",
      email: "administration@harborhigh.edu",
      address: "42 Education Plaza, Knowledge District, San Francisco, CA 94105, USA",
    },
    stats: {
      totalStudents: 1240,
      totalStudentsDelta: "+48 this month",
      assessmentsTaken: 3850,
      assessmentsLast: "Last: 12 minutes ago",
      activePackage: "Enterprise Pro",
      packageRenews: "Renews in 18 days",
    },
    weeklyActivity: [
      { day: "Mon", value: 120 },
      { day: "Tue", value: 185 },
      { day: "Wed", value: 142 },
      { day: "Thu", value: 210 },
      { day: "Fri", value: 195 },
      { day: "Sat", value: 85 },
      { day: "Sun", value: 112 },
    ],
    primaryContact: {
      name: "Robert Fox",
      email: "robert.fox@harborhigh.edu",
      phone: "+1 (555) 012-3456",
    },
    internalNote: {
      text: "Thinking about upgrading to custom white-label in Q4. Keep an eye on their assessment volume.",
      author: "Dana W, Oct 15",
    },
    members: [
      { id: "m1", name: "Robert Fox", email: "robert.fox@harborhigh.edu", role: "ORG_ADMIN", lastActive: "Active now", status: "ACTIVE" },
      { id: "m2", name: "Sarah Jenkins", email: "s.jenkins@harborhigh.edu", role: "COUNSELLOR", lastActive: "2 hours ago", status: "ACTIVE" },
      { id: "m3", name: "Linda Meyer", email: "l.meyer@harborhigh.edu", role: "STAFF", lastActive: "Yesterday", status: "INACTIVE" },
    ],
    package: {
      name: "Enterprise Pro",
      icon: Flame,
      billing: "Billed monthly • Renewing on Nov 12, 2023",
      price: "$899",
      priceSuffix: "/month",
      metrics: [
        { label: "Student Capacity", value: "1,240 / 2,500", progress: 0.5 },
        { label: "Assessment Modules", value: "12 Enabled", note: "Full Library Access" },
        { label: "AI Credits", value: "4,200 / 5,000", note: "Resets monthly" },
        { label: "Support Level", value: "Priority 24/7", note: "Dedicated Manager" },
      ],
    },
    addons: [
      { id: "a1", name: "Custom Email Branding", price: "$20/mo", icon: Mail },
      { id: "a2", name: "Extended Data Storage", price: "$50/mo", icon: Package },
    ],
    billingHistory: [
      { id: "b1", invoice: "Invoice #TMP-8291", date: "Oct 12, 2023", amount: "$969.00" },
      { id: "b2", invoice: "Invoice #TMP-7154", date: "Sep 12, 2023", amount: "$969.00" },
    ],
    students: [
      { id: "s1", name: "Marcus Lee", studentId: "TMP-2023-0842", grade: "Grade 12", assessments: "8 / 12", avgScore: 84, lastActive: "15 mins ago" },
      { id: "s2", name: "Sofia Reyes", studentId: "TMP-2023-1156", grade: "Grade 11", assessments: "4 / 12", avgScore: 92, lastActive: "2 hours ago" },
      { id: "s3", name: "Elena Park", studentId: "TMP-2023-0219", grade: "Grade 12", assessments: "12 / 12", avgScore: 76, lastActive: "Yesterday" },
      { id: "s4", name: "Noah Kim", studentId: "TMP-2023-0533", grade: "Grade 10", assessments: "6 / 12", avgScore: 68, lastActive: "3 days ago" },
      { id: "s5", name: "Ava Chen", studentId: "TMP-2023-0987", grade: "Grade 9", assessments: "10 / 12", avgScore: 88, lastActive: "1 hour ago" },
    ],
    studentsTotal: 1240,
  };
};

// ---- Small building blocks --------------------------------------------------

const OrgAvatar = ({ name, size = "h-9 w-9" }) => (
  <div className={cn("flex shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white", size)}>
    {initialsFor(name)}
  </div>
);

const StatusBadge = ({ status }) => {
  const meta = ORG_STATUS_META[status];
  if (!meta) return null;
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide", meta.badge)}>
      {meta.label}
    </span>
  );
};

const StatCard = ({ label, value, sub, subClassName }) => (
  <div className={cn(adminTheme.card.base, "p-4")}>
    <p className={adminTheme.card.subtitle}>{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    {sub && <p className={cn("mt-1 text-xs", subClassName || "text-slate-400")}>{sub}</p>}
  </div>
);

// Simple CSS bar chart — no charting library dependency, bars in adminTheme's
// slate-900 (chart.stroke), track in slate-100.
const WeeklyActivityChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn(adminTheme.card.base, "p-5 sm:p-6")}>
      <div className="flex items-center justify-between">
        <p className={adminTheme.card.title}>Student Activity</p>
        <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">Last 7 Days</span>
      </div>
      <div className="mt-6 flex h-48 items-end gap-3 border-b border-slate-100 pb-2">
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end">
              <div
                className="w-full rounded-t-md bg-slate-900 transition-all"
                style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
                title={`${d.day}: ${d.value}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.day} className="flex-1 text-center text-xs text-slate-400">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm text-slate-900">{value}</p>
  </div>
);

// ---- Header --------------------------------------------------------------

const HEADER_ACTIONS = {
  overview: ({ onEdit }) => (
    <>
      <button type="button" className={adminTheme.actionButton.secondary}>
        Manage Login Links
      </button>
      <button type="button" onClick={onEdit} className={adminTheme.actionButton.primary}>
        Edit Organization
      </button>
    </>
  ),
  members: () => (
    <button type="button" className={adminTheme.actionButton.primary}>
      <Plus className="h-4 w-4" />
      Add Member
    </button>
  ),
  packages: () => (
    <button type="button" className={adminTheme.actionButton.primary}>
      Assign New Package
    </button>
  ),
  students: () => (
    <button type="button" className={adminTheme.actionButton.secondary}>
      <Upload className="h-4 w-4" />
      Export Student List
    </button>
  ),
  links: () => (
    <button type="button" className={adminTheme.actionButton.primary}>
      <Link2 className="h-4 w-4" />
      Generate Link
    </button>
  ),
  logs: () => (
    <button type="button" className={adminTheme.actionButton.secondary}>
      <Download className="h-4 w-4" />
      Export Logs
    </button>
  ),
};

// ---- Tab: Overview -----------------------------------------------------

const QuickTools = () => (
  <div className={cn(adminTheme.card.base, "p-5")}>
    <p className={adminTheme.card.title}>Quick Tools</p>
    <div className="mt-3 divide-y divide-slate-100">
      {[
        { label: "Generate Registration Link", icon: Link2 },
        { label: "Upgrade Subscription", icon: Package },
        { label: "Audit Permissions", icon: ShieldCheck },
      ].map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          className="flex w-full items-center gap-2.5 py-2.5 text-left text-sm text-slate-700 transition hover:text-slate-900"
        >
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </button>
      ))}
      <button type="button" className="flex w-full items-center gap-2.5 py-2.5 text-left text-sm font-medium text-red-600 transition hover:text-red-700">
        <Ban className="h-4 w-4" />
        Deactivate Organization
      </button>
    </div>
  </div>
);

const OverviewTab = ({ org }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div className="space-y-4 lg:col-span-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Students" value={org.stats.totalStudents.toLocaleString()} sub={org.stats.totalStudentsDelta} subClassName="text-emerald-600" />
        <StatCard label="Assessments Taken" value={org.stats.assessmentsTaken.toLocaleString()} sub={org.stats.assessmentsLast} subClassName="text-slate-500" />
        <StatCard label="Active Package" value={org.stats.activePackage} sub={org.stats.packageRenews} subClassName="text-amber-600" />
      </div>

      <WeeklyActivityChart data={org.weeklyActivity} />

      <div className={cn(adminTheme.card.base, "p-5 sm:p-6")}>
        <p className={adminTheme.card.title}>Organization Information</p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InfoField label="Full Legal Name" value={org.info.legalName} />
          <InfoField label="Organization Type" value={org.info.orgType} />
          <InfoField
            label="Website"
            value={
              <a href={org.info.website} className="text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500">
                {org.info.website}
              </a>
            }
          />
          <InfoField label="Primary Email" value={org.info.email} />
          <div className="sm:col-span-2">
            <InfoField label="Address" value={org.info.address} />
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className={cn(adminTheme.card.base, "p-5")}>
        <p className={adminTheme.card.title}>Primary Contact</p>
        <div className="mt-3 flex items-center gap-3">
          <OrgAvatar name={org.primaryContact.name} size="h-11 w-11" />
          <div>
            <p className="text-sm font-semibold text-slate-900">{org.primaryContact.name}</p>
            <p className="text-xs text-slate-400">{org.primaryContact.email}</p>
            <p className="text-xs text-slate-400">{org.primaryContact.phone}</p>
          </div>
        </div>
        <button type="button" className={cn(adminTheme.actionButton.secondary, "mt-4 w-full justify-center")}>
          Send Message
        </button>
      </div>

      <QuickTools />

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Internal Notes</p>
        <p className="mt-2 text-sm italic leading-relaxed text-amber-900">&ldquo;{org.internalNote.text}&rdquo;</p>
        <p className="mt-2 text-xs text-amber-700">— {org.internalNote.author}</p>
        <button type="button" className="mt-3 text-sm font-medium text-slate-700 hover:text-slate-900">
          Add internal note
        </button>
      </div>
    </div>
  </div>
);

// ---- Tab: Admins & Members ----------------------------------------------

const MembersTab = ({ members }) => {
  const [query, setQuery] = useState("");
  const filtered = members.filter(
    (m) => !query.trim() || m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className={adminTheme.card.title}>Organization Members</p>
          <span className={adminTheme.badge.neutral}>{members.length} TOTAL</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="h-8 w-56 rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className={adminTheme.table.headerCell}>Member</th>
              <th className={adminTheme.table.headerCell}>Role</th>
              <th className={adminTheme.table.headerCell}>Last Active</th>
              <th className={adminTheme.table.headerCell}>Status</th>
              <th className={cn(adminTheme.table.headerCell, "text-right")}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => {
              const roleMeta = MEMBER_ROLE_META[member.role];
              const isActive = member.status === "ACTIVE";
              return (
                <tr key={member.id} className={adminTheme.table.row}>
                  <td className={adminTheme.table.cell}>
                    <div className="flex items-center gap-3">
                      <OrgAvatar name={member.name} />
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={adminTheme.table.cell}>
                    {roleMeta && (
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide", roleMeta.className)}>
                        {roleMeta.label}
                      </span>
                    )}
                  </td>
                  <td className={adminTheme.table.cellMuted}>{member.lastActive}</td>
                  <td className={adminTheme.table.cell}>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className={isActive ? adminTheme.timeline.dotActive : adminTheme.timeline.dotMuted} />
                      <span className={isActive ? "text-slate-700" : "text-slate-400"}>{isActive ? "Active" : "Inactive"}</span>
                    </span>
                  </td>
                  <td className={cn(adminTheme.table.cell, "text-right")}>
                    <button type="button" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Tab: Assigned Packages ----------------------------------------------

const PackagesTab = ({ org }) => {
  const Icon = org.package.icon;
  return (
    <div className="space-y-4">
      <div className={cn(adminTheme.card.base, "overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">
          <p className="text-sm font-semibold text-slate-900">Current Active Package</p>
          <span className={adminTheme.badge.positive}>ACTIVE SUBSCRIPTION</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{org.package.name}</p>
              <p className="text-sm text-slate-500">{org.package.billing}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {org.package.price}
              <span className="ml-1 text-sm font-normal text-slate-400">{org.package.priceSuffix}</span>
            </p>
            <button type="button" className="mt-1 text-sm font-medium text-slate-700 hover:text-slate-900">
              Change Billing Method
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          {org.package.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{metric.label}</p>
              <p className="mt-1.5 text-base font-bold text-slate-900">{metric.value}</p>
              {metric.progress != null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${metric.progress * 100}%` }} />
                </div>
              )}
              {metric.note && <p className="mt-2 text-xs text-slate-500">{metric.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
          <div className="flex items-center justify-between">
            <p className={adminTheme.card.title}>Enabled Add-ons</p>
            <button type="button" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Add More
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {org.addons.map((addon) => {
              const AddonIcon = addon.icon;
              return (
                <div key={addon.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <AddonIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{addon.name}</p>
                      <p className="text-xs text-slate-400">{addon.price}</p>
                    </div>
                  </div>
                  <span className={adminTheme.badge.positive}>ACTIVE</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
          <p className={adminTheme.card.title}>Billing History</p>
          <div className="mt-3 divide-y divide-slate-100">
            {org.billingHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{entry.invoice}</p>
                  <p className="text-xs text-slate-400">{entry.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{entry.amount}</span>
                  <button type="button" aria-label={`Download ${entry.invoice}`} className="text-slate-400 hover:text-slate-700">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 w-full text-center text-sm font-medium text-slate-700 hover:text-slate-900">
            View All Billing History
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Students -----------------------------------------------------

const scoreClassName = (score) => {
  if (score >= 85) return "text-emerald-600";
  if (score >= 72) return "text-slate-900";
  return "text-amber-600";
};

const StudentsTab = ({ students, total }) => {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const grades = useMemo(() => Array.from(new Set(students.map((s) => s.grade))), [students]);

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
        const matchesGrade = !grade || s.grade === grade;
        return matchesQuery && matchesGrade;
      }),
    [students, query, grade]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className={cn(adminTheme.card.base, adminTheme.card.padding)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or ID..."
            className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          <option value="">All Grades</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <th className={adminTheme.table.headerCell}>Student Name</th>
              <th className={adminTheme.table.headerCell}>Student ID</th>
              <th className={adminTheme.table.headerCell}>Grade</th>
              <th className={adminTheme.table.headerCell}>Assessments</th>
              <th className={adminTheme.table.headerCell}>Avg. Score</th>
              <th className={adminTheme.table.headerCell}>Last Active</th>
              <th className={cn(adminTheme.table.headerCell, "text-right")}>Profile</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Inbox className="h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-500">No students match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((student) => (
                <tr key={student.id} className={adminTheme.table.row}>
                  <td className={adminTheme.table.cell}>
                    <div className="flex items-center gap-3">
                      <OrgAvatar name={student.name} />
                      <p className="font-medium text-slate-900">{student.name}</p>
                    </div>
                  </td>
                  <td className={cn(adminTheme.table.cellMuted, "font-mono text-xs")}>{student.studentId}</td>
                  <td className={adminTheme.table.cellMuted}>{student.grade}</td>
                  <td className={adminTheme.table.cellMuted}>{student.assessments}</td>
                  <td className={cn(adminTheme.table.cell, "font-semibold", scoreClassName(student.avgScore))}>{student.avgScore}%</td>
                  <td className={adminTheme.table.cellMuted}>{student.lastActive}</td>
                  <td className={cn(adminTheme.table.cell, "text-right")}>
                    <button type="button" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                      View Results
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-500">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filtered.length)} of{" "}
          {total.toLocaleString()} students
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium",
                p === safePage ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage >= pageCount}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Tabs without screenshots — simple, on-brand empty states -----------

const EmptyTab = ({ icon: Icon, title, description, actionLabel }) => (
  <div className={cn(adminTheme.card.base, "flex flex-col items-center justify-center px-6 py-20 text-center")}>
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
      <Icon className="h-5 w-5 text-slate-400" />
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
    {actionLabel && (
      <button type="button" className={cn(adminTheme.actionButton.primary, "mt-5")}>
        {actionLabel}
      </button>
    )}
  </div>
);

// ---- Page -----------------------------------------------------------------

const EnterpriseDetail = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Swap for a real fetch keyed on orgId; name is threaded through from the
  // list page via router state where available, mock data otherwise.
  const org = useMemo(() => buildOrgDetail(orgId), [orgId]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);
  const handleEdit = useCallback(() => {
    navigate(`/s-admin/organizations/${orgId}/edit`);
  }, [navigate, orgId]);

  return (
    <div className={cn("min-h-screen", adminTheme.surface.page)}>
      <div className={cn("border-b bg-white", adminTheme.border.default)}>
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-3 py-4 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleBack} aria-label="Go back" className={adminTheme.button.icon}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="h-6 w-px bg-slate-200" />
            <OrgAvatar name={org.name} />
            <h1 className="text-lg font-bold text-slate-900">{org.name}</h1>
            <StatusBadge status={org.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {HEADER_ACTIONS[activeTab] && (() => {
              const Actions = HEADER_ACTIONS[activeTab];
              return <Actions onEdit={handleEdit} />;
            })()}
          </div>
        </div>

        <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 sm:px-4 lg:px-6">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] space-y-4 px-3 py-6 sm:px-4 lg:px-6">
        {activeTab === "overview" && <OverviewTab org={org} />}
        {activeTab === "members" && <MembersTab members={org.members} />}
        {activeTab === "packages" && <PackagesTab org={org} />}
        {activeTab === "students" && <StudentsTab students={org.students} total={org.studentsTotal} />}
        {activeTab === "links" && (
          <EmptyTab
            icon={Link2}
            title="No registration links yet"
            description="Generate a link so students or staff can self-register into this organization."
            actionLabel="Generate Registration Link"
          />
        )}
        {activeTab === "logs" && (
          <EmptyTab
            icon={ClipboardList}
            title="No activity yet"
            description="Actions taken on this organization — member changes, package updates, logins — will show up here."
          />
        )}
      </main>
    </div>
  );
};

export default EnterpriseDetail;