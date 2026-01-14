import { Search, Bell, Info, Plus, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface Props {
    title: string;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    notifications: any[];
    showNotifications: boolean;
    setShowNotifications: (s: boolean) => void;
    setNotifications: (n: any[]) => void;
    onNewTask: () => void;
    // Add these two lines to fix the errors
    userName: string;
    userInitial: string;
}

export default function Navbar({
    title,
    searchTerm,
    setSearchTerm,
    notifications,
    showNotifications,
    setShowNotifications,
    setNotifications,
    onNewTask,
    userName,    // Receive from App.tsx
    userInitial  // Receive from App.tsx
}: Props) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--bg-paper)]/95 backdrop-blur-md sticky top-0 z-10 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-[var(--bg-body)] rounded-lg text-[var(--text-secondary)] transition-all"
                    title="Go Back"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold capitalize tracking-wide whitespace-nowrap text-[var(--text-primary)]">{title}</h2>
                <div className="relative max-w-md w-full ml-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-all text-[var(--text-primary)]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-body)] rounded-lg transition-all"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative">
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-paper)]"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between bg-[var(--bg-body)]">
                                <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Notifications</span>
                                <button onClick={() => setNotifications([])} className="text-[10px] text-blue-500">Clear All</button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-[var(--text-secondary)] text-sm">No new alerts</div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className="p-4 border-b border-[var(--border-color)] flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                                <Info size={14} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-[var(--text-primary)]">{n.message}</p>
                                                <span className="text-[10px] text-[var(--text-secondary)]">{n.time}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onNewTask}
                    className="bg-blue-600 px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg hover:bg-blue-700 transition-all text-white"
                >
                    <Plus size={18} /> New Task
                </button>

                {/* Profile Section */}
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)]">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{userName}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">Online</span>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border border-blue-400/30 text-white">
                        {userInitial}
                    </div>
                </div>
            </div>
        </header>
    );
}