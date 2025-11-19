"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMeasure from "react-use-measure";
import {
  ArrowUp,
  Loader2,
  ScanSearch,
  Square,
  X,
} from "lucide-react";
import { InsightAgentService } from "@/lib/agents/insight-agent-service";
import { AgentResponseRenderer } from "./agent-response-renderer";
import type { InsightResponse } from "@/lib/agents/types";

interface ChatComposerProps {
  evaluationId?: string;
  evaluationType?: string;
  className?: string;
}

interface ResultSection {
  id: string;
  query: string;
  response?: InsightResponse;
  error?: string;
  timestamp: Date;
}

type ComposerState = "closed" | "open" | "loading";

export function ChatComposer({
  evaluationId,
  evaluationType,
}: ChatComposerProps) {
  const [composerState, setComposerState] = useState<ComposerState>("closed");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<ResultSection[]>([]);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [measureRef, bounds] = useMeasure();

  // Auto-scroll to latest result when new result is added
  useEffect(() => {
    if (resultsEndRef.current && results.length > 0) {
      setTimeout(() => {
        resultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [results]);

  // Auto-resize textarea dynamically as user types
  useEffect(() => {
    if (textareaRef.current && composerState === "open") {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // max-height: 200px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message, composerState]);

  // Focus textarea when opening
  useEffect(() => {
    if (composerState === "open" && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [composerState]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        composerState === "open" &&
        composerRef.current &&
        !composerRef.current.contains(event.target as Node)
      ) {
        setComposerState("closed");
        setMessage("");
        setCurrentError(null);
      }
    };

    if (composerState === "open") {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [composerState]);

  const handleSendMessage = async () => {
    if (!message.trim() || composerState === "loading") return;

    const query = message.trim();
    setMessage("");
    setComposerState("loading");
    setCurrentError(null);

    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);

    // Create a new result section
    const resultId = Date.now().toString();
    const newResult: ResultSection = {
      id: resultId,
      query,
      timestamp: new Date(),
    };

    setResults((prev) => [...prev, newResult]);

    // Call agent service
    try {
      const result = await InsightAgentService.sendMessage(
        query,
        evaluationId,
        evaluationType
      );

      // Update the result with the response
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                response: result.response,
                error: result.error,
              }
            : r
        )
      );

      // On success, collapse to closed state
      if (!result.error) {
        setComposerState("closed");
      } else {
        // On error, stay open and show error tag
        setCurrentError(result.error);
        setComposerState("open");
      }
    } catch (error) {
      // Handle error - stay open and show error tag
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setCurrentError(errorMessage);
      setComposerState("open");

      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                error: errorMessage,
              }
            : r
        )
      );
    } finally {
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setComposerState("open");
    setCurrentError("Request cancelled");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape to close
    if (e.key === "Escape") {
      setComposerState("closed");
      setMessage("");
      setCurrentError(null);
      return;
    }

    // Enter to send (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      return;
    }

    // Cmd/Ctrl + Enter to send
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendMessage();
      return;
    }
  };

  return (
    <>
      {/* Results Sections */}
      {results.map((result) => (
        <div key={result.id} className="mb-6">
          {/* Result Content */}
          {result.response && (
            <AgentResponseRenderer response={result.response} />
          )}
        </div>
      ))}

      <div ref={resultsEndRef} />

      {/* Spacer to prevent chat composer from overlapping content */}
      <div className="h-20" />

      {/* Hidden measurement element for dynamic width */}
      <div
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none whitespace-nowrap"
        style={{
          padding: "0.5rem 1rem 0.5rem 1rem",
          fontSize: "0.875rem",
          fontFamily: "inherit",
        }}
      >
        {message}
      </div>

      {/* Chat Composer - Fixed at Bottom */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <motion.div
          className="pointer-events-auto rounded-2xl"
          ref={composerRef}
          animate={{
            width: (composerState === "closed" || composerState === "loading") ? "auto" : Math.min(bounds.width < 240 ? 300 : bounds.width + 240, 672),
          }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.3,
          }}
          style={{
            borderRadius: 24,
          }}
        >
          <AnimatePresence mode="popLayout">
            {composerState === "closed" ? (
              // Closed State - Button
              <motion.button
                key="button"
                layoutId="composer-wrapper"
                onClick={() => setComposerState("open")}
                className="mx-auto flex items-center gap-2 h-10 px-4 rounded-full shadow-lg bg-gray-900 text-gray-0 font-550 cursor-pointer hover:bg-gray-800 transition-colors"
                style={{ borderRadius: 24 }}
                initial={{ opacity: 0}}
                animate={{ opacity: 1}}
                transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.2 }}
              >
                <motion.span animate={{opacity:1}}layoutId="composer-title" className="text-sm">Ask Insights</motion.span>
                <ScanSearch className="h-4 w-4" />

              </motion.button>
            ) : (
              // Open or Loading State - Expanded Form
              <motion.div
                key="expanded"
                layoutId="composer-wrapper"
                className="bg-gray-0 border border-gray-200 shadow-lg rounded-2xl overflow-hidden"
                style={{ borderRadius: 24 }}
                initial={false}
              >
                {/* Error Tag */}
                <AnimatePresence>
                  {currentError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                      className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center justify-between"
                    >
                      <div className="text-sm text-red-700 font-[425] flex-1">
                        {currentError}
                      </div>
                      <button
                        onClick={() => setCurrentError(null)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Composer Area */}
                <div className="p-2 pl-4">
                  {/* Hidden placeholder for smooth layoutId transition */}
                  {(message == "" && composerState === "open") && (<motion.span
                    layoutId="composer-title"
                    aria-hidden
                    className="absolute opacity-0 pointer-events-none pt-1 text-sm text-gray-600"
                  >
                    Ask Insights
                  </motion.span>)}

                  {composerState === "loading" ? (
                    // Loading State
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Loader2 className="h-5 w-5 text-gray-900 animate-spin" />
                        <span className="text-sm font-550 text-gray-900 pr-2">
                          Gathering Insights...
                        </span>
                      </div>
                      <button
                        onClick={handleCancel}
                        className="h-8 w-8 rounded-full bg-gray-100 text-red-600 flex items-center justify-center hover:bg-gray-800 transition-colors"
                        title="Cancel"
                      >
                        <Square className="h-4 w-4 fill-current" />
                      </button>
                    </motion.div>
                  ) : (
                    // Open State - Form
                    <motion.form
                      key="form"
                     
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-end gap-3"
                    >
                      <motion.textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder=""
                        className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none overflow-y-auto min-h-[24px] pb-2"
                        rows={1}
                        style={{ maxHeight: "200px" }}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!message.trim()}
                        className={`h-8 w-8 rounded-full bg-gray-900 text-gray-0 flex items-center justify-center transition-colors flex-shrink-0 ${
                          !message.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-800"
                        }`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </motion.form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
