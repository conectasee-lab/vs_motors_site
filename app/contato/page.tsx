export default function ContatoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Contato</h1>
      <div className="space-y-2 text-gray-300 mb-8">
        <p><span className="text-brand-gold">Telefone:</span> (00) 0000-0000</p>
        <p><span className="text-brand-gold">WhatsApp:</span> (00) 90000-0000</p>
        <p><span className="text-brand-gold">E-mail:</span> contato@vsmotors.com.br</p>
        <p><span className="text-brand-gold">Endereço:</span> Av. Exemplo, 1000 — Centro, Cidade - UF, 00000-000</p>
        <p><span className="text-brand-gold">Horário:</span> Segunda a sábado, 9h às 18h</p>
      </div>
      <div className="w-full h-64 bg-brand-black-soft border border-brand-gold/20 rounded-lg flex items-center justify-center text-gray-500">
        Mapa (placeholder)
      </div>
    </div>
  );
}
