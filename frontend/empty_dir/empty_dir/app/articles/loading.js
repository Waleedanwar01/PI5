export default function Loading() {
  const skeletonCard = (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-100" />
      <div className="p-5">
        <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
        <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
        <div className="h-5 w-2/3 bg-gray-100 rounded mb-4" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <div className="h-7 w-56 bg-gray-100 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-[36rem] max-w-full bg-gray-100 rounded mx-auto animate-pulse" />
        </div>

        <div className="mt-6 mb-8 flex flex-wrap items-center gap-2.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i}>{skeletonCard}</div>
          ))}
        </div>
      </div>
    </main>
  );
}