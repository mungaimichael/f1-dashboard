import type { RaceEvent } from "../types";

type Props = {
  event: RaceEvent;
  onDismiss: () => void;
};

export function Toast({ event, onDismiss }: Props) {
  return (
    <div className="toast" role="alert">
      <div className="toast-body">
        <strong>Safety car deployed</strong>
        <span>
          {event.message} &mdash; Lap {event.lap}
        </span>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
