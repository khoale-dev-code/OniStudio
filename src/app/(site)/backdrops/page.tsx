import { RentalAssetPublicPage } from "@/components/catalog/rental-asset-page";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() { return pageMetadata({ vi: "Phông màu", en: "Color backdrops" }, { vi: "Phông màu tại Oni Studio, ví dụ Apple / 512, kèm hình ảnh và mức phí rõ ràng.", en: "Color backdrops at Oni Studio, including names such as Apple / 512, with images and clear pricing." }, "/backdrops"); }
export default function Page() { return <RentalAssetPublicPage mode="color" />; }
