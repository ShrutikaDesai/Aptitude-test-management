import React, { useState } from "react";
import {
    User,
    Calendar,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Building2,
    Pencil,
    Download,
    RotateCcw,
    FileText,
    CreditCard,
    Clock3,
    CheckCircle2,
    Sparkles,
    Award,
    Target,
    PhoneCall,
    CalendarCheck,
    MessageSquareText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import theme from "../theme/theme";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ------------------------------------------------------------------ */
/* Mock data — swap these for real values from your auth/user slice   */
/* ------------------------------------------------------------------ */

const STUDENT = {
    fullName: "Shweta Bamane",
    email: "shwetabbamane@gmail.com",
    mobile: "8956034009",
    qualification: "10th Pass",
    initials: "SB",
};

const GRADE_OPTIONS = ["8th", "9th", "10th", "11th", "12th", "Graduate"];
const STATUS_OPTIONS = ["Pass", "Appearing"];
const YES_NO = ["None", "Yes"];
const STREAM_OPTIONS = ["Science", "Commerce", "Arts", "Not decided yet"];
const QUERY_TOPICS = ["Career Selection", "Stream Selection", "Report Query", "Payment / Billing", "Other"];

const TABS = [
    { id: "personal", label: "Personal Details", icon: User, Component: () => <PersonalDetailsTab /> },
    { id: "report", label: "10th Test & Report", icon: FileText, Component: () => <ReportTab /> },
    { id: "payment", label: "Payment Details", icon: CreditCard, Component: () => <PaymentTab /> },
    { id: "counselling", label: "Counselling", icon: PhoneCall, Component: () => <CounsellingTab /> },
    { id: "ask", label: "Ask Expert", icon: MessageSquareText, Component: () => <AskExpertTab /> },
];

/* ------------------------------------------------------------------ */

const StudentAccount = () => {
    const [activeTab, setActiveTab] = useState("personal");
    const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

    return (
        <div className="w-full bg-slate-50 min-h-screen flex flex-col" style={{ fontFamily: theme.font.family }}>
            <Header user={{ name: STUDENT.fullName, initials: STUDENT.initials }} />

            <main className="flex-1 w-full">
                <div className="w-full max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
                    <ProfileSummary />
                    <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div key={activeTab} className="animate-fade-in">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </main>

            <Footer />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.25s ease-out; }
            `}</style>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Profile summary — gradient hero card, replaces the plain avatar row */
/* ------------------------------------------------------------------ */

const ProfileSummary = () => (
    <div
        className="relative overflow-hidden rounded-2xl mb-8 px-5 sm:px-7 py-6 sm:py-7"
        style={{ background: `linear-gradient(120deg, ${theme.colors.primary}, #1E3A8A)` }}
    >
        {/* one restrained decorative device: a faint diagonal grid, not a blob */}
        <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
                backgroundImage:
                    "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 26px)",
            }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold text-white bg-white/15 border border-white/25 flex-shrink-0">
                {STUDENT.initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-white">{STUDENT.fullName}</p>
                <p className="text-sm text-white/75">
                    {STUDENT.email} &middot; {STUDENT.qualification}
                </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                Test Activated
            </span>
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/* Tab bar — pill-segmented control with icons                         */
/* ------------------------------------------------------------------ */

const TabBar = ({ activeTab, setActiveTab }) => (
    <div className="w-full flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 mb-8">
        {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                    style={
                        isActive
                            ? { backgroundColor: "#fff", color: theme.colors.primary, boxShadow: "0 1px 3px rgba(15,23,42,0.12)" }
                            : { color: theme.colors.text.light }
                    }
                >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                </button>
            );
        })}
    </div>
);

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title, hint }) => (
    <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            <h3 className="text-base font-bold" style={{ color: theme.colors.text.heading }}>
                {title}
            </h3>
        </div>
        {hint && (
            <span className="text-sm hidden sm:block" style={{ color: theme.colors.text.light }}>
                {hint}
            </span>
        )}
    </div>
);

const Field = ({ label, icon: Icon, required, children }) => (
    <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <div className="relative">
            {Icon && <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />}
            {children ?? <Input className={Icon ? "pl-10" : ""} />}
        </div>
    </div>
);

const TextField = ({ label, icon: Icon, required, ...props }) => (
    <Field label={label} icon={Icon} required={required}>
        <Input className={`${Icon ? "pl-10" : ""} rounded-lg focus-visible:ring-2`} {...props} />
    </Field>
);

