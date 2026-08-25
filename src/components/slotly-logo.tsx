import Link from "next/link";

type SlotlyLogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function SlotlyLogo({ href = "/", className = "", compact = false }: SlotlyLogoProps) {
  const mark = (
    <svg aria-hidden="true" className="h-7 w-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <path d="M22.8 9.2a9.5 9.5 0 1 0 0 13.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12.3 10.5h6.8M12.3 15.9h8.2M12.3 21.3h5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22.1 19.6 25.8 16l-3.7-3.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <Link href={href} aria-label="Slotly — на главную" className={`focus-ring inline-flex items-center gap-2 font-semibold tracking-[-0.04em] ${className}`}>
      <span className="text-[var(--brand)]">{mark}</span>
      {!compact && <span className="text-[1.18rem] text-[var(--ink)]">Slotly</span>}
    </Link>
  );
}
