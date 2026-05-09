"use client";

import { motion } from "framer-motion";
import { Calendar, Map, Tag, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalEvents: number;
  citiesCovered: number;
  aiEventsCount: number;
  upcomingThisMonth: number;
}

export function StatsCards({ totalEvents, citiesCovered, aiEventsCount, upcomingThisMonth }: StatsCardsProps) {
  const stats = [
    { label: "Total Events", value: totalEvents, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Cities Covered", value: citiesCovered, icon: Map, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "AI & Tech", value: aiEventsCount, icon: Tag, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Upcoming Soon", value: upcomingThisMonth, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="flex flex-col p-5 bg-card border border-card-border rounded-2xl hover:border-accent-foreground/10 transition-colors"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground mb-1">
            {stat.value}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
