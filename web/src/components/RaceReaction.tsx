import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ADD_REACTION, GET_REACTIONS } from "../graphql/queries";
import { useReactionEvents } from "../hooks/useReactionEvents";
import { captureReactionPhoto, pickReactionPhoto } from "../native/camera";
import type { Reaction } from "../types";
import { LoadingIcon } from "./LoadingIcon";

type ReactionsData = { reactions: Reaction[] };
type AddReactionVars = { input: { author: string; photoDataUrl: string } };

export function RaceReaction() {
  const [author, setAuthor] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const { data } = useQuery<ReactionsData>(GET_REACTIONS, {
    fetchPolicy: "network-only"
  });

  const [addReaction, { loading: posting }] = useMutation<
    { addReaction: Reaction },
    AddReactionVars
  >(ADD_REACTION);

  const { reactions: liveReactions, connectionState } = useReactionEvents();

  const allReactions = [...(data?.reactions ?? []), ...liveReactions];

  async function handleCapture(source: () => Promise<string | null>) {
    setCaptureError(null);
    setCapturing(true);
    try {
      const photoDataUrl = await source();
      if (photoDataUrl) setPendingPhoto(photoDataUrl);
    } catch (error) {
      setCaptureError(
        error instanceof Error ? error.message : "Could not access the camera."
      );
    } finally {
      setCapturing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !pendingPhoto || posting) return;
    await addReaction({
      variables: { input: { author: author.trim(), photoDataUrl: pendingPhoto } }
    });
    setPendingPhoto(null);
  }

  return (
    <section className="reaction-board" aria-labelledby="reaction-title">
      <div className="section-heading">
        <h2 id="reaction-title">Race reactions</h2>
        <span
          className="connection"
          aria-label={`SSE connection: ${connectionState}`}
        >
          <span
            className={connectionState === "open" ? "dot dot-open" : "dot dot-closed"}
            aria-hidden="true"
          />
          <span>{connectionState}</span>
        </span>
      </div>

      <form className="reaction-compose" onSubmit={(e) => void handleSubmit(e)}>
        <div className="reaction-capture-row">
          <button
            type="button"
            onClick={() => void handleCapture(captureReactionPhoto)}
            disabled={capturing}
          >
            {capturing ? <LoadingIcon /> : "Take photo"}
          </button>
          <button
            type="button"
            onClick={() => void handleCapture(pickReactionPhoto)}
            disabled={capturing}
          >
            Upload photo
          </button>
        </div>

        {captureError ? (
          <p className="reaction-error" role="alert">
            {captureError}
          </p>
        ) : null}

        {pendingPhoto ? (
          <div className="reaction-preview">
            <img src={pendingPhoto} alt="Your reaction preview" />
            <div className="reaction-preview-actions">
              <input
                className="message-input"
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={50}
                aria-label="Author name"
                required
              />
              <button type="submit" disabled={posting || !author.trim()}>
                {posting ? <LoadingIcon /> : "Post reaction"}
              </button>
              <button
                type="button"
                onClick={() => setPendingPhoto(null)}
                disabled={posting}
              >
                Discard
              </button>
            </div>
          </div>
        ) : null}
      </form>

      <ol className="reaction-grid" aria-live="polite" aria-label="Race reaction photos">
        <AnimatePresence mode="popLayout" initial={false}>
          {allReactions.length === 0 ? (
            <motion.li
              key="empty"
              className="reaction-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No reactions yet — be the first to share one!
            </motion.li>
          ) : (
            allReactions.map((reaction) => (
              <motion.li
                key={reaction.id}
                layout
                className="reaction-card"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <img src={reaction.photoDataUrl} alt={`${reaction.author}'s reaction`} />
                <div className="reaction-meta">
                  <strong>{reaction.author}</strong>
                  <time dateTime={reaction.createdAt}>
                    {new Date(reaction.createdAt).toLocaleTimeString()}
                  </time>
                </div>
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ol>
    </section>
  );
}
