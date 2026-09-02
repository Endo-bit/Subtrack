import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

/**
 * RevenueCat entitlement identifier — must match the entitlement created in the
 * RevenueCat dashboard (Entitlements tab), not the product/package identifier.
 */
export const PRO_ENTITLEMENT_ID = 'com.SubTrack.lifetime';

const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

const isExpoGo = Constants.appOwnership === 'expo';

let configured = false;

/** No-ops until an API key is set (env not configured yet, or running in Expo Go). */
export function isPurchasesAvailable(): boolean {
  if (isExpoGo) return false;
  if (Platform.OS === 'ios') return !!iosApiKey;
  if (Platform.OS === 'android') return !!androidApiKey;
  return false;
}

export function configurePurchases(): void {
  if (configured || !isPurchasesAvailable()) return;
  const apiKey = Platform.OS === 'ios' ? iosApiKey : androidApiKey;
  if (!apiKey) return;
  Purchases.configure({ apiKey });
  configured = true;
}

export function entitlementIsActive(info: CustomerInfo): boolean {
  return info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isPurchasesAvailable()) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function fetchCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isPurchasesAvailable()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

/**
 * One purchasable Pro option, reduced to what the UI needs. `priceString` comes straight from
 * StoreKit / Google Play, so it is already formatted in the user's storefront currency and
 * locale — never rebuild it from a number, and never hardcode a price in copy.
 */
export type ProPriceOption = {
  identifier: string;
  productIdentifier: string;
  packageType: string;
  priceString: string;
};

export async function fetchProPriceOptions(): Promise<ProPriceOption[]> {
  const offering = await fetchCurrentOffering();
  return (offering?.availablePackages ?? []).map((pkg) => ({
    identifier: pkg.identifier,
    productIdentifier: pkg.product.identifier,
    packageType: pkg.packageType,
    priceString: pkg.product.priceString,
  }));
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ isPro: boolean; cancelled: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { isPro: entitlementIsActive(customerInfo), cancelled: false };
  } catch (e) {
    const cancelled = typeof e === 'object' && e !== null && 'userCancelled' in e && (e as { userCancelled?: boolean }).userCancelled === true;
    return { isPro: false, cancelled };
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!isPurchasesAvailable()) return false;
  try {
    const info = await Purchases.restorePurchases();
    return entitlementIsActive(info);
  } catch {
    return false;
  }
}

export function addEntitlementListener(onChange: (isPro: boolean) => void): () => void {
  if (!isPurchasesAvailable()) return () => {};
  const listener = (info: CustomerInfo) => onChange(entitlementIsActive(info));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}
