import { FolderKanban, TrendingUp } from 'lucide-react';

interface Props {
    projectName: string;
    progress: number;
}

export default function ProjectProgress({ projectName, progress }: Props) {
    return (
        <div className="bg-[#252a40] p-5 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
                        <FolderKanban size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">{projectName}</h4>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Status Report [cite: 26]</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">{progress}%</span>
                </div>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                    className="bg-blue-600 h-full transition-all duration-700" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}