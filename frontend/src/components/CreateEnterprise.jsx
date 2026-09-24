import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Info,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Landmark,
  Flag,
  Hash,
  Image as ImageIcon,
  Zap,
  Flame,
  Crown,
  Rocket,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminTheme } from "../theme/adminTheme";
import { useDispatch, useSelector } from "react-redux";
import { createOrganizationSlice, updateOrganizationSlice, fetchOrganizationDraftSlice } from "../slices/enterpriseOnboardingSlice";
import { fetchPackages } from "../slices/packageSlice";

const INPUT_BASE =
  "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400";
const INPUT_BORDER = "border-slate-200";
const INPUT_BORDER_ERROR = "border-red-400";
const TITLE_CLASS = "text-lg font-semibold text-slate-900";

const PACKAGE_ICONS = [Zap, Flame, Crown];

const STEPS = [
  {
    id: 1,
    label: "Basic Information",
    description: "Organization identity & logo",
    headerTitle: "Create New Organization",
    headerSubtitle: "Step 1 of 3: Organization Basics",
  },
  {
    id: 2,
    label: "Contact Details",
    description: "Address & primary contact",
    headerTitle: "Contact & Address",
    headerSubtitle: "Step 2 of 3: How We Reach You",
  },
  {
    id: 3,
    label: "Subscription & Package",
    description: "Plan, billing & activation",
    headerTitle: "Subscription & Package",
    headerSubtitle: "Step 3 of 3: Choose Your Plan",
  },
];

const ORGANIZATION_TYPES = [
  { value: "", label: "Select organization type" },
  { value: "SCHOOL", label: "School" },
  { value: "COLLEGE", label: "College" },
  { value: "COACHING_INSTITUTE", label: "Coaching Institute" },
  { value: "COUNSELLOR", label: "Independent Counsellor" },
  { value: "ENTERPRISE", label: "Enterprise" },
  { value: "NGO", label: "NGO" },
  { value: "FRANCHISE", label: "Franchise" },
];

const INITIAL_FORM = {
  organization_type: "",
  name: "",
  short_name: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  timezone: "Asia/Kolkata",
  logo_url: "", // hosted URL, only ever comes back from the server (edit-mode prefill)

  package: "",
  negotiated_price: "",
  currency: "INR",
  seat_limit: "",
  valid_from: "",
  valid_until: "",
  contract_code: "",
  notes: "",
};

// ---- Validation ---------------------------------------------------------

const validateStepOne = (form) => {
  const errors = {};
  if (!form.organization_type) errors.organization_type = "Organization type is required.";
  if (!form.name.trim()) errors.name = "Organization name is required.";
  if (!form.short_name.trim()) errors.short_name = "Short name is required.";
  if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
    errors.website = "Enter a valid URL (starting with http:// or https://).";
  }
  return errors;
};

const validateStepTwo = (form) => {
  const errors = {};
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!form.country.trim()) errors.country = "Country is required.";
  if (!form.pincode.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!/^\d{4,10}$/.test(form.pincode.trim())) {
    errors.pincode = "Enter a valid pincode.";
  }
  return errors;
};

const validateStepThree = (form) => {
  const errors = {};
  if (!form.package) errors.package = "Please select a package.";
  if (!form.seat_limit) errors.seat_limit = "Seat limit is required.";
  if (!form.valid_from) errors.valid_from = "Valid-from date is required.";
  if (!form.valid_until) errors.valid_until = "Valid-until date is required.";
  if (!form.contract_code.trim()) errors.contract_code = "Contract code is required.";
  return errors;
};

const validate = (form) => ({
  ...validateStepOne(form),
  ...validateStepTwo(form),
  ...validateStepThree(form),
});

// ---- Reusable field primitives ------------------------------------------

const FieldLabel = ({ children, required }) => (
  <label className="mb-1.5 block text-sm font-medium text-slate-900">
    {children}
    {required && <span className="ml-0.5 text-red-600">*</span>}
  </label>
);

