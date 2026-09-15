export default function Footer() {
  return (
    <footer className="bg-brand-black-soft border-t border-brand-gold/30 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3 text-sm text-gray-300">
        <div>
          <p className="text-brand-red font-bold mb-2">VS MOTORS</p>
          <p>Qualidade e confiança na hora de comprar seu carro.</p>
        </div>
        <div>
          <p className="text-brand-gold font-semibold mb-2">Contato</p>
          <p>Telefone: (00) 0000-0000</p>
          <p>WhatsApp: (00) 90000-0000</p>
          <p>contato@vsmotors.com.br</p>
        </div>
        <div>
          <p className="text-brand-gold font-semibold mb-2">Endereço</p>
          <p>Av. Quatorze de Dezembro, 1300</p>
          <p>Vila Mafalda, Jundiaí - SP, 13206-105</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 py-5">
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} VS Motors. Todos os direitos reservados.
        </p>
        <span className="text-gray-700">·</span>
        <a href="/login" className="text-xs text-gray-600 hover:text-gray-400">
          Área restrita
        </a>
      </div>
    </footer>
  );
}
