import { getCompanyContact } from "@/lib/company-contact";

export default async function SocialAndMap() {
  const contact = await getCompanyContact();

  return (
    <div className="bg-white py-12 px-4 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        {(contact.instagramUrl || contact.facebookUrl) && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-brand-black mb-4 text-center">Nossas redes sociais</h2>
            <div className="flex items-center justify-center gap-3">
              {contact.instagramUrl && (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: "radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                  </svg>
                </a>
              )}
              {contact.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-12 h-12 flex items-center justify-center rounded-full shrink-0 bg-[#1877F2] shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md hover:-translate-y-0.5"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M14 9h2.5V6H14c-1.9 0-3.5 1.6-3.5 3.5V11H8v3h2.5v6h3v-6h2.5l.5-3h-3V9.8c0-.5.3-.8.5-.8Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-brand-black mb-4 text-center">Onde estamos</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              title="Localização da VS Motors"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
              className="w-full h-72 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
