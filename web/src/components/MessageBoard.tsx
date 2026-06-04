import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ADD_MESSAGE, GET_MESSAGES } from "../graphql/queries";
import { useMessageEvents } from "../hooks/useMessageEvents";
import type { Message } from "../types";

type MessagesData = { messages: Message[] };
type AddMessageVars = { input: { author: string; text: string } };

export function MessageBoard() {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const listRef = useRef<HTMLOListElement>(null);

  const { data } = useQuery<MessagesData>(GET_MESSAGES, {
    fetchPolicy: "network-only"
  });

  const [addMessage, { loading }] = useMutation<
    { addMessage: Message },
    AddMessageVars
  >(ADD_MESSAGE);

  const { messages: liveMessages, connectionState } = useMessageEvents();

  // Historical messages from query + live messages pushed via SSE
  const allMessages = [...(data?.messages ?? []), ...liveMessages];

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [allMessages.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim() || loading) return;
    await addMessage({
      variables: { input: { author: author.trim(), text: text.trim() } }
    });
    setText("");
  }

  return (
    <section className="message-board" aria-labelledby="board-title">
      <div className="section-heading">
        <h2 id="board-title">Message board</h2>
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

        <form className="message-compose" onSubmit={(e) => void handleSubmit(e)}>
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
        <input
          className="message-input message-input--grow"
          type="text"
          placeholder="Say something…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          aria-label="Message text"
          required
        />
        <button
          type="submit"
          disabled={loading || !author.trim() || !text.trim()}
        >
          {loading ? "…" : "Send"}
        </button>
      </form>

      <ol
        ref={listRef}
        className="message-list"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <AnimatePresence initial={false}>
          {allMessages.length === 0 ? (
            <motion.li 
              key="empty"
              className="message-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No messages yet — be the first!
            </motion.li>
          ) : (
            allMessages.map((msg, index) => {
              const distance = allMessages.length - 1 - index;
              return (
                <motion.li 
                  key={msg.id} 
                  className="message-item"
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: Math.max(0.5, 1 - distance * 0.06), 
                    y: 0, 
                    scale: 1 
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="message-meta">
                    <strong className="message-author">{msg.author}</strong>
                    <time className="message-time" dateTime={msg.createdAt}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </time>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </motion.li>
              );
            })
          )}
        </AnimatePresence>
      </ol>

      
    </section>
  );
}
