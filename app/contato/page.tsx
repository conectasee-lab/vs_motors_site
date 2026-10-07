import type { Metadata } from "next";
import { getCompanyContact, whatsappDigits } from "@/lib/company-contact";
import TrackedLink from "@/components/TrackedLink";
import CopyEmailButton from "@/components/CopyEmailButton";
import { StoreHoursList, StoreStatusBadge } from "@/components/StoreStatus";

export const metadata: Metadata = {
  title: "Contato | VS Motors, carros seminovos em Jundiaí",
  description:
    "Fale com a VS Motors pelo WhatsApp, veja o endereço, os horários de atendimento e como chegar à loja em Jundiaí.",
};

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value;
}

const linkFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded";

export default async function ContatoPage() {
  const contact = await getCompanyContact();
  const phone = whatsappDigits(contact.whatsapp);
  const whatsappHref = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Olá! Gostaria de mais informações sobre os veículos da VS Motors."
  )}`;
  const addressQuery = encodeURIComponent(contact.address);

  return (
    <div className="font-sans w-full bg-[#eceef0]">
      <section className="relative flex items-end min-h-[700px] px-4 pt-24 pb-12 overflow-hidden bg-brand-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-04.png')",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.7) 45%, rgba(10,10,10,0.35) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="relative w-full max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-2xl mx-auto mb-3">
            Carros Seminovos e Usados em Jundiaí.
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-6">
            As Melhores Ofertas de Agência de Veículos com Entrada Facilitada.
            Encontre Seu Carro Seminovo em Jundiaí com Condições Exclusivas.
          </p>
          <div className="[&>p]:justify-center">
            <StoreStatusBadge />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
        <div className="bg-white rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loja_de_veiculo_em_jundiai_automoveis_jundiai_varzea_paulista_itupeva_itu_campo_limpo_paulista_cabreva_itatiba_vinhedo_carros_vs_motors_10.png"
            alt="Fachada da loja VS Motors em Jundiaí"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 md:p-8 space-y-8">
          <div>
            <TrackedLink
              href={whatsappHref}
              metaEvent="Contact"
              metaParams={{ content_name: "Página de contato" }}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              Chamar no WhatsApp
            </TrackedLink>
            <p className="mt-3 text-2xl font-bold text-brand-black tabular-nums">{formatPhone(contact.whatsapp)}</p>
          </div>

          <div>
            <h2 className="font-bold text-brand-black mb-1">E-mail</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a href={`mailto:${contact.email}`} className={`text-gray-700 hover:text-brand-red break-all ${linkFocus}`}>
                {contact.email}
              </a>
              <CopyEmailButton email={contact.email} />
            </div>
          </div>

          <div>
            <h2 className="font-bold text-brand-black mb-1">Endereço</h2>
            <p className="text-gray-700 mb-2">{contact.address}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-semibold text-brand-red hover:text-red-700 ${linkFocus}`}
            >
              Abrir rota no Google Maps
            </a>
          </div>

          <div>
            <h2 className="font-bold text-brand-black mb-2">Horários</h2>
            <StoreHoursList />
          </div>

          {(contact.instagramUrl || contact.facebookUrl) && (
            <div>
              <h2 className="font-bold text-brand-black mb-1">Redes sociais</h2>
              <div className="flex gap-5">
                {contact.instagramUrl && (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-700 hover:text-brand-red ${linkFocus}`}
                  >
                    Instagram
                  </a>
                )}
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-700 hover:text-brand-red ${linkFocus}`}
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-white lg:sticky lg:top-24">
          <iframe
            title="Localização da VS Motors"
            src={`https://www.google.com/maps?q=${addressQuery}&output=embed`}
            className="w-full h-[360px] lg:h-[560px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