const PickField = ({ label, icon: Icon, required, placeholder, options, value, onValueChange }) => (
    <Field label={label} icon={Icon} required={required}>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={`rounded-lg ${Icon ? "pl-10" : ""}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                        {opt}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </Field>
);

const CardShell = ({ children }) => (
    <Card
        className="rounded-2xl border shadow-sm bg-white transition-shadow hover:shadow-md"
        style={{ borderColor: theme.colors.border }}
    >
        {children}
    </Card>
);

/* ------------------------------------------------------------------ */
/* Tab 1 — Personal Details                                            */
/* ------------------------------------------------------------------ */

const PersonalDetailsTab = () => {
    const [marks, setMarks] = useState({
        "8th": { aggregate: "", science: "", maths: "", english: "" },
        "9th": { aggregate: "", science: "", maths: "", english: "" },
        "10th": { aggregate: "", science: "", maths: "", english: "" },
    });

    const updateMark = (grade, field, value) =>
        setMarks((prev) => ({ ...prev, [grade]: { ...prev[grade], [field]: value } }));

    return (
        <div className="flex flex-col gap-6">
            <CardShell>
                <CardContent className="p-6">
                    <SectionHeader title="Personal Details" hint="We use this only to serve you better" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <TextField label="Full Name" icon={User} required defaultValue={STUDENT.fullName} />
                        <TextField label="Birth Date" icon={Calendar} required type="date" />
                        <PickField label="Gender" required placeholder="Select gender" options={["Female", "Male", "Other"]} />
                        <div>
                            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <Input
                                        disabled
                                        value={STUDENT.email}
                                        className="pl-10 rounded-lg bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="text-sm font-semibold whitespace-nowrap hover:underline"
                                    style={{ color: theme.colors.primary }}
                                >
                                    Change password
                                </button>
                            </div>
                        </div>
                        <TextField label="Mobile Number" icon={Phone} required defaultValue={STUDENT.mobile} />
                        <TextField label="Address" icon={MapPin} required placeholder="House no, street, area" />
                        <PickField label="State" required placeholder="Select state" options={["Maharashtra", "Karnataka", "Gujarat", "Delhi"]} />
                        <PickField label="City" required placeholder="Select city" options={["Pune", "Mumbai", "Bengaluru", "Ahmedabad"]} />
                        <TextField label="School / College Name" icon={Building2} required placeholder="e.g. St. Xavier's High School" />
                        <PickField label="Qualification" icon={GraduationCap} required placeholder="Select qualification" options={GRADE_OPTIONS} />
                        <PickField label="Qualification Status" required placeholder="Select status" options={STATUS_OPTIONS} />
                        <PickField label="Disabilities / Handicaps" required placeholder="Select" options={YES_NO} />
                    </div>
                </CardContent>
            </CardShell>

            <CardShell>
                <CardContent className="p-6">
                    <SectionHeader title="Academic Details" hint="Helps us tailor your career recommendations" />
                    <p className="text-sm mb-4" style={{ color: theme.colors.text.body }}>
                        If a qualification is still pending, enter your expected percentage or marks.
                    </p>
                    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: theme.colors.border }}>
                        <table className="w-full text-sm min-w-[520px]">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left font-semibold text-slate-500 py-3 pl-4 pr-4 w-40">Score</th>
                                    {["8th", "9th", "10th"].map((g) => (
                                        <th key={g} className="text-left font-semibold text-slate-500 py-3 pr-4">
                                            {g}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { key: "aggregate", label: "Aggregate %" },
                                    { key: "science", label: "Science" },
                                    { key: "maths", label: "Maths" },
                                    { key: "english", label: "English" },
                                ].map((row, i) => (
                                    <tr key={row.key} className={i % 2 === 1 ? "bg-slate-50/60" : ""}>
                                        <td className="py-2.5 pl-4 pr-4 text-slate-600 font-medium">{row.label}</td>
                                        {["8th", "9th", "10th"].map((g) => (
                                            <td key={g} className="py-2 pr-4">
                                                <Input
                                                    inputMode="decimal"
                                                    className="rounded-lg h-9 bg-white"
                                                    value={marks[g][row.key]}
                                                    onChange={(e) => updateMark(g, row.key, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </CardShell>

            <CardShell>
                <CardContent className="p-6">
                    <SectionHeader title="Career Aspiration" hint="Helps us give the most accurate recommendations" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <PickField label="Aspired Career 1" required placeholder="Select career" options={["Doctor", "Engineer", "Designer", "Entrepreneur", "Civil Services"]} />
                        <PickField label="Aspired Career 2" required placeholder="Select career" options={["Doctor", "Engineer", "Designer", "Entrepreneur", "Civil Services"]} />
                        <div className="sm:col-span-2 sm:w-1/2">
                            <PickField label="Preferred City" required placeholder="Select preferred city" options={["Pune", "Mumbai", "Bengaluru", "Delhi"]} />
                        </div>
                    </div>
                </CardContent>
            </CardShell>

            <div className="flex justify-end">
                <Button
                    className="rounded-lg font-semibold px-8 text-white shadow-sm hover:shadow transition-shadow"
                    style={{ backgroundColor: theme.colors.primary }}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Tab 2 — 10th Test & Report                                          */
/* ------------------------------------------------------------------ */

const ReportTab = () => {
    const stats = [
        { label: "Top Stream Match", value: "Science (PCM)", Icon: Target },
        { label: "Aptitude Score", value: "82 / 100", Icon: Award },
        { label: "Recommended Careers", value: "3 matches", Icon: Sparkles },
    ];

    return (
        <CardShell>
            <CardContent className="p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold" style={{ color: theme.colors.text.heading }}>
                                10th Std. Career Assessment
                            </h3>
                            <span
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: "#F0FDF4", color: theme.colors.success }}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Completed
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: theme.colors.text.body }}>
                            Submitted on 23 Jun 2026 &middot; Your personalised report is ready to view.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-lg font-semibold" style={{ borderColor: theme.colors.border }}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake Test
                        </Button>
                        <Button className="rounded-lg font-semibold text-white shadow-sm" style={{ backgroundColor: theme.colors.primary }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t" style={{ borderColor: theme.colors.border }}>
                    {stats.map(({ label, value, Icon }) => (
                        <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                            <span
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${theme.colors.primary}1A`, color: theme.colors.primary }}
                            >
                                <Icon className="w-5 h-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-medium mb-0.5 truncate" style={{ color: theme.colors.text.light }}>
                                    {label}
                                </p>
                                <p className="text-base font-bold truncate" style={{ color: theme.colors.text.heading }}>
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </CardShell>
    );
};

