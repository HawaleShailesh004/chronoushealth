import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavbarProps {
  alertCount?: number;
  patientName?: string;
  role?: 'patient' | 'doctor' | null;
}

export function Navbar({ alertCount, patientName, role }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-ink-200 bg-white px-8"
    >
      <Link href="/" className="group flex items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 transition-colors group-hover:bg-blue-700">
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            aria-hidden
          >
            <polyline
              points="0,7 3,7 5,1 7,13 9,7 11,7 12.5,3.5 14,10.5 15.5,7 18,7"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-display text-[17px] font-800 tracking-tight text-ink-950">
          Nadi
        </span>
      </Link>

      <div className="flex items-center gap-2 text-sm tracking-wide text-ink-500">
        {role === 'patient' && patientName && <span>{patientName}</span>}
        {role === 'doctor' && <span>Dr. Patel — Physician Panel</span>}
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success-100 bg-success-50 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-success-700">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success-500" />
          Live
        </span>

        {alertCount != null && alertCount > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-danger-100 bg-danger-50 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-danger-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-danger-600" />
            {alertCount} Alert{alertCount > 1 ? 's' : ''}
          </motion.span>
        )}
      </div>
    </motion.nav>
  );
}
