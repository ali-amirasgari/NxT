"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Target, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

import { PHASES, PRIMARY_SHADE_SWATCH, TICKER_ITEMS } from "./landing-data";

function useDotAngle(step: number) {
  const prevStep = useRef(0);
  const cumulative = useRef(0);
  const angleRef = useRef(0);
  const rafRef = useRef(0);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const prev = prevStep.current;
    const delta = ((step - prev + 3) % 3) * 120;
    cumulative.current += delta;
    prevStep.current = step;
    const target = cumulative.current;

    const tick = () => {
      const diff = target - angleRef.current;
      if (Math.abs(diff) < 0.15) {
        angleRef.current = target;
        setAngle(target);
        return;
      }
      angleRef.current += diff * 0.07;
      setAngle(angleRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);

  return angle;
}

function OrbitalRing({ step }: { step: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dotAngle = useDotAngle(step);
  const CX = 180,
    CY = 180,
    R = 130;

  if (!mounted) {
    return <div className="relative select-none" style={{ width: 360, height: 360 }} />;
  }

  const toRad = (d: number) => (d * Math.PI) / 180;
  const pos = (deg: number) => ({
    x: CX + R * Math.cos(toRad(deg)),
    y: CY + R * Math.sin(toRad(deg)),
  });

  const nodes = [
    { angle: 270, label: "COMMIT", Icon: Target },
    { angle: 30, label: "PROVE", Icon: Upload },
    { angle: 150, label: "RESOLVE", Icon: CheckCircle },
  ];

  const arcPath = (a1: number, a2: number) => {
    const p1 = pos(a1),
      p2 = pos(a2);
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`;
  };

  const arcs = [arcPath(270, 30), arcPath(30, 150), arcPath(150, 270)];

  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = i * 10;
    const inner = pos(a);
    const outerR = R + (i % 3 === 0 ? 10 : 6);
    const outerPos = {
      x: CX + outerR * Math.cos(toRad(a)),
      y: CY + outerR * Math.sin(toRad(a)),
    };
    return { inner, outer: outerPos, major: i % 3 === 0 };
  });

  return (
    <div className="relative select-none" style={{ width: 360, height: 360 }}>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 10%, transparent) 0%, transparent 70%)",
        }}
      />

      <svg width="360" height="360" viewBox="0 0 360 360" style={{ overflow: "visible" }}>
        <circle
          cx={CX}
          cy={CY}
          r={R + 20}
          fill="none"
          stroke="color-mix(in oklab, var(--primary) 8%, transparent)"
          strokeWidth="1"
        />

        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke={
              t.major
                ? "color-mix(in oklab, var(--primary) 30%, transparent)"
                : "color-mix(in oklab, var(--primary) 12%, transparent)"
            }
            strokeWidth={t.major ? "1.5" : "1"}
          />
        ))}

        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="color-mix(in oklab, var(--primary) 12%, transparent)"
          strokeWidth="2"
        />

        {arcs.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={
              i === step ? "var(--primary)" : "color-mix(in oklab, var(--primary) 12%, transparent)"
            }
            strokeWidth={i === step ? "3" : "2"}
            strokeLinecap="round"
            style={{
              filter:
                i === step ? "drop-shadow(0 0 6px var(--primary))" : "none",
              transition: "stroke 0.6s, stroke-width 0.6s, filter 0.6s",
            }}
          />
        ))}

        {nodes.map((n, i) => {
          const p = pos(n.angle);
          const active = i === step;
          return (
            <g key={n.label}>
              {active && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="28"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r="18"
                fill={
                  active
                    ? "color-mix(in oklab, var(--primary) 14%, transparent)"
                    : "color-mix(in oklab, var(--secondary-900) 90%, transparent)"
                }
                stroke={
                  active
                    ? "var(--primary)"
                    : "color-mix(in oklab, var(--primary) 25%, transparent)"
                }
                strokeWidth={active ? "2" : "1.5"}
                style={{
                  filter:
                    active
                      ? "drop-shadow(0 0 10px color-mix(in oklab, var(--primary) 50%, transparent))"
                      : "none",
                  transition: "all 0.6s",
                }}
              />
              <text
                x={n.angle === 270 ? p.x : n.angle === 30 ? p.x + 10 : p.x - 10}
                y={n.angle === 270 ? p.y - 30 : p.y + 38}
                textAnchor="middle"
                fontSize="9"
                letterSpacing="2"
                fontFamily="'JetBrains Mono', monospace"
                fill={
                  active
                    ? "var(--primary)"
                    : "color-mix(in oklab, var(--primary) 35%, transparent)"
                }
                style={{ transition: "fill 0.6s" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}

        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${dotAngle}deg)`,
          }}
        >
          <circle
            cx={CX}
            cy={CY - R}
            r="6"
            fill="var(--primary)"
            style={{
              filter:
                "drop-shadow(0 0 8px var(--primary)) drop-shadow(0 0 16px color-mix(in oklab, var(--primary) 50%, transparent))",
            }}
          />
          <circle cx={CX} cy={CY - R} r="3" fill="var(--secondary-foreground)" />
        </g>

        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fontSize="10"
          letterSpacing="3"
          fontFamily="'JetBrains Mono', monospace"
          fill="color-mix(in oklab, var(--primary) 55%, transparent)"
        >
          PHASE {step + 1}/3
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          letterSpacing="2"
          fontFamily="'Barlow Condensed', sans-serif"
          fill="var(--secondary-foreground)"
          style={{ transition: "all 0.4s" }}
        >
          {PHASES[step].label}
        </text>
        <text
          x={CX}
          y={CY + 30}
          textAnchor="middle"
          fontSize="9"
          fontFamily="'DM Sans', sans-serif"
          fill="color-mix(in oklab, var(--secondary-foreground) 50%, transparent)"
        >
          {PHASES[step].title}
        </text>
      </svg>
    </div>
  );
}

