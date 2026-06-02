export default function EyebrowBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="
      inline-flex items-center gap-2
      rounded-full
      border border-[#c8a84e]/20
      bg-[#c8a84e]/8
      px-3 py-1.5
      text-[10px] font-medium tracking-[0.15em] text-[#c8a84e] uppercase
      shadow-sm
      backdrop-blur-md
    ">
      {children}
    </span>
  );
}
