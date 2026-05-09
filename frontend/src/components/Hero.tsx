"use client";

import { motion } from "framer-motion";
import { EmailSubscription } from "./EmailSubscription";
import { TechEvent } from "@/types";

interface HeroProps {
  filteredEvents: TechEvent[];
}

export function Hero({ filteredEvents }: HeroProps) {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradients for modern, jolly feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-tr from-amber-400/20 via-orange-300/10 to-rose-400/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center px-3 py-1 mb-6 text-xs font-medium bg-muted text-foreground border border-card-border rounded-full"
        >
          <span className="w-2 h-2 mr-2 rounded-full bg-green-500 animate-pulse" />
          Live Platform
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground text-balance mb-6"
        >
          India Tech Events <span className="text-muted-foreground">Hub</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mb-10"
        >
          Discover the top upcoming technology conferences, startup meetups, and developer summits happening across India.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 relative z-20"
        >
          <div className="flex flex-col items-start gap-2 relative">
            <span className="text-sm font-medium text-foreground ml-1">Get weekly updates</span>
            <EmailSubscription filteredEvents={filteredEvents} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
