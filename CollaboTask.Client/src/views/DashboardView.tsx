import { useState, useEffect } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import { Projects, Users as UsersAPI } from '../api/agent';
import type { Task } from '../types';

interface Props {
    tasks: Task[];
    allTasks: Task[];
    getStyle: (p: string) => any;
    onComment: (task: Task) => void;
    onDelete: (id: string) => void;
    onUnassign?: (taskId: string) => void;
    selectedProjectId?: string | null;
    onMembersChange?: () => void;
}

export default function DashboardView({ tasks, allTasks, getStyle, onComment, onDelete, onUnassign, selectedProjectId, onMembersChange }: Props) {
    const [projectMembers, setProjectMembers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');

    // Load project members when project is selected
    useEffect(() => {
        if (selectedProjectId) {
            Projects.getMembers(selectedProjectId).then(setProjectMembers).catch(() => setProjectMembers([]));
        } else {
            setProjectMembers([]);
        }
    }, [selectedProjectId]);

    // Load all users for add member dropdown
    useEffect(() => {
        UsersAPI.list().then(setAllUsers).catch(() => setAllUsers([]));
    }, []);

    const handleAddMember = async () => {
        if (!selectedProjectId || !selectedUserId) return;
        try {
            await Projects.addMember(selectedProjectId, parseInt(selectedUserId));
            const updated = await Projects.getMembers(selectedProjectId);
            setProjectMembers(updated);
            setShowAddMember(false);
            setSelectedUserId('');
            onMembersChange?.();
        } catch (err) {
            console.error('Failed to add member:', err);
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (!selectedProjectId) return;
        if (!window.confirm('Remove this member from the project?')) return;
        try {
            await Projects.removeMember(selectedProjectId, userId);
            const updated = await Projects.getMembers(selectedProjectId);
            setProjectMembers(updated);
            onMembersChange?.();
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    // Filter users not already in project
    const availableUsers = allUsers.filter(
        u => !projectMembers.some(m => m.userId === u.user_id)
    );

    return (
        <div className="space-y-8">
            {/* Project Members Section - Only visible when project selected */}
            {selectedProjectId && (
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-500/30 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={16} /> Project Team ({projectMembers.length} members)
                        </h3>
                        <button
                            onClick={() => setShowAddMember(!showAddMember)}
                            className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <UserPlus size={14} /> Add Member
                        </button>
                    </div>

                    {/* Add Member Dropdown */}
                    {showAddMember && (
                        <div className="mb-4 p-4 bg-[var(--bg-body)] rounded-xl border border-[var(--border-color)] flex gap-3 items-center">
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="flex-1 bg-[var(--bg-paper)] border border-[var(--border-color)] p-2 rounded-lg text-sm text-[var(--text-primary)]"
                            >
                                <option value="">Select a user...</option>
                                {availableUsers.map(u => (
                                    <option key={u.user_id} value={u.user_id}>
                                        {u.name} ({u.role})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddMember}
                                disabled={!selectedUserId}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddMember(false)}
                                className="text-gray-400 hover:text-white p-2"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Members List */}
                    <div className="flex flex-wrap gap-3">
                        {projectMembers.length === 0 ? (
                            <p className="text-sm text-[var(--text-secondary)]">No members yet. Add team members to collaborate!</p>
                        ) : (
                            projectMembers.map((member: any) => (
                                <div
                                    key={member.userId || member.id}
                                    className="flex items-center gap-2 bg-[var(--bg-body)] px-4 py-2 rounded-xl border border-[var(--border-color)] group"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                        {member.userName?.substring(0, 2) || member.name?.substring(0, 2) || '??'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">{member.userName || member.name}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">{member.role || 'Member'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member.userId)}
                                        className="opacity-0 group-hover:opacity-100 ml-2 text-red-400 hover:text-red-300 transition-all"
                                        title="Remove member"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase mb-1">Total</p><p className="text-2xl font-bold text-[var(--text-primary)]">{tasks.length}</p></div>
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-red-500 text-[10px] font-bold uppercase mb-1">High Priority</p><p className="text-2xl font-bold text-red-500">{tasks.filter(t => t.priority === 'High').length}</p></div>
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-emerald-500 text-[10px] font-bold uppercase mb-1">Completed</p><p className="text-2xl font-bold text-emerald-500">{tasks.filter(t => t.status === 'Done').length}</p></div>
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-blue-500 text-[10px] font-bold uppercase mb-1">In Progress</p><p className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.status === 'In Progress').length}</p></div>
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <TaskCard
                        key={task.taskId || task.TaskId}
                        task={task}
                        allTasks={allTasks}
                        getStyle={getStyle}
                        onComment={onComment}
                        onDelete={onDelete}
                        onUnassign={onUnassign}
                    />
                ))}
            </div>
        </div>
    );
}
