"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  X,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsightAgentService } from "@/lib/agents/insight-agent-service";
import { AgentResponseRenderer } from "./agent-response-renderer";
import type { ChatMessage } from "@/lib/agents/types";

interface ChatComposerProps {
  evaluationId?: string;
  className?: string;
}

export function ChatComposer({
  evaluationId,
  className = "",
}: ChatComposerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Create placeholder for agent response
    const agentMessageId = (Date.now() + 1).toString();
    const agentPlaceholder: ChatMessage = {
      id: agentMessageId,
      role: "agent",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, agentPlaceholder]);
    setIsLoading(true);

    // Call agent service
    try {
      const result = await InsightAgentService.sendMessage(
        userMessage.content,
        evaluationId
      );

      // Update agent message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMessageId
            ? {
                ...msg,
                content: result.success
                  ? "Here are the insights:"
                  : "Sorry, I encountered an error.",
                response: result.response,
                error: result.error,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      // Handle error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMessageId
            ? {
                ...msg,
                content: "Failed to get response from agent.",
                error:
                  error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
              }
            : msg
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

  const handleClearHistory = () => {
    setMessages([]);
  };

  if (!isOpen) {
    // Collapsed floating button
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => {
              setIsOpen(true);
              setIsExpanded(false);
            }}
            className="h-12 w-12 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-0 shadow-lg border border-gray-700 p-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="pointer-events-auto"
        >
          <div
            className={`bg-gray-0 rounded-lg shadow-xl border border-gray-200 ${
              isExpanded ? "w-[500px]" : "w-[400px]"
            } ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-700" />
                <span className="font-550 text-sm text-gray-900">
                  Insight Agent
                </span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-7 w-7 p-0 hover:bg-gray-200"
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Message History (when expanded) */}
            {isExpanded && messages.length > 0 && (
              <div
                ref={chatContainerRef}
                className="max-h-[400px] overflow-y-auto px-4 py-3 space-y-3 bg-gray-0"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`space-y-2 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {/* User Message */}
                    {msg.role === "user" && (
                      <div className="inline-block max-w-[80%]">
                        <div className="bg-gray-900 text-gray-0 px-3 py-2 rounded-lg text-sm font-[425]">
                          {msg.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-1">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    )}

                    {/* Agent Message */}
                    {msg.role === "agent" && (
                      <div className="space-y-2">
                        <div className="inline-block max-w-[90%] text-left">
                          {msg.isLoading ? (
                            <div className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                              <span className="text-sm font-[425] text-gray-600">
                                Thinking...
                              </span>
                            </div>
                          ) : (
                            <div className="bg-gray-100 px-3 py-2 rounded-lg space-y-2">
                              {msg.error && (
                                <p className="text-sm font-[425] text-red-600">
                                  {msg.content}
                                </p>
                              )}
                              {msg.response && (
                                <AgentResponseRenderer response={msg.response} />
                              )}
                              {!msg.response && !msg.error && (
                                <p className="text-sm font-[425] text-gray-900">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-3 space-y-2">
              {messages.length > 0 && isExpanded && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-6 text-xs text-gray-600 hover:text-gray-900"
                  >
                    Clear History
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about evaluation insights..."
                  className="flex-1 resize-none rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem] text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 max-h-[120px]"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="h-9 w-9 p-0 bg-gray-900 hover:bg-gray-800 text-gray-0 disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 px-1">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
