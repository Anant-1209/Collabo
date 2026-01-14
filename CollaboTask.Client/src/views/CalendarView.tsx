import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import type { Task } from '../types';
import { Calendar as CalIcon, Clock, ChevronRight } from 'lucide-react';
import './CalendarStyles.css'; // We will create this file next

interface Props { tasks: Task[]; }

export default function CalendarView({ tasks }: Props) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const tasksOnSelectedDate = tasks.filter(t => {
        if (!t.dueDate) return false;
        // Adjust for potential timezone offsets to match dates correctly
        const taskDate = new Date(t.dueDate);
        return taskDate.toDateString() === selectedDate.toDateString();
    });

    return (
        <div className="flex flex-col xl:flex-row gap-8 h-full animate-in fade-in duration-500">
            {/* Left: The Styled Calendar */}
            <div className="xl:w-[450px]">
                <div className="bg-[var(--bg-paper)] p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl">
                    <Calendar
                        onChange={(val: any) => setSelectedDate(val)}
                        value={selectedDate}
                        className="ct-dark-calendar"
                        tileClassName={({ date }) => {
                            const hasTasks = tasks.some(t => t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString());
                            return hasTasks ? 'has-tasks-tile' : null;
                        }}
                    />
                </div>
            </div>

            {/* Right: Daily Agenda Section */}
            <div className="flex-1">
                <div className="bg-[var(--bg-paper)] p-6 rounded-3xl border border-[var(--border-color)] h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-500">
                            <CalIcon size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm">Requirement 32: Scheduled Deadlines [cite: 32]</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {tasksOnSelectedDate.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <Clock size={64} className="mb-4 text-[var(--text-secondary)]" />
                                <p className="text-[var(--text-secondary)] font-medium">No tasks due today</p>
                            </div>
                        ) : (
                            tasksOnSelectedDate.map(task => (
                                <div key={task.taskId || task.TaskId} className="bg-[var(--bg-body)] p-5 rounded-2xl border border-[var(--border-color)] flex items-center justify-between hover:border-blue-500/50 transition-all cursor-default group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1.5 h-10 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">{task.title || task.Title}</h4>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-wider font-bold">
                                                {task.status || task.Status} • {task.priority || task.Priority}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" size={20} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}