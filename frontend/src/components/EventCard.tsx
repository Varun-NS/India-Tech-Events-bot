"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, ExternalLink, Plus } from "lucide-react";
import { TechEvent } from "@/types";

interface EventCardProps {
  event: TechEvent;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("ai")) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (cat.includes("startup")) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    if (cat.includes("saas")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    if (cat.includes("cloud")) return "bg-sky-500/10 text-sky-600 border-sky-500/20";
    if (cat.includes("cyber")) return "bg-red-500/10 text-red-600 border-red-500/20";
    if (cat.includes("developer")) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const handleAddToCalendar = () => {
    const text = encodeURIComponent(event.eventName);
    const dates = encodeURIComponent(`${event.sortDate.replace(/-/g, "")}T090000Z/${event.sortDate.replace(/-/g, "")}T180000Z`);
    const details = encodeURIComponent(`${event.shortDescription}\n\nMore info: ${event.websiteLink}`);
    const location = encodeURIComponent(`${event.venue}, ${event.city}`);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative flex flex-col justify-between p-6 bg-card border border-card-border rounded-2xl hover:border-accent-foreground/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
      
      <div className="z-10">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          <div className="flex items-center text-muted-foreground text-sm font-medium">
            <Calendar className="w-4 h-4 mr-1.5" />
            {event.date}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-foreground tracking-tight group-hover:text-primary transition-colors">
          {event.eventName}
        </h3>

        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
          <span className="truncate">{event.venue !== "Not specified" ? `${event.venue}, ${event.city}` : event.city}</span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
          {event.shortDescription}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-auto z-10 pt-4 border-t border-card-border/50">
        <a
          href={event.websiteLink !== 'N/A' ? event.websiteLink : '#'}
          target={event.websiteLink !== 'N/A' ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          onClick={(e) => {
            if (event.websiteLink === 'N/A') e.preventDefault();
          }}
        >
          Visit Website
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
        <button
          onClick={handleAddToCalendar}
          className="inline-flex justify-center items-center px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors"
          title="Add to Calendar"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
