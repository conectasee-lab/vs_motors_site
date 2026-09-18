import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import DashboardLinkButton from "@/components/DashboardLinkButton";

export default function EmployeeBar() {
  return (
    <div className="bg-brand-black border border-brand-gold/20 rounded-lg px-4 py-3 mb-6 flex flex-wrap items-center gap-3">
      <Link
        href="/estoque/novo"
        className="text-sm font-semibold text-brand-black bg-brand-gold px-4 py-2 rounded hover:bg-brand-gold/80 transition-colors"
      >
        Cadastrar veículo
      </Link>
      <DashboardLinkButton />
      <Link
        href="/admin/usuarios"
        className="text-sm font-semibold text-white border border-brand-gold/40 px-4 py-2 rounded hover:bg-brand-black-soft transition-colors"
      >
        Gerenciar usuários
      </Link>
      <Link
        href="/admin/marcas"
        className="text-sm font-semibold text-white border border-brand-gold/40 px-4 py-2 rounded hover:bg-brand-black-soft transition-colors"
      >
        Gerenciar marcas
      </Link>
      <Link
        href="/admin/contato"
        className="text-sm font-semibold text-white border border-brand-gold/40 px-4 py-2 rounded hover:bg-brand-black-soft transition-colors"
      >
        Gerenciar contato
      </Link>
      <Link
        href="/admin/acessorios"
        className="text-sm font-semibold text-white border border-brand-gold/40 px-4 py-2 rounded hover:bg-brand-black-soft transition-colors"
      >
        Gerenciar acessórios
      </Link>
      <Link
        href="/admin/carrocerias"
        className="text-sm font-semibold text-white border border-brand-gold/40 px-4 py-2 rounded hover:bg-brand-black-soft transition-colors"
      >
        Gerenciar carrocerias
      </Link>
      <form action={logoutAction} className="ml-auto">
        <button
          type="submit"
          className="text-sm font-semibold text-brand-red hover:underline"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
