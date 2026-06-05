import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { DriverStanding } from "../types";

type Props = {
  standings: DriverStanding[];
  loading?: boolean;
  onSelectDriver: (id: string) => void;
};

const DriverStandingRow = memo(function DriverStandingRow({
  driver,
  onSelect
}: {
  driver: DriverStanding;
  onSelect: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      className="driver-row"
      onClick={() => onSelect(driver.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title=""
    >
      <td className="rank" data-pos={driver.position}>P{driver.position}</td>
      <td>
        <div className="driver-cell">
          <span className="driver-code" aria-label={driver.code ?? "F1"}>
            {driver.code ?? "F1"}
          </span>
          <span>
            <strong className="driver-name">{driver.name}</strong>
            <small className="driver-team">{driver.team}</small>
          </span>
        </div>
      </td>
      <td>{driver.wins}</td>
      <td className="points" style={{ position: 'relative' }}>
        {driver.points}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="row-hover-tooltip"
              initial={{ opacity: 0, x: 8, filter: "blur(2px)", y: "-50%" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)", y: "-50%" }}
              exit={{ opacity: 0, x: 4, filter: "blur(2px)", y: "-50%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              View details
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
});

export function DriverStandingsTable({ standings, loading, onSelectDriver }: Props) {
  return (
    <section className="standings-section" aria-labelledby="standings-title">
      <div className="section-heading">
        <h2 id="standings-title">Driver standings</h2>
        <span>
          {loading ? "Loading…" : `${standings.length} drivers — click a row for details`}
        </span>
      </div>

      <div className="table-wrap">
        <table aria-label="F1 driver standings">
          <thead>
            <tr>
              <th scope="col">Pos</th>
              <th scope="col">Driver</th>
              <th scope="col">Wins</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: "28px 20px", textAlign: "center" }}>
                  <span className="skeleton" style={{ width: "40%" }} />
                </td>
              </tr>
            ) : (
              standings.map((driver) => (
                <DriverStandingRow
                  key={driver.id}
                  driver={driver}
                  onSelect={onSelectDriver}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
