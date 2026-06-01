import { useLazyQuery } from "@apollo/client/react";
import { useEffect } from "react";
import { GET_DRIVER } from "../graphql/queries";
import type { DriverDetailData } from "../types";

type Props = {
  driverId: string;
  onClose: () => void;
};

export function DriverModal({ driverId, onClose }: Props) {
  // useLazyQuery: the query does NOT run on mount — we fire it manually below.
  // This is the key difference from useQuery.
  const [fetchDriver, { data, loading }] = useLazyQuery<DriverDetailData>(GET_DRIVER);

  useEffect(() => {
    fetchDriver({ variables: { id: driverId } });
  }, [driverId, fetchDriver]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const driver = data?.driver;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{loading ? "Loading…" : (driver?.name ?? "Driver")}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="modal-body modal-loading">
            <span className="skeleton" style={{ width: "60%" }} />
            <span className="skeleton" style={{ width: "40%", marginTop: 10 }} />
          </div>
        ) : driver ? (
          <dl className="modal-body modal-dl">
            <div className="modal-dl-row">
              <dt>Code</dt>
              <dd>{driver.code ?? "—"}</dd>
            </div>
            <div className="modal-dl-row">
              <dt>Full name</dt>
              <dd>{driver.givenName} {driver.familyName}</dd>
            </div>
            <div className="modal-dl-row">
              <dt>Nationality</dt>
              <dd>{driver.nationality}</dd>
            </div>
            <div className="modal-dl-row">
              <dt>Team</dt>
              <dd>{driver.team}</dd>
            </div>
            <div className="modal-dl-row">
              <dt>Championship position</dt>
              <dd>P{driver.position}</dd>
            </div>
            <div className="modal-dl-row">
              <dt>Points</dt>
              <dd>{driver.points}</dd>
            </div>
            <div className="modal-dl-row">
              <dt>Wins</dt>
              <dd>{driver.wins}</dd>
            </div>
          </dl>
        ) : (
          <p className="modal-body modal-empty">Driver not found.</p>
        )}
      </div>
    </div>
  );
}
