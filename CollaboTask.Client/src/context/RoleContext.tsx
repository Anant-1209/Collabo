import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Users, Auth, type User } from '../api/agent';

// Role definitions per requirements
export type UserRole = 'Admin' | 'Project Manager' | 'Team Member' | 'Guest';

interface RoleContextType {
    role: UserRole;
    user: User | null;
    isLoading: boolean;
    refreshRole: (email: string) => Promise<void>;
    syncAndRefresh: (email: string, name: string) => Promise<void>;
    canCreateProject: boolean;
    canDeleteProject: boolean;
    canCreateTask: boolean;
    canDeleteTask: boolean;
    canAssignTask: boolean;
    canViewAnalytics: boolean;
    canManageDocuments: boolean;
    canManageUsers: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Permission matrix based on requirements
const getPermissions = (role: UserRole) => ({
    canCreateProject: role === 'Admin' || role === 'Project Manager',
    canDeleteProject: role === 'Admin',
    canCreateTask: role === 'Admin' || role === 'Project Manager',
    canDeleteTask: role === 'Admin' || role === 'Project Manager',
    canAssignTask: role === 'Admin' || role === 'Project Manager',
    canViewAnalytics: role === 'Admin' || role === 'Project Manager',
    canManageDocuments: role !== 'Guest',
    canManageUsers: role === 'Admin',
});

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>('Team Member');
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user role from server (assumes user exists)
    const refreshRole = useCallback(async (email: string) => {
        if (!email) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const userData = await Users.me(email);
            setUser(userData);
            setRole(userData.role);
        } catch (error) {
            console.error('Failed to fetch user role:', error);
            setRole('Team Member');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sync user with server (create if doesn't exist) then refresh role
    const syncAndRefresh = useCallback(async (email: string, name: string) => {
        if (!email) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            // First, sync user to database (creates if new, updates if exists)
            const response = await Auth.syncUser(email, name);
            setUser(response.user);
            setRole(response.user.role);

            // Store user info in localStorage for persistence
            localStorage.setItem('user', JSON.stringify({ email, name }));
        } catch (error) {
            console.error('Failed to sync user:', error);
            // Fallback: try to just fetch existing user
            try {
                const userData = await Users.me(email);
                setUser(userData);
                setRole(userData.role);
            } catch {
                setRole('Team Member');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load role on mount if user email is in localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.email) {
                    refreshRole(parsed.email);
                } else {
                    setIsLoading(false);
                }
            } catch {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [refreshRole]);

    const permissions = getPermissions(role);

    return (
        <RoleContext.Provider value={{ role, user, isLoading, refreshRole, syncAndRefresh, ...permissions }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
}