const FieldError = ({ error }) =>
  error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null;

const TextField = ({ label, name, value, onChange, placeholder, icon: Icon, error, required, type = "text" }) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(INPUT_BASE, error ? INPUT_BORDER_ERROR : INPUT_BORDER)}
        style={{ paddingLeft: Icon ? "2.5rem" : undefined }}
      />
    </div>
    <FieldError error={error} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon, error, required }) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={cn(INPUT_BASE, error ? INPUT_BORDER_ERROR : INPUT_BORDER)}
        style={{ paddingLeft: Icon ? "2.5rem" : undefined }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
    <FieldError error={error} />
  </div>
);

// Drag-and-drop / click-to-upload logo field. Hands the raw File straight
// back up via onFileSelect — no base64 conversion here, the parent decides
// how to preview/send it.
const LogoDropzone = ({ previewUrl, onFileSelect, error }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div>
      <FieldLabel>Organization Logo</FieldLabel>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-5 transition-colors",
          isDragging ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-slate-50"
        )}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
          {previewUrl ? (
            <img src={previewUrl} alt="Logo preview" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">Click to upload</span> or drag and drop
          <p className="mt-0.5 text-xs text-slate-400">PNG, JPG or SVG (max. 2MB)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
};

// ---- Package selection & subscription config (Step 3) --------------------

const collectNumberedFields = (pkg, prefix) =>
  [1, 2, 3, 4, 5]
    .map((n) => pkg[`${prefix}${n}`])
    .filter((value) => typeof value === "string" && value.trim() !== "");

const STATUS_BADGE = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-500",
  DRAFT: "bg-amber-50 text-amber-700",
};

const PackageOption = ({ pkg, index, isSelected, onSelect }) => {
  const Icon = PACKAGE_ICONS[index % PACKAGE_ICONS.length];
  const features = collectNumberedFields(pkg, "package_features");
  const statusBadge = STATUS_BADGE[pkg.status] || "bg-slate-100 text-slate-500";

  return (
    <button
      type="button"
      onClick={() => onSelect(pkg.id)}
      className={cn(
        "relative flex flex-col items-start rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all",
        isSelected
          ? "border-slate-900 shadow-md ring-1 ring-slate-900/5"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      )}
    >
      <span
        className={cn(
          "absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
          statusBadge
        )}
      >
        {pkg.status}
      </span>

      <div className="flex w-full items-start justify-between pr-20">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
            isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug text-slate-900">{pkg.package_name}</h3>
      {pkg.package_description && (
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{pkg.package_description}</p>
      )}

      <p className="mt-4 text-2xl font-bold text-slate-900">
        ₹{Number(pkg.package_price).toLocaleString("en-IN")}
      </p>

      {features.length > 0 && (
        <div className="mt-4 w-full border-t border-slate-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Features</p>
          <ul className="mt-1.5 space-y-1">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <span
        className={cn(
          "absolute bottom-5 right-5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white"
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </span>
    </button>
  );
};

const PackageGrid = ({ packages, value, onSelect, error, loading, loadError }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading packages...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        {loadError?.message || "Failed to load packages."}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No packages available.
      </div>
    );
  }

  return (
    <div data-field="package">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg, index) => (
          <PackageOption
            key={pkg.id}
            pkg={pkg}
            index={index}
            isSelected={value === pkg.id}
            onSelect={onSelect}
          />
        ))}
      </div>
      <FieldError error={error} />
    </div>
  );
};

// ---- Sidebar (desktop) ------------------------------------------------

const StepIndicator = ({ step, isActive, isComplete, isClickable, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!isClickable}
    className={cn(
      "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
      isActive ? "bg-slate-100" : "bg-transparent",
      !isClickable && "cursor-not-allowed opacity-60"
    )}
  >
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
        isComplete
          ? "border-slate-900 bg-slate-900 text-white"
          : isActive
          ? "border-slate-900 bg-white text-slate-900"
          : "border-slate-200 bg-white text-slate-500"
      )}
    >
      {isComplete ? <Check className="h-3.5 w-3.5" /> : step.id}
    </span>
    <span className="min-w-0">
      <span className={cn("block truncate text-sm font-semibold", isActive || isComplete ? "text-slate-900" : "text-slate-500")}>
        {step.label}
      </span>
      <span className="block truncate text-xs text-slate-500">{step.description}</span>
    </span>
  </button>
);

