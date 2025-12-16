import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { poll_id, choice } = body;

    // Validate input
    if (!poll_id || !choice) {
      return NextResponse.json(
        { error: 'Missing poll_id or choice' },
        { status: 400 }
      );
    }

    // Create Supabase client and get authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to vote' },
        { status: 401 }
      );
    }

    // Verify poll exists
    const { data: pollExists, error: pollError } = await supabase
      .from('polls')
      .select('id')
      .eq('id', poll_id)
      .single();

    if (pollError || !pollExists) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Verify choice is valid for this poll
    const { data: validChoice, error: choiceError } = await supabase
      .from('polls_choices')
      .select('choice')
      .eq('poll_id', poll_id)
      .eq('choice', choice)
      .single();

    if (choiceError || !validChoice) {
      return NextResponse.json(
        { error: 'Invalid choice for this poll' },
        { status: 400 }
      );
    }

    // Check if user already voted (belt + suspenders with DB constraint)
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', poll_id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 409 }
      );
    }

    // Insert vote (RLS will automatically set user_id)
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        poll_id: poll_id,
        choice: choice,
        user_id: user.id, // Explicit for clarity, RLS enforces this
      });

    if (insertError) {
      console.error('Vote insertion error:', insertError);
      
      // Check if it's a duplicate vote error from the unique constraint
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted on this poll' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully',
    });

  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}