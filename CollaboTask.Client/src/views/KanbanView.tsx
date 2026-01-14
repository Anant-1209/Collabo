// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import TaskCard from '../components/TaskCard';
// import type { Task } from '../types';

// interface Props {
//     tasks: Task[];
//     getStyle: (p: string) => any;
//     onUpdateStatus: (id: string, s: string) => void;
//     onComment: (task: Task) => void;
//     onDelete: (id: string) => void;
// }

// export default function KanbanView({ tasks, getStyle, onUpdateStatus, onComment, onDelete }: Props) {
//     return (
//         <DragDropContext onDragEnd={(res) => { if (res.destination) onUpdateStatus(res.draggableId, res.destination.droppableId); }}>
//             <div className="flex gap-6 h-full overflow-x-auto pb-4">
//                 {['To Do', 'In Progress', 'Done'].map(col => (
//                     <Droppable key={col} droppableId={col}>{(provided) => (
//                         <div {...provided.droppableProps} ref={provided.innerRef} className="w-80 bg-[#161625]/50 rounded-2xl p-5 flex flex-col shrink-0 border border-gray-800/50">
//                             <h3 className="font-bold text-sm uppercase text-gray-500 mb-6 flex justify-between">{col} <span className="bg-gray-800 text-white px-2 rounded-full text-[10px]">{tasks.filter(t => t.status === col).length}</span></h3>
//                             <div className="space-y-4 overflow-y-auto min-h-[150px]">
//                                 {tasks.filter(t => t.status === col).map((task, index) => (
//                                     <Draggable key={task.taskId} draggableId={task.taskId} index={index}>{(p) => (
//                                         <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
//                                             <TaskCard task={task} getStyle={getStyle} onComment={onComment} onDelete={onDelete} />
//                                         </div>
//                                     )}</Draggable>
//                                 ))}
//                                 {provided.placeholder}
//                             </div>
//                         </div>
//                     )}</Droppable>
//                 ))}
//             </div>
//         </DragDropContext>
//     );
// }



import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from '../components/TaskCard';
import type { Task } from '../types';

interface Props {
    tasks: Task[];
    allTasks: Task[];
    getStyle: (p: string) => any;
    onUpdateStatus: (id: string, s: string, u?: string) => void;
    onComment: (task: Task) => void;
    onDelete: (id: string) => void;
    onUnassign?: (taskId: string) => void;
}

export default function KanbanView({ tasks, allTasks, getStyle, onUpdateStatus, onComment, onDelete, onUnassign }: Props) {
    const columns = ['To Do', 'In Progress', 'Done'];

    return (
        <DragDropContext onDragEnd={(res) => { if (res.destination) onUpdateStatus(res.draggableId, res.destination.droppableId); }}>
            <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
                {columns.map(col => (
                    <Droppable key={col} droppableId={col}>{(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="w-80 bg-[var(--bg-paper)] rounded-3xl p-5 flex flex-col shrink-0 border border-[var(--border-color)]">
                            <h3 className="font-bold text-sm uppercase text-[var(--text-secondary)] mb-6 flex justify-between px-2">
                                {col}
                                <span className="bg-[var(--bg-body)] text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] border border-[var(--border-color)]">
                                    {tasks.filter(t => (t.status || t.Status) === col).length}
                                </span>
                            </h3>
                            <div className="space-y-4 overflow-y-auto min-h-[150px] flex-1 pr-1 custom-scrollbar">
                                {tasks.filter(t => (t.status || t.Status) === col).map((task, index) => (
                                    <Draggable key={task.taskId || task.TaskId} draggableId={task.taskId || task.TaskId || ""} index={index}>{(p) => (
                                        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} style={p.draggableProps.style}>
                                            <TaskCard
                                                task={task}
                                                allTasks={allTasks}
                                                getStyle={getStyle}
                                                onComment={onComment}
                                                onDelete={onDelete}
                                                onUnassign={onUnassign}
                                            />
                                        </div>
                                    )}</Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        </div>
                    )}</Droppable>
                ))}
            </div>
        </DragDropContext>
    );
}