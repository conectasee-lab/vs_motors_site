"use client";

import { useState } from "react";
import { trackMetaEvent } from "@/components/MetaPixel";

const OPTIONS = [
  {
    value: "Venda na hora",
    title: "Venda na hora",
    text: "Compramos o seu carro e pagamos à vista.",
  },
  {
    value: "Troco na troca",
    title: "Troco na troca",
    text: "Troque por outro de maior ou menor valor. Se for menor, você sai com a diferença em dinheiro.",
  },
  {
    value: "Consignação",
    title: "Consignação",
    text: "Anunciamos nos principais portais e repassamos as propostas. Vendido, você recebe à vista.",
  },
];

const inputClass =
  "w-full bg-white text-brand-black border border-gray-300 rounded-lg px-3.5 py-3 placeholder:text-gray-400 focus:border-brand-red focus:outline-2 focus:outline-offset-0 focus:outline-brand-red/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-brand-black mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function SellCarForm({ phone }: { phone: string }) {
  const [href, setHref] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const lines = [
      "Olá! Quero uma avaliação do meu carro.",
      "",
      `Como quero vender: ${get("option")}`,
      `Veículo: ${get("brand")} ${get("model")} ${get("year")}`,
      `Quilometragem: ${get("km")} km`,
      `Nome: ${get("name")}`,
      `WhatsApp: ${get("phone")}`,
    ];
    if (get("notes")) lines.push(`Observações: ${get("notes")}`);

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
    setHref(url);
    trackMetaEvent("Lead", { content_name: "Venda seu carro", content_category: get("option") });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (href) {
    return (
      <div className="py-6" role="status">
        <h3 className="text-2xl font-bold text-brand-black mb-2">Falta só enviar no WhatsApp</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Abrimos a conversa com os dados do seu carro já escritos. Toque em enviar e responderemos com a avaliação.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-whatsapp text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-whatsapp"
          >
            Abrir WhatsApp de novo
          </a>
          <button
            type="button"
            onClick={() => setHref(null)}
            className="text-sm font-semibold text-brand-red hover:text-red-700 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            Corrigir os dados
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <fieldset>
        <legend className="text-lg font-bold text-brand-black mb-3">Como você quer vender?</legend>
        <div className="grid gap-3">
          {OPTIONS.map((o, i) => (
            <label key={o.value} className="block cursor-pointer">
              <input type="radio" name="option" value={o.value} defaultChecked={i === 0} className="peer sr-only" />
              <div className="rounded-lg border border-gray-300 bg-white px-4 py-3.5 transition-colors peer-checked:border-brand-red peer-checked:bg-red-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-red">
                <p className="font-bold text-brand-black">{o.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{o.text}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-bold text-brand-black mb-3">Sobre o carro</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marca">
            <input required name="brand" autoComplete="off" placeholder="Ex.: Volkswagen" className={inputClass} />
          </Field>
          <Field label="Modelo">
            <input required name="model" autoComplete="off" placeholder="Ex.: Gol 1.0" className={inputClass} />
          </Field>
          <Field label="Ano">
            <input required name="year" type="number" inputMode="numeric" min={1980} max={new Date().getFullYear() + 1} placeholder="Ex.: 2018" className={inputClass} />
          </Field>
          <Field label="Quilometragem">
            <input required name="km" type="number" inputMode="numeric" min={0} placeholder="Ex.: 68000" className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-bold text-brand-black mb-3">Seus dados</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <input required name="name" autoComplete="name" className={inputClass} />
          </Field>
          <Field label="WhatsApp">
            <input required name="phone" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Observações (opcional)">
              <textarea name="notes" rows={3} placeholder="Estado do carro, revisões, financiamento em aberto…" className={inputClass} />
            </Field>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full sm:w-auto bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
      >
        Pedir avaliação no WhatsApp
      </button>
    </form>
  );
}
