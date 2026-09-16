import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAccessoryById } from "@/lib/accessories";
import EditarAcessorioForm from "./EditarAcessorioForm";

export default async function EditarAcessorioPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const accessory = await getAccessoryById(id);
  if (!accessory) notFound();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Editar acessório</h1>
        <EditarAcessorioForm accessory={accessory} />
      </div>
    </div>
  );
}
