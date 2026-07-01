export function formatPrice(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    return "₡—";
  }
  return `₡${price.toLocaleString("es-CR")}`;
}

export function formatPriceCompact(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    return "₡—";
  }
  if (price >= 1_000_000) {
    return `₡${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `₡${(price / 1_000).toFixed(0)}K`;
  }
  return `₡${price}`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "0";
  return n.toLocaleString("es-CR");
}
