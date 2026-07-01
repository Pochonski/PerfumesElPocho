export default function EyebrowBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="
      inline-flex items-center gap-2
      rounded-full
      border border-accent/25
      bg-accent/10
      px-3.5 py-1.5
      text-[10px] font-semibold tracking-[0.2em] text-accent uppercase
      shadow-sm
      backdrop-blur-md
    ">
      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(200,168,78,0.6)]" aria-hidden="true" />
      {children}
    </span>
  );
}
