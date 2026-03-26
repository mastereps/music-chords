import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshUser = async () => {
        try {
            const currentUser = await apiClient.getMe();
            setUser(currentUser);
        }
        catch {
            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        void refreshUser();
    }, []);
    const value = useMemo(() => ({
        user,
        isLoading,
        login: async (email, password) => {
            const loggedInUser = await apiClient.login(email, password);
            setUser(loggedInUser);
        },
        logout: async () => {
            await apiClient.logout();
            setUser(null);
        },
        refreshUser
    }), [user, isLoading]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
