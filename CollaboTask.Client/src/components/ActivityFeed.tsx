import { MessageSquare, CheckCircle2, PlusCircle, RefreshCw } from 'lucide-react';

export default function ActivityFeed({ activities }: { activities: any[] }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'Comment': return <MessageSquare size={14} className="text-blue-400" />;
            case 'StatusUpdate': return <RefreshCw size={14} className="text-emerald-400" />;
            case 'TaskCreated': return <PlusCircle size={14} className="text-purple-400" />;
            default: return <CheckCircle2 size={14} className="text-gray-400" />;
        }
    };

    return (
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] flex flex-col h-full overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-body)]">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Recent Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activities.length === 0 ? (
                    <p className="text-center text-[var(--text-secondary)] text-xs py-10 italic">No recent activity logs.</p>
                ) : (
                    activities.map((act, i) => (
                        <div key={i} className="flex gap-3 items-start animate-in slide-in-from-right-2 duration-300">
                            <div className="mt-1 p-1.5 bg-[var(--bg-body)] rounded-lg border border-[var(--border-color)]">
                                {getIcon(act.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    <span className="font-bold text-[var(--text-primary)]">{act.user}</span> {act.message}
                                </p>
                                <span className="text-[10px] text-[var(--text-secondary)] font-medium">{act.timestamp}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}