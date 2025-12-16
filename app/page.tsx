import AuthButton from '@/components/auth/AuthButton';
import { fetchPollsWithResults } from '@/lib/polls/queries';

export default async function Home() {
  const polls = await fetchPollsWithResults();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Real-time Voting App
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Create and vote on polls in real-time
            </p>
          </div>
          <AuthButton />
        </div>

        {/* Polls List */}
        <div className="space-y-4">
          {polls.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">
                No polls yet. Sign in to create one!
              </p>
            </div>
          ) : (
            polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {poll.question_text}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {poll.total_votes} votes • {poll.creator_email}
                </p>

                {/* Vote Results */}
                <div className="space-y-3">
                  {poll.results.map((result) => (
                    <div key={result.choice}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">
                          {result.choice}
                        </span>
                        <span className="text-gray-600">
                          {result.count} ({result.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* User Vote Status */}
                {poll.user_has_voted && (
                  <p className="text-sm text-green-600 mt-4 font-medium">
                    ✓ You voted for: {poll.user_vote_choice}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Debug Info */}
        <details className="mt-8 p-4 bg-gray-200 rounded">
          <summary className="cursor-pointer font-semibold text-gray-700">
            Debug: Raw Polls Data
          </summary>
          <pre className="mt-4 text-xs overflow-auto bg-gray-100 p-2 rounded">
            {JSON.stringify(polls, null, 2)}
          </pre>
        </details>
      </div>
    </main>
  );
}