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
        <title>Nadi — Universal Health Context Engine</title>
        <meta
          name="description"
          content="Medical AI with full patient context"
        />
      </Head>

      <div className="min-h-screen bg-ink-50">
        <Navbar />

        <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-2">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col justify-center border-r border-ink-200 px-10 py-20 lg:px-20 lg:py-28"
          >
            <motion.div variants={fadeUp} className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-blue-600" />
                Universal Health Context Engine
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-6 font-display text-[46px] font-800 leading-[1.08] tracking-[-0.03em] text-ink-950 lg:text-[54px]"
            >
              Medical AI needs
              <br />
              <span className="font-display italic text-blue-600">context</span>,
              <br />
              not guesses.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-6 max-w-md text-base font-normal leading-[1.7] tracking-wide text-ink-700"
            >
              Your wearable, your records, and your medications — finally unified
              into one reasoning engine that understands your full health story.
            </motion.p>

            <motion.blockquote
              variants={fadeUp}
              className="mb-12 max-w-sm border-l-2 border-blue-200 pl-5 font-body text-sm italic leading-[1.7] tracking-wide text-ink-500"
            >
              &quot;Same heart rate spike. Standalone AI: possible cardiac event.
              Nadi: medication adjustment. No emergency.&quot;
            </motion.blockquote>

            <motion.div variants={fadeUp} className="mb-12 flex gap-12">
              {[
                { n: '3', l: 'Data streams unified' },
                { n: '30', l: 'Days of context' },
                { n: '48h', l: 'Drift detection' },
              ].map((s) => (
                <div key={s.n}>
                  <div className="font-mono text-[28px] font-medium leading-none text-blue-600">
                    {s.n}
                  </div>
                  <div className="mt-2 font-mono text-[10px] tracking-wide text-ink-400">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mb-12 flex flex-col gap-4 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => router.push('/patient?id=sarah')}
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-display text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-blue active:scale-[0.98]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-base">
                  🧬
                </div>
                <div className="text-left">
                  <div>Patient View</div>
                  <div className="text-[10px] font-normal opacity-70">
                    Sarah M., 42F — Demo
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => router.push('/doctor')}
                className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-6 py-4 font-display text-sm font-semibold tracking-wide text-ink-900 transition-all duration-200 hover:border-ink-300 hover:shadow-card-hover active:scale-[0.98]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-base">
                  🏥
                </div>
                <div className="text-left">
                  <div>Physician Panel</div>
                  <div className="text-[10px] font-normal text-ink-400">
                    Dr. Patel — Roster
                  </div>
                </div>
              </button>
            </motion.div>
          </motion.div>

          <div className="hidden flex-col justify-center gap-6 bg-gradient-to-br from-blue-50 via-ink-50 to-white px-14 py-20 lg:flex">
            {[
              {
                delay: 0.1,
                label: 'Resting HR — Sarah M.',
                border: '',
                children: (
                  <div>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="font-mono text-[28px] font-medium text-ink-950">
                        88
                      </span>
                      <span className="font-mono text-xs text-ink-400">
                        bpm
                      </span>
                      <span className="ml-auto rounded-md border border-danger-100 bg-danger-50 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-danger-700">
                        ↑ +29.8%
                      </span>
                    </div>
                    <p className="font-mono text-[10px] tracking-wide text-ink-400">
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
                    <p className="mb-4 text-sm leading-[1.7] tracking-wide text-ink-700">
                      HR +29.8%, HRV −31.3%, Sleep −22.1% — all began 48h after
                      Metformin 500mg initiation on Mar 19.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'wearable_30d',
                        'fhir_conditions',
                        'medication_log',
                      ].map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-ink-200 bg-ink-100 px-2.5 py-1 font-mono text-[10px] tracking-wide text-ink-600"
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
                  <p className="text-sm leading-[1.7] tracking-wide text-ink-700">
                    <strong className="font-semibold tracking-tight text-ink-950">
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
                className={`rounded-2xl border border-ink-200 bg-white p-6 shadow-card ${card.border}`}
              >
                <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
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
