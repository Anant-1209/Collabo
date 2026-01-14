import { LayoutDashboard, List, FileText, Plus, Trash2, Calendar, BarChart3, User, Users } from 'lucide-react';
import type { Project } from '../types';
import { Projects } from '../api/agent';
import { useRole } from '../context/RoleContext';

interface Props {
    view: string;
    setView: (v: string) => void;
    projects: Project[];
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    setShowProjectModal: (s: boolean) => void;
    getProgress: (id: string) => number;
    refresh: () => void;
    logout: () => void;
}

export default function Sidebar({ view, setView, projects, selectedProjectId, setSelectedProjectId, setShowProjectModal, getProgress, refresh, logout }: Props) {
    const { canCreateProject, canDeleteProject, canViewAnalytics, canManageUsers } = useRole();

    return (
        <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col shrink-0 transition-colors">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">CollaboTask</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                    <button
                        onClick={() => { setView('dashboard'); setSelectedProjectId(null) }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'dashboard' && !selectedProjectId ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </button>

                    <button
                        onClick={() => setView('kanban')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                    >
                        <List size={18} /> Kanban
                    </button>

                    <button
                        onClick={() => setView('calendar')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                    >
                        <Calendar size={18} /> Calendar
                    </button>

                    {/* Only show Analytics to Admin/Manager */}
                    {canViewAnalytics && (
                        <button
                            onClick={() => setView('analytics')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'analytics' ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                        >
                            <BarChart3 size={18} /> Analytics
                        </button>
                    )}

                    <button
                        onClick={() => setView('documents')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'documents' ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                    >
                        <FileText size={18} /> Documents
                    </button>

                    {/* Profile Page Link */}
                    <button
                        onClick={() => setView('profile')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'profile' ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                    >
                        <User size={18} /> Profile
                    </button>

                    {/* Admin-only: User Management */}
                    {canManageUsers && (
                        <button
                            onClick={() => setView('users')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${view === 'users' ? 'bg-blue-600 shadow-md text-white' : 'text-[var(--text-secondary)] hover:bg-gray-800/10'}`}
                        >
                            <Users size={18} /> Users
                        </button>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center px-3 mb-4">
                        <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Projects</h3>
                        {/* Only show add project button if user can create projects */}
                        {canCreateProject && (
                            <button onClick={() => setShowProjectModal(true)} className="text-blue-500 hover:text-blue-400"><Plus size={14} /></button>
                        )}
                    </div>
                    {projects.map((proj) => {
                        const id = proj.projectId || proj.ProjectId || "";
                        const tags = (proj.tags || proj.Tags || "").split(',').filter((t: string) => t.trim());
                        return (
                            <div key={id} className="group px-2 mb-4">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setSelectedProjectId(id)}
                                        className={`flex-1 text-left px-3 py-2 rounded-lg text-sm truncate ${selectedProjectId === id ? 'bg-gray-800/20 text-blue-400 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        # {proj.name || proj.Name}
                                    </button>
                                    {/* Only show delete button to Admin */}
                                    {canDeleteProject && (
                                        <button
                                            onClick={() => Projects.delete(id).then(refresh)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-secondary)] hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                {/* Display project tags as chips */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 px-3 mt-1">
                                        {tags.map((tag: string, i: number) => (
                                            <span
                                                key={i}
                                                className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-2 px-3">
                                    <div className="w-full h-1 bg-gray-800/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-700"
                                            style={{ width: `${getProgress(id)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-body)]">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium">
                    Logout
                </button>
            </div>
        </aside>
    );
}