import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthProvider';
export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await login(email, password);
            navigate(location.state?.from ?? '/admin', { replace: true });
        }
        catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : 'Login failed');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 shadow-panel dark:border-stone-800 dark:bg-stone-900", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300", children: "Admin access" }), _jsx("h2", { className: "mt-2 text-2xl font-semibold", children: "Login for editing and review" }), _jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [_jsxs("label", { className: "block space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" })] }), _jsxs("label", { className: "block space-y-2", children: [_jsx("span", { className: "text-sm font-semibold", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (event) => setPassword(event.target.value), className: "w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950" })] }), error ? _jsx("p", { className: "text-sm text-red-700", children: error }) : null, _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full rounded-2xl bg-brand-700 px-4 py-3 font-semibold text-white disabled:opacity-60", children: isSubmitting ? 'Signing in...' : 'Sign in' })] })] }));
}
