import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, Search, RefreshCw, Trash2 } from 'lucide-react';
import { Users, type User } from '../api/agent';
import { useRole, type UserRole } from '../context/RoleContext';

export default function UserManagementView() {
    const { canManageUsers, user: currentUser } = useRole();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState<number | null>(null);

    const roles: UserRole[] = ['Admin', 'Project Manager', 'Team Member', 'Guest'];

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await Users.list();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            setUpdating(userId);
            await Users.updateRole(userId, newRole);
            setUsers(users.map(u =>
                u.user_id === userId ? { ...u, role: newRole as UserRole } : u
            ));
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteUser = async (userId: number, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also remove them from all projects and unassign their tasks.`)) {
            return;
        }
        try {
            setUpdating(userId);
            await Users.delete(userId);
            setUsers(users.filter(u => u.user_id !== userId));
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data || 'Failed to delete user. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'Admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Project Manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Team Member': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (!canManageUsers) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Shield size={48} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
                <p className="text-[var(--text-secondary)] mt-2">You don't have permission to manage users.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <UsersIcon size={28} /> User Management
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Manage user roles and permissions
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                               rounded-lg text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] 
                               rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                               focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Users Table */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-[var(--text-secondary)]">
                        <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-secondary)]">
                        No users found.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-[var(--bg-body)] border-b border-[var(--border-color)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">User</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Joined</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.user_id}
                                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-body)] transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg 
                                                            flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-[var(--text-primary)]">
                                                    {user.name}
                                                    {currentUser?.user_id === user.user_id && (
                                                        <span className="ml-2 text-xs text-blue-400">(You)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                            disabled={updating === user.user_id || currentUser?.user_id === user.user_id}
                                            className={`px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer
                                                        bg-[var(--bg-body)] focus:outline-none focus:border-blue-500
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                        ${getRoleBadgeColor(user.role)}`}
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role} className="bg-[var(--bg-paper)] text-[var(--text-primary)]">
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        {currentUser?.user_id === user.user_id && (
                                            <span className="ml-2 text-xs text-[var(--text-secondary)]">
                                                (Cannot change own role)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role !== 'Admin' && currentUser?.user_id !== user.user_id ? (
                                            <button
                                                onClick={() => handleDeleteUser(user.user_id, user.name)}
                                                disabled={updating === user.user_id}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors
                                                           disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete user"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {user.role === 'Admin' ? 'Protected' : '-'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {roles.map((role) => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                        <div key={role} className={`p-4 rounded-xl border ${getRoleBadgeColor(role)}`}>
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm opacity-80">{role}s</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
