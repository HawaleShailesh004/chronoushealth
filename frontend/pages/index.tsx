import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';

const stagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>ChronosHealth — Universal Health Context Engine</title>
        <meta
          name="description"
          content="Medical AI with full patient context"
        />
      </Head>

      <div className="min-h-screen bg-ink-50">
        <Navbar />

        <div className="min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-2">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col justify-center px-8 py-16 lg:px-16 lg:py-24 border-r border-ink-200"
          >
            <motion.div variants={fadeUp} className="mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse-dot" />
                Universal Health Context Engine
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-[46px] lg:text-[54px] font-800 text-ink-950 leading-[1.07] tracking-[-0.03em] mb-4"
            >
              Medical AI needs
              <br />
              <span className="text-blue-600 italic font-display">context</span>,
              <br />
              not guesses.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-[16px] text-ink-500 leading-relaxed mb-3 font-light max-w-md"
            >
              Your wearable, your records, and your medications — finally unified
              into one reasoning engine that understands your full health story.
            </motion.p>

            <motion.blockquote
              variants={fadeUp}
              className="pl-4 border-l-2 border-blue-200 text-[13px] text-ink-400 italic mb-10 leading-relaxed max-w-sm font-body"
            >
              &quot;Same heart rate spike. Standalone AI: possible cardiac event.
              ChronosHealth: medication adjustment. No emergency.&quot;
            </motion.blockquote>

            <motion.div variants={fadeUp} className="flex gap-8 mb-10">
              {[
                { n: '3', l: 'Data streams unified' },
                { n: '30', l: 'Days of context' },
                { n: '48h', l: 'Drift detection' },
              ].map((s) => (
                <div key={s.n}>
                  <div className="font-mono text-[26px] font-medium text-blue-600 leading-none">
                    {s.n}
                  </div>
                  <div className="text-[11px] text-ink-400 mt-1 font-mono">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <button
                type="button"
                onClick={() => router.push('/patient?id=sarah')}
                className="flex items-center gap-3 px-5 py-3.5 bg-blue-600 text-white rounded-xl text-[14px] font-semibold font-display hover:bg-blue-700 transition-all duration-200 hover:shadow-blue active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-[16px]">
                  🧬
                </div>
                <div className="text-left">
                  <div>Patient View</div>
                  <div className="text-[11px] opacity-70 font-normal">
                    Sarah M., 42F — Demo
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => router.push('/doctor')}
                className="flex items-center gap-3 px-5 py-3.5 bg-white text-ink-900 border border-ink-200 rounded-xl text-[14px] font-semibold font-display hover:border-ink-300 hover:shadow-card-hover transition-all duration-200 active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[16px]">
                  🏥
                </div>
                <div className="text-left">
                  <div>Physician Panel</div>
                  <div className="text-[11px] text-ink-400 font-normal">
                    Dr. Patel — Roster
                  </div>
                </div>
              </button>
            </motion.div>
          </motion.div>

          <div className="hidden lg:flex flex-col justify-center gap-4 px-12 py-16 bg-gradient-to-br from-blue-50 via-ink-50 to-white">
            {[
              {
                delay: 0.1,
                label: 'Resting HR — Sarah M.',
                border: '',
                children: (
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[32px] font-medium text-ink-950">
                        88
                      </span>
                      <span className="font-mono text-[12px] text-ink-400">
                        bpm
                      </span>
                      <span className="ml-auto text-[10px] font-mono font-semibold bg-danger-50 text-danger-700 border border-danger-100 px-2 py-0.5 rounded-md">
                        ↑ +29.8%
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-ink-400">
                      Baseline: 63.0 bpm · 28-day avg
                    </p>
                  </div>
                ),
              },
              {
                delay: 0.2,
                label: 'Drift Detected — MODERATE',
                border: 'border-l-[3px] border-l-warning-500',
                children: (
                  <div>
                    <p className="text-[12px] text-ink-600 leading-relaxed mb-3">
                      HR +29.8%, HRV −31.3%, Sleep −22.1% — all began 48h after
                      Metformin 500mg initiation on Mar 19.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'wearable_30d',
                        'fhir_conditions',
                        'medication_log',
                      ].map((s) => (
                        <span
                          key={s}
                          className="text-[9px] font-mono px-2 py-0.5 bg-ink-50 border border-ink-100 text-ink-400 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                delay: 0.3,
                label: 'AI Assessment',
                border: '',
                children: (
                  <p className="text-[12px] text-ink-600 leading-relaxed">
                    <strong className="text-ink-950 font-semibold">
                      Not a cardiac emergency.
                    </strong>{' '}
                    Consistent with Metformin autonomic adjustment. SpO2 stable
                    at 96.8%. Monitor HR for 5 days.
                  </p>
                ),
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: card.delay,
                  ease: easeOut,
                }}
                className={`bg-white border border-ink-200 rounded-2xl p-4 shadow-card ${card.border}`}
              >
                <p className="text-[9px] font-mono font-semibold uppercase tracking-[0.08em] text-ink-400 mb-3">
                  {card.label}
                </p>
                {card.children}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
