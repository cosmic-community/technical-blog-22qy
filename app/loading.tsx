export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
      <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-10" />
      <div className="h-64 w-full bg-gray-100 dark:bg-gray-900 rounded-xl mb-10" />
      <div className="space-y-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-900 rounded-lg" />
        ))}
      </div>
    </div>
  );
}