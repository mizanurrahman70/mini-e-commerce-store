"use client";

// Root error boundary. Catches unexpected errors thrown in any page/layout
// below the root layout and shows a friendly fallback instead of a stack trace.
// Because the root layout and Header/Footer render fine, we can keep the app
// shell and just replace the main content.

export default function RootErrorBoundary({
  error: _error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        An unexpected error occurred. You can try again — if it keeps happening,
        please contact support.
      </p>
      <button
        onClick={retry}
        className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  );
}
