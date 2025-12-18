'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, UserPlus, Trash2, Eraser, Loader2, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { createNewBots, runSimulationStep, removeBots, clearAllBotVotes, fetchBotStats } from '@/lib/actions/admin';
import { useToast } from '@/components/ui/ToastContext';
import { FlaggedPollsTable } from './FlaggedPollsTable';

export default function AdminHUD() {
    const [loading, setLoading] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [botCount, setBotCount] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'simulation' | 'moderation'>('simulation');
    const { toast } = useToast();

    const refreshStats = useCallback(async () => {
        try {
            const stats = await fetchBotStats();
            setBotCount(stats.totalBots);
        } catch (error) {
            console.error("Failed to fetch bot stats in HUD:", error);
        }
    }, []);

    useEffect(() => {
        refreshStats();
        // Refresh stats periodically
        const interval = setInterval(refreshStats, 30000);
        return () => clearInterval(interval);
    }, [refreshStats]);

    const handleAction = async (name: string, action: () => Promise<{ success?: boolean; error?: string | null;[key: string]: unknown }>, successMsg: (res: Record<string, unknown>) => string) => {
        setLoading(name);
        try {
            const result = await action();
            if (!result || result.success === false) {
                toast(`Error: ${result?.error || "Unknown error"}`, { type: 'error' });
            } else {
                toast(successMsg(result), { type: 'success' });
                refreshStats(); // Update count after actions
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            toast(`Action failed: ${errorMsg}`, { type: 'error' });
        } finally {
            setLoading(null);
        }
    };

    const handleCreateBots = () => {
        const formData = new FormData();
        formData.append('count', '5');
        handleAction('create', () => createNewBots(formData), (res) => `Created ${res.created as number} bots.`);
    };

    const handleDeleteBots = () => {
        const formData = new FormData();
        formData.append('count', '5');
        handleAction('delete', () => removeBots(formData), (res) => `Deleted ${res.deleted as number} bots.`);
    };

    const [isSimulating, setIsSimulating] = useState(false);
    const stopSignalRef = useRef(false);

    const handleRunSimulation = async () => {
        if (loading || isSimulating) return;

        setLoading('simulate');
        setIsSimulating(true);
        stopSignalRef.current = false;
        toast('Starting chunked simulation...', { type: 'info' });

        try {
            let totalVotesCast = 0;
            // Run up to 100 steps
            for (let i = 0; i < 100; i++) {
                if (stopSignalRef.current) {
                    console.log("[AdminHUD] Stop signal detected. Breaking loop.");
                    break;
                }

                const result = await runSimulationStep();

                if (!result.success) {
                    if (result.error?.includes("No bots")) break;
                    // Minor delay on error/skip
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }

                if (result.vote) {
                    totalVotesCast++;
                }

                // Small delay between calls to keep UI smooth and human-like
                await new Promise(r => setTimeout(r, 1000));
            }

            if (totalVotesCast > 0) {
                toast(`Simulated ${totalVotesCast} votes!`, { type: 'success' });
            } else {
                toast('Simulation finished.', { type: 'info' });
            }
            refreshStats();
        } catch (err) {
            console.error("[AdminHUD] Simulation error:", err);
            toast('Simulation encountered an error', { type: 'error' });
        } finally {
            setLoading(null);
            setIsSimulating(false);
        }
    };

    const handleStopSimulation = () => {
        stopSignalRef.current = true;
        setIsSimulating(false);
        toast('Stopping simulation...', { type: 'info' });
    };

    const handleClearVotes = () => {
        handleAction('clear', clearAllBotVotes, (res) => `Cleared ${res.deleted as number} bot votes.`);
    };

    return (
        <div
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isMinimized ? 'w-48' : 'w-80'}`}
            style={{
                backgroundColor: 'var(--color-surface)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                padding: '2px'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-light">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Bot size={18} className="text-primary shrink-0" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-xs leading-none">Admin Control Center</span>
                        <span className="text-[10px] text-muted font-medium uppercase tracking-tighter">
                            God Mode Active
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!isMinimized && (
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg mr-2">
                            <button
                                onClick={() => setActiveTab('simulation')}
                                className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${activeTab === 'simulation' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500'}`}
                            >
                                SIM
                            </button>
                            <button
                                onClick={() => setActiveTab('moderation')}
                                className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${activeTab === 'moderation' ? 'bg-white dark:bg-zinc-700 shadow-sm text-red-500' : 'text-zinc-500'}`}
                            >
                                MOD
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-background rounded transition-colors"
                    >
                        {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="p-4 space-y-4">
                    {activeTab === 'simulation' ? (
                        <>
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Bot Management</span>
                                <span className="text-[10px] font-bold text-blue-500">{botCount ?? 0} Bots</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleCreateBots}
                                    disabled={!!loading}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/10 text-blue-600 rounded-md hover:bg-blue-600/20 transition text-xs font-medium disabled:opacity-50"
                                >
                                    {loading === 'create' ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                                    +5 Bots
                                </button>
                                <button
                                    onClick={handleDeleteBots}
                                    disabled={!!loading}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/10 text-red-600 rounded-md hover:bg-red-600/20 transition text-xs font-medium disabled:opacity-50"
                                >
                                    {loading === 'delete' ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                    -5 Bots
                                </button>
                            </div>

                            {(loading === 'simulate' || loading === 'stopping') ? (
                                <button
                                    onClick={handleStopSimulation}
                                    disabled={loading === 'stopping'}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-bold shadow-sm disabled:opacity-50"
                                >
                                    <Loader2 className="animate-spin" size={18} />
                                    {loading === 'stopping' ? 'Stopping...' : 'Stop Voting Round'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleRunSimulation}
                                    disabled={!!loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm font-bold shadow-sm disabled:opacity-50"
                                >
                                    <Activity size={18} />
                                    Run Voting Round
                                </button>
                            )}

                            <button
                                onClick={handleClearVotes}
                                disabled={!!loading}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600/10 text-amber-600 rounded-md hover:bg-amber-600/20 transition text-xs font-medium disabled:opacity-50"
                            >
                                {loading === 'clear' ? <Loader2 className="animate-spin" size={14} /> : <Eraser size={14} />}
                                Clear Bot Activity
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] uppercase font-black text-red-400 tracking-widest">Moderation Queue</span>
                            </div>
                            <FlaggedPollsTable />
                        </>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Live Controls Active</span>
                    </div>
                </div>
            )}
        </div>
    );
}
