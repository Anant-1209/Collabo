import TaskCard from '../components/TaskCard';
import type { Task } from '../types';

interface Props {
    tasks: Task[];
    allTasks: Task[];
    getStyle: (p: string) => any;
    onComment: (task: Task) => void;
    onDelete: (id: string) => void;
    onUnassign?: (taskId: string) => void;
}

export default function DashboardView({ tasks, allTasks, getStyle, onComment, onDelete, onUnassign }: Props) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase mb-1">Total</p><p className="text-2xl font-bold text-[var(--text-primary)]">{tasks.length}</p></div>
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-red-500 text-[10px] font-bold uppercase mb-1">High Priority</p><p className="text-2xl font-bold text-red-500">{tasks.filter(t => t.priority === 'High').length}</p></div>
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-emerald-500 text-[10px] font-bold uppercase mb-1">Completed</p><p className="text-2xl font-bold text-emerald-500">{tasks.filter(t => t.status === 'Done').length}</p></div>
                <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg text-center"><p className="text-blue-500 text-[10px] font-bold uppercase mb-1">In Progress</p><p className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.status === 'In Progress').length}</p></div>
            </div>
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