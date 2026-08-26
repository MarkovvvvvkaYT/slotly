import Link from "next/link";
import Image from "next/image";

type SlotlyLogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function SlotlyLogo({ href = "/", className = "", compact = false }: SlotlyLogoProps) {
  return (
    <Link href={href} aria-label="Slotly — на главную" className={`focus-ring inline-flex items-center gap-2 font-bold tracking-[-0.04em] ${className}`}>
      <Image src="/slotly-mark.png" alt="" aria-hidden width={30} height={30} className="h-7 w-7 shrink-0 object-contain" />
      {!compact && <span className="text-[1.2rem]">Slotly</span>}
    </Link>
  );
}
