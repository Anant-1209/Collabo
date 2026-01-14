import { X, Users, Check } from 'lucide-react';
import { useState } from 'react';

interface ProjectModalProps {
    show: boolean;
    onClose: () => void;
    form: any;
    setForm: (f: any) => void;
    onSubmit: (e: any) => void;
    allUsers: any[];
}

interface TaskModalProps {
    show: boolean;
    onClose: () => void;
    form: any;
    setForm: (f: any) => void;
    tasks: any[];
    onSubmit: (e: any) => void;
    teamMembers: any[];
}

/* =======================
   PROJECT MODAL
======================= */
export function ProjectModal({ show, onClose, form, setForm, onSubmit, allUsers }: ProjectModalProps) {
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

    if (!show) return null;

    const toggleMember = (userId: number) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Add selected member IDs to form before submitting
        setForm({ ...form, memberIds: selectedMembers });
        // Small delay to ensure form is updated
        setTimeout(() => onSubmit(e), 10);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] w-full max-w-lg rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">New Project</h2>
                    <button onClick={onClose}>
                        <X className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-primary)] outline-none focus:border-blue-500"
                        placeholder="Project Name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <textarea
                        className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-primary)] outline-none h-20 focus:border-blue-500"
                        placeholder="Project Description"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />

                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Tags (comma-separated)</label>
                        <input
                            className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-primary)] outline-none focus:border-blue-500"
                            placeholder="e.g., Frontend, Urgent, Q1"
                            value={form.tags || ''}
                            onChange={e => setForm({ ...form, tags: e.target.value })}
                        />
                    </div>

                    {/* Team Members Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">
                            <Users size={12} className="inline mr-1" />
                            Add Team Members ({selectedMembers.length} selected)
                        </label>
                        <div className="max-h-40 overflow-y-auto bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl p-2">
                            {allUsers && allUsers.length > 0 ? (
                                allUsers.map((user: any) => (
                                    <button
                                        key={user.user_id}
                                        type="button"
                                        onClick={() => toggleMember(user.user_id)}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg mb-1 transition-all
                                            ${selectedMembers.includes(user.user_id)
                                                ? 'bg-blue-500/20 border border-blue-500/50'
                                                : 'hover:bg-[var(--border-color)]'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm text-[var(--text-primary)]">{user.name}</div>
                                                <div className="text-[10px] text-[var(--text-secondary)]">{user.email}</div>
                                            </div>
                                        </div>
                                        {selectedMembers.includes(user.user_id) && (
                                            <Check size={16} className="text-blue-500" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-[var(--text-secondary)] text-sm py-4">No users available</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-all"
                    >
                        Create Project
                    </button>
                </form>
            </div>
        </div>
    );
}

/* =======================
   TASK MODAL
======================= */
export function TaskModal({ show, onClose, form, setForm, tasks, onSubmit, teamMembers }: TaskModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-[var(--bg-paper)] w-full max-w-md rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-body)]">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">Create New Task</h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--bg-body)] rounded-lg transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Task Title</label>
                        <input
                            required
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl p-3 text-sm outline-none focus:border-blue-500 text-[var(--text-primary)]"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Assign To Member</label>
                        <select
                            value={form.assignee}
                            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                            className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl p-3 text-sm outline-none focus:border-blue-500 text-[var(--text-primary)]"
                        >
                            <option value="">Unassigned</option>
                            {(teamMembers || []).map((member: any) => {
                                // Handle potential casing differences between allUsers (user_id) and projectMembers (userId)
                                const id = member.user_id || member.userId || member.UserId || member.Id || member.id;
                                const name = member.name || member.Name;

                                if (!id || !name) return null;

                                return (
                                    <option key={id} value={name}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                        {teamMembers && teamMembers.length > 0 && (
                            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                                {teamMembers.some((m: any) => m.userId || m.UserId) ? 'Only project members are shown' : 'All registered users are shown'}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Priority</label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl p-3 text-sm outline-none text-[var(--text-primary)]"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl p-3 text-sm outline-none text-[var(--text-primary)]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 uppercase text-xs tracking-widest"
                    >
                        Create Task
                    </button>
                </form>
            </div>
        </div>
    );
}
