'use client';

interface UpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdate: Date;
  onRefresh: () => void;
  error?: string | null;
}

export default function UpdateIndicator({ isUpdating, lastUpdate, onRefresh, error }: UpdateIndicatorProps) {
  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        {error ? (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-600 font-medium">Error</span>
          </>
        ) : isUpdating ? (
          <>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-600 font-medium">Updating...</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600">Live</span>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <span className="text-red-500 text-xs">
          {error}
        </span>
      )}

      {/* Last Update Time */}
      <span className="text-gray-500">
        Updated {getTimeAgo()}
      </span>

      {/* Manual Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isUpdating}
        className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUpdating ? 'Refreshing...' : '🔄 Refresh'}
      </button>
    </div>
  );
}