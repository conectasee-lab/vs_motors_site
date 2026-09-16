"use client";

import { useActionState } from "react";
import { updateCompanyContactAction } from "./actions";
import type { CompanyContact } from "@/lib/company-contact";

type State = { error: string | null; success: boolean };

export default function ContatoForm({ contact }: { contact: CompanyContact }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateCompanyContactAction(formData),
    { error: null, success: false }
  );

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
        <input
          name="whatsapp"
          defaultValue={contact.whatsapp}
          placeholder="(11) 96019-7007"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
        <input
          name="email"
          type="email"
          defaultValue={contact.email}
          placeholder="contato@vsmotors.com.br"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
        <textarea
          name="address"
          defaultValue={contact.address}
          placeholder="Av. Quatorze de Dezembro, 1300 - Vila Mafalda, Jundiaí - SP"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Dados de contato atualizados.</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 bg-brand-red text-white font-semibold rounded-lg disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
