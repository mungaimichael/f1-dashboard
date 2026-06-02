import { memo } from "react";
import type { Race } from "../types";
import { getFlag, formatDate } from "../utils";

type Props = {
  races: Race[];
  loading?: boolean;
};

function getRaceStatus(
  raceDate: string,
  today: string,
  isFirstFuture: boolean
): "completed" | "next" | "upcoming" {
  if (raceDate < today) return "completed";
  if (isFirstFuture) return "next";
  return "upcoming";
}

const RaceCard = memo(function RaceCard({
  race,
  status,
}: {
  race: Race;
  status: "completed" | "next" | "upcoming";
}) {
  return (
    <article className={`race-card race-card--${status}`}>
      <span className="race-card-round">R{race.round}</span>
      <span className="race-card-flag" aria-hidden="true">
        {getFlag(race.country)}
      </span>
      <h3 className="race-card-name" title={race.raceName}>
        {race.raceName}
      </h3>
      <p className="race-card-circuit">{race.circuitName}</p>
      <p className="race-card-date">{formatDate(race.date)}</p>
      {race.isSprint && (
        <span className="sprint-badge sprint-badge--small">⚡ Sprint</span>
      )}
    </article>
  );
});

function SkeletonCard({ index }: { index: number }) {
  return (
    <article className="race-card race-card--upcoming" aria-hidden="true">
      <span className="skeleton" style={{ width: "24px", height: "14px" }} />
      <span
        className="skeleton"
        style={{ width: "48px", height: "48px", borderRadius: "50%", marginBlock: "8px" }}
      />
      <span className="skeleton" style={{ width: `${100 - index * 8}%`, height: "16px" }} />
      <span className="skeleton" style={{ width: "70%", height: "12px", marginTop: "4px" }} />
      <span className="skeleton" style={{ width: "60px", height: "14px", marginTop: "8px" }} />
    </article>
  );
}

export function RaceCalendar({ races, loading }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  let foundNext = false;

  return (
    <section className="calendar-section" aria-labelledby="calendar-title">
      <div className="section-heading">
        <h2 id="calendar-title">Race Calendar</h2>
        <span>
          {loading
            ? "Loading…"
            : races.length > 0
              ? `${races[0].season} · ${races.length} races`
              : "No races"}
        </span>
      </div>

      <div className="calendar-scroll">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))
          : races.map((race) => {
              const isFirstFuture = !foundNext && race.date >= today;
              if (isFirstFuture) foundNext = true;
              const status = getRaceStatus(race.date, today, isFirstFuture);
              return (
                <RaceCard
                  key={race.round}
                  race={race}
                  status={status}
                />
              );
            })}
      </div>
    </section>
  );
}