function Ticker() {
  return (
    <div className="overflow-hidden py-2.5 border-y border-primary/20 bg-primary/5">
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: "ticker 30s linear infinite",
          display: "flex",
          gap: "3rem",
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <Typography
            key={i}
            as="span"
            className={cn(
              "text-xs flex-shrink-0",
              i % 3 === 1 ? "text-primary" : "text-secondary-foreground/65"
            )}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {item}
          </Typography>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export function LandingHero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((p) => (p + 1) % 3), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary-600 to-secondary-700" />

      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-5%",
          width: "55%",
          height: "130%",
          background:
            "linear-gradient(135deg, transparent 40%, color-mix(in oklab, var(--primary) 4%, transparent) 40%, color-mix(in oklab, var(--primary) 7%, transparent) 55%, transparent 55%)",
          transform: "skewX(-8deg)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--primary) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary) 4%, transparent) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%",
          right: "15%",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 10%, transparent) 0%, transparent 65%)",
          transform: "translate(50%, -50%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-center">
          <div>
            <Typography
              as="div"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold mb-8 uppercase tracking-widest bg-primary/10 border border-primary/35 text-primary"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-primary" />
              12,847 Active Commitments Right Now
            </Typography>

            <Typography
              as="h1"
              variant="h1"
              className="font-black uppercase leading-none mb-6 text-secondary-foreground border-b-0 pb-0"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(3.5rem, 7.5vw, 6rem)",
              }}
            >
              Stop
              <br />
              <Typography
                as="span"
                tone="primary"
                className="text-primary"
                style={{
                  textShadow:
                    "0 0 40px color-mix(in oklab, var(--primary) 35%, transparent)",
                }}
              >
                Promising.
              </Typography>
              <br />
              Start
              <br />
              <Typography as="span" className="text-secondary-foreground">
                Proving.
              </Typography>
            </Typography>

            <Typography as="p" className="text-lg leading-relaxed mb-10 max-w-lg text-secondary-foreground/75">
              Stake virtual XP on your goals. Execute them. Submit proof. Resolve the commitment and keep your progress visible.
            </Typography>

            <div className="flex items-center gap-3 mb-10 flex-wrap">
              {PHASES.map((p, i) => (
                <div key={p.label} className="flex items-center gap-3">
                  <Typography
                    as="div"
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-500 border",
                      i === step
                        ? "bg-primary/15 border-primary/45 text-primary shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
                        : "bg-secondary-foreground/5 border-secondary-foreground/10 text-secondary-foreground/40"
                    )}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {i === step && <span className="w-1 h-1 rounded-full bg-primary" />}
                    {p.label}
                  </Typography>
                  {i < 2 && (
                    <ArrowRight
                      size={12}
                      className={cn(
                        "transition-colors duration-500",
                        i === step ? "text-primary" : "text-secondary-foreground/15"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                type="button"
                variant="default"
                tone="primary"
                className="h-auto px-8 py-4 text-sm font-black hover:scale-[1.02]"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.08em",
                  boxShadow:
                    "0 0 40px color-mix(in oklab, var(--primary) 35%, transparent), 0 4px 24px color-mix(in oklab, var(--primary) 22%, transparent)",
                }}
              >
                COMMIT YOUR FIRST GOAL
                <ArrowRight size={15} />
              </Button>
              <Button
                type="button"
                variant="outline"
                tone="secondary"
                className="h-auto px-8 py-4 text-sm font-bold border-secondary-foreground/15 text-secondary-foreground/70 hover:text-secondary-foreground"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.06em",
                }}
              >
                VIEW LIVE COMMITMENTS
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {PRIMARY_SHADE_SWATCH.map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-primary-foreground"
                    style={{ background: c, borderColor: "var(--secondary)" }}
                  >
                    <Typography as="span" className="text-[9px] font-black leading-none">
                      {["M", "P", "D", "A", "L"][i]}
                    </Typography>
                  </div>
                ))}
              </div>
              <Typography as="span" className="text-sm text-secondary-foreground/60">
                <Typography
                  as="span"
                  className="font-bold text-secondary-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  847K+
                </Typography>{" "}
                goals committed this month
              </Typography>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-6">
            <OrbitalRing step={step} />

            <div className="w-full rounded-lg p-4 transition-all duration-500 bg-secondary-700/60 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 bg-primary/15 border border-primary/20">
                  {(() => {
                    const Icon = PHASES[step].icon;
                    return <Icon size={16} className="text-primary" />;
                  })()}
                </div>
                <div>
                  <Typography
                    as="div"
                    className="text-xs font-bold uppercase tracking-widest mb-1 text-primary"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {PHASES[step].label}
                  </Typography>
                  <Typography as="p" className="text-sm leading-relaxed text-secondary-foreground/70">
                    {PHASES[step].desc}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <Ticker />
      </div>
    </section>
  );
}
