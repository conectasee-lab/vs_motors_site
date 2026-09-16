import { requireUser } from "@/lib/auth";
import { getBrands } from "@/lib/brands";
import { getBodyTypes } from "@/lib/body-types";
import { getAccessories } from "@/lib/accessories";
import NovoVeiculoForm from "./NovoVeiculoForm";

export default async function NovoVeiculoPage() {
  await requireUser();
  const [brands, bodyTypes, accessories] = await Promise.all([getBrands(), getBodyTypes(), getAccessories()]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar veículo</h1>
        <NovoVeiculoForm brands={brands} bodyTypes={bodyTypes} accessories={accessories} />
      </div>
    </div>
  );
}
