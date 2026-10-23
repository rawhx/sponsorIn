import { Link } from '@inertiajs/react';

export default function HomePage({ name }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-[#1b1b18]">
      <h1 className="text-3xl font-medium">Welcome, {name}!</h1>
      <p className="mt-2 text-sm text-[#706f6c]">
        Inertia + React (Vite 7) is working. See the console for the page props.
      </p>
      <ul className="mt-4 text-sm text-[#706f6c]">
        <li>URL: /</li>
        <li>React app mounts via createInertiaApp</li>
        <li>Props resolved from the server</li>
      </ul>
      <Link
        href="/about"
        className="mt-6 inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18]"
      >
        Go to /about
      </Link>
    </div>
  );
}
