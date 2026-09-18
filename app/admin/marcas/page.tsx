import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { getBrands } from "@/lib/brands";
import { deleteBrandAction } from "./actions";
import BackToEstoqueButton from "@/components/BackToEstoqueButton";

export default async function MarcasPage() {
  await requireUser();
  const brands = await getBrands();

  return (
    <div className="min-h-screen w-full bg-gray-50">
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Marcas</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/marcas/nova" className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm">
            Nova marca
          </Link>
          <BackToEstoqueButton />
        </div>
      </div>

      {brands.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma marca cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {brands.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                {b.logoUrl ? (
                  <Image src={b.logoUrl} alt={b.name} width={32} height={32} className="object-contain" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gray-100" />
                )}
                <span className="font-semibold text-brand-black">{b.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/marcas/${b.id}/editar`} className="text-sm text-brand-red font-semibold hover:underline">
                  Editar
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteBrandAction(b.id);
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
