import { Mail, Shield, Settings, Bell, Users } from 'lucide-react';
import { useRole, type UserRole } from '../context/RoleContext';
import { useState } from 'react';

interface Props {
    userName: string;
    userEmail: string;
}

export default function ProfileView({ userName, userEmail }: Props) {
    const { role, canManageUsers, isLoading } = useRole();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const getRoleBadgeColor = (r: UserRole) => {
        switch (r) {
            case 'Admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Project Manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Team Member': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{userName}</h2>
                        <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                            <Mail size={14} /> {userEmail}
                        </p>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mt-3 ${getRoleBadgeColor(role)}`}>
                            <Shield size={12} /> {isLoading ? 'Loading...' : role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Role Information (Read-Only for non-admins) */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <Settings size={20} /> Role Information
                </h3>
                <div className="bg-[var(--bg-body)] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">Your Role</div>
                            <div className="text-sm text-[var(--text-secondary)] mt-1">
                                {role === 'Admin' && 'Full access to all features including user management'}
                                {role === 'Project Manager' && 'Manage projects, create and assign tasks'}
                                {role === 'Team Member' && 'Update tasks, add comments, and collaborate'}
                                {role === 'Guest' && 'View-only access to projects and tasks'}
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-sm font-bold ${getRoleBadgeColor(role)}`}>
                            {role}
                        </span>
                    </div>
                    {!canManageUsers && (
                        <p className="text-xs text-[var(--text-secondary)] mt-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                            Your role is assigned by an administrator. Contact your admin if you need different permissions.
                        </p>
                    )}
                </div>

                {/* Admin-only: Link to User Management */}
                {canManageUsers && (
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-blue-400" />
                                <div>
                                    <div className="font-medium text-blue-400">User Management</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Manage user roles and permissions</div>
                                </div>
                            </div>
                            <span className="text-xs text-blue-400">Navigate to "Users" in the sidebar</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Preferences */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <Bell size={20} /> Notification Preferences
                </h3>
                <div className="space-y-3">
                    <NotificationToggle
                        label="Task Updates"
                        description="When tasks are created, updated, or completed"
                        enabled={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    />
                    <NotificationToggle
                        label="Comments & Mentions"
                        description="When someone comments or @mentions you"
                        enabled={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    />
                    <NotificationToggle
                        label="Project Changes"
                        description="When project status or members change"
                        enabled={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    />
                    <NotificationToggle
                        label="Due Date Reminders"
                        description="Reminders for upcoming task deadlines"
                        enabled={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    />

                    {/* Digest Option */}
                    <div className="mt-4 p-4 bg-[var(--bg-body)] rounded-xl border border-[var(--border-color)]">
                        <div className="font-medium text-[var(--text-primary)] mb-2">Notification Digest</div>
                        <div className="text-xs text-[var(--text-secondary)] mb-3">
                            Receive a summary of notifications instead of real-time updates
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white">Real-time</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-paper)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)]">Daily</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-paper)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)]">Weekly</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions Overview */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <Shield size={20} /> Your Permissions
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <PermissionItem label="Create Projects" allowed={role === 'Admin' || role === 'Project Manager'} />
                    <PermissionItem label="Delete Projects" allowed={role === 'Admin'} />
                    <PermissionItem label="Create Tasks" allowed={role === 'Admin' || role === 'Project Manager'} />
                    <PermissionItem label="Delete Tasks" allowed={role === 'Admin' || role === 'Project Manager'} />
                    <PermissionItem label="Assign Tasks" allowed={role === 'Admin' || role === 'Project Manager'} />
                    <PermissionItem label="View Analytics" allowed={role === 'Admin' || role === 'Project Manager'} />
                    <PermissionItem label="Manage Documents" allowed={role !== 'Guest'} />
                    <PermissionItem label="Add Comments" allowed={role !== 'Guest'} />
                    <PermissionItem label="Manage Users" allowed={role === 'Admin'} />
                </div>
            </div>
        </div>
    );
}

function PermissionItem({ label, allowed }: { label: string; allowed: boolean }) {
    return (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${allowed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <div className={`w-2 h-2 rounded-full ${allowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={allowed ? 'text-green-400' : 'text-red-400'}>{label}</span>
        </div>
    );
}

function NotificationToggle({ label, description, enabled, onChange }: {
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-[var(--bg-body)] rounded-xl">
            <div>
                <div className="font-medium text-[var(--text-primary)]">{label}</div>
                <div className="text-xs text-[var(--text-secondary)]">{description}</div>
            </div>
            <button
                onClick={onChange}
                className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`}></div>
            </button>
        </div>
    );
}

