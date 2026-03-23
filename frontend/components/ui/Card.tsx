import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
  delay?: number;
}

export function Card({
  children,
  className,
  hover,
  animate,
  delay = 0,
}: CardProps) {
  const base = cn(
    'rounded-2xl border border-ink-200 bg-white shadow-card',
    hover && 'transition-shadow duration-200 hover:shadow-card-hover',
    className
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={base}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base}>{children}</div>;
}
