import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Building2, ShieldCheck, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import enterpriseTheme from "@/theme/enterpriseTheme";

// ---- Left brand panel -------------------------------------------------------
// Dark sidebar-toned panel reusing enterpriseTheme.colors.background.sidebar,
// so the login screen reads as part of the same product as the dashboard.
const BrandPanel = () => {
  const highlights = [
    { icon: Users, label: "Manage every organization from one console" },
    { icon: BarChart3, label: "Track enrollment and activity in real time" },
    { icon: ShieldCheck, label: "Role-based access, built for admins" },
  ];

  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden px-12 py-12 lg:flex lg:w-[45%]"
      style={{ backgroundColor: enterpriseTheme.colors.background.sidebar }}
    >
      {/* Soft radial accent, no motion, single deliberate flourish */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: enterpriseTheme.colors.primary }}
      />

      <div className="relative flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: enterpriseTheme.colors.primary }}
        >
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-white">Enterprise Console</span>
      </div>

      <div className="relative max-w-sm">
        <h2 className="text-3xl font-bold leading-tight text-white">
          Run your organization, end to end.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Onboarding, students, and reporting — one login for everything your
          team manages.
        </p>

        <ul className="mt-10 space-y-4">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-slate-300">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-slate-500">
        © {new Date().getFullYear()} Enterprise Console. All rights reserved.
      </p>
    </div>
  );
};

// ---- Page --------------------------------------------------------------------
const EnterpriseLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // TODO: wire to the real auth slice/endpoint (mirrors the dispatch(...)
  // pattern used elsewhere, e.g. fetchOrganizationsListSlice) once the
  // enterprise login API is available.
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (!email.trim() || !password) {
        setError("Enter your email and password to continue.");
        return;
      }

      setSubmitting(true);
      try {
        // await dispatch(loginEnterpriseSlice({ email, password, remember })).unwrap();
        navigate("/s-admin/organizations");
      } catch (err) {
        setError(err?.message || "Couldn't sign you in. Check your details and try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, remember, navigate]
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: enterpriseTheme.colors.background.page }}>
      <BrandPanel />

      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: enterpriseTheme.colors.primary }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold" style={{ color: enterpriseTheme.colors.text.heading }}>
                Enterprise Console
              </span>
            </div>
          </div>

          <h1 className={enterpriseTheme.typography.h3} style={{ color: enterpriseTheme.colors.text.heading }}>
            Sign in
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: enterpriseTheme.colors.text.body }}>
            Enter your admin credentials to access your console.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: enterpriseTheme.colors.dangerLight, color: enterpriseTheme.colors.danger }}
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" style={{ color: enterpriseTheme.colors.text.heading }}>
                Work email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" style={{ color: enterpriseTheme.colors.text.heading }}>
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => navigate("/s-admin/forgot-password")}
                  className="text-xs font-medium hover:underline"
                  style={{ color: enterpriseTheme.colors.primary }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pl-10 pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
                disabled={submitting}
              />
              <Label htmlFor="remember" className="text-sm font-normal" style={{ color: enterpriseTheme.colors.text.body }}>
                Keep me signed in
              </Label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className={cn("h-11 w-full rounded-xl text-white", enterpriseTheme.transition.normal)}
              style={{ backgroundColor: enterpriseTheme.colors.primary }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: enterpriseTheme.colors.text.light }}>
            Trouble accessing your console? Contact your platform administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseLogin;