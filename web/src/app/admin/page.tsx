import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32">
        <h2 className="text-2xl font-semibold text-white">
          Panel de Administración
        </h2>
        <p className="text-zinc-400">
          Iniciá sesión para acceder al panel de control.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">
        Bienvenido al Panel de Control
      </h2>
      <p className="mt-4 text-zinc-400">
        Desde acá vas a poder gestionar productos, pedidos y más.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-surface p-6">
          <h3 className="font-semibold text-zinc-200">📦 Productos</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Gestioná el catálogo de perfumes
          </p>
        </div>
        <div className="card-surface p-6">
          <h3 className="font-semibold text-zinc-200">📊 Estadísticas</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Métricas y reportes de ventas
          </p>
        </div>
        <div className="card-surface p-6">
          <h3 className="font-semibold text-zinc-200">⚙️ Configuración</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Ajustes de la tienda
          </p>
        </div>
      </div>
    </div>
  );
}
