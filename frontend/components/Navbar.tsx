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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 h-14 bg-white/95 backdrop-blur-sm border-b border-ink-200 flex items-center justify-between px-6"
    >
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
            <polyline
              points="0,7 3,7 5,1 7,13 9,7 11,7 12.5,3.5 14,10.5 15.5,7 18,7"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-display text-[17px] font-800 text-ink-950 tracking-tight">
          Chronos<span className="text-blue-600">Health</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {role === 'patient' && patientName && (
          <span className="text-sm text-ink-500 font-body">{patientName}</span>
        )}
        {role === 'doctor' && (
          <span className="text-sm text-ink-500 font-body">
            Dr. Patel — Physician Panel
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wide bg-success-50 text-success-700 border border-success-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-dot" />
          LIVE
        </span>
        {alertCount != null && alertCount > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wide bg-danger-50 text-danger-700 border border-danger-100 px-2.5 py-1 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-danger-500" />
            {alertCount} ALERT{alertCount > 1 ? 'S' : ''}
          </motion.span>
        )}
      </div>
    </motion.nav>
  );
}
