import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBodyTypeById } from "@/lib/body-types";
import EditarCarroceriaForm from "./EditarCarroceriaForm";

export default async function EditarCarroceriaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const bodyType = await getBodyTypeById(id);
  if (!bodyType) notFound();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Editar carroceria</h1>
        <EditarCarroceriaForm bodyType={bodyType} />
      </div>
    </div>
  );
}
