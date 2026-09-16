import { getVehicles } from "@/lib/vehicles-data";
import { getBrands } from "@/lib/brands";
import { getBodyTypes } from "@/lib/body-types";
import { getAccessories } from "@/lib/accessories";
import { getSessionUser } from "@/lib/auth";
import EstoqueFilters from "@/components/EstoqueFilters";

export default async function EstoquePage() {
  const [vehicles, brands, bodyTypes, accessories, user] = await Promise.all([
    getVehicles(),
    getBrands(),
    getBodyTypes(),
    getAccessories(),
    getSessionUser(),
  ]);
  return (
    <EstoqueFilters
      vehicles={vehicles}
      brands={brands}
      bodyTypes={bodyTypes}
      accessories={accessories}
      isLoggedIn={!!user}
    />
  );
}
