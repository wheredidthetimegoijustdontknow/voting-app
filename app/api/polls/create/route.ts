import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question_text, choices } = await request.json()

    // Validate input
    if (!question_text || !choices || choices.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 choices are required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to create a poll' },
        { status: 401 }
      )
    }

    // ⚠️ BEGINNER MISTAKE: Not validating data before inserting
    // Always validate user input on the server before database operations.
    // We validate above to prevent SQL injection and malformed data.

    // Insert poll into database
    // RLS will automatically set user_id to the authenticated user's ID
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question_text: question_text.trim(),
        user_id: user.id,
      })
      .select('id')
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    if (!poll) {
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    // Insert choices for the poll
    const choicesPayload = choices.map((choice: string) => ({
      poll_id: poll.id,
      choice: choice.trim(),
    }))

    console.log('Inserting choices:', choicesPayload)

    const { data: insertedChoices, error: choicesError } = await supabase
      .from('polls_choices')
      .insert(choicesPayload)
      .select()

    console.log('Choices insert response:', { data: insertedChoices, error: choicesError })

    if (choicesError) {
      console.error('Error creating choices:', choicesError)
      return NextResponse.json(
        { error: `Failed to create poll choices: ${choicesError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        poll_id: poll.id,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Unexpected error in /api/polls/create:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}