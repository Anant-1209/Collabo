import { Upload, FileText, Eye, History, Unlock, Lock, Trash2, File } from 'lucide-react';
import type { IDocument } from '../types/index';
import { Documents } from '../api/agent';

interface Props {
    docs: IDocument[];
    selectedProjectId: string | null;
    onUpload: (e: any) => void;
    onVersion: (id: string, e: any) => void;
    onTogglePerms: (id: string, status: boolean) => void;
    onPreview: (doc: IDocument) => void;
    onDelete: (id: string) => void;
}

export default function DocumentView({ docs, selectedProjectId, onUpload, onVersion, onTogglePerms, onPreview, onDelete }: Props) {
    if (!selectedProjectId) return (
        <div className="bg-[var(--bg-paper)] p-20 rounded-3xl border border-dashed border-[var(--border-color)] text-center">
            <File size={64} className="mx-auto text-[var(--text-secondary)] mb-6" />
            <p className="text-[var(--text-secondary)]">Select a project to manage documents</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)]">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Document Repository</h3>
                    <p className="text-[var(--text-secondary)] text-sm">Requirement 40 & 41 Enabled</p>
                </div>
                <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl cursor-pointer font-bold flex items-center gap-2 transition-all text-white">
                    <Upload size={20} /> Upload New
                    <input type="file" className="hidden" onChange={onUpload} />
                </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {docs.map((doc) => (
                    <div key={doc.documentId} className="bg-[var(--bg-paper)] p-5 rounded-2xl border border-[var(--border-color)] group flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-500">
                                <FileText size={20} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onPreview(doc)} className="p-1.5 hover:bg-[var(--bg-body)] rounded-md text-emerald-400"><Eye size={16} /></button>
                                <label className="p-1.5 hover:bg-[var(--bg-body)] rounded-md text-amber-400 cursor-pointer">
                                    <History size={16} />
                                    <input type="file" className="hidden" onChange={(e) => onVersion(doc.documentId, e)} />
                                </label>
                                <button onClick={() => onTogglePerms(doc.documentId, doc.isPublic)} className={`p-1.5 hover:bg-[var(--bg-body)] rounded-md ${doc.isPublic ? 'text-blue-400' : 'text-[var(--text-secondary)]'}`}>
                                    {doc.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                                </button>
                                <button onClick={() => onDelete(doc.documentId)} className="p-1.5 hover:bg-[var(--bg-body)] rounded-md text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-bold truncate text-sm text-[var(--text-primary)]">{doc.name}</h4>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-[var(--text-secondary)]">v{doc.version || "1.0"}</span>
                                <button onClick={() => Documents.download(doc.documentId, doc.name)} className="text-blue-500 text-[10px] font-bold">Download</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}