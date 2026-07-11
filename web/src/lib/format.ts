export function formatPrice(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    return "₡—";
  }
  return `₡${price.toLocaleString("es-CR")}`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "0";
  return n.toLocaleString("es-CR");
}
