import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { getHomePathForRole } from "../utils/roleRouting";
import "./RegisterPage.css";

const ROLE_CONFIG = {
  pilot: {
    value: "PILOT",
    title: "Pilot account",
    subtitle: "Create a pilot workspace for missions, drones, clients, and billing.",
    cta: "Create pilot account",
  },
  client: {
    value: "CLIENT",
    title: "Client account",
    subtitle: "Create a client portal for project tracking, documents, and invoices.",
    cta: "Create client account",
  },
  company: {
    value: "COMPANY",
    title: "Company account",
    subtitle: "Create a company workspace for inspections, reports, and claim coordination.",
    cta: "Create company account",
  },
};

export default function RegisterPage() {
  const { roleType } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const roleConfig = useMemo(() => ROLE_CONFIG[roleType] ?? null, [roleType]);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    try {
      const session = await register({
        email: form.email,
        password: form.password,
        role: roleConfig?.value,
      });
      showToast({ title: "Account created", description: "Welcome to PED AERIAL!", variant: "success" });
      navigate(getHomePathForRole(session?.role), { replace: true });
    } catch (err) {
      setErrors({ confirmPassword: err.message || "Unable to create your account." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!roleConfig) {
    return (
      <div className="register-page">
        <div className="register-page__shell">
          <div className="register-page__intro">
            <span className="register-page__brand">PED AERIAL</span>
            <h1 className="register-page__title">Choose your account type</h1>
            <p className="register-page__subtitle">
              Pick the signup flow that matches how you will use the platform.
            </p>
          </div>

          <div className="register-page__role-list">
            {Object.entries(ROLE_CONFIG).map(([key, option]) => (
              <Link
                key={key}
                to={`/register/${key}`}
                className="register-page__role-card"
              >
                <span className="register-page__role-title">{option.title}</span>
                <span className="register-page__role-subtitle">{option.subtitle}</span>
              </Link>
            ))}
          </div>

          <p className="register-page__helper-link">
            Already have an account?{" "}
            <Link to="/login" className="register-page__helper-anchor">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-page__shell register-page__shell--form">
        <div className="register-page__intro">
          <span className="register-page__brand">PED AERIAL</span>
          <h1 className="register-page__title">{roleConfig.title}</h1>
          <p className="register-page__subtitle">{roleConfig.subtitle}</p>
        </div>

        <div className="register-page__form-card">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="register-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="you@example.com"
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              value={form.password}
              onChange={updateField("password")}
              placeholder="At least 8 characters"
              error={errors.password}
              hint="Minimum 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              id="register-confirm-password"
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
            <div className="register-page__type-chip">
              <strong>Account type</strong>
              <span>{roleConfig.title}</span>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full mt-1"
              aria-label="Create your account"
            >
              {isSubmitting ? <LoadingSpinner size="sm" label="" /> : roleConfig.cta}
            </Button>
          </form>
        </div>

        <p className="register-page__helper-link">
          Need a different account type?{" "}
          <Link to="/register" className="register-page__helper-anchor">
            Choose another signup
          </Link>
        </p>

        <p className="register-page__helper-link register-page__helper-link--tight">
          Already have an account?{" "}
          <Link to="/login" className="register-page__helper-anchor">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
