import { requireUser } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import UsuariosForms from "./UsuariosForms";

export default async function UsuariosPage() {
  await requireUser();

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.auth.admin.listUsers();
  const users = data.users.map((u) => ({ id: u.id, email: u.email ?? "" }));

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Gerenciar usuários</h1>
        <UsuariosForms users={users} />
      </div>
    </div>
  );
}
