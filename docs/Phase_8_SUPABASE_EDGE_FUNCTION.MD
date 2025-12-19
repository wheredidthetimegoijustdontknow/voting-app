# SUPABASE EDGE FUNCTION: Nightly Archetype Update

**File Location:** `supabase/functions/update-voter-archetypes/index.ts`

-- TS START --
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Bypasses RLS
);

serve(async (req) => {
  try {
    // 1. Fetch all profiles that have voted recently
    const { data: profiles, error: pError } = await supabaseAdmin
      .from("profiles")
      .select("id, username");

    if (pError) throw pError;

    for (const profile of profiles) {
      // 2. Fetch last 50 votes for analysis
      const { data: votes, error: vError } = await supabaseAdmin
        .from("votes")
        .select(`
          created_at,
          polls (created_at, accent_color)
        `)
        .eq("user_id", profile.id)
        .limit(50);

      if (vError || !votes.length) continue;

      // 3. Calculate Stats
      let totalDelay = 0;
      const hourCounts: Record<number, number> = {};

      votes.forEach((v: any) => {
        const voteDate = new Date(v.created_at);
        const pollDate = new Date(v.polls.created_at);
        
        // Delay in minutes
        totalDelay += (voteDate.getTime() - pollDate.getTime()) / 60000;
        
        // Track hour of day
        const hour = voteDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const avgDelay = totalDelay / votes.length;
      const mostActiveHour = parseInt(
        Object.keys(hourCounts).reduce((a, b) => 
          hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
        )
      );

      // 4. Determine Archetype
      let archetype = "The Trendsetter";
      if (avgDelay < 10) archetype = "The Early Bird";
      else if (mostActiveHour >= 0 && mostActiveHour <= 5) archetype = "The Night Owl";

      // 5. Update Profile
      await supabaseAdmin
        .from("profiles")
        .update({ bio: `Voter Archetype: ${archetype}` }) // Or a dedicated 'title' column
        .eq("id", profile.id);
    }

    return new Response(JSON.stringify({ message: "Archetypes Updated" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
-- TS END --