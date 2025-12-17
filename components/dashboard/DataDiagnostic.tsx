'use client';

import { useState } from 'react';
import { Database, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

interface DiagnosticData {
    pollsCount: number;
    votesCount: number;
    lastUpdated: string;
}

export default function DataDiagnostic({ polls, currentUserId }: { polls: any[], currentUserId?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);

    const totalVotes = polls.reduce((acc, poll) => acc + (poll.total_votes || 0), 0);
    const myPolls = currentUserId ? polls.filter(p => p.user_id === currentUserId).length : 0;

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2 px-3 text-xs font-mono"
                >
                    <Database size={14} />
                    <span>DIAGNOSTICS</span>
                </button>
            ) : (
                <div
                    className="bg-white border-2 border-black rounded-lg shadow-2xl p-4 w-80 animate-in slide-in-from-bottom-5 duration-300"
                    style={{ fontFamily: 'monospace' }}
                >
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <Database size={16} className="text-primary" />
                            <span className="font-bold text-sm">SYSTEM DIAGNOSTICS</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">×</button>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">Total Polls (DB)</span>
                            <span className="font-bold text-black">{polls.length}</span>
                        </div>

                        <div className="flex justify-between bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">Total Votes (DB)</span>
                            <span className="font-bold text-primary">{totalVotes}</span>
                        </div>

                        {currentUserId && (
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">My Polls</span>
                                <span className="font-bold text-black">{myPolls}</span>
                            </div>
                        )}

                        <div className="pt-2 border-t mt-2">
                            <div className="flex items-center gap-2 text-[10px] text-green-600 mb-1">
                                <CheckCircle2 size={10} />
                                <span>DYNAMIC SYNC: ACTIVE</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-tight">
                                This data is calculated directly from the props passed to the PageClient. If these numbers match your expectations but the UI doesn't, the issue is at the presentation layer.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 py-2 rounded transition-colors text-black"
                        >
                            <RefreshCw size={12} />
                            <span>FORCE HARD RELOAD</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
