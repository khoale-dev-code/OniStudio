import {
  RentalAssetDetailPage,
  rentalAssetMetadata,
} from "@/components/catalog/rental-asset-detail-page";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return rentalAssetMetadata({
    mode: "prop",
    slug,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return (
    <RentalAssetDetailPage
      mode="prop"
      slug={slug}
    />
  );
}
