import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pitch flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="font-heading text-8xl text-ember">404</h1>
        <p className="text-xl text-ash max-w-md">Esta página no existe o fue movida.</p>
        <Link
          href="/es"
          className="inline-block px-8 py-3 bg-ember text-parchment rounded-lg font-medium hover:bg-ember/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
