import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBrandById } from "@/lib/brands";
import EditarMarcaForm from "./EditarMarcaForm";

export default async function EditarMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const brand = await getBrandById(id);
  if (!brand) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Editar marca</h1>
      <EditarMarcaForm brand={brand} />
    </div>
  );
}
