import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

type ButtonProps = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  showArrow?: boolean;
  className?: string;
};

export default function Button({
  href,
  onClick,
  children,
  variant = "primary",
  showArrow = false,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300";

  const variants = {
    primary:
      "gold-gradient-bg text-black shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02]",
    secondary:
      "card-surface text-foreground hover:border-accent/30",
    ghost:
      "text-muted-foreground hover:text-foreground",
  };

  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
        {showArrow && <ArrowRight size={16} weight="bold" />}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      {children}
      {showArrow && <ArrowRight size={16} weight="bold" />}
    </button>
  );
}
