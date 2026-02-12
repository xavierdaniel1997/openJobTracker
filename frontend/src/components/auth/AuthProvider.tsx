'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        // Check auth on app initialization
        checkAuth();
    }, [checkAuth]);

    return <>{children}</>;
}
