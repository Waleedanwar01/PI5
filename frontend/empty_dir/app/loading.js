export default function Loading() {
  return (
    <main className="bg-white flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    </main>
  );
}