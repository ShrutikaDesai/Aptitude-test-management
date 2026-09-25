import React from "react";
import { GraduationCap, MessageCircle, ShieldCheck } from "lucide-react";
import theme from "../theme/theme";

/* lucide-react no longer ships trademarked brand logos (Facebook, LinkedIn,
   etc.) in recent versions, so these are drawn as small inline SVGs instead
   of imported icon components. */
const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}>
        <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.14C15.9 4.06 15 4 14 4c-2.15 0-3.62 1.31-3.62 3.72V10.2H8v3h2.38V21h3.12Z" />
    </svg>
);

const LinkedinIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}>
        <path d="M6.94 8.5H4.06V19h2.88V8.5ZM5.5 4a1.68 1.68 0 1 0 0 3.35A1.68 1.68 0 0 0 5.5 4ZM19.94 19h-2.87v-5.66c0-1.35-.03-3.08-1.88-3.08-1.88 0-2.17 1.47-2.17 2.98V19H10.15V8.5h2.75v1.43h.04c.38-.73 1.32-1.5 2.72-1.5 2.9 0 3.44 1.91 3.44 4.39V19Z" />
    </svg>
);

/* ------------------------------------------------------------------ */
/* Site footer — brand + social, link columns, payment trust row,      */
/* bottom legal bar. Same structure as the legacy footer (social block, */
/* payment icons, four link columns, copyright) rebuilt with the        */
/* dashboard's card/spacing language.                                   */
/* ------------------------------------------------------------------ */

const LINK_COLUMNS = [
    {
        title: "Career Assessment",
        links: ["For 8th & 9th Std.", "For 10th Std.", "For 11th & 12th Std.", "For Graduation", "For Professionals"],
    },
    {
        title: "More on TrueMindPath",
        links: ["Career Confusion", "Career Planning", "Career Guidance", "Career Change", "Educational Franchise"],
    },
    {
        title: "Contact Us",
        links: ["Schools", "Parents & Students", "Business Enquiries", "Counselling Centres"],
    },
];

const PAYMENT_BADGES = ["Visa", "Mastercard", "Maestro", "Net Banking", "UPI"];

const Footer = () => (
    <footer style={{ fontFamily: theme.font.family }}>
        <div
            className="w-full text-white"
            style={{ background: `linear-gradient(180deg, #0F1B3D, #0B1530)` }}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-10">
                    {/* Brand + social */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, #F59E0B)` }}
                            >
                                <GraduationCap className="w-5 h-5 text-white" />
                            </span>
                            <span className="text-base font-bold">TrueMindPath</span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-xs mb-5">
                            Personalised career assessments and counselling to help students choose the right stream, course, and career with confidence.
                        </p>
                        <div className="flex items-center gap-2.5">
                            {[
                                { Icon: FacebookIcon, label: "Facebook" },
                                { Icon: LinkedinIcon, label: "LinkedIn" },
                                { Icon: MessageCircle, label: "WhatsApp" },
                            ].map(({ Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {LINK_COLUMNS.map((col) => (
                        <div key={col.title}>
                            <p className="text-sm font-semibold text-white mb-3.5">{col.title}</p>
                            <ul className="space-y-2.5">
                                {col.links.map((l) => (
                                    <li key={l}>
                                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Trust / payment row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Payments secured &amp; encrypted
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {PAYMENT_BADGES.map((p) => (
                            <span
                                key={p}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 text-slate-200"
                            >
                                {p}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} TrueMindPath. All rights reserved.</p>
                    <div className="flex items-center gap-5">
                        <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Terms &amp; Conditions</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;