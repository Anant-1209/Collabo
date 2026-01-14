
import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Set the base URL for your .NET backend [cite: 232]
axios.defaults.baseURL = 'http://localhost:5000/api';

/**
 * REQUEST INTERCEPTOR
 * Automatically adds the JWT token to every outgoing request.
 */
axios.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`; // Requirement 2.3.4 [cite: 234]
    }
    return config;
}, error => {
    return Promise.reject(error);
});

/**
 * RESPONSE INTERCEPTOR
 * Requirement 2.2.4: Error handling and graceful degradation.
 * If the backend returns a 401 (Unauthorized), we clear the local session.
 */
axios.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = '/login'; // Redirect to login if token is invalid or expired
    }
    return Promise.reject(error);
});

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const Requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
    patch: <T>(url: string, body: {}) => axios.patch<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
};

export const Tasks = {
    list: () => Requests.get<any[]>('/tasks'),
    create: (task: any) => Requests.post<any>('/tasks', task),
    delete: (id: string) => Requests.delete(`/tasks/${id}`),
    updateStatus: (id: string, status: string, userName: string) =>
        axios.patch(`/tasks/${id}/status`, { NewStatus: status, UserName: userName }, {
            headers: { 'Content-Type': 'application/json' }
        }).then(responseBody),
    updateAssignee: (id: string, assignee: string | null, userName: string) =>
        axios.patch(`/tasks/${id}/assignee`, { Assignee: assignee, UserName: userName }, {
            headers: { 'Content-Type': 'application/json' }
        }).then(responseBody),
};

export const Projects = {
    list: (email?: string) => Requests.get<any[]>(`/projects${email ? `?email=${encodeURIComponent(email)}` : ''}`),
    create: (project: any) => Requests.post<any>('/projects', project),
    delete: (id: string) => Requests.delete(`/projects/${id}`),
    getMembers: (projectId: string) => Requests.get<ProjectMember[]>(`/projects/${projectId}/members`),
    addMember: (projectId: string, userId: number, role?: string) => Requests.post<any>(`/projects/${projectId}/members`, { userId, role }),
    removeMember: (projectId: string, userId: number) => Requests.delete(`/projects/${projectId}/members/${userId}`),
};

export interface ProjectMember {
    id: number;
    userId: number;
    role: string;
    joinedAt: string;
    name: string;
    email: string;
}

export const Comments = {
    list: (taskId: string) => Requests.get<any[]>(`/comments/${taskId}`),
    create: (comment: any) => Requests.post<any>('/comments', comment),
    delete: (id: string) => Requests.delete(`/comments/${id}`),
};

export const Documents = {
    listByProject: (projectId: string) => Requests.get<any[]>(`/documents/project/${projectId}`),

    upload: (file: File, projectId?: string) => {
        let formData = new FormData();
        formData.append('file', file);
        if (projectId) formData.append('projectId', projectId);
        return axios.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' } // Requirement 2.1.5 [cite: 39]
        }).then(responseBody);
    },

    // Requirement 40: Logic for updating versions [cite: 40]
    updateVersion: (id: string, file: File) => {
        let formData = new FormData();
        formData.append('file', file);
        return axios.post(`/documents/${id}/version`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(responseBody);
    },

    // Requirement 41: Logic for toggling public/private permissions 
    updatePermissions: (id: string, isPublic: boolean) =>
        axios.put(`/documents/${id}/permissions`, isPublic, {
            headers: { 'Content-Type': 'application/json' }
        }).then(responseBody),

    // Requirement 42: Preview for file formats [cite: 42]
    getPreview: (id: string) =>
        axios.get(`/documents/download/${id}`, { responseType: 'blob' }).then(res => res.data),

    download: (id: string, fileName: string) =>
        axios.get(`/documents/download/${id}`, { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }),

    delete: (id: string) => Requests.delete(`/documents/${id}`),
};

// AI-Powered Features [cite: 49, 92]
export const AI = {
    getSuggestion: (title: string, description: string) =>
        axios.post('http://localhost:5001/api/ai/prioritize', { title, description })
            .then(res => res.data),

    getWorkloadAnalysis: (users: any[], tasks: any[]) =>
        axios.post('http://localhost:5001/api/ai/workload', { users, tasks })
            .then(res => res.data),

    getPrediction: (tasks: any[], projectName: string) =>
        axios.post('http://localhost:5001/api/ai/predict-timeline', { tasks, projectName })
            .then(res => res.data),
};

// Collaboration Features: Activity Feed [cite: 37]
export const Activity = {
    list: (projectId?: string) => axios.get<any[]>(`/activity${projectId ? `?projectId=${projectId}` : ''}`).then(res => res.data),
};

// Dashboard and Analytics: Custom report generation [cite: 48]
export const Reports = {
    downloadTasksCsv: (projectId?: string) => axios.get(`/reports/tasks/csv${projectId ? `?projectId=${projectId}` : ''}`, {
        responseType: 'blob'
    }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `TaskReport_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url); // Clean up memory
        document.body.removeChild(link);
    })
};

// User interface for RBAC
export interface User {
    user_id: number;
    email: string;
    name: string;
    profile_picture?: string;
    role: 'Admin' | 'Project Manager' | 'Team Member' | 'Guest';
    created_at: string;
    updated_at: string;
}

// Users API for Role-Based Access Control
export const Users = {
    me: (email: string) => Requests.get<User>(`/users/me?email=${encodeURIComponent(email)}`),
    list: () => Requests.get<User[]>('/users'),
    updateRole: (id: number, role: string) => Requests.patch<{ message: string; user: User }>(`/users/${id}/role`, { role }),
    delete: (id: number) => Requests.delete<{ message: string }>(`/users/${id}`),
};

// Auth API for user sync
export const Auth = {
    syncUser: (email: string, name: string) => Requests.post<{ message: string; user: User }>('/auth/sync-user', { email, name }),
};
