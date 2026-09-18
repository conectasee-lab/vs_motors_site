import { requireUser } from "@/lib/auth";
import { getCompanyContact } from "@/lib/company-contact";
import ContatoForm from "./ContatoForm";
import DashboardLinkButton from "@/components/DashboardLinkButton";

export default async function AdminContatoPage() {
  await requireUser();
  const contact = await getCompanyContact();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-black">Dados de contato</h1>
          <DashboardLinkButton />
        </div>
        <ContatoForm contact={contact} />
      </div>
    </div>
  );
}
