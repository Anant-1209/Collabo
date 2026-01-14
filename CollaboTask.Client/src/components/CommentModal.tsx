import { useState } from 'react';
import { Send, AtSign, Trash2, X } from 'lucide-react';

interface Props {
    activeTask: any;
    onClose: () => void;
    comments: any[];
    newComment: string;
    setNewComment: (val: string) => void;
    onSend: () => void;
    onDeleteComment: (id: string) => void;
    teamMembers: any[];
}

// Parse @mentions and convert to styled spans
function parseMentions(text: string): React.ReactNode[] {
    const mentionRegex = /@(\w+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        // Add styled mention
        parts.push(
            <span key={match.index} className="text-blue-400 font-medium bg-blue-500/20 px-1 rounded">
                @{match[1]}
            </span>
        );
        lastIndex = mentionRegex.lastIndex;
    }
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [text];
}

export default function CommentModal({ activeTask, onClose, comments, newComment, setNewComment, onSend, onDeleteComment, teamMembers }: Props) {
    const [showMentionList, setShowMentionList] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNewComment(val);
        if (val.endsWith('@')) setShowMentionList(true);
        else if (!val.includes('@') || val.endsWith(' ')) setShowMentionList(false);
    };

    if (!activeTask) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-end z-[60]">
            <div className="bg-[var(--bg-paper)] w-full max-w-lg h-full border-l border-[var(--border-color)] p-8 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Comments</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-body)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                    {comments.map((c: any) => (
                        <div key={c.commentId} className="bg-[var(--bg-body)] p-4 rounded-2xl border border-[var(--border-color)] group relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                        {c.author ? c.author[0] : 'U'}
                                    </div>
                                    <span className="text-xs font-bold text-blue-400">{c.author}</span>
                                </div>
                                <button
                                    onClick={() => onDeleteComment(c.commentId)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-secondary)] hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            {/* Parse and highlight @mentions in comment text */}
                            <p className="text-sm text-[var(--text-secondary)]">{parseMentions(c.text)}</p>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    {showMentionList && (
                        <div className="absolute bottom-full left-0 w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl mb-2 shadow-2xl z-10">
                            {teamMembers.map((m: any) => (
                                <button key={m.user_id} onClick={() => { setNewComment(newComment + m.name + ' '); setShowMentionList(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600 hover:text-white flex items-center gap-2 text-[var(--text-primary)]">
                                    <AtSign size={14} /> {m.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2 bg-[var(--bg-body)] p-2 rounded-2xl border border-[var(--border-color)]">
                        <textarea className="flex-1 bg-transparent border-none outline-none p-2 text-sm h-20 resize-none text-[var(--text-primary)]" placeholder="Type @ to mention someone..." value={newComment} onChange={handleTextChange} />
                        <button onClick={onSend} className="bg-blue-600 p-4 rounded-xl self-end hover:bg-blue-700 transition-all text-white"><Send size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
