"use client";

// Global error boundary. Wraps the ENTIRE app (including the root layout), so
// unlike error.tsx it renders its own <html>/<body>. Only used for unexpected
// failures that escape all other boundaries.

export default function GlobalError({
  error: _error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827" }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
              An unexpected error occurred. Please try again or refresh the page.
            </p>
            <button
              onClick={retry}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.25rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
