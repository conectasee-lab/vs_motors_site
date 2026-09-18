import { requireUser } from "@/lib/auth";
import { getCompanyContact } from "@/lib/company-contact";
import ContatoForm from "./ContatoForm";

export default async function AdminContatoPage() {
  await requireUser();
  const contact = await getCompanyContact();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Dados de contato</h1>
        <ContatoForm contact={contact} />
      </div>
    </div>
  );
}
