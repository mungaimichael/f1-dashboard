import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ADD_MESSAGE, GET_MESSAGES } from "../graphql/queries";
import { useMessageEvents } from "../hooks/useMessageEvents";
import type { Message } from "../types";
import { LoadingIcon } from "./LoadingIcon";

type MessagesData = { messages: Message[] };
type AddMessageVars = { input: { author: string; text: string } };

function MessageItem({ msg, distance, onDismiss }: { msg: Message, distance: number, onDismiss: (id: string) => void }) {
  const x = useMotionValue(0);
  const itemRef = useRef<HTMLLIElement>(null);
  const [width, setWidth] = useState(300);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (itemRef.current) {
      setWidth(itemRef.current.offsetWidth);
    }
  }, []);

  const baseOpacity = Math.max(0.5, 1 - distance * 0.06);
  
  const dragOpacity = useTransform(x, [-width / 1.5, 0, width / 1.5], [0, baseOpacity, 0]);

  return (
    <motion.li 
      ref={itemRef}
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      style={{ x, opacity: dragOpacity }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: baseOpacity, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onDragStart={() => setIsHovered(false)}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > width / 3) {
          onDismiss(msg.id);
        }
      }}
      className="message-item"
    >
      <div className="message-meta">
        <strong className="message-author">{msg.author}</strong>
        <time className="message-time" dateTime={msg.createdAt}>
          {new Date(msg.createdAt).toLocaleTimeString()}
        </time>
      </div>
      <p className="message-text">{msg.text}</p>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="drag-tooltip"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            Drag to remove
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

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
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const allMessages = [...(data?.messages ?? []), ...liveMessages].filter(msg => !dismissedIds.has(msg.id));

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
          {loading ? <LoadingIcon /> : "Send"}
        </button>
      </form>

      <ol
        ref={listRef}
        className="message-list"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <AnimatePresence mode="popLayout" initial={false}>
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
                <MessageItem 
                  key={msg.id}
                  msg={msg}
                  distance={distance}
                  onDismiss={(id) => setDismissedIds(prev => new Set(prev).add(id))}
                />
              );
            })
          )}
        </AnimatePresence>
      </ol>

      
    </section>
  );
}
