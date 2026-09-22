"use client";

import { useActionState } from "react";
import { createEmployeeAction, resetPasswordAction, updateUserEmailAction, deleteUserAction } from "./actions";
import BackToEstoqueButton from "@/components/BackToEstoqueButton";

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
  const [editState, editFormAction, editPending] = useActionState<State, FormData>(
    async (_prev, formData) => updateUserEmailAction(formData),
    { error: null }
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState<State, FormData>(
    async (_prev, formData) => deleteUserAction(formData),
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
          <div className="flex items-center gap-3">
            <button type="submit" disabled={resetPending} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm disabled:opacity-60">
              {resetPending ? "Salvando..." : "Redefinir senha"}
            </button>
            <BackToEstoqueButton />
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-bold text-brand-black mb-3">Editar usuário</h2>
        <form action={editFormAction} className="space-y-3 max-w-sm">
          <select name="userId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="">Selecione um funcionário</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
          <input name="email" type="email" placeholder="Novo e-mail" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
          {editState.error && <p className="text-sm text-red-600">{editState.error}</p>}
          <button type="submit" disabled={editPending} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm disabled:opacity-60">
            {editPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-bold text-brand-black mb-3">Excluir usuário</h2>
        <form
          action={deleteFormAction}
          onSubmit={(e) => {
            const form = e.currentTarget;
            const select = form.elements.namedItem("userId") as HTMLSelectElement;
            const label = select?.selectedOptions[0]?.text ?? "este usuário";
            if (!confirm(`Tem certeza que deseja excluir ${label}? Esta ação não pode ser desfeita.`)) {
              e.preventDefault();
            }
          }}
          className="space-y-3 max-w-sm"
        >
          <select name="userId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="">Selecione um funcionário</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
          {deleteState.error && <p className="text-sm text-red-600">{deleteState.error}</p>}
          <button type="submit" disabled={deletePending} className="px-4 py-2 bg-red-700 text-white font-semibold rounded-lg text-sm disabled:opacity-60">
            {deletePending ? "Excluindo..." : "Excluir usuário"}
          </button>
        </form>
      </section>
    </div>
  );
}
