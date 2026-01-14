// import {
//     MessageSquare,
//     Trash2,
//     Calendar,
//     CheckCircle2,
//     Clock,
//     Lock
// } from 'lucide-react';
// import type { Task } from '../types';

// interface Props {
//     task: Task;
//     allTasks: Task[];              // ✅ ADD THIS
//     getStyle: (p: string) => { badge: string; border: string };
//     onComment: (task: Task) => void;
//     onDelete: (id: string) => void;
// }

// export default function TaskCard({
//     task,
//     allTasks,
//     getStyle,
//     onComment,
//     onDelete
// }: Props) {

//     const stl = getStyle(task.priority);

//     /* =========================
//        BLOCKED LOGIC (CORRECT PLACE)
//     ========================= */
//     const isBlocked = (task: Task) => {
//         if (!task.parentTaskId) return false;

//         const parent = allTasks.find(
//             t => (t.taskId || t.TaskId) === task.parentTaskId
//         );

//         return parent && (parent.status || parent.Status) !== 'Done';
//     };

//     return (
//         <div
//             className={`bg-[#252a40] border-l-4 rounded-2xl p-6 shadow-xl flex flex-col gap-4
//             ${stl.border}
//             ${isBlocked(task) ? 'opacity-70' : ''}`}
//         >

//             {/* HEADER */}
//             <div className="flex justify-between items-start">
//                 <div className="flex flex-col gap-1">
//                     <span className="text-[10px] text-blue-400 uppercase font-mono">
//                         TSK-{task.taskId.substring(0, 4)}
//                     </span>
//                     <span
//                         className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${stl.badge}`}
//                     >
//                         {task.priority}
//                     </span>
//                 </div>

//                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button
//                         onClick={() => onComment(task)}
//                         className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-blue-500"
//                     >
//                         <MessageSquare size={16} />
//                     </button>
//                     <button
//                         onClick={() => onDelete(task.taskId)}
//                         className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-red-500"
//                     >
//                         <Trash2 size={16} />
//                     </button>
//                 </div>
//             </div>

//             {/* BLOCKED INDICATOR */}
//             {isBlocked(task) && (
//                 <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
//                     <Lock size={12} />
//                     BLOCKED BY PARENT TASK
//                 </div>
//             )}

//             {/* BODY */}
//             <div className="flex-1">
//                 <h4 className="text-lg font-bold mb-2 truncate">
//                     {task.title}
//                 </h4>
//                 <p className="text-sm text-gray-400 line-clamp-2 h-10 leading-relaxed">
//                     {task.description}
//                 </p>
//             </div>

//             {/* FOOTER */}
//             <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-500 font-medium">
//                 <div className="flex items-center gap-2">
//                     <Calendar size={12} />
//                     {task.dueDate
//                         ? new Date(task.dueDate).toLocaleDateString()
//                         : 'N/A'}
//                 </div>

//                 <div className="flex items-center gap-2">
//                     {task.status === 'Done'
//                         ? <CheckCircle2 size={14} className="text-emerald-500" />
//                         : <Clock size={14} />}
//                     {task.status}
//                 </div>
//             </div>
//         </div>
//     );
// }


import {
    MessageSquare,
    Trash2,
    Calendar,
    CheckCircle2,
    Clock,
    Lock,
    UserX,
    User
} from 'lucide-react';
import type { Task } from '../types';

interface Props {
    task: Task;
    allTasks: Task[];
    getStyle: (p: string) => { badge: string; border: string };
    onComment: (task: Task) => void;
    onDelete: (id: string) => void;
    onUnassign?: (taskId: string) => void;
}

export default function TaskCard({ task, allTasks, getStyle, onComment, onDelete, onUnassign }: Props) {
    const stl = getStyle(task.priority || task.Priority);
    const assignee = task.assignee || task.Assignee;
    const taskId = task.taskId || task.TaskId || '';

    const isBlocked = (task: Task) => {
        if (!task.parentTaskId) return false;
        const parent = allTasks.find(t => (t.taskId || t.TaskId) === task.parentTaskId);
        return parent && (parent.status || parent.Status) !== 'Done';
    };

    return (
        <div className={`group bg-[var(--bg-paper)] border-l-4 rounded-2xl p-6 shadow-xl flex flex-col gap-4 transition-all hover:border-blue-500/50 ${stl.border} ${isBlocked(task) ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-blue-400 uppercase font-mono">
                        TSK-{(task.taskId || task.TaskId)?.substring(0, 4)}
                    </span>
                    <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${stl.badge}`}>
                        {task.priority || task.Priority}
                    </span>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onComment(task)} className="p-1.5 hover:bg-[var(--bg-body)] rounded-lg text-[var(--text-secondary)] hover:text-blue-500 transition-colors" title="Comments">
                        <MessageSquare size={16} />
                    </button>
                    {assignee && onUnassign && (
                        <button onClick={() => onUnassign(taskId)} className="p-1.5 hover:bg-[var(--bg-body)] rounded-lg text-[var(--text-secondary)] hover:text-orange-500 transition-colors" title="Unassign user">
                            <UserX size={16} />
                        </button>
                    )}
                    <button onClick={() => onDelete(taskId)} className="p-1.5 hover:bg-[var(--bg-body)] rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors" title="Delete task">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {isBlocked(task) && (
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                    <Lock size={12} /> BLOCKED BY PARENT TASK
                </div>
            )}

            <div className="flex-1">
                <h4 className="text-lg font-bold mb-2 truncate text-[var(--text-primary)]">{task.title || task.Title}</h4>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 h-10 leading-relaxed">
                    {task.description || task.Description}
                </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                    {assignee ? (
                        <>
                            <User size={12} className="text-blue-400" />
                            <span className="text-blue-400">{assignee}</span>
                        </>
                    ) : (
                        <span className="text-[var(--text-secondary)] italic">Unassigned</span>
                    )}
                </div>
                <div className="flex items-center gap-2 capitalize">
                    {(task.status || task.Status) === 'Done' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} />}
                    {task.status || task.Status}
                </div>
            </div>
        </div>
    );
}