import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { X, Download } from 'lucide-react';
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Tasks, Projects, Comments, Documents, Activity, Reports, Users, type User } from './api/agent';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommentModal from './components/CommentModal';
import ActivityFeed from './components/ActivityFeed';
import { ProjectModal, TaskModal } from './components/Modals';
import Login from './views/Login';

// Specialized Views
import DashboardView from './views/DashboardView';
import KanbanView from './views/KanbanView';
import DocumentView from './views/DocumentView';
import CalendarView from './views/CalendarView';
import AnalyticsView from './views/AnalyticsView';
import ProfileView from './views/ProfileView';
import UserManagementView from './views/UserManagementView';
import { useRole } from './context/RoleContext';

// Type Imports
import type { Task, Project, IDocument } from './types/index';

export default function App() {
    /* =========================
       1. AUTHENTICATION STATE
    ========================= */
    const { instance, accounts } = useMsal();
    const isMsalAuthenticated = useIsAuthenticated();

    // Dynamic Identity Extraction
    const activeAccount = accounts.length > 0 ? accounts[0] : null;
    const userName = activeAccount?.name || activeAccount?.username || "Guest User";
    const userInitial = userName.charAt(0).toUpperCase();

    const isAuthenticated = isMsalAuthenticated || !!localStorage.getItem("token");

    /* =========================
       2. CORE STATE MANAGEMENT
    ========================= */
    const [view, setView] = useState('dashboard');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [projectDocs, setProjectDocs] = useState<IDocument[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // UI & Modal States
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [activeTaskForComments, setActiveTaskForComments] = useState<Task | null>(null);
    const [taskComments, setTaskComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [previewFile, setPreviewFile] = useState<any>(null);



    // Dynamic users from database
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [projectMembers, setProjectMembers] = useState<any[]>([]);

    /* =========================
       3. FORM STATES
    ========================= */
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', priority: 'Medium', status: 'To Do',
        projectId: '', assignee: '', dueDate: '', parentTaskId: ''
    });

    const [projectForm, setProjectForm] = useState({ name: '', description: '', tags: '' });

    const resetTaskForm = () => {
        setTaskForm({
            title: '', description: '', priority: 'Medium', status: 'To Do',
            projectId: '', assignee: '', dueDate: '', parentTaskId: ''
        });
    };

    /* =========================
       4. DATA SYNC & AUTH LOGIC
    ========================= */
    const loadData = async () => {
        try {
            const userEmail = activeAccount?.username || '';
            const [t, p] = await Promise.all([Tasks.list(), Projects.list(userEmail)]);
            setTasks(t || []);
            setProjects(p || []);

            // Load all users for assignment dropdowns
            try {
                const users = await Users.list();
                console.log("Fetched All Users:", users);
                setAllUsers(users || []);
            } catch (err) { console.warn("Users API not ready or failed:", err); }

            try {
                const act = await Activity.list(selectedProjectId || undefined);
                setActivities(act || []);
            } catch (err) { console.warn("Activity backend not ready."); }

            if (view === 'documents' && selectedProjectId) {
                const docs = await Documents.listByProject(selectedProjectId);
                setProjectDocs(docs || []);
            }

            // Load project members when a project is selected
            if (selectedProjectId) {
                try {
                    const members = await Projects.getMembers(selectedProjectId);
                    console.log("Fetched Project Members:", members);
                    setProjectMembers(members || []);
                } catch (err) { console.warn("Could not load project members:", err); }
            }
        } catch (err) { console.error('Global sync error:', err); }
    };

    const handleLogout = () => {
        localStorage.clear();
        instance.logoutPopup().catch(e => console.error(e));
    };

    const getProjectProgress = (projectId: string) => {
        const projectTasks = tasks.filter(t => (t.projectId || t.ProjectId) === projectId);
        if (projectTasks.length === 0) return 0;
        const completedTasks = projectTasks.filter(t => (t.status || t.Status) === 'Done');
        return Math.round((completedTasks.length / projectTasks.length) * 100);
    };

    // Import role context for syncing user
    const { syncAndRefresh } = useRole();

    // Sync user with database when authenticated (creates user if first time, fetches role)
    useEffect(() => {
        if (isAuthenticated && activeAccount?.username) {
            syncAndRefresh(activeAccount.username, userName);
        }
    }, [isAuthenticated, activeAccount?.username, userName, syncAndRefresh]);

    useEffect(() => { if (isAuthenticated) loadData(); }, [isAuthenticated, view, selectedProjectId]);

    // SignalR Group-Based Notification Hub logic
    useEffect(() => {
        if (!isAuthenticated) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/hubs/notifications')
            .withAutomaticReconnect().build();

        connection.start().then(() => {
            if (selectedProjectId) {
                connection.invoke("JoinProjectGroup", selectedProjectId);
            }

            connection.on('ReceiveNotification', (n) => {
                setNotifications(prev => [n, ...prev]);
                loadData();
            });
        }).catch(err => console.error('SignalR error:', err));

        return () => {
            if (selectedProjectId) {
                connection.invoke("LeaveProjectGroup", selectedProjectId);
            }
            connection.stop();
        };
    }, [isAuthenticated, selectedProjectId]);

    /* =========================
       5. ACTION HANDLERS
    ========================= */
    const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
        const task = tasks.find(t => (t.taskId || t.TaskId) === taskId);

        if (newStatus !== 'To Do' && task?.parentTaskId) {
            const parent = tasks.find(t => (t.taskId || t.TaskId) === task.parentTaskId);
            if (parent && (parent.status || parent.Status) !== 'Done') {
                alert(`LOCKED: Prerequisite "${parent.title || parent.Title}" is not Done.`);
                return;
            }
        }
        await Tasks.updateStatus(taskId, newStatus, userName); // Pass dynamic user name
        loadData();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm("Permanently delete this task?")) {
            await Tasks.delete(taskId);
            loadData();
        }
    };

    const handleUnassign = async (taskId: string) => {
        if (window.confirm("Remove the assigned user from this task?")) {
            await Tasks.updateAssignee(taskId, null, userName);
            loadData();
        }
    };

    const handleTaskSubmit = (e: any) => {
        e.preventDefault();
        const pId = selectedProjectId || projects[0]?.projectId || projects[0]?.ProjectId || '';

        // Dynamic Creator Assignment
        const taskData = {
            ...taskForm,
            projectId: pId,
            creator: userName,
            author: userName
        };

        Tasks.create(taskData).then(() => {
            setShowTaskModal(false);
            resetTaskForm();
            // Client-side notification
            setNotifications(prev => [{ message: `Task "${taskData.title}" created`, time: 'Just now' }, ...prev]);
            loadData();
        });
    };

    const handleProjectSubmit = (e: any) => {
        e.preventDefault();
        // Dynamic Project Creator
        Projects.create({ ...projectForm, creator: userName }).then(() => {
            setShowProjectModal(false);
            loadData();
        });
    };

    const handleCommentSend = () => {
        if (!newComment.trim()) return;
        const taskId = activeTaskForComments?.taskId || activeTaskForComments?.TaskId || '';

        // Dynamic Comment Author
        Comments.create({
            taskId: taskId,
            text: newComment,
            author: userName
        }).then(() => {
            setNewComment('');
            Comments.list(taskId).then(setTaskComments);
            // Client-side notification
            const taskTitle = activeTaskForComments?.title || activeTaskForComments?.Title || 'task';
            setNotifications(prev => [{ message: `You commented on "${taskTitle}"`, time: 'Just now' }, ...prev]);
            loadData();
        });
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await Comments.delete(commentId);
            const taskId = activeTaskForComments?.taskId || activeTaskForComments?.TaskId || '';
            const updatedComments = await Comments.list(taskId);
            setTaskComments(updatedComments);
            loadData();
        } catch (err) {
            console.error("Delete Comment Error:", err);
        }
    };

    const getPriorityStyle = (p: string) => {
        switch (p?.toLowerCase()) {
            case 'high': return { badge: 'bg-red-500/10 text-red-500 border-red-500/20', border: 'border-l-red-500' };
            case 'medium': return { badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', border: 'border-l-amber-500' };
            default: return { badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', border: 'border-l-emerald-500' };
        }
    };

    /* =========================
       6. RENDER LOGIC
    ========================= */
    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="flex h-screen w-screen bg-[var(--bg-body)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors">
            <Sidebar
                view={view}
                setView={setView}
                projects={projects}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                setShowProjectModal={setShowProjectModal}
                getProgress={getProjectProgress}
                refresh={loadData}
                logout={handleLogout}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-body)] transition-colors">
                <Navbar
                    title={selectedProjectId ? projects.find(p => (p.projectId || p.ProjectId) === selectedProjectId)?.name || 'Project' : view}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    notifications={notifications}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    setNotifications={setNotifications}
                    onNewTask={() => setShowTaskModal(true)}
                    userName={userName}
                    userInitial={userInitial}
                />

                <div className="flex-1 flex overflow-hidden">
                    <main className="flex-1 overflow-auto p-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Workspace</h2>
                            <button onClick={() => Reports.downloadTasksCsv(selectedProjectId || undefined)} className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2 transition-all text-xs font-bold"><Download size={14} /> Export CSV</button>
                        </div>

                        {view === 'documents' ? (
                            <DocumentView
                                docs={projectDocs}
                                selectedProjectId={selectedProjectId}
                                onUpload={(e: any) => Documents.upload(e.target.files[0], selectedProjectId!).then(loadData)}
                                onPreview={(doc: any) => Documents.getPreview(doc.documentId).then(blob => setPreviewFile({ url: URL.createObjectURL(blob), name: doc.name }))}
                                onDelete={(id: string) => Documents.delete(id).then(loadData)}
                                onVersion={(id, e) => Documents.updateVersion(id, e.target.files[0]).then(loadData)}
                                onTogglePerms={(id, status) => Documents.updatePermissions(id, !status).then(loadData)}
                            />
                        ) : view === 'kanban' ? (
                            <KanbanView tasks={tasks.filter(t => !selectedProjectId || (t.projectId || t.ProjectId) === selectedProjectId)} allTasks={tasks} getStyle={getPriorityStyle} onUpdateStatus={handleUpdateTaskStatus} onComment={(t: Task) => { setActiveTaskForComments(t); Comments.list(t.taskId || t.TaskId || '').then(setTaskComments); }} onDelete={handleDeleteTask} onUnassign={handleUnassign} />
                        ) : view === 'calendar' ? (
                            <CalendarView tasks={tasks} />
                        ) : view === 'analytics' ? (
                            <AnalyticsView tasks={tasks} />
                        ) : view === 'profile' ? (
                            <ProfileView userName={userName} userEmail={activeAccount?.username || 'user@example.com'} />
                        ) : view === 'users' ? (
                            <UserManagementView />
                        ) : (
                            <DashboardView tasks={tasks.filter(t => !selectedProjectId || (t.projectId || t.ProjectId) === selectedProjectId)} allTasks={tasks} getStyle={getPriorityStyle} onComment={(t: Task) => { setActiveTaskForComments(t); Comments.list(t.taskId || t.TaskId || '').then(setTaskComments); }} onDelete={handleDeleteTask} onUnassign={handleUnassign} selectedProjectId={selectedProjectId} onMembersChange={loadData} />
                        )}
                    </main>

                    <aside className="w-80 p-8 border-l border-[var(--border-color)] bg-[var(--bg-body)] hidden xl:block shadow-inner">
                        <ActivityFeed activities={activities} />
                    </aside>
                </div>
            </div>

            <CommentModal
                activeTask={activeTaskForComments}
                onClose={() => setActiveTaskForComments(null)}
                comments={taskComments}
                newComment={newComment}
                setNewComment={setNewComment}
                teamMembers={projectMembers.length > 0 ? projectMembers : allUsers}
                onSend={handleCommentSend}
                onDeleteComment={handleDeleteComment}
            />

            <ProjectModal show={showProjectModal} onClose={() => setShowProjectModal(false)} form={projectForm} setForm={setProjectForm} onSubmit={handleProjectSubmit} allUsers={allUsers} />
            <TaskModal show={showTaskModal} onClose={() => { setShowTaskModal(false); resetTaskForm(); }} form={taskForm} setForm={setTaskForm} tasks={tasks} onSubmit={handleTaskSubmit} teamMembers={projectMembers.length > 0 ? projectMembers : allUsers} />

            {previewFile && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col p-4">
                    <div className="flex justify-between items-center mb-4 px-4 text-white"><h3 className="font-bold">{previewFile.name}</h3><button onClick={() => setPreviewFile(null)}><X size={24} /></button></div>
                    <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <iframe src={previewFile.url} className="w-full h-full border-none" title="Document Preview" />
                    </div>
                </div>
            )}
        </div>
    );
}