import { getVehicles } from "@/lib/vehicles-data";
import { getSessionUser } from "@/lib/auth";
import EstoqueFilters from "@/components/EstoqueFilters";

export default async function EstoquePage() {
  const [vehicles, user] = await Promise.all([getVehicles(), getSessionUser()]);
  return <EstoqueFilters vehicles={vehicles} isLoggedIn={!!user} />;
}
