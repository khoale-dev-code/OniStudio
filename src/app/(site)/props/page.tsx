import { RentalAssetPublicPage } from "@/components/catalog/rental-asset-page";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() { return pageMetadata({ vi: "Đạo cụ", en: "Props" }, { vi: "Đạo cụ tại Oni Studio với hình ảnh và mức phí rõ ràng.", en: "Props at Oni Studio with images and clear pricing." }, "/props"); }
export default function Page() { return <RentalAssetPublicPage mode="prop" />; }
