"use client";

import { useState, useMemo } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Hero } from "@/components/Hero";
import { StatsCards } from "@/components/StatsCards";
import { FilterBar } from "@/components/FilterBar";
import { EventCard } from "@/components/EventCard";
import { TechEvent } from "@/types";

// Mock Data based on the requirements
const initialEvents: TechEvent[] = [
  {
    id: "1",
    eventName: "AI Summit Bengaluru 2026",
    date: "May 15-16, 2026",
    sortDate: "2026-05-15",
    city: "Bengaluru",
    venue: "BIEC",
    category: "AI",
    shortDescription: "The premier AI conference exploring the future of artificial intelligence, machine learning, and neural networks.",
    websiteLink: "https://example.com/ai-summit-blr"
  },
  {
    id: "2",
    eventName: "Startup Expo India",
    date: "June 2-4, 2026",
    sortDate: "2026-06-02",
    city: "Mumbai",
    venue: "Jio World Convention Centre",
    category: "Startup",
    shortDescription: "Connecting the brightest startups with top investors and venture capitalists from across the globe.",
    websiteLink: "https://example.com/startup-expo-mumbai"
  },
  {
    id: "3",
    eventName: "Cloud Native Day",
    date: "July 10, 2026",
    sortDate: "2026-07-10",
    city: "Pune",
    venue: "Marriott",
    category: "Cloud",
    shortDescription: "A deep dive into Kubernetes, microservices, and modern cloud-native architectures.",
    websiteLink: "https://example.com/cloud-native-pune"
  },
  {
    id: "4",
    eventName: "Cybersecurity Con 2026",
    date: "May 28-29, 2026",
    sortDate: "2026-05-28",
    city: "Delhi NCR",
    venue: "Pragati Maidan",
    category: "Cybersecurity",
    shortDescription: "Securing the future: Discussions on zero trust, ransomware defense, and cutting-edge security.",
    websiteLink: "https://example.com/cyber-con-delhi"
  },
  {
    id: "5",
    eventName: "SaaS Founders Meetup",
    date: "August 14, 2026",
    sortDate: "2026-08-14",
    city: "Chennai",
    venue: "ITC Grand Chola",
    category: "SaaS",
    shortDescription: "Exclusive meetup for SaaS founders to discuss growth, metrics, and scaling strategies.",
    websiteLink: "https://example.com/saas-founders-chennai"
  },
  {
    id: "6",
    eventName: "React India 2026",
    date: "September 5-7, 2026",
    sortDate: "2026-09-05",
    city: "Goa",
    venue: "Grand Hyatt",
    category: "Developer",
    shortDescription: "The largest React and React Native conference in India featuring international speakers.",
    websiteLink: "https://example.com/react-india"
  },
  {
    id: "7",
    eventName: "Fintech Revolution",
    date: "June 18, 2026",
    sortDate: "2026-06-18",
    city: "Mumbai",
    venue: "Taj Lands End",
    category: "Startup",
    shortDescription: "Exploring the next wave of financial technology, open banking, and crypto innovations.",
    websiteLink: "https://example.com/fintech-mumbai"
  },
  {
    id: "8",
    eventName: "Generative AI Hackathon",
    date: "May 22-23, 2026",
    sortDate: "2026-05-22",
    city: "Hyderabad",
    venue: "T-Hub",
    category: "AI",
    shortDescription: "A 48-hour hackathon focused on building next-generation applications using LLMs.",
    websiteLink: "https://example.com/genai-hack-hyd"
  }
];

export default function Home() {
  const [events, setEvents] = useState<TechEvent[]>(initialEvents);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Extract unique filter options
  const cities = useMemo(() => Array.from(new Set(events.map(e => e.city))).sort(), [events]);
  const categories = useMemo(() => Array.from(new Set(events.map(e => e.category))).sort(), [events]);
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    events.forEach(e => {
      const date = new Date(e.sortDate);
      if (!isNaN(date.getTime())) {
        monthSet.add(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
      }
    });
    return Array.from(monthSet);
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search
      if (searchQuery && !event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !event.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // City
      if (selectedCity && event.city !== selectedCity) {
        return false;
      }
      
      // Category
      if (selectedCategory && event.category !== selectedCategory) {
        return false;
      }
      
      // Month
      if (selectedMonth) {
        const eventMonth = new Date(event.sortDate).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (eventMonth !== selectedMonth) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
  }, [events, searchQuery, selectedCity, selectedCategory, selectedMonth]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCategory("");
    setSelectedMonth("");
  };

  const fetchLiveEvents = async () => {
    setIsFetchingLive(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/fetch-events", { method: "POST" });
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      } else {
        setErrorMsg(data.error || "Failed to fetch events");
      }
    } catch (err) {
      setErrorMsg("Failed to fetch events");
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Stats calculation
  const totalEvents = events.length;
  const citiesCovered = cities.length;
  const aiEventsCount = events.filter(e => e.category === "AI").length;
  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const upcomingThisMonth = events.filter(e => {
    const eventMonth = new Date(e.sortDate).toLocaleString('default', { month: 'long', year: 'numeric' });
    return eventMonth === currentMonthStr;
  }).length;

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col relative">
      <Hero filteredEvents={filteredEvents} />
      
      <StatsCards 
        totalEvents={totalEvents}
        citiesCovered={citiesCovered}
        aiEventsCount={aiEventsCount}
        upcomingThisMonth={upcomingThisMonth}
      />

      <div className="flex flex-col flex-1 relative z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Events Dashboard</h2>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </span>
          </div>
          <button
            onClick={fetchLiveEvents}
            disabled={isFetchingLive}
            className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isFetchingLive ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping Web...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Live Events
              </>
            )}
          </button>
        </div>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          cities={cities}
          categories={categories}
          months={months}
          onClear={handleClearFilters}
        />

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {filteredEvents.map((event, idx) => (
              <EventCard key={event.id} event={event} index={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any events matching your current filters. Try adjusting your search criteria or clearing filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-6 px-4 py-2 bg-foreground text-background font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
