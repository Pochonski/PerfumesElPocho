export const SITE = {
  brand: "Perfumes El Pocho",
  contactEmail: "joseph19102005@gmail.com",
  whatsappNumber: "50664779672",
  whatsappHref(message: string): string {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  },
} as const;
