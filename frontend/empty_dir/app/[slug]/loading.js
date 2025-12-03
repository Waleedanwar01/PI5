export default function Loading() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="flex items-center gap-2 text-gray-600">
        <div className="h-5 w-5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}