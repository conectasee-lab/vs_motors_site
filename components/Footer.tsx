import { getCompanyContact } from "@/lib/company-contact";

export default async function Footer() {
  const contact = await getCompanyContact();

  return (
    <footer className="bg-brand-black mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3 text-sm text-gray-400">
        <div>
          <p className="text-brand-red font-semibold text-lg mb-3">VS Motors</p>
          <p className="leading-relaxed">Qualidade e confiança na hora de comprar seu carro.
            Atendemos Jundiaí, Várzea Paulista, Campo Limpo Paulista, Itupeva, Louveira e Cabreúva.
          </p>
        </div>
        <div>
          <p className="text-brand-red font-semibold text-lg mb-3">Contato</p>
          <p className="leading-relaxed">WhatsApp: {contact.whatsapp}</p>
          <p className="leading-relaxed">{contact.email}</p>
        </div>
        <div>
          <p className="text-brand-red font-semibold text-lg mb-3">Endereço</p>
          <p className="leading-relaxed">{contact.address}</p>
        </div>
      </div>
      <div className="border-t border-white/10 flex items-center justify-center gap-3 py-5">
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} VS Motors. Todos os direitos reservados.
        </p>
        <span className="text-gray-700">·</span>
        <a href="/login" className="text-xs text-gray-600 hover:text-gray-400">
          Área restrita
        </a>
        <span className="text-gray-700">·</span>
           <a href="https://geeo4.com.br/" className="text-xs text-gray-600 hover:text-gray-400">
          Desenvolvido por GEEO4
        </a>
      </div>
    </footer>
  );
}
