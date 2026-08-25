import campaignRedHeels from "@/assets/campaign-red-heels.png";
import campaignMirror from "@/assets/campaign-mirror.jpg";
import campaignWhite from "@/assets/campaign-white.jpg";
import storeInterior from "@/assets/store-interior.jpeg";
import flowerBurgundy from "@/assets/flower-burgundy.jpg";
import flowerLogo from "@/assets/flower-logo.jpg";

export const brandImages = {
  campaignRedHeels: campaignRedHeels,
  campaignMirror: campaignMirror,
  campaignWhite: campaignWhite,
  storeInterior: storeInterior,
  flowerBurgundy: flowerBurgundy,
  flowerLogo: flowerLogo,
};

export const SITE_URL = "https://vinci-shoes.lovable.app";

export function formatMnt(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `₮ ${new Intl.NumberFormat("en-US").format(Math.round(n))}`;
}
