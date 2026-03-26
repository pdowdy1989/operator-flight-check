import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password.trim()) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!form.confirmPassword.trim()) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));
    try {
      await register({ email: form.email, password: form.password });
      showToast({ title: "Account created", description: "Welcome to PED AERIAL!", variant: "success" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ confirmPassword: err.message || "Unable to create your account." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-brand-orange font-bold text-xl tracking-tight">PED AERIAL</span>
          <h1 className="text-2xl font-bold text-text-primary mt-2">Create account</h1>
          <p className="text-text-secondary text-sm mt-1">
            Start planning your flights in under a minute.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-card p-6">
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
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full mt-1"
              aria-label="Create your account"
            >
              {isSubmitting ? <LoadingSpinner size="sm" label="" /> : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-orange font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
