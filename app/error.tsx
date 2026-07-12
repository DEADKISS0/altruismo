"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-pitch flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="font-heading text-6xl text-ember">Error</h1>
        <p className="text-xl text-ash max-w-md">Algo salió mal. Intenta de nuevo.</p>
        <button
          onClick={reset}
          className="inline-block px-8 py-3 bg-ember text-parchment rounded-lg font-medium hover:bg-ember/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
