import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
export function RequireRole({ allowedRoles, children }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return _jsx("div", { className: "px-4 py-10 text-sm text-stone-500", children: "Loading session..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
    }
    if (!allowedRoles.includes(user.role)) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
