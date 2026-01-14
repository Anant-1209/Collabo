export interface Task {
    taskId: string;
    TaskId?: string;
    title: string;
    Title?: string;
    description: string;
    Description?: string;
    priority: string;
    Priority?: string;
    status: string;
    Status?: string;
    projectId: string;
    ProjectId?: string;
    dueDate?: string;
    parentTaskId?: string;
    assignee?: string;
    Assignee?: string;
}

export interface Project {
    projectId: string;
    ProjectId?: string;
    name: string;
    Name?: string;
    description?: string;
    Description?: string;
    tags?: string;
    Tags?: string;
}

// Renamed to IDocument to prevent browser naming conflicts
export interface IDocument {
    documentId: string;
    name: string;
    fileType: string;
    size: number;
    version: string;
    isPublic: boolean;
}