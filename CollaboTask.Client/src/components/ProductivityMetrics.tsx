import { CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import type { Task } from '../types';

interface Props {
    tasks: Task[];
}

export default function ProductivityMetrics({ tasks }: Props) {
    const total = tasks.length;
    const done = tasks.filter(t => (t.status || t.Status) === 'Done').length;
    const highPriority = tasks.filter(t => (t.priority || t.Priority) === 'High' && (t.status || t.Status) !== 'Done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="bg-[#252a40] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-blue-500" size={20} />
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Team Productivity </h3>
            </div>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Completion Rate</span>
                        <span className="text-emerald-400 font-bold">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1a2e] p-3 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase">Resolved</span>
                        </div>
                        <p className="text-xl font-bold text-white">{done}</p>
                    </div>
                    <div className="bg-[#1a1a2e] p-3 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase">Urgent</span>
                        </div>
                        <p className="text-xl font-bold text-white">{highPriority}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}