import React, { useState } from "react";
import { GraduationCap, Phone, ChevronDown, Menu, X, LogOut, UserCircle2 } from "lucide-react";
import theme from "../theme/theme";

/* ------------------------------------------------------------------ */
/* Site header — logo, primary nav, call CTA, account menu            */
/* Mirrors the legacy careerfutura.com chrome (logo left, nav center, */
/* call/account right) but restyled to match the dashboard's design   */
/* language: same rounded-pill tabs, same primary color, one bold      */
/* accent (the gradient logo mark + top hairline) instead of many.     */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Career Assessment Test", href: "/career-assessment-test" },
    { label: "Study Habits Test", href: "/study-habits-test" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact-us" },
];

const Header = ({ user = { name: "Shweta Bamane", initials: "SB" }, phone = "+91-97670 01122" }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full bg-white" style={{ fontFamily: theme.font.family }}>
            {/* single accent hairline — the one bold structural device */}
            <div
                className="h-[3px] w-full"
                style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, #F59E0B)` }}
            />
            <div className="w-full border-b" style={{ borderColor: theme.colors.border }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5 shrink-0">
                        <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, #1E3A8A)` }}
                        >
                            <GraduationCap className="w-5 h-5" />
                        </span>
                        <span className="leading-tight">
                            <span className="block text-base font-bold tracking-tight" style={{ color: theme.colors.text.heading }}>
                                TrueMindPath
                            </span>
                            <span className="block text-[11px] font-medium" style={{ color: theme.colors.text.light }}>
                                India's Career Counselling Platform
                            </span>
                        </span>
                    </a>

                    {/* Primary nav — desktop */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50"
                                style={{ color: theme.colors.text.body }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right cluster */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <a
                            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border text-sm font-semibold transition-colors hover:bg-slate-50"
                            style={{ borderColor: theme.colors.border, color: theme.colors.primary }}
                        >
                            <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: theme.colors.primary }}
                            >
                                <Phone className="w-3 h-3" />
                            </span>
                            {phone}
                        </a>

                        {/* Account menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border transition-colors hover:bg-slate-50"
                                style={{ borderColor: theme.colors.border }}
                            >
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: theme.colors.primary }}
                                >
                                    {user.initials}
                                </span>
                                <span className="text-sm font-medium" style={{ color: theme.colors.text.heading }}>
                                    {user.name.split(" ")[0]}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5" style={{ color: theme.colors.text.light }} />
                            </button>

                            {menuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl border shadow-lg py-1.5 z-50"
                                    style={{ borderColor: theme.colors.border }}
                                >
                                    <a
                                        href="/my-account"
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium hover:bg-slate-50"
                                        style={{ color: theme.colors.text.body }}
                                    >
                                        <UserCircle2 className="w-4 h-4" />
                                        My Account
                                    </a>
                                    <a
                                        href="/logout"
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium hover:bg-slate-50"
                                        style={{ color: "#DC2626" }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log out
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-50"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="lg:hidden border-b bg-white px-4 py-3 flex flex-col gap-0.5" style={{ borderColor: theme.colors.border }}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="px-2 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50"
                            style={{ color: theme.colors.text.body }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="flex items-center justify-between mt-2 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.colors.primary }}>
                            <Phone className="w-4 h-4" />
                            {phone}
                        </a>
                        <a href="/logout" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#DC2626" }}>
                            <LogOut className="w-4 h-4" />
                            Log out
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;