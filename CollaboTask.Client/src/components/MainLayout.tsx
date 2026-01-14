import React from 'react';
import { LayoutDashboard, ListTodo, Calendar, Settings } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    currentView: string;
    onNavigate: (view: string) => void;
}

export const MainLayout = ({ children, currentView, onNavigate }: Props) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Matching your #1a1a2e theme */}
            <aside className="w-64 bg-[#1a1a2e] border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#007bff] rounded-lg flex items-center justify-center font-bold">C</div>
                        <span className="text-xl font-bold tracking-tight">CollaboTask</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-[#007bff] text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-[#252a40] hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-[#0f0f1a]">
                <header className="h-16 border-b border-gray-800 flex items-center px-8 justify-between">
                    <h2 className="text-lg font-semibold capitalize">{currentView}</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600"></div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};