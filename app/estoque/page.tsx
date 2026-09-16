import { getVehicles } from "@/lib/vehicles-data";
import { getBrands } from "@/lib/brands";
import { getSessionUser } from "@/lib/auth";
import EstoqueFilters from "@/components/EstoqueFilters";

export default async function EstoquePage() {
  const [vehicles, brands, user] = await Promise.all([getVehicles(), getBrands(), getSessionUser()]);
  return <EstoqueFilters vehicles={vehicles} brands={brands} isLoggedIn={!!user} />;
}
