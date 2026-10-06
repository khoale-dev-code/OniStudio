import { RentalAssetPublicPage } from "@/components/catalog/rental-asset-page";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() { return pageMetadata({ vi: "Phông màu hiệu ứng", en: "Effect backdrops" }, { vi: "Phông màu hiệu ứng tại Oni Studio với hình ảnh và mức phí rõ ràng.", en: "Effect backdrops at Oni Studio with images and clear pricing." }, "/effect-backdrops"); }
export default function Page() { return <RentalAssetPublicPage mode="effect" />; }
