import { RentalAssetAdminList } from "@/components/admin/rental-asset-admin";
export default function Page({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) { return <RentalAssetAdminList assetType="backdrop" searchParams={searchParams} />; }
