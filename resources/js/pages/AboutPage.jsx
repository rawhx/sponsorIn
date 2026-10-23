export default function AboutPage({ name }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-[#1b1b18]">
      <h1 className="text-3xl font-medium">About — {name}</h1>
      <p className="mt-2 text-sm text-[#706f6c]">Inertia page loaded client-side.</p>
    </div>
  );
}
