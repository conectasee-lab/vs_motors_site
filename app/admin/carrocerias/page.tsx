import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBodyTypes } from "@/lib/body-types";
import { deleteBodyTypeAction } from "./actions";

export default async function CarroceriasPage() {
  await requireUser();
  const bodyTypes = await getBodyTypes();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-black">Carrocerias</h1>
          <Link href="/admin/carrocerias/novo" className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm">
            Nova carroceria
          </Link>
        </div>

        {bodyTypes.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma carroceria cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {bodyTypes.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white">
                <span className="font-semibold text-brand-black">{b.name}</span>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/carrocerias/${b.id}/editar`} className="text-sm text-brand-red font-semibold hover:underline">
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteBodyTypeAction(b.id);
                    }}
                  >
                    <button type="submit" className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                      Excluir
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
