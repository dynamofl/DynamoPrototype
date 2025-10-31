"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  ScanSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function ChatComposer({
  evaluationId,
  evaluationType,
  className = "",
}: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<ResultSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatComposerRef = useRef<HTMLDivElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest result when new result is added
  useEffect(() => {
    if (resultsEndRef.current && results.length > 0) {
      resultsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const query = message.trim();
    setMessage("");
    setIsLoading(true);

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
      const result = await InsightAgentService.sendMessage(query, evaluationId, evaluationType);

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
    } catch (error) {
      // Handle error
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : r
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Detect when chat composer is visible in viewport
  useEffect(() => {
    if (!chatComposerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Hide button when composer is visible, show when it's not
        setShowButton(!entry.isIntersecting);
      },
      {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -100px 0px", // Account for bottom spacing
      }
    );

    observer.observe(chatComposerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Fixed Bottom Button - Show/hide based on scroll */}
      <AnimatePresence>
        {showButton && (
          <div className="fixed bottom-8 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-3xl mx-auto flex justify-center pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={() => {
                    if (chatComposerRef.current) {
                      chatComposerRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      setTimeout(() => {
                        textareaRef.current?.focus();
                      }, 500);
                    }
                  }}
                  variant="default"
                  className="h-10 px-4 rounded-full shadow-lg border-0 flex items-center gap-2 font-550"
                >
                  <ScanSearch className="h-4 w-4" />
                  <span>Ask Insights</span>
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Results Sections */}
      <AnimatePresence>
        {results.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            {/* Loading State */}
            {!result.response && !result.error && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-[425]">Analyzing data...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4">
                <div className="text-sm font-[425] text-red-600">
                  Error: {result.error}
                </div>
              </div>
            )}

            {/* Result Content */}
            {result.response && (
              <AgentResponseRenderer response={result.response} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <div ref={resultsEndRef} />

      {/* Chat Composer Input */}
      <div ref={chatComposerRef} className={`w-full ${className}`}>
        <div className="shadow-xl bg-gray-0 border border-gray-200 rounded-[1.5rem] pl-4 pr-2 py-2">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask insights about this evaluation"
              disabled={isLoading}
              className="flex-1 resize-none pb-1 bg-transparent leading-relaxed text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 max-h-[120px]"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="h-8 w-fit px-4"
              variant="default"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  Get Insights
                  <Send className="h-4 w-4" />
                  
                </div>
              
              )}
            </Button>
          </div>
         
        </div>
         <p className="text-center text-xs text-gray-400 mt-4">
            Get Insights is in Beta. AI generated results might be inaccurate.
          </p>
      </div>
    </>
  );
}
