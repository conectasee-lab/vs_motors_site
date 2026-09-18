"use client";

import type { Brand } from "@/lib/brands";
import BackToEstoqueButton from "@/components/BackToEstoqueButton";

type Props = {
  action: (formData: FormData) => void;
  brand?: Brand;
  pending: boolean;
  error: string | null;
};

export default function BrandForm({ action, brand, pending, error }: Props) {
  return (
    <form action={action} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
        <input
          name="name"
          defaultValue={brand?.name}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Logo {brand?.logoUrl ? "(deixe em branco para manter a atual)" : "(opcional)"}
        </label>
        {brand?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt={brand.name} className="w-16 h-16 object-contain mb-2 border border-gray-200 rounded" />
        )}
        <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm text-gray-700" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-brand-red text-white font-semibold rounded-lg disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <BackToEstoqueButton />
      </div>
    </form>
  );
}
