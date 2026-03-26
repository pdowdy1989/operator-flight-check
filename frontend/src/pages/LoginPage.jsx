import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("pilot@pedaerial.com");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const redirectTo = location.state?.from?.pathname ?? "/dashboard";

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (!password.trim()) e.password = "Password is required.";
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
      await login({ email, password });
      showToast({ title: "Signed in", description: "Welcome back!", variant: "success" });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({ password: err.message || "Incorrect email or password." });
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
          <h1 className="text-2xl font-bold text-text-primary mt-2">Sign in</h1>
          <p className="text-text-secondary text-sm mt-1">
            Use <span className="font-mono text-text-primary">pilot@pedaerial.com</span> / <span className="font-mono text-text-primary">password123</span> to demo the real JWT flow
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-card p-6">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
