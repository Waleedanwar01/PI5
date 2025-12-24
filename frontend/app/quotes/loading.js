
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-5xl px-8 sm:px-12 lg:px-16">
        <div className="space-y-6">
          {/* Skeleton Items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/4 h-24 bg-gray-200 rounded"></div>
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
                <div className="w-full md:w-1/4 h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
