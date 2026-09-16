import { requireUser } from "@/lib/auth";
import { getBrands } from "@/lib/brands";
import NovoVeiculoForm from "./NovoVeiculoForm";

export default async function NovoVeiculoPage() {
  await requireUser();
  const brands = await getBrands();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar veículo</h1>
        <NovoVeiculoForm brands={brands} />
      </div>
    </div>
  );
}
