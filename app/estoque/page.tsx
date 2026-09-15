import { getVehicles } from "@/lib/vehicles-data";
import EstoqueFilters from "@/components/EstoqueFilters";

export default async function EstoquePage() {
  const vehicles = await getVehicles();
  return <EstoqueFilters vehicles={vehicles} />;
}
