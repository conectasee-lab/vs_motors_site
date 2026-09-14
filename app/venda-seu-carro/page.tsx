"use client";

import { useState } from "react";

export default function VendaSeuCarroPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Venda seu Carro</h1>
      <p className="text-gray-400 mb-8">
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
          <input required placeholder="Marca" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required placeholder="Modelo" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required type="number" placeholder="Ano" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required placeholder="Seu nome" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required placeholder="Telefone / WhatsApp" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <textarea placeholder="Observações (opcional)" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" rows={4} />
          <button
            type="submit"
            className="bg-brand-red text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