const ConfigurationSidebar = ({ currentStep, maxStepReached, onStepClick }) => {
  const completedCount = currentStep - 1;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-5 md:flex lg:w-72 lg:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Onboarding Progress</p>
        <span className="text-xs font-semibold text-slate-500">{progressPercent}%</span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="relative mt-6 space-y-1">
        {STEPS.map((step, index) => (
          <div key={step.id} className="relative">
            {index !== STEPS.length - 1 && (
              <span
                className={cn(
                  "absolute left-[22.5px] top-10 h-[calc(100%-16px)] w-px",
                  step.id < currentStep ? "bg-slate-900" : "bg-slate-200"
                )}
              />
            )}
            <StepIndicator
              step={step}
              isActive={step.id === currentStep}
              isComplete={step.id < currentStep}
              isClickable={step.id <= maxStepReached}
              onClick={() => onStepClick(step.id)}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
            <Info className="h-3 w-3" />
          </span>
          Quick Tip
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Your organization type and location can't be changed once onboarding is complete — double-check them
          before finishing.
        </p>
      </div>
    </aside>
  );
};

const MobileStepTracker = ({ currentStep, maxStepReached, onStepClick }) => {
  const completedCount = currentStep - 1;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="sticky top-16 z-40 border-b border-slate-200 bg-white md:hidden">
      <div className="h-0.5 bg-slate-900 transition-all duration-300" style={{ width: `${progressPercent}%` }} />

      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2.5">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          const isClickable = step.id <= maxStepReached;

          return (
            <div key={step.id} className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  isActive ? "bg-slate-100" : "bg-transparent",
                  !isClickable && "cursor-not-allowed opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold",
                    isComplete
                      ? "border-slate-900 bg-slate-900 text-white"
                      : isActive
                      ? "border-slate-900 bg-transparent text-slate-900"
                      : "border-slate-200 bg-transparent text-slate-500"
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : step.id}
                </span>
                <span className={cn("whitespace-nowrap", isActive ? "text-slate-900" : "text-slate-500")}>
                  {step.label}
                </span>
              </button>
              {index !== STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-200" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Header & footer --------------------------------------------------

const WizardHeader = ({ currentStep, onBack, onNext, isSubmitting, isEditMode }) => {
  const step = STEPS.find((s) => s.id === currentStep);
  const isLastStep = currentStep === STEPS.length;
  const headerTitle = isEditMode && currentStep === 1 ? "Edit Organization" : step.headerTitle;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className={cn("shrink-0", adminTheme.button.icon)}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{headerTitle}</h1>
        <p className="truncate text-xs text-slate-500">{step.headerSubtitle}</p>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={cn(
          adminTheme.actionButton.primary,
          "shrink-0 px-3 py-2 sm:px-4 sm:py-2.5",
          isSubmitting && "cursor-not-allowed opacity-70"
        )}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLastStep ? (
          <Rocket className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isSubmitting ? "Setting up..." : isLastStep ? "Complete Onboarding" : "Next Step"}
        </span>
        <span className="sm:hidden">{isSubmitting ? "Setting up..." : isLastStep ? "Finish" : "Next"}</span>
      </button>
    </header>
  );
};

const WizardFooter = ({ onCancel, onBack, onSaveContinue, currentStep, isLastStep, isSubmitting }) => (
  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
    <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
      Cancel
    </button>

    <div className="flex items-center gap-3">
      {currentStep > 1 && (
        <button type="button" onClick={onBack} className={adminTheme.actionButton.secondary}>
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onSaveContinue}
        disabled={isSubmitting}
        className={cn(adminTheme.actionButton.primary, isSubmitting && "cursor-not-allowed opacity-70")}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isLastStep ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        {isSubmitting ? "Setting up..." : isLastStep ? "Complete Onboarding" : "Save and Continue"}
      </button>
    </div>
  </div>
);

// ---- Helper -------------------------------------------------------------

const extractOrgId = (payload) =>
  payload?.data?.id ?? payload?.id ?? payload?.organization?.id ?? null;

// ---- Page -----------------------------------------------------------------

const CreateEnterprise = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { id: routeOrgId } = useParams();
  const isEditMode = Boolean(routeOrgId);

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Raw File the user picked in the LogoDropzone — this is what actually
  // gets sent to the backend as multipart. form.logo_url only ever holds
  // a hosted URL string coming back from the server (edit-mode prefill),
  // never a base64/data URL.
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Builds a local object URL for whatever file was just picked, and
  // revokes the previous one so we don't leak blob URLs.
  useEffect(() => {
    if (!logoFile) return;
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const organizationId = useSelector((state) => state.enterpriseOnboarding.organizationId);
  const effectiveOrgId = isEditMode ? Number(routeOrgId) : organizationId;

  const draftData = useSelector((state) => state.enterpriseOnboarding.draftData);
  const draftLoading = useSelector((state) => state.enterpriseOnboarding.draftLoading);

  const packages = useSelector((state) => state.package.packages);
  const packagesLoading = useSelector((state) => state.package.packagesLoading);
  const packagesError = useSelector((state) => state.package.packagesError);

  const isLastStep = currentStep === STEPS.length;

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchOrganizationDraftSlice(routeOrgId));
    }
  }, [isEditMode, routeOrgId, dispatch]);

  useEffect(() => {
    if (currentStep === 3 && packages.length === 0 && !packagesLoading) {
      dispatch(fetchPackages());
    }
  }, [currentStep, packages.length, packagesLoading, dispatch]);

  useEffect(() => {
    const org = draftData?.data;
    if (!org) return;

    setForm((prev) => ({
      ...prev,
      organization_type: org.organization_type ?? prev.organization_type,
      name: org.name ?? prev.name,
      short_name: org.short_name ?? prev.short_name,
      email: org.email ?? prev.email,
      phone: org.phone ?? prev.phone,
      website: org.website ?? prev.website,
      address: org.address ?? prev.address,
      city: org.city ?? prev.city,
      state: org.state ?? prev.state,
      country: org.country ?? prev.country,
      pincode: org.pincode ?? prev.pincode,
      timezone: org.timezone ?? prev.timezone,
      logo_url: org.logo_url ?? prev.logo_url,
    }));
  }, [draftData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const handleLogoFile = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo_url: "Logo must be 2MB or smaller." }));
      return;
    }
    setLogoFile(file);
    setErrors((prev) => (prev.logo_url ? { ...prev, logo_url: "" } : prev));
  };

  const handlePackageSelect = (packageId) => {
    setForm((prev) => ({ ...prev, package: packageId }));
    setErrors((prev) => (prev.package ? { ...prev, package: "" } : prev));
  };

  const scrollToFirstError = (validationErrors) => {
    const key = Object.keys(validationErrors)[0];
    const firstErrorField = document.querySelector(`[name="${key}"], [data-field="${key}"]`);
    firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const goToStep = (stepId) => {
    if (stepId <= maxStepReached) setCurrentStep(stepId);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const selectedPackageMeta = packages.find((p) => p.id === form.package);

  // Builds Step 1's payload. Sends multipart/form-data (so the logo goes
  // up as a real binary file) whenever a new logo was picked; plain JSON
  // otherwise.
  const buildStep1Payload = () => {
    if (!logoFile) {
      return {
        organization_type: form.organization_type,
        name: form.name.trim(),
        short_name: form.short_name.trim(),
        website: form.website.trim(),
        is_draft: true,
      };
    }

    const fd = new FormData();
    fd.append("organization_type", form.organization_type);
    fd.append("name", form.name.trim());
    fd.append("short_name", form.short_name.trim());
    fd.append("website", form.website.trim());
    fd.append("logo_url", logoFile, logoFile.name);
    fd.append("is_draft", "true");
    return fd;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const stepErrors = validateStepOne(form);

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        scrollToFirstError(stepErrors);
        return;
      }

      setErrors({});
      setSubmitError("");

      const step1Payload = buildStep1Payload();

      setIsSubmitting(true);
      try {
        if (isEditMode) {
          await dispatch(
            updateOrganizationSlice({ id: effectiveOrgId, payload: step1Payload })
          ).unwrap();
          dispatch(fetchOrganizationDraftSlice(effectiveOrgId));
        } else {
          const created = await dispatch(createOrganizationSlice(step1Payload)).unwrap();
          const newOrgId = extractOrgId(created);
          if (newOrgId) {
            dispatch(fetchOrganizationDraftSlice(newOrgId));
          }
        }
        setCurrentStep((prev) => {
          const next = Math.min(STEPS.length, prev + 1);
          setMaxStepReached((max) => Math.max(max, next));
          return next;
        });
      } catch (error) {
        setSubmitError(error?.message || "Failed to save organization details. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!isLastStep) {
      const stepErrors = validateStepTwo(form);

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        scrollToFirstError(stepErrors);
        return;
      }

      setErrors({});
      setSubmitError("");

      const step2Payload = {
        organization_type: form.organization_type,
        name: form.name.trim(),
        short_name: form.short_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
          address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        pincode: form.pincode.trim(),
        timezone: form.timezone,
        is_draft: true,
      };

      setIsSubmitting(true);
      try {
        await dispatch(
          updateOrganizationSlice({ id: effectiveOrgId, payload: step2Payload })
        ).unwrap();
        dispatch(fetchOrganizationDraftSlice(effectiveOrgId));
        setCurrentStep((prev) => {
          const next = Math.min(STEPS.length, prev + 1);
          setMaxStepReached((max) => Math.max(max, next));
          return next;
        });
      } catch (error) {
        setSubmitError(error?.message || "Failed to save contact details. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setSubmitError("");

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      if (validateStepOne(form)[firstErrorField]) setCurrentStep(1);
      else if (validateStepTwo(form)[firstErrorField]) setCurrentStep(2);
      scrollToFirstError(validationErrors);
      return;
    }

    const finalPayload = {
      organization_type: form.organization_type,
      name: form.name.trim(),
      short_name: form.short_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
       address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      pincode: form.pincode.trim(),
      timezone: form.timezone,
      is_draft: false,
      packages: [
        {
          package_id: selectedPackageMeta?.id,
          negotiated_price: form.negotiated_price || selectedPackageMeta?.package_price || "0.00",
          currency: form.currency,
          seat_limit: Number(form.seat_limit),
          valid_from: form.valid_from,
          valid_until: form.valid_until,
          contract_code: form.contract_code.trim(),
          notes: form.notes.trim(),
        },
      ],
    };

    setIsSubmitting(true);
    try {
      await dispatch(
        updateOrganizationSlice({ id: effectiveOrgId, payload: finalPayload })
      ).unwrap();
      // dispatch(fetchOrganizationDraftSlice(effectiveOrgId));
      navigate("/s-admin/enterprise-onboarding");
    } catch (error) {
      setSubmitError(error?.message || "Failed to save package details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <WizardHeader
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
      />

      <div className="flex flex-col md:flex-row">
        <ConfigurationSidebar currentStep={currentStep} maxStepReached={maxStepReached} onStepClick={goToStep} />

        <main className="min-w-0 flex-1">
          <MobileStepTracker currentStep={currentStep} maxStepReached={maxStepReached} onStepClick={goToStep} />

          <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            {isEditMode && draftLoading && !draftData && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading organization details...
              </div>
            )}

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {submitError}
              </div>
            )}

            <div
              className={cn(adminTheme.card.base, adminTheme.card.padding)}
              style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
            >
              {/* Step 1 — Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className={TITLE_CLASS}>Organization Identity</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Basic identity of your organization.</p>
                  </div>

                  <TextField
                    label="Organization Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Harbor High School"
                    icon={Building2}
                    required
                    error={errors.name}
                  />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <SelectField
                      label="Organization Type"
                      name="organization_type"
                      value={form.organization_type}
                      onChange={handleChange}
                      options={ORGANIZATION_TYPES}
                      icon={Building2}
                      required
                      error={errors.organization_type}
                    />
                    <TextField
                      label="Short Name"
                      name="short_name"
                      value={form.short_name}
                      onChange={handleChange}
                      placeholder="ABC School"
                      icon={Hash}
                      required
                      error={errors.short_name}
                    />
                  </div>
                  <TextField
                    label="Website URL"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    icon={Globe}
                    error={errors.website}
                  />
                  <LogoDropzone
                    previewUrl={logoPreview || form.logo_url}
                    onFileSelect={handleLogoFile}
                    error={errors.logo_url}
                  />
                </div>
              )}

              {/* Step 2 — Contact Details */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className={TITLE_CLASS}>Address & Contact</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Registered address and how we and your users will reach the organization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <TextField
                      label="Country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="India"
                      icon={Flag}
                      required
                      error={errors.country}
                    />
                    <TextField
                      label="State/Province"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      icon={Landmark}
                      required
                      error={errors.state}
                    />
                    <TextField
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Pune"
                      icon={Landmark}
                      required
                      error={errors.city}
                    />
                    <TextField
                      label="Pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="411001"
                      icon={Hash}
                      required
                      error={errors.pincode}
                    />
                  </div>
                  <TextField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main Road"
                    icon={MapPin}
                    required
                    error={errors.address}
                  />

                  <div className="border-t border-slate-200 pt-5">
                    <p className="mb-4 text-sm font-semibold text-slate-900">Primary Contact</p>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <TextField
                        label="Admin Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="admin@example.com"
                        icon={Mail}
                        required
                        error={errors.email}
                      />
                      <TextField
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        icon={Phone}
                        required
                        error={errors.phone}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Subscription & Package */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className={TITLE_CLASS}>Select Package</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Choose the plan that fits this organization.
                    </p>
                  </div>

                  <PackageGrid
                    packages={packages}
                    value={form.package}
                    onSelect={handlePackageSelect}
                    error={errors.package}
                    loading={packagesLoading}
                    loadError={packagesError}
                  />

                  <div className="space-y-5 border-t border-slate-200 pt-5">
                    <p className="text-sm font-semibold text-slate-900">Subscription Configuration</p>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <TextField
                        label="Seat Limit"
                        name="seat_limit"
                        type="number"
                        value={form.seat_limit}
                        onChange={handleChange}
                        placeholder="100"
                        required
                        error={errors.seat_limit}
                      />
                      <TextField
                        label="Contract Code"
                        name="contract_code"
                        value={form.contract_code}
                        onChange={handleChange}
                        placeholder="ABC-2026"
                        required
                        error={errors.contract_code}
                      />
                      <TextField
                        label="Valid From"
                        name="valid_from"
                        type="date"
                        value={form.valid_from}
                        onChange={handleChange}
                        required
                        error={errors.valid_from}
                      />
                      <TextField
                        label="Valid Until"
                        name="valid_until"
                        type="date"
                        value={form.valid_until}
                        onChange={handleChange}
                        required
                        error={errors.valid_until}
                      />
                    </div>

                    <TextField
                      label="Notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Annual package"
                    />
                  </div>
                </div>
              )}
            </div>

            <WizardFooter
              onCancel={handleCancel}
              onBack={handleBack}
              onSaveContinue={handleNext}
              currentStep={currentStep}
              isLastStep={isLastStep}
              isSubmitting={isSubmitting}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateEnterprise;