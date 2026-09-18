"use client";

import { useState } from "react";

export default function VendaSeuCarroPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <section className="relative h-[700px] flex items-center pt-16 pb-28 px-4 overflow-hidden bg-brand-black">
        {/* Hero background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-02.png')" }}
          aria-hidden="true"
        />
        {/* Dark overlay for text legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.45) 55%, rgba(10,10,10,0.15) 75%, rgba(10,10,10,0.05) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
            O carro certo, revisado e pronto para rodar
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
            Em Jundiaí, cada veículo passa por inspeção antes de chegar até você.
            Negocie direto pelo WhatsApp, sem enrolação.
          </p>
        </div>
      </section>
      <div className="max-w-xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-brand-black mb-2">Venda seu Carro</h2>
        <p className="text-gray-600 mb-8">
          Preencha os dados abaixo e nossa equipe entrará em contato para
          avaliar seu veículo.
        </p>

        {submitted ? (
          <p className="text-brand-gold">
            Obrigado! Recebemos seus dados (formulário de demonstração — envio
            real será conectado em uma fase futura).
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input required placeholder="Marca" className="w-full bg-white text-brand-black border border-gray-300 rounded px-3 py-2" />
            <input required placeholder="Modelo" className="w-full bg-white text-brand-black border border-gray-300 rounded px-3 py-2" />
            <input required type="number" placeholder="Ano" className="w-full bg-white text-brand-black border border-gray-300 rounded px-3 py-2" />
            <input required placeholder="Seu nome" className="w-full bg-white text-brand-black border border-gray-300 rounded px-3 py-2" />
            <input required placeholder="Telefone / WhatsApp" className="w-full bg-white text-brand-black border border-gray-300 rounded px-3 py-2" />
            <textarea placeholder="Observações (opcional)" className="w-full bg-white text-brand-black border border-gray-300 rounded px-3 py-2" rows={4} />
            <button
              type="submit"
              className="bg-brand-red text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
