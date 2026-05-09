"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { TechEvent } from "@/types";

interface EmailSubscriptionProps {
  filteredEvents: TechEvent[];
}

export function EmailSubscription({ filteredEvents }: EmailSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || filteredEvents.length === 0) return;

    setStatus("loading");
    
    try {
      const response = await fetch("/api/send-events-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, events: filteredEvents }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Events sent successfully!");
        setTimeout(() => setStatus("idle"), 5000);
        setEmail("");
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to send. Please try again.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="w-64 pl-4 pr-32 py-2.5 bg-card border border-card-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || filteredEvents.length === 0}
        />
        <button
          type="submit"
          disabled={status === "loading" || filteredEvents.length === 0}
          className="absolute right-1 top-1 bottom-1 px-4 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <>
              <span className="mr-1.5">Send</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
      {message && status !== "idle" && (
        <span className={`text-xs font-medium absolute top-full mt-1.5 ${status === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
