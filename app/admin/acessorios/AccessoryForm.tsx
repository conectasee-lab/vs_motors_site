"use client";

import type { Accessory } from "@/lib/accessories";

type Props = {
  action: (formData: FormData) => void;
  accessory?: Accessory;
  pending: boolean;
  error: string | null;
};

export default function AccessoryForm({ action, accessory, pending, error }: Props) {
  return (
    <form action={action} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
        <input
          name="name"
          defaultValue={accessory?.name}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
