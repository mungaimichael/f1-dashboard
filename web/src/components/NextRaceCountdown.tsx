import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Race } from "../types";
import { getFlag, formatDate } from "../utils";

type Props = {
  race: Race | null;
  loading?: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(race: Race): TimeLeft | null {
  const raceTime = race.time || "14:00:00Z";
  const target = new Date(race.date + "T" + raceTime).getTime();
  const diff = target - Date.now();

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatSessionTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.replace("Z", "").split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${suffix}`;
}

export function NextRaceCountdown({ race, loading }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!race) return;
    setTimeLeft(getTimeLeft(race));

    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(race));
    }, 1000);

    return () => clearInterval(id);
  }, [race]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="next-race-card">
        <div className="next-race-info">
          <span className="skeleton" style={{ width: "80px", height: "14px" }} />
          <span className="skeleton" style={{ width: "220px", height: "32px", marginTop: "8px" }} />
          <span className="skeleton" style={{ width: "160px", height: "16px", marginTop: "8px" }} />
        </div>
        <div className="countdown">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="countdown-segment" key={i}>
              <span className="skeleton" style={{ width: "48px", height: "48px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!race) return null;

  const isInProgress = timeLeft === null;

  return (
    <div className="next-race-card">
      <div className="next-race-info">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Next Race <span className="eyebrow-sub">ROUND {race.round}</span>
        </motion.p>
        <motion.h2
          className="next-race-name"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {getFlag(race.country)} {race.raceName}
        </motion.h2>
        <motion.p
          className="next-race-circuit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {race.circuitName}
        </motion.p>
        <motion.p
          className="next-race-location"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {race.locality}, {race.country}
        </motion.p>

        {race.isSprint && (
          <motion.span
            className="sprint-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
          >
            ⚡ Sprint Weekend
          </motion.span>
        )}
      </div>

      <div className="countdown" aria-label="Countdown to race start">
        <AnimatePresence mode="wait">
          {isInProgress ? (
            <motion.div
              key="in-progress"
              className="race-in-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="dot dot-open" aria-hidden="true" />
              <span className="race-in-progress-text">Race in progress</span>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              className="countdown-digits"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="countdown-segment">
                <span className="countdown-value">{pad(timeLeft.days)}</span>
                <span className="countdown-label">Days</span>
              </div>
              <span className="countdown-separator" aria-hidden="true">:</span>
              <div className="countdown-segment">
                <span className="countdown-value">{pad(timeLeft.hours)}</span>
                <span className="countdown-label">Hrs</span>
              </div>
              <span className="countdown-separator" aria-hidden="true">:</span>
              <div className="countdown-segment">
                <span className="countdown-value">{pad(timeLeft.minutes)}</span>
                <span className="countdown-label">Min</span>
              </div>
              <span className="countdown-separator" aria-hidden="true">:</span>
              {/* Seconds segment re-keys each tick to trigger a CSS pulse */}
              <div className="countdown-segment countdown-segment--sec" key={timeLeft.seconds}>
                <span className="countdown-value">{pad(timeLeft.seconds)}</span>
                <span className="countdown-label">Sec</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session schedule */}
      {race.sessions.length > 0 && (
        <div className="session-schedule">
          {race.sessions.map((s, i) => (
            <motion.span
              className="session-pill"
              key={s.name + s.date}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            >
              <strong>{s.name}</strong>
              <span>
                {formatDate(s.date)}
                {s.time ? ` · ${formatSessionTime(s.time)}` : ""}
              </span>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
