import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getAccessories } from "@/lib/accessories";
import { deleteAccessoryAction } from "./actions";
import BackToEstoqueButton from "@/components/BackToEstoqueButton";

export default async function AcessoriosPage() {
  await requireUser();
  const accessories = await getAccessories();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-black">Acessórios</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/acessorios/novo" className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm">
              Novo acessório
            </Link>
            <BackToEstoqueButton />
          </div>
        </div>

        {accessories.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum acessório cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {accessories.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white">
                <span className="font-semibold text-brand-black">{a.name}</span>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/acessorios/${a.id}/editar`} className="text-sm text-brand-red font-semibold hover:underline">
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteAccessoryAction(a.id);
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