/* ------------------------------------------------------------------ */
/* Tab 3 — Payment Details                                             */
/* ------------------------------------------------------------------ */

const PaymentTab = () => (
    <CardShell>
        <CardContent className="p-6 sm:p-7">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold" style={{ color: theme.colors.text.heading }}>
                    Invoice
                </h3>
                <Button variant="outline" className="rounded-lg" style={{ borderColor: theme.colors.border }}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Print Invoice
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm rounded-xl bg-slate-50 p-5">
                <div className="space-y-1.5">
                    <p><span className="text-slate-400">Contact&nbsp;&nbsp;</span>{STUDENT.mobile}</p>
                    <p><span className="text-slate-400">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>{STUDENT.email}</p>
                    <p><span className="text-slate-400">Order No.&nbsp;</span>100000</p>
                    <p>
                        <span className="text-slate-400">Test Status&nbsp;</span>
                        <span className="font-medium" style={{ color: theme.colors.success }}>Activated</span>
                    </p>
                </div>
                <div className="sm:text-right space-y-1.5">
                    <p className="text-slate-400">Invoice No. <span className="text-slate-700 font-medium">100000</span></p>
                    <p className="text-slate-400">Date <span className="text-slate-700 font-medium">23 Jun 2026</span></p>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-xl" style={{ borderColor: theme.colors.border }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50" style={{ borderColor: theme.colors.border }}>
                            <th className="text-left font-semibold py-3 px-4" style={{ color: theme.colors.text.heading }}>Description</th>
                            <th className="text-center font-semibold py-3 px-4" style={{ color: theme.colors.text.heading }}>Units</th>
                            <th className="text-right font-semibold py-3 px-4" style={{ color: theme.colors.text.heading }}>Unit Cost</th>
                            <th className="text-right font-semibold py-3 px-4" style={{ color: theme.colors.text.heading }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b" style={{ borderColor: theme.colors.border }}>
                            <td className="py-3 px-4 text-slate-700">Assessment - 10th Std.</td>
                            <td className="py-3 px-4 text-center text-slate-700">1</td>
                            <td className="py-3 px-4 text-right text-slate-700">₹2,999</td>
                            <td className="py-3 px-4 text-right text-slate-700">₹2,999</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="py-3 px-4 text-right font-semibold" style={{ color: theme.colors.text.heading }}>
                                Total
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-base" style={{ color: theme.colors.primary }}>
                                ₹2,999
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-xs mt-6" style={{ color: theme.colors.text.light }}>
                Company PAN number: AADCK7659K &middot; Questions about this invoice? Write to{" "}
                <span style={{ color: theme.colors.primary }}>support@thecareerfront.com</span>
            </p>
        </CardContent>
    </CardShell>
);

/* ------------------------------------------------------------------ */
/* Tab 4 — Counselling                                                  */
/* ------------------------------------------------------------------ */

const CounsellingTab = () => {
    const [note, setNote] = useState("");
    const steps = [
        { title: "Book your appointment", desc: "Pick a slot with a career counsellor" },
        { title: "Share your query", desc: "Tell us what you'd like to talk through" },
        { title: "Get a call back", desc: "Our experts call you at the scheduled time" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div
                className="text-sm px-4 py-3 rounded-xl border flex items-center gap-2.5"
                style={{ backgroundColor: "#FFFBEB", color: "#92400E", borderColor: "#FDE68A" }}
            >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                This service is only available for paid users.
            </div>

            <CardShell>
                <CardContent className="p-6 sm:p-7">
                    <SectionHeader title="Telephonic Counselling" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm font-semibold mb-4" style={{ color: theme.colors.text.heading }}>
                                How it works
                            </p>
                            <ol className="relative space-y-5">
                                {steps.map((s, i) => (
                                    <li key={s.title} className="flex gap-3">
                                        <span className="flex flex-col items-center">
                                            <span
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                style={{ backgroundColor: theme.colors.primary }}
                                            >
                                                {i + 1}
                                            </span>
                                            {i < steps.length - 1 && <span className="w-px flex-1 mt-1" style={{ backgroundColor: theme.colors.border }} />}
                                        </span>
                                        <div className="pb-1">
                                            <p className="text-sm font-semibold" style={{ color: theme.colors.text.heading }}>{s.title}</p>
                                            <p className="text-sm" style={{ color: theme.colors.text.body }}>{s.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <p className="flex items-center gap-1.5 text-xs mt-5" style={{ color: theme.colors.text.light }}>
                                <Clock3 className="w-3.5 h-3.5" />
                                Available 10:00 AM – 9:00 PM
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold mb-3" style={{ color: theme.colors.text.heading }}>
                                What you get
                            </p>
                            <ul className="space-y-2.5 text-sm">
                                {[
                                    "Complete confidentiality",
                                    "Service at your doorstep",
                                    "India's best career experts",
                                    "Ease and comfort of communication",
                                ].map((b) => (
                                    <li key={b} className="flex items-start gap-2" style={{ color: theme.colors.text.body }}>
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.success }} />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </CardShell>

            <CardShell>
                <CardContent className="p-6 sm:p-7">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        <div className="md:col-span-3">
                            <h4 className="text-sm font-bold mb-3" style={{ color: theme.colors.text.heading }}>
                                Get answers to your query
                            </h4>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Type your question for a counsellor..."
                                className="rounded-lg min-h-[110px] mb-4"
                            />
                            <Button className="rounded-lg font-semibold px-8 text-white shadow-sm" style={{ backgroundColor: theme.colors.primary }}>
                                Ask
                            </Button>
                        </div>
                        <div className="md:col-span-2 rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold" style={{ color: theme.colors.text.heading }}>
                                    Your Details
                                </h4>
                                <button type="button" className="flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: theme.colors.primary }}>
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            </div>
                            <dl className="text-sm space-y-2">
                                {[
                                    ["Name", STUDENT.fullName],
                                    ["Qualification", STUDENT.qualification],
                                    ["Contact No.", STUDENT.mobile],
                                    ["Email", STUDENT.email],
                                    ["Preferred City", "—"],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-3">
                                        <dt style={{ color: theme.colors.text.light }}>{k}</dt>
                                        <dd className="font-medium text-right" style={{ color: theme.colors.text.heading }}>
                                            {v}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </CardContent>
            </CardShell>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Tab 5 — Ask Expert                                                   */
/* ------------------------------------------------------------------ */

const AskExpertTab = () => (
    <CardShell>
        <CardContent className="p-6 sm:p-7">
            <SectionHeader title="Ask Query" />
            <p className="text-sm mb-6 -mt-3" style={{ color: theme.colors.text.body }}>
                Get your query solved by India's best career counsellors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                    <PickField label="Question Related To" required placeholder="Select topic" options={QUERY_TOPICS} />
                </div>
                <TextField label="Name" icon={User} required defaultValue={STUDENT.fullName} />
                <TextField label="Email" icon={Mail} required defaultValue={STUDENT.email} />
                <TextField label="Mobile No." icon={Phone} required defaultValue={STUDENT.mobile} />
                <PickField label="City" required placeholder="Select city" options={["Pune", "Mumbai", "Bengaluru", "Delhi"]} />
                <div className="sm:col-span-2 sm:w-1/2">
                    <PickField label="Stream" required placeholder="Select stream" options={STREAM_OPTIONS} />
                </div>
                <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Query <span className="text-red-500">*</span>
                    </Label>
                    <Textarea placeholder="Describe what you'd like help with..." className="rounded-lg min-h-[100px]" />
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <Button className="rounded-lg font-semibold px-8 text-white shadow-sm" style={{ backgroundColor: theme.colors.primary }}>
                    Ask
                </Button>
            </div>
        </CardContent>
    </CardShell>
);

export default StudentAccount;