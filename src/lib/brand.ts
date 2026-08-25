import campaignRedHeels from "@/assets/campaign-red-heels.png.asset.json";
import campaignMirror from "@/assets/campaign-mirror.webp.asset.json";
import campaignWhite from "@/assets/campaign-white.jpg.asset.json";
import storeInterior from "@/assets/store-interior.png.asset.json";
import flowerBurgundy from "@/assets/flower-burgundy.jpg.asset.json";
import flowerLogo from "@/assets/flower-logo.jpg.asset.json";

export const brandImages = {
  campaignRedHeels: campaignRedHeels.url,
  campaignMirror: campaignMirror.url,
  campaignWhite: campaignWhite.url,
  storeInterior: storeInterior.url,
  flowerBurgundy: flowerBurgundy.url,
  flowerLogo: flowerLogo.url,
};

export const SITE_URL = "https://vinci-shoes.lovable.app";

export function formatMnt(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `₮ ${new Intl.NumberFormat("en-US").format(Math.round(n))}`;
}
