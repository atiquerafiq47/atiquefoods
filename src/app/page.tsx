import { InventoryHome } from "@/components/dashboard/inventory-home";
import { getSiteName } from "@/lib/env";

export default function Home() {
  return <InventoryHome siteName={getSiteName()} />;
}
