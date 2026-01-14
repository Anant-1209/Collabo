import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, AlertCircle, Brain, TrendingUp, Users as UsersIcon, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AI, Users } from '../api/agent';
import type { Task } from '../types';

interface Props { tasks: Task[]; }

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsView({ tasks }: Props) {
    const [workloadData, setWorkloadData] = useState<any>(null);
    const [predictionData, setPredictionData] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const total = tasks.length;
    const done = tasks.filter(t => (t.status || t.Status) === 'Done').length;
    const highPriority = tasks.filter(t => (t.priority || t.Priority) === 'High' && (t.status || t.Status) !== 'Done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const statusData = [
        { name: 'To Do', value: tasks.filter(t => (t.status || t.Status) === 'To Do').length },
        { name: 'In Progress', value: tasks.filter(t => (t.status || t.Status) === 'In Progress').length },
        { name: 'Done', value: tasks.filter(t => (t.status || t.Status) === 'Done').length },
    ];

    const priorityData = [
        { name: 'High', count: tasks.filter(t => (t.priority || t.Priority) === 'High').length },
        { name: 'Medium', count: tasks.filter(t => (t.priority || t.Priority) === 'Medium').length },
        { name: 'Low', count: tasks.filter(t => (t.priority || t.Priority) === 'Low').length },
    ];

    // Fetch AI insights
    useEffect(() => {
        Users.list().then(setAllUsers).catch(() => { });
    }, []);

    useEffect(() => {
        if (allUsers.length > 0 && tasks.length > 0) {
            AI.getWorkloadAnalysis(allUsers, tasks)
                .then(setWorkloadData)
                .catch(() => setWorkloadData(null));

            AI.getPrediction(tasks, 'Current Project')
                .then(setPredictionData)
                .catch(() => setPredictionData(null));
        }
    }, [allUsers, tasks]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Row: Productivity Metrics [cite: 46, 47] */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Team Completion Rate</h3>
                        <span className="text-emerald-400 font-bold">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-body)] h-4 rounded-full overflow-hidden mb-4 border border-[var(--border-color)]">
                        <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><CheckCircle2 size={14} className="text-emerald-500" /> {done} Tasks Resolved</div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><AlertCircle size={14} className="text-red-500" /> {highPriority} Urgent Blockers</div>
                    </div>
                </div>

                <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] text-center flex flex-col justify-center shadow-xl">
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Efficiency Rating</h3>
                    <div className={`text-4xl font-black ${completionRate > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {completionRate > 70 ? 'High' : completionRate > 40 ? 'Medium' : 'Low'}
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-2">Workforce Productivity Metric</p>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Workload Analysis */}
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-500/30 shadow-xl">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Brain size={16} /> AI Workload Analysis
                    </h3>
                    {workloadData ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                                <span>Average: {workloadData.averageTasksPerUser} tasks/user</span>
                                <span>Total: {workloadData.totalTasks} tasks</span>
                            </div>
                            {workloadData.analysis?.slice(0, 4).map((user: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-[var(--bg-body)] p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <UsersIcon size={14} className="text-blue-400" />
                                        <span className="text-sm text-[var(--text-primary)]">{user.user}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--text-secondary)]">{user.taskCount} tasks</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'overloaded' ? 'bg-red-500/20 text-red-400' :
                                                user.status === 'underloaded' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                            }`}>{user.status}</span>
                                    </div>
                                </div>
                            ))}
                            {workloadData.recommendations?.length > 0 && (
                                <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <div className="flex items-center gap-2 text-xs text-purple-400 mb-1">
                                        <Sparkles size={12} /> AI Recommendation
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        {workloadData.recommendations[0]}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-[var(--text-secondary)]">Loading AI analysis...</div>
                    )}
                </div>

                {/* Predictive Analytics */}
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-6 rounded-2xl border border-blue-500/30 shadow-xl">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={16} /> AI Timeline Prediction
                    </h3>
                    {predictionData ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[var(--bg-body)] p-3 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-400">{predictionData.completionPercentage}%</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Complete</div>
                                </div>
                                <div className="bg-[var(--bg-body)] p-3 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-cyan-400">{predictionData.estimatedDaysRemaining}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Days Left</div>
                                </div>
                            </div>
                            <div className="bg-[var(--bg-body)] p-3 rounded-lg">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-[var(--text-secondary)]">Predicted Completion</span>
                                    <span className="text-blue-400 font-medium">{predictionData.predictedCompletionDate}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-secondary)]">Risk Level</span>
                                    <span className={`font-medium ${predictionData.riskLevel === 'High' ? 'text-red-400' :
                                            predictionData.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                        }`}>{predictionData.riskLevel}</span>
                                </div>
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                <Sparkles size={12} className="text-blue-400" />
                                Velocity: {predictionData.velocityPerDay} tasks/day
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-[var(--text-secondary)]">Loading prediction...</div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] h-96 shadow-xl">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] h-96 shadow-xl">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6">Priority Volume</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={priorityData}>
                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: 'var(--bg-body)' }} contentStyle={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={45} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}