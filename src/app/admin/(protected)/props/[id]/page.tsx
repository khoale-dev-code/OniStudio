import { RentalAssetAdminEditor } from "@/components/admin/rental-asset-admin";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <RentalAssetAdminEditor assetType="prop" id={id} />; }
