'use server';

import { createBots, deleteBots, listBots, simulateSingleStep, clearBotVotes, getBotStats } from '@/lib/admin/bot-manager';
import { revalidatePath } from 'next/cache';

export async function fetchBots() {
    // Only allow in dev/test environments or check admin role
    if (process.env.NODE_ENV === 'production') return [];
    return await listBots();
}

export async function fetchBotStats() {
    if (process.env.NODE_ENV === 'production') return { totalBots: 0, totalBotVotes: 0 };
    return await getBotStats();
}

export async function createNewBots(formData: FormData) {
    const count = Number(formData.get('count')) || 5;
    try {
        const result = await createBots(count);
        revalidatePath('/', 'layout');
        return { success: true, created: result.created };
    } catch (error) {
        console.error("Failed to create bots:", error);
        return { success: false, error: String(error) };
    }
}

export async function removeBots(formData: FormData) {
    const count = Number(formData.get('count')) || 5;
    try {
        const result = await deleteBots(count);
        revalidatePath('/', 'layout');
        return { success: true, deleted: result.deleted };
    } catch (error) {
        console.error("Failed to remove bots:", error);
        return { success: false, error: String(error) };
    }
}

export async function runSimulationStep() {
    try {
        const result = await simulateSingleStep();
        if (result.success) {
            revalidatePath('/', 'layout');
        }
        return result;
    } catch (error) {
        console.error("Simulation step failed:", error);
        return { success: false, error: String(error) };
    }
}

export async function clearAllBotVotes() {
    console.log("[actions/admin] clearAllBotVotes: Starting action...");
    try {
        const result = await clearBotVotes();
        console.log("[actions/admin] clearAllBotVotes: result from bot-manager:", result);

        revalidatePath('/', 'layout');

        return {
            success: true,
            deleted: result.deleted ?? 0,
            status: `DB verified: ${result.deleted} cleared.`,
            error: result.errors.length > 0 ? String(result.errors[0]) : null
        };
    } catch (error) {
        console.error("[actions/admin] clearAllBotVotes: Failed with error:", error);
        return { success: false, error: String(error) };
    }
}
