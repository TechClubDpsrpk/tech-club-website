'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Loading from '@/app/loading';

interface UserData {
    id: string;
    email?: string;
    [key: string]: any;
}

interface AuthContextType {
    isAuthenticated: boolean;
    emailVerified: boolean;
    isLoading: boolean;
    user: UserData | null;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    emailVerified: false,
    isLoading: true,
    user: null,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(data.isAuthenticated);
                    setUser(data.user);

                    // Fetch email_verified from Supabase
                    if (data.isAuthenticated && data.user?.id) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('email_verified')
                            .eq('id', data.user.id)
                            .single();

                        setEmailVerified(userData?.email_verified || false);
                    } else {
                        setEmailVerified(false);
                    }
                } else {
                    setIsAuthenticated(false);
                    setEmailVerified(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                setEmailVerified(false);
                setUser(null);
            } finally {
                // Enforce a minimum loading time to prevent flickering if needed, 
                // or just set loading to false immediately
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, emailVerified, isLoading, user }}>
            {children}
        </AuthContext.Provider>
    );
}
