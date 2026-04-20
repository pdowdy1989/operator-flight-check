import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getHomePathForRole } from "../utils/roleRouting";

const DEMO_ACCOUNTS = {
  pilot: {
    label: "Login as Pilot",
    name: "Marcus Reed",
    email: "pilot@pedaerial.com",
    password: "Password123",
    description: "Pilot workspace with drones, missions, invoices, and revenue.",
  },
  client: {
    label: "Login as Client",
    name: "Sarah Johnson",
    email: "client@pedaerial.com",
    password: "Password123",
    description: "Client workspace with active projects, deliverables, and invoices.",
  },
  insurance: {
    label: "Login as Company",
    name: "David Carter",
    email: "insurance@pedaerial.com",
    password: "Password123",
    description: "Company workspace with claims, inspections, and report review.",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("pilot@pedaerial.com");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password.trim()) nextErrors.password = "Password is required.";
    return nextErrors;
  };

  const submitLogin = async (nextEmail, nextPassword) => {
    setErrors({});
    setIsSubmitting(true);
    try {
      const session = await login({ email: nextEmail, password: nextPassword });
      showToast({ title: "Signed in", description: "Welcome back!", variant: "success" });
      const redirectTo = location.state?.from?.pathname ?? getHomePathForRole(session?.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({ password: err.message || "Incorrect email or password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    await submitLogin(email, password);
  };

  const handleQuickLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    await submitLogin(account.email, account.password);
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-brand-orange font-bold text-xl tracking-tight">PED AERIAL</span>
          <h1 className="text-2xl font-bold text-text-primary mt-2">Sign in</h1>
          <p className="text-text-secondary text-sm mt-1">
            Use demo mode for one-click access to seeded platform walkthroughs.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-secondary transition hover:border-brand-orange hover:text-brand-orange"
            onClick={() => setDemoMode((value) => !value)}
          >
            Demo Mode: {demoMode ? "On" : "Off"}
          </button>
        </div>

        {demoMode ? (
          <div className="mb-4 grid gap-3">
            {Object.values(DEMO_ACCOUNTS).map((account) => (
              <button
                key={account.email}
                type="button"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-left shadow-card transition hover:border-brand-orange hover:bg-brand-orange/5"
                onClick={() => handleQuickLogin(account)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-text-primary">{account.label}</span>
                  <span className="text-xs font-mono text-text-secondary">Password123</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{account.name}</p>
                <p className="mt-1 text-xs text-text-secondary">{account.description}</p>
              </button>
            ))}
          </div>
        ) : null}

        <div className="bg-white rounded-3xl border border-border shadow-card p-6">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              error={errors.password}
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full mt-1"
              aria-label="Sign in to your account"
            >
              {isSubmitting ? <LoadingSpinner size="sm" label="" /> : "Sign in"}
            </Button>
          </form>
          {demoMode ? (
            <div className="mt-4 rounded-2xl bg-surface-secondary px-4 py-3 text-xs text-text-secondary">
              Demo accounts are seeded with linked jobs, invoices, payments, reports, and placeholder deliverables. Use password <span className="font-semibold">Password123</span> for manual sign-in too.
            </div>
          ) : null}
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-brand-orange font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
