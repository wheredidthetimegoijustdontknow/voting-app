'use client';

import { useState } from 'react';
import { UserPlus, RefreshCw, Trash2, Eraser, Loader2 } from 'lucide-react';
import { createNewBots, runSimulation, removeBots, clearAllBotVotes } from '@/lib/actions/admin';
import { useToast } from '@/components/ui/ToastContext';

export default function SimulationControls() {
    const [loading, setLoading] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const { toast } = useToast();

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
    };

    const handleAction = async (name: string, action: () => Promise<any>, successMsg: (res: any) => string) => {
        const startMsg = `Starting action: ${name}`;
        console.log(`[SimulationControls] ${startMsg}`);
        addLog(startMsg);
        setLoading(name);

        try {
            const result = await action();
            console.log(`[SimulationControls] ${name} result:`, result);
            addLog(`${name} response received: ${JSON.stringify(result)}`);

            if (!result || result.success === false) {
                const errorMsg = result?.error || "Unknown error occurred";
                console.error(`[SimulationControls] ${name} failed:`, errorMsg);
                addLog(`ERROR: ${errorMsg}`);
                toast(`Error: ${errorMsg}`, { type: 'error' });
            } else {
                const msg = successMsg(result);
                console.log(`[SimulationControls] ${name} success:`, msg);
                addLog(`SUCCESS: ${msg}`);

                // If simulation, add detailed votes to log
                if (name === 'simulate' && result.details?.length > 0) {
                    result.details.forEach((v: any) => {
                        addLog(`VOTE: ${v.bot} voted "${v.choice}" on "${v.poll}"`);
                    });
                }

                if (result.status) {
                    addLog(`DB STATUS: ${result.status}`);
                }

                toast(msg, { type: 'success' });
            }
        } catch (error: any) {
            console.error(`[SimulationControls] ${name} exception:`, error);
            addLog(`EXCEPTION: ${error.message || String(error)}`);
            toast(`Action failed: ${String(error)}`, { type: 'error' });
        } finally {
            setLoading(null);
        }
    };

    const handleCreateBots = () => {
        const formData = new FormData();
        formData.append('count', '5');
        handleAction('create', () => createNewBots(formData), (res) => `Created ${res.created} new bots.`);
    };

    const handleDeleteBots = () => {
        const formData = new FormData();
        formData.append('count', '5');
        handleAction('delete', () => removeBots(formData), (res) => `Deleted ${res.deleted} bots.`);
    };

    const handleRunSimulation = () => {
        handleAction('simulate', runSimulation, (res) =>
            res.votesCast > 0
                ? `Simulation complete: ${res.votesCast} votes cast!`
                : 'Simulation complete: No new votes cast (bots have already voted on all polls).'
        );
    };

    const handleClearVotes = () => {
        addLog("Clear Bot Votes button clicked (confirm bypassed for debug)");
        handleAction('clear', clearAllBotVotes, (res) => `Cleared ${res.deleted} votes from bots.`);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <button
                        onClick={handleCreateBots}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading === 'create' ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                        Create 5 New Bots
                    </button>
                </div>

                <div>
                    <button
                        onClick={handleDeleteBots}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading === 'delete' ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        Delete 5 Bots
                    </button>
                </div>

                <hr className="border-default" />

                <div>
                    <button
                        onClick={handleRunSimulation}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading === 'simulate' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        Simulate Voting Round
                    </button>
                    <p className="text-caption mt-2 text-center">
                        Triggers all bots to vote on available polls randomly.
                    </p>
                </div>

                <div>
                    <button
                        id="clear-bot-votes-btn"
                        onClick={handleClearVotes}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition disabled:opacity-50"
                    >
                        {loading === 'clear' ? <Loader2 className="animate-spin" size={18} /> : <Eraser size={18} />}
                        Clear Bot Votes
                    </button>
                </div>
            </div>

            {/* Debug Console */}
            <div className="mt-8 p-4 bg-zinc-900 text-zinc-300 rounded-lg font-mono text-xs border border-zinc-800">
                <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Debug Action Log</span>
                    <button
                        onClick={() => setLogs([])}
                        className="text-[10px] hover:text-white underline transition"
                    >
                        Clear Logs
                    </button>
                </div>
                <div className="max-h-[150px] overflow-y-auto space-y-1">
                    {logs.length === 0 ? (
                        <div className="text-zinc-600 italic">No actions recorded yet...</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className={log.includes('ERROR') || log.includes('EXCEPTION') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : ''}>
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
