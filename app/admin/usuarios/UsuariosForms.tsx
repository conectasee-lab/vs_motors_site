"use client";

import { useActionState } from "react";
import { createEmployeeAction, resetPasswordAction } from "./actions";

type State = { error: string | null };
type UserRow = { id: string; email: string };

export default function UsuariosForms({ users }: { users: UserRow[] }) {
  const [createState, createFormAction, createPending] = useActionState<State, FormData>(
    async (_prev, formData) => createEmployeeAction(formData),
    { error: null }
  );
  const [resetState, resetFormAction, resetPending] = useActionState<State, FormData>(
    async (_prev, formData) => resetPasswordAction(formData),
    { error: null }
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-bold text-brand-black mb-3">Novo funcionário</h2>
        <form action={createFormAction} className="space-y-3 max-w-sm">
          <input name="email" type="email" placeholder="E-mail" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
          <input name="password" type="password" placeholder="Senha inicial" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
          {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
          <button type="submit" disabled={createPending} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm disabled:opacity-60">
            {createPending ? "Criando..." : "Criar funcionário"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-bold text-brand-black mb-3">Redefinir senha</h2>
        <form action={resetFormAction} className="space-y-3 max-w-sm">
          <select name="userId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="">Selecione um funcionário</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
          <input name="password" type="password" placeholder="Nova senha" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
          {resetState.error && <p className="text-sm text-red-600">{resetState.error}</p>}
          <button type="submit" disabled={resetPending} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm disabled:opacity-60">
            {resetPending ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
