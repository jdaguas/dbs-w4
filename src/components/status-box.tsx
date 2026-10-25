// Shared box for loading / nothing found / unavailable states.
export function StatusBox({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mt-4 rounded-2xl border px-5 py-4 text-sm ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-line bg-surface text-muted"
      }`}
    >
      {children}
    </p>
  );
}
