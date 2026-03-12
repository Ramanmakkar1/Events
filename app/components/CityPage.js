/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December",
];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CAT_META = {
  Sports: { bg: "#041E42", accent: "#FF4C00", icon: "🏒", label: "Sports" },
  Concert: { bg: "#1a0a2e", accent: "#e040fb", icon: "🎵", label: "Concerts" },
  Festival: { bg: "#0a2e1a", accent: "#00e676", icon: "🎪", label: "Festivals" },
  Comedy: { bg: "#2e2a0a", accent: "#ffd740", icon: "😂", label: "Comedy" },
  Theatre: { bg: "#2e0a1a", accent: "#ff5252", icon: "🎭", label: "Arts & Theatre" },
  Family: { bg: "#0a1a2e", accent: "#40c4ff", icon: "👨‍👩‍👧‍👦", label: "Family" },
  Miscellaneous: { bg: "#1a1a2e", accent: "#b388ff", icon: "✨", label: "Other" },
};

// Utils
const fmt = {
  time: (d) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  dateFull: (d) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  dateShort: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  relative: (d) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((target - today) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 7) return DAYS_FULL[d.getDay()];
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },
};

function classifyEvent(ev) {
  const c = ev.classifications?.[0];
  const seg = c?.segment?.name || "";
  const genre = c?.genre?.name || "";
  if (seg === "Sports") return "Sports";
  if (genre === "Comedy") return "Comedy";
  if (seg === "Arts & Theatre") return "Theatre";
  if (
    ["Family", "Children's Theatre", "Childrens Theatre"].includes(genre) ||
    seg === "Family"
  )
    return "Family";
  if (genre.includes("Festival")) return "Festival";
  if (seg === "Music") return "Concert";
  if (seg === "Miscellaneous") return "Miscellaneous";
  return "Concert";
}

function parseEvent(ev) {
  const cat = classifyEvent(ev);
  const meta = CAT_META[cat] || CAT_META.Miscellaneous;
  const localDate = ev.dates?.start?.localDate || "";
  const localTime = ev.dates?.start?.localTime || "";
  const dt = localTime
    ? new Date(`${localDate}T${localTime}`)
    : new Date(localDate + "T19:00:00");
  return {
    id: ev.id,
    name: ev.name,
    category: cat,
    meta,
    venue: ev._embedded?.venues?.[0]?.name || "TBA",
    address: ev._embedded?.venues?.[0]?.address?.line1 || "",
    date: dt,
    localDate,
    priceMin: ev.priceRanges?.[0]?.min ?? null,
    priceMax: ev.priceRanges?.[0]?.max ?? null,
    url: ev.url || "#",
    image: ev.images?.sort((a, b) => (b.width || 0) - (a.width || 0))?.[0]?.url || null,
    status: ev.dates?.status?.code || "onsale",
  };
}

function generateDemoEvents(config) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const demoList = [
    [`${config.name} ${config.teamName} vs Calgary Flames`, "Sports", config.arena, 85, 350, 0],
    [`${config.name} ${config.teamName} vs Vancouver Canucks`, "Sports", config.arena, 65, 280, 3],
    [`${config.name} ${config.teamName} vs Toronto Maple Leafs`, "Sports", config.arena, 95, 500, 7],
    [`${config.name} ${config.teamName} vs Winnipeg Jets`, "Sports", config.arena, 60, 260, 12],
    [`${config.name} ${config.teamName} vs Montreal Canadiens`, "Sports", config.arena, 70, 300, 18],
    [`${config.name} ${config.teamName} vs Colorado Avalanche`, "Sports", config.arena, 90, 400, 24],
    [`Karan Aujla — It Was All A Dream Tour`, "Concert", config.arena, 89, 250, 1],
    [`Diljit Dosanjh — Dil-Luminati Tour`, "Concert", `${config.name} Stadium`, 99, 350, 5],
    [`AP Dhillon Live in ${config.name}`, "Concert", config.arena, 79, 220, 9],
    [`Drake — Anita Max Wynn Tour`, "Concert", config.arena, 120, 450, 14],
    [`The Weeknd — After Hours Til Dawn`, "Concert", `${config.name} Stadium`, 110, 380, 20],
    [`Morgan Wallen — One Night At A Time`, "Concert", config.arena, 85, 300, 22],
    [`${config.name} Symphony Orchestra`, "Concert", `${config.name} Theatre`, 35, 110, 4],
    [`Taylor Swift — The Eras Tour`, "Concert", `${config.name} Stadium`, 150, 800, 27],
    [`Kevin Hart — Reality Check`, "Comedy", config.arena, 65, 180, 6],
    [`Hasan Minhaj Live`, "Comedy", `${config.name} Performing Arts Centre`, 55, 120, 11],
    [`Russell Peters — Act Your Age`, "Comedy", config.arena, 60, 150, 16],
    [`Punjabi Comedy Night`, "Comedy", `${config.name} Theatre`, 40, 80, 21],
    [`Cirque du Soleil — KOOZA`, "Theatre", `${config.name} EXPO Centre`, 45, 165, 2],
    [`Frozen — The Musical`, "Theatre", `${config.name} Performing Arts Centre`, 55, 200, 10],
    [`${config.name} International Fringe Festival`, "Theatre", `Downtown ${config.name}`, 15, 45, 17],
    [`Les Misérables`, "Theatre", `${config.name} Performing Arts Centre`, 50, 180, 25],
    [`Summer Music Festival`, "Festival", `${config.name} EXPO Centre`, 30, 60, 8],
    [`${config.name} Folk Music Festival`, "Festival", `${config.name} Park`, 40, 120, 15],
    [`Heritage Festival`, "Festival", `${config.name} Park`, 0, 0, 19],
    [`Taste of ${config.name}`, "Festival", `${config.name} Square`, 5, 15, 23],
    [`Monster Jam`, "Family", `${config.name} Stadium`, 30, 85, 3],
    [`Disney On Ice — Find Your Hero`, "Family", config.arena, 35, 120, 13],
    [`PAW Patrol Live!`, "Family", `${config.name} Performing Arts Centre`, 25, 75, 19],
    [`Harlem Globetrotters`, "Family", config.arena, 30, 90, 26],
  ];
  const imgs = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop",
  ];
  return demoList.map(([name, cat, venue, pMin, pMax, dayOff], i) => {
    const meta = CAT_META[cat] || CAT_META.Miscellaneous;
    const day = Math.min((dayOff % 28) + 1, 28);
    // Scatter demo events across an entire 12-month period
    const monthOffset = i % 12; 
    const dt = new Date(y, m + monthOffset, day, 19 + (i % 3), i % 2 === 0 ? 0 : 30);
    return {
      id: `demo-${i}`,
      name,
      category: cat,
      meta,
      venue,
      address: "",
      date: dt,
      localDate: dt.toISOString().split("T")[0],
      priceMin: pMin ?? null,
      priceMax: pMax ?? null,
      url: "#",
      image: imgs[i % imgs.length],
      status: "onsale",
    };
  });
}

function EventCard({ ev, index, onToast, isSaved, onSave }) {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: ev.name,
        text: `Check out ${ev.name} happening at ${ev.venue}!`,
        url: ev.url || window.location.href,
      }).catch(console.error);
    } else {
      if (onToast) onToast("Sharing is not supported on this browser.", "error");
      else alert("Sharing is not supported on this browser.");
    }
  };

  const handleAddToCalendar = (e) => {
    e.stopPropagation();
    const startStr = ev.date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endDt = new Date(ev.date.getTime() + 2 * 60 * 60 * 1000);
    const endStr = endDt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${ev.url}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${ev.name}
DESCRIPTION:Tickets: ${ev.url}
LOCATION:${ev.venue}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${ev.name.replace(/\\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast("Added to your calendar!", "success");
  };

  const priceHTML = (ev.priceMin !== null && ev.priceMin !== undefined) ? (
    <div
      className="event-card-price"
      style={{ background: `${ev.meta.accent}15`, color: ev.meta.accent }}
    >
      {ev.priceMin === 0 ? "Free" : `$${ev.priceMin}`}
      {ev.priceMax && ev.priceMax !== ev.priceMin ? ` – $${ev.priceMax}` : (ev.priceMin !== 0 ? "+" : "")} {ev.priceMin !== 0 ? "CAD" : ""}
    </div>
  ) : (
    <div
      className="event-card-notba"
      style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text2)", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}
    >
      Check Ticketmaster
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </div>
  );

  return (
    <div
      ref={cardRef}
      className="event-card fade-up group"
      style={{
        animationDelay: `${index * 0.06}s`,
        background: `linear-gradient(135deg, ${ev.meta.bg}90, rgba(13,13,20,0.9))`,
        border: `1px solid ${ev.meta.accent}20`,
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out, border-color 0.2s ease',
        transformStyle: 'preserve-3d',
      }}
      onClick={() => {
        if (ev.url && ev.url !== "#") window.open(ev.url, "_blank");
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={(e) => {
        handleMouseLeave();
        e.currentTarget.style.borderColor = `${ev.meta.accent}20`;
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${ev.meta.accent}50`)}
    >
      {ev.image && (
        <div
          className="event-card-img"
          style={{ backgroundImage: `url('${ev.image}')` }}
        >
          <img src={ev.image} alt={`${ev.name} at ${ev.venue}`} style={{ display: 'none' }} loading="lazy" />
          <div className="event-card-img-overlay"></div>
          <div className="event-card-cat-badge" style={{ color: ev.meta.accent }}>
            {ev.meta.icon} {ev.meta.label}
          </div>
        </div>
      )}
      <div className="event-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {!ev.image && (
            <div className="event-card-cat-inline">
              <span style={{ fontSize: "16px" }}>{ev.meta.icon}</span>
              <span className="event-card-cat-label" style={{ color: ev.meta.accent }}>
                {ev.meta.label}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="share-btn" onClick={(e) => { e.stopPropagation(); ev.url && ev.url !== "#" ? window.open(ev.url, "_blank") : null; }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: ev.meta.accent, cursor: 'pointer', padding: '0' }} title="Buy Tickets">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2"/><path d="M15 11v2"/><path d="M15 17v2"/><path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>
              <span style={{ fontSize: '9px', fontWeight: 600 }}>Buy</span>
            </button>
            <button className="share-btn" onClick={(e) => { e.stopPropagation(); if (onSave) onSave(); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: isSaved ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', padding: '0' }} title={isSaved ? "Remove Saved" : "Save Event"}>
              {isSaved ? <svg fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> 
              : <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
              <span style={{ fontSize: '9px', fontWeight: 600 }}>{isSaved ? "Saved" : "Save"}</span>
            </button>
            <button className="share-btn" onClick={handleShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: '0' }} title="Share Event">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              <span style={{ fontSize: '9px', fontWeight: 600 }}>Share</span>
            </button>
            <button className="share-btn" onClick={handleAddToCalendar} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: '0' }} title="Add to Calendar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
              <span style={{ fontSize: '9px', fontWeight: 600 }}>Add</span>
            </button>
          </div>
        </div>
        <h4 style={{ transform: "translateZ(30px)" }}>{ev.name}</h4>
        <div className="event-card-meta" style={{ transform: "translateZ(20px)" }}>
          <span>📍 {ev.venue}</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              📅 {fmt.dateFull(ev.date)} • {fmt.time(ev.date)}
            </span>
            <span style={{ fontSize: "14px", background: "var(--surface2)", padding: "2px 6px", borderRadius: "10px", color: "var(--text2)" }}>
              {["❄️", "⛅", "🌧️", "☀️"][ev.date.getDate() % 4]} {Math.abs((ev.date.getDate() % 15) - 5)}°
            </span>
          </div>
        </div>
        <div style={{ transform: "translateZ(40px)" }}>
          {priceHTML}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ ev, index }) {
  return (
    <div
      className="featured-card fade-up"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => {
        if (ev.url && ev.url !== "#") window.open(ev.url, "_blank");
      }}
    >
      {ev.image && (
        <div
          className="featured-card-bg"
          style={{ backgroundImage: `url('${ev.image}')` }}
        >
          <img src={ev.image} alt={`Featured event: ${ev.name} at ${ev.venue}`} style={{ display: 'none' }} loading="lazy" />
        </div>
      )}
      <div className="featured-card-overlay"></div>
      <div className="featured-card-content">
        <div
          className="featured-date-badge"
          style={{
            background: `${ev.meta.accent}20`,
            border: `1px solid ${ev.meta.accent}40`,
            color: ev.meta.accent,
          }}
        >
          {ev.meta.icon} {fmt.relative(ev.date)} • {fmt.time(ev.date)}
        </div>
        <h3>{ev.name}</h3>
        <p>📍 {ev.venue}</p>
      </div>
    </div>
  );
}

import { CITIES } from "../data/cities";
import Link from "next/link";

export default function CityPage({ cityId = "edmonton" }) {
  const config = CITIES[cityId] || CITIES["edmonton"];

  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activePage, setActivePage] = useState("home"); // home | events | shop | about | saved
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list"); // list | map
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [statsMonthOffset, setStatsMonthOffset] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Bookmarks Logic
  const [savedEventIds, setSavedEventIds] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedEvents");
    if (saved) {
      try {
        setSavedEventIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleSaveEvent = useCallback((eventId) => {
    setSavedEventIds(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      localStorage.setItem("savedEvents", JSON.stringify(next));
      if (!prev.includes(eventId)) {
        addToast("Event saved successfully!", "success");
      }
      return next;
    });
  }, [addToast]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(".fade-up:not(.is-visible), .fade-in:not(.is-visible)");
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [allEvents, activePage, activeView, visibleCount, statsMonthOffset, activeFilter, searchQuery]);

  // Typewriter effect logic
  const heroPhrases = useMemo(() => ["Live Concerts", `${config.teamName} Games`, "Comedy Nights", "Festivals"], [config.teamName]);
  const [typewriterText, setTypewriterText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ticker = setTimeout(() => {
      const currentPhrase = heroPhrases[phraseIndex];
      if (!isDeleting) {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length + 1));
        if (typewriterText === currentPhrase) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length - 1));
        if (typewriterText === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
        }
      }
    }, isDeleting ? 40 : 100);
    return () => clearTimeout(ticker);
  }, [typewriterText, isDeleting, phraseIndex, heroPhrases]);

  useEffect(() => {
    // Only detect location once per session to allow users to switch freely
    if (sessionStorage.getItem("locationDetected")) return;
    sessionStorage.setItem("locationDetected", "true");

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (!data.city) return;
        const city = data.city.toLowerCase();
        const routes = {
          toronto: "/toronto",
          vancouver: "/vancouver",
          calgary: "/calgary",
          montreal: "/montreal",
          winnipeg: "/winnipeg",
          ottawa: "/ottawa",
        };
        if (routes[city]) {
          window.location.href = routes[city];
        }
      })
      .catch((err) => console.log("Location detection failed:", err));
  }, []);

  useEffect(() => {
    document.body.classList.add(config.theme);
    document.body.classList.remove('theme-light');
    localStorage.removeItem("themeMode");
    return () => document.body.classList.remove(config.theme);
  }, [config.theme]);

  // Dynamic page title
  useEffect(() => {
    document.title = `${config.name} Weekend — Everything Happening in ${config.name}`;
  }, [config.name]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [activeFilter, searchQuery, statsMonthOffset]);

  const fetchedMonthsRef = useRef(new Set());

  const fetchEvents = useCallback(async (dateToFetch, offset) => {
    const targetDate = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth() + offset, 1);
    const monthKey = `${config.id}-${targetDate.getFullYear()}-${targetDate.getMonth()}`;
    
    if (fetchedMonthsRef.current.has(monthKey)) {
      return;
    }
    
    setLoading(true);
    setIsDemo(false);
    try {
      const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
      const s = start.toISOString().split(".")[0] + "Z";
      const e = end.toISOString().split(".")[0] + "Z";
      const url = `/api/events?city=${encodeURIComponent(config.apiCity)}&stateCode=${encodeURIComponent(config.apiState)}&startDateTime=${encodeURIComponent(s)}&endDateTime=${encodeURIComponent(e)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const newEvents = data._embedded?.events ? data._embedded.events.map(parseEvent) : [];
      
      setAllEvents(prev => {
        // Accumulate events to maintain full data tracking as user scrolls months
        const combined = [...prev, ...newEvents];
        // Deduplicate
        const unique = Array.from(new Map(combined.map(ev => [ev.id, ev])).values());
        return unique;
      });
      fetchedMonthsRef.current.add(monthKey);
    } catch (err) {
      console.error("API unreachable, using demo data:", err);
      if (!isDemo) {
        setAllEvents(generateDemoEvents(config));
        setIsDemo(true);
      }
    }
    setLoading(false);
  }, [config, isDemo]);

  useEffect(() => {
    fetchEvents(currentDate, statsMonthOffset);
  }, [fetchEvents, currentDate, statsMonthOffset]);

  const filteredEvents = useMemo(() => {
    const search = searchQuery.toLowerCase();
    const todayStr = new Date().toDateString();

    return allEvents.filter((ev) => {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
      
      if (activeFilter === "today") {
        if (ev.date.toDateString() !== todayStr) return false;
      } else {
        // Globally enforce month offset for everything else
        if (ev.date.getMonth() !== targetDate.getMonth() || ev.date.getFullYear() !== targetDate.getFullYear()) return false;
        
        if (activeFilter === "thisWeek") {
          if (statsMonthOffset === 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const d = (ev.date - today) / 86400000;
            if (d < 0 || d >= 7) return false;
          } else {
            const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            const d = (ev.date - firstDay) / 86400000;
            if (d < 0 || d >= 7) return false;
          }
        } else if (activeFilter === "teamGames") {
          if (ev.category !== "Sports" || !ev.name.toLowerCase().includes(config.teamSearch)) return false;
        } else if (activeFilter !== "all" && activeFilter !== "thisMonth" && ev.category !== activeFilter) {
          return false;
        }
      }

      if (
        search &&
        !ev.name.toLowerCase().includes(search) &&
        !ev.venue.toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });
  }, [allEvents, activeFilter, searchQuery, currentDate, statsMonthOffset, config.teamSearch]);

  const categoryCounts = useMemo(() => {
    const todayStr = new Date().toDateString();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
    
    // Get all events for the target month
    const monthEvents = allEvents.filter(ev => 
      ev.date.getMonth() === targetDate.getMonth() && 
      ev.date.getFullYear() === targetDate.getFullYear()
    );
    
    // Today check remains absolute
    const counts = { 
      all: monthEvents.length, 
      today: allEvents.filter(ev => ev.date.toDateString() === todayStr).length 
    };
    
    monthEvents.forEach(ev => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, [allEvents, currentDate, statsMonthOffset]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredEvents
      .filter((ev) => {
        if (statsMonthOffset < 0) return true; // Show all events for past months
        if (statsMonthOffset === 0 && ev.date < today) return false; // Hide past events in current month
        return true;
      })
      .sort((a, b) => a.date - b.date);
  }, [filteredEvents, statsMonthOffset]);

  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [upcomingEvents.length, visibleCount]);

  const savedEventsData = useMemo(() => {
    return allEvents.filter(ev => savedEventIds.includes(ev.id)).sort((a, b) => a.date - b.date);
  }, [allEvents, savedEventIds]);

  const nextEvent = useMemo(() => {
    const today = new Date();
    return allEvents.filter(ev => ev.date >= today).sort((a, b) => a.date - b.date)[0];
  }, [allEvents]);

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!nextEvent) return;
    const interval = setInterval(() => {
      const diff = nextEvent.date.getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("Happening Now!");
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  // Scroll To Top Logic
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const homeStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
    const targetY = targetDate.getFullYear();
    const targetM = targetDate.getMonth();

    const eventsInMonth = allEvents.filter(
      (ev) => ev.date.getMonth() === targetM && ev.date.getFullYear() === targetY
    );
    const thisMonth = eventsInMonth.length;
    
    let thisWeek = 0;
    if (statsMonthOffset === 0) {
      thisWeek = eventsInMonth.filter((ev) => {
        const d = (ev.date - today) / 86400000;
        return d >= 0 && d < 7;
      }).length;
    } else {
      const firstDay = new Date(targetY, targetM, 1);
      thisWeek = eventsInMonth.filter((ev) => {
        const d = (ev.date - firstDay) / 86400000;
        return d >= 0 && d < 7;
      }).length;
    }

    const oilers = eventsInMonth.filter(
      (ev) => ev.category === "Sports" && ev.name.toLowerCase().includes(config.teamSearch)
    ).length;
    const concerts = eventsInMonth.filter((ev) => ev.category === "Concert").length;

    return { thisMonth, thisWeek, oilers, concerts };
  }, [allEvents, currentDate, config.teamSearch, statsMonthOffset]);

  const thisWeekEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
    const targetY = targetDate.getFullYear();
    const targetM = targetDate.getMonth();

    return allEvents
      .filter((ev) => {
        if (ev.date.getMonth() !== targetM || ev.date.getFullYear() !== targetY) return false;
        if (statsMonthOffset === 0) {
          const d = (ev.date - today) / 86400000;
          return d >= 0 && d < 7;
        } else {
          const firstDay = new Date(targetY, targetM, 1);
          const d = (ev.date - firstDay) / 86400000;
          return d >= 0 && d < 7;
        }
      })
      .sort((a, b) => a.date - b.date)
      .slice(0, 6);
  }, [allEvents, currentDate, statsMonthOffset]);

  const homeFeaturedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
    const targetY = targetDate.getFullYear();
    const targetM = targetDate.getMonth();

    return allEvents
      .filter((ev) => {
         if (ev.date.getMonth() !== targetM || ev.date.getFullYear() !== targetY) return false;
         if (statsMonthOffset === 0 && ev.date < today) return false;
         return ev.image;
      })
      .sort((a, b) => a.date - b.date)
      .slice(0, 6);
  }, [allEvents, currentDate, statsMonthOffset]);

  const homeOilersEvents = useMemo(() => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
    const targetY = targetDate.getFullYear();
    const targetM = targetDate.getMonth();

    return allEvents
      .filter((ev) => {
         if (ev.date.getMonth() !== targetM || ev.date.getFullYear() !== targetY) return false;
         return ev.category === "Sports" && ev.name.toLowerCase().includes(config.teamSearch);
      })
      .slice(0, 8);
  }, [allEvents, currentDate, statsMonthOffset, config.teamSearch]);

  // Render Calendar Grid
  const CalendarGrid = () => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = new Date();

    const days = [];
    for (let i = 0; i < firstDow; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvs = filteredEvents.filter(ev => ev.date.getDate() === day && ev.date.getMonth() === m && ev.date.getFullYear() === y);
      const has = dayEvs.length > 0;
      const isTd = day === today.getDate() && m === today.getMonth() && y === today.getFullYear();
      const sel = selectedDay === day;
      const hasOilers = dayEvs.some(e => e.category === 'Sports');

      const borderStyle = sel ? `2px solid var(--accent)` : isTd ? `2px solid rgba(255,76,0,0.4)` : `1px solid var(--border)`;
      const bgStyle = sel ? `rgba(255,76,0,0.12)` : has ? `rgba(255,255,255,0.03)` : `transparent`;
      const numColor = sel ? `var(--accent)` : isTd ? `#fff` : has ? `#ddd` : `#333`;
      const numWeight = isTd ? 800 : has ? 600 : 400;

      days.push(
        <button
          key={`day-${day}`}
          className={`cal-day-btn ${has ? 'has-events' : 'no-events'}`}
          style={{ border: borderStyle, background: bgStyle }}
          disabled={!has}
          onClick={() => has ? setSelectedDay(selectedDay === day ? null : day) : null}
        >
          <span className="cal-day-num" style={{ color: numColor, fontWeight: numWeight }}>{day}</span>
          {has && (
            <div className="cal-dots">
              {dayEvs.slice(0, 4).map((ev, i) => (
                <div key={i} className="cal-dot" style={{ background: ev.meta.accent, boxShadow: `0 0 6px ${ev.meta.accent}50` }}></div>
              ))}
              {dayEvs.length > 4 && <span className="cal-overflow">+{dayEvs.length - 4}</span>}
            </div>
          )}
          {hasOilers && <span className="cal-oilers">🏒</span>}
        </button>
      );
    }

    return <div className="cal-grid">{days}</div>;
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return filteredEvents.filter(
      (ev) =>
        ev.date.getDate() === selectedDay &&
        ev.date.getMonth() === m &&
        ev.date.getFullYear() === y
    );
  }, [filteredEvents, selectedDay, currentDate]);

  const jsonLdSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": upcomingEvents.slice(0, 30).map((ev, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Event",
          "name": ev.name,
          "startDate": ev.date.toISOString(),
          "location": {
            "@type": "Place",
            "name": ev.venue,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": config.name,
              "addressRegion": config.prov || "AB",
              "addressCountry": "CA"
            }
          },
          "image": ev.image ? [ev.image] : undefined,
          "offers": ev.priceMin ? {
            "@type": "Offer",
            "url": ev.url,
            "price": ev.priceMin,
            "priceCurrency": "CAD",
            "availability": "https://schema.org/InStock"
          } : undefined
        }
      }))
    };
  }, [upcomingEvents, config]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <div id="ambient"></div>
      <div id="noise"></div>
      <div id="app">
        {/* NAV */}
        <nav>
          <div className="nav-inner">
            <div className="nav-logo" onClick={() => { setActivePage("home"); setMobileMenuOpen(false); }}>
              <img src="/logo.png" alt={`${config.name} Weekend Logo`} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover", background: "#fff", border: "1px solid rgba(255, 76, 0, 0.3)" }} />
              <span className="nav-logo-text">
                {config.name}<span>Weekend</span>
              </span>
            </div>

            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}></span>
              <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}></span>
              <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}></span>
            </button>

            <div className={`nav-right ${mobileMenuOpen ? "mobile-open" : ""}`}>
              <button
                className={`nav-btn ${activePage === "home" ? "active" : ""}`}
                onClick={() => { setActivePage("home"); setMobileMenuOpen(false); }}
              >
                Home
              </button>

              <div className={`nav-dropdown ${mobileDropdownOpen ? 'expanded' : ''}`}>
                <button
                  className={`nav-btn ${activePage === "events" ? "active" : ""}`}
                  onClick={(e) => {
                    if (window.innerWidth <= 768) {
                      e.preventDefault();
                      setMobileDropdownOpen(!mobileDropdownOpen);
                    } else {
                      setActivePage("events");
                      setMobileMenuOpen(false);
                    }
                  }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}
                >
                  Events
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: mobileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M1 1L5 5L9 1" /></svg>
                </button>
                <div className="nav-dropdown-content">
                  {Object.values(CITIES).map(c => (
                    <Link key={c.id} href={c.id === 'edmonton' ? '/' : `/${c.id}`} onClick={() => { setMobileMenuOpen(false); setMobileDropdownOpen(false); }}>{c.name}</Link>
                  ))}
                </div>
              </div>

              <button
                className={`nav-btn ${activePage === "shop" ? "active" : ""}`}
                onClick={() => { setActivePage("shop"); setMobileMenuOpen(false); }}
              >
                Shop
              </button>
              <button
                className={`nav-btn ${activePage === "about" ? "active" : ""}`}
                onClick={() => { setActivePage("about"); setMobileMenuOpen(false); }}
              >
                About
              </button>
              
              <button
                className={`nav-btn ${activePage === "saved" ? "active" : ""}`}
                style={{ position: 'relative' }}
                onClick={() => { setActivePage("saved"); setMobileMenuOpen(false); }}
              >
                Saved <span style={{ padding: '2px 6px', background: 'var(--accent)', color: '#fff', borderRadius: '10px', fontSize: '10px', marginLeft: '4px' }}>{savedEventIds.length}</span>
              </button>

              <div className="nav-divider"></div>
              <div className={`status-pill ${isDemo ? "demo" : "live"}`}>
                <div className={`status-dot ${isDemo ? "demo" : "live"}`}></div>
                <span className={`status-label ${isDemo ? "demo" : "live"}`}>
                  {isDemo ? "PREVIEW" : "LIVE"}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {isDemo && (
          <div id="demo-banner" style={{ display: "block" }}>
            <span>⚡ Preview mode — showing sample events. Deploy this site to see real Ticketmaster data.</span>
          </div>
        )}

        {/* HOME PAGE */}
        {activePage === "home" && (
          <div id="home-page" className="fade-in">
            {/* HERO */}
            <section className="hero">
              <div className="hero-inner fade-up">
                <div className="hero-badge">
                  <span>{config.name.toUpperCase()} • {config.provFull} • CANADA</span>
                </div>
                <h1>
                  <span style={{ color: "var(--accent)" }}>{typewriterText}</span><span className="cursor-blink">|</span><br />in {config.name}
                </h1>
                <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                  Discover the best things to do in {config.name} this weekend. From electrifying live concerts and {config.teamName} games, to vibrant festivals and comedy nights — your ultimate local event calendar. Updated in real time.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginTop: "32px", animationDelay: "0.2s" }} className="fade-up">
                  <button
                    className="btn-primary"
                    style={{ margin: 0, height: "48px", borderRadius: "30px", display: "flex", alignItems: "center", padding: "0 24px" }}
                    onClick={() => setActivePage("events")}
                  >
                    Browse Events →
                  </button>

                  <div className="month-selector" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "12px", background: "var(--surface)", padding: "0 16px", borderRadius: "30px", border: "1px solid var(--border)", height: "48px" }}>
                    <button onClick={() => setStatsMonthOffset(p => p - 1)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span>{new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "600" }}>{loading ? "..." : homeStats.thisMonth} Events</span>
                      </span>
                    </div>
                    <button onClick={() => setStatsMonthOffset(p => p + 1)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>
                </div>


                <div 
                  className="hero-categories fade-up" 
                  style={{ 
                    display: "flex", 
                    flexWrap: "nowrap", 
                    overflowX: "auto", 
                    gap: "12px", 
                    marginTop: "24px", 
                    paddingBottom: "16px",
                    width: "100vw",
                    marginLeft: "calc(-50vw + 50%)",
                    paddingLeft: "max(24px, calc((100vw - 1280px) / 2))",
                    paddingRight: "max(24px, calc((100vw - 1280px) / 2))",
                    scrollSnapType: "x mandatory",
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                    animationDelay: "0.4s" 
                  }}
                >
                  <style>{`.hero-categories::-webkit-scrollbar { display: none; }`}</style>
                  {Object.entries({ today: { icon: "⏰", label: "Today" }, ...CAT_META }).map(
                    ([key, val]) => (
                      <button
                        key={key}
                        onClick={() => { setActiveFilter(key); setActivePage("events"); setActiveView("list"); }}
                        style={{ 
                          flexShrink: 0,
                          scrollSnapAlign: "start",
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "8px", 
                          background: "var(--surface)", 
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.05)", 
                          padding: "10px 20px", 
                          borderRadius: "30px", 
                          fontSize: "14px", 
                          color: "var(--text)", 
                          cursor: "pointer", 
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = "var(--surface-light)"; 
                          e.currentTarget.style.borderColor = "var(--accent)"; 
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = "var(--surface)"; 
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; 
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{val.icon}</span> 
                        <span style={{ fontWeight: 600 }}>{val.label}</span> 
                        <span style={{ opacity: 0.8, fontSize: "12px", marginLeft: "4px", background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "10px" }}>
                          {categoryCounts[key] || 0}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* FEATURED CAROUSEL */}
            {homeFeaturedEvents.length > 0 && (
              <section className="content-section" style={{ position: "relative", overflow: "hidden" }}>
                <div className="content-inner">
                  <div className="section-header">
                    <div className="section-bar purple" style={{ background: "#e040fb" }}></div>
                    <h2 className="section-title">Featured Events</h2>
                    
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => document.getElementById('featured-carousel').scrollBy({ left: -360, behavior: 'smooth' })}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >←</button>
                      <button 
                        onClick={() => document.getElementById('featured-carousel').scrollBy({ left: 360, behavior: 'smooth' })}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >→</button>
                    </div>
                  </div>
                  
                  <div className="carousel-viewport fade-up">
                    <div id="featured-carousel" className="carousel-grid">
                      {homeFeaturedEvents.map((ev, i) => (
                        <FeaturedCard key={ev.id} ev={ev} index={i} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* THIS WEEK */}
            {thisWeekEvents.length > 0 && (
              <section className="content-section">
                <div className="content-inner">
                  <div className="section-header">
                    <div className="section-bar"></div>
                    <h2 className="section-title">{statsMonthOffset === 0 ? "This Week" : "First Week"} in {config.name}</h2>
                  </div>
                  <div className="events-grid">
                    {thisWeekEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i} onToast={addToast} isSaved={savedEventIds.includes(ev.id)} onSave={() => toggleSaveEvent(ev.id)} />
                    ))}
                  </div>
                </div>
              </section>
            )}



            {/* OILERS */}
            {homeOilersEvents.length > 0 && (
              <section className="oilers-section">
                <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
                  <div className="oilers-header">
                    <div className="oilers-icon">🏒</div>
                    <div>
                      <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px" }}>
                        {config.name} <span style={{ color: "var(--accent)" }}>{config.teamName}</span>
                      </h2>
                      <p style={{ color: "var(--text2)", fontSize: "14px" }}>
                        Upcoming games at {config.arena}
                      </p>
                    </div>
                  </div>
                  <div className="events-grid">
                    {homeOilersEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i} onToast={addToast} isSaved={savedEventIds.includes(ev.id)} onSave={() => toggleSaveEvent(ev.id)} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="cta-section">
              <div className="cta-box">
                <h2>Never Miss an Event</h2>
                <p>
                  Bookmark this page and check back anytime. We pull fresh event data
                  from Ticketmaster so you always know what&apos;s happening in {config.name}.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setActivePage("events")}
                >
                  Explore All Events →
                </button>
              </div>
            </section>
          </div>
        )}

        {/* EVENTS PAGE */}
        {activePage === "events" && (
          <div id="events-page" style={{ display: "block" }}>
            <div className="events-page-inner">
              <div style={{ marginBottom: "32px" }}>
                <div className="filter-row">
                  <div className="search-bar-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search events, venues, artists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="view-toggles" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "var(--surface)", padding: "6px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                      <button onClick={(e) => { e.preventDefault(); setStatsMonthOffset(p => p - 1); }} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                      </button>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "70px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)" }}>
                          {new Date(currentDate.getFullYear(), currentDate.getMonth() + statsMonthOffset, 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setStatsMonthOffset(p => p + 1); }} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </div>
                    <button
                      className={`view-btn ${activeView === "list" ? "active" : "inactive"}`}
                      onClick={() => setActiveView("list")}
                    >
                      📋 List
                    </button>
                    <button
                      className={`view-btn ${activeView === "map" ? "active" : "inactive"}`}
                      onClick={() => setActiveView("map")}
                    >
                      🗺️ Map
                    </button>
                  </div>
                </div>

                <div className="cat-filters">
                  {Object.entries({ all: { label: "🔥 All" }, today: { label: "⏰ Today" }, ...CAT_META }).map(
                    ([key, val]) => (
                      <button
                        key={key}
                        className={`filter-pill ${activeFilter === key ? "active" : "inactive"}`}
                        onClick={() => setActiveFilter(key)}
                      >
                        {val.icon ? `${val.icon} ` : ""}
                        {val.label}
                        <span style={{ opacity: 0.6, marginLeft: "4px", fontSize: "11px" }}>
                          ({categoryCounts[key] || 0})
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {loading ? (
                <div className="skeleton-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* 
                  {activeView === "calendar" && (
                    <div className="cal-container fade-in">
                      <div className="cal-wrap">
                        <div className="cal-nav">
                          <button
                            className="cal-nav-btn"
                            onClick={() => {
                              setSelectedDay(null);
                              setCurrentDate(
                                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                              );
                            }}
                          >
                            ←
                          </button>
                          <div>
                            <div className="cal-month">
                              {MONTHS[currentDate.getMonth()]}
                            </div>
                            <div className="cal-year">{currentDate.getFullYear()}</div>
                          </div>
                          <button
                            className="cal-nav-btn"
                            onClick={() => {
                              setSelectedDay(null);
                              setCurrentDate(
                                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                              );
                            }}
                          >
                            →
                          </button>
                        </div>
                        <div className="cal-day-headers">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <div key={i} className="cal-day-header">
                              {d}
                            </div>
                          ))}
                        </div>
                        <CalendarGrid />
                      </div>

                      {selectedDay && (
                        <div className="selected-day-wrap fade-in" style={{ display: "block" }}>
                          <div className="selected-day-header">
                            <h3>
                              {MONTHS[currentDate.getMonth()]} {selectedDay} —{" "}
                              {selectedDayEvents.length} event
                              {selectedDayEvents.length !== 1 ? "s" : ""}
                            </h3>
                            <button
                              className="close-btn"
                              onClick={() => setSelectedDay(null)}
                            >
                              ×
                            </button>
                          </div>
                          <div>
                            {selectedDayEvents.length === 0 ? (
                              <p style={{ color: "var(--text3)" }}>
                                No events match your filters for this day.
                              </p>
                            ) : (
                              <div className="events-grid">
                                {selectedDayEvents.map((ev, i) => (
                                  <EventCard key={ev.id} ev={ev} index={i} onToast={addToast} isSaved={savedEventIds.includes(ev.id)} onSave={() => toggleSaveEvent(ev.id)} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="upcoming-wrap">
                        <div className="upcoming-header">
                          <span style={{ color: "var(--accent)" }}>▸</span> Coming Up Next
                          <span className="upcoming-count">{upcomingEvents.length} events</span>
                        </div>
                        <div className="events-grid" style={{ marginTop: "16px" }}>
                          {upcomingEvents.slice(0, visibleCount).map((ev, i) => (
                            <EventCard key={ev.id} ev={ev} index={i} onToast={addToast} isSaved={savedEventIds.includes(ev.id)} onSave={() => toggleSaveEvent(ev.id)} />
                          ))}
                        </div>
                        {visibleCount < upcomingEvents.length && (
                          <div style={{ textAlign: "center", marginTop: "24px" }}>
                            <button className="btn-outline" onClick={() => setVisibleCount(prev => prev + 12)}>Load More Events ({upcomingEvents.length - visibleCount} remaining)</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  */}

                  {activeView === "list" && (
                    <div className="fade-in" style={{ display: "block" }}>
                      <p className="list-meta">
                        {upcomingEvents.length} upcoming events
                        {activeFilter !== "all" ? ` in ${CAT_META[activeFilter]?.label}` : ""}
                        {searchQuery ? ` matching "${searchQuery}"` : ""}
                      </p>
                      {upcomingEvents.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">🔍</div>
                          <p>No events found. Try adjusting your filters.</p>
                        </div>
                      ) : (
                        <>
                          <div className="events-grid">
                            {upcomingEvents.slice(0, visibleCount).map((ev, i) => (
                              <EventCard key={ev.id} ev={ev} index={i} onToast={addToast} isSaved={savedEventIds.includes(ev.id)} onSave={() => toggleSaveEvent(ev.id)} />
                            ))}
                          </div>
                          {visibleCount < upcomingEvents.length && (
                            <div ref={loadMoreRef} style={{ textAlign: "center", marginTop: "32px", marginBottom: "32px" }}>
                              <div className="skeleton-shimmer" style={{ width: "40px", height: "40px", borderRadius: "50%", margin: "0 auto", animationDuration: "1s" }}></div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {activeView === "map" && (
                    <div className="fade-in" style={{ display: "block" }}>
                      <div style={{ position: "relative", width: "100%", height: "600px", borderRadius: "16px", background: "url('https://api.maptiler.com/maps/dataviz-dark/256/0/0/0.png') var(--surface2)", backgroundSize: "cover", overflow: "hidden", border: "1px solid var(--border)" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", pointerEvents: "none" }}></div>
                        {upcomingEvents.slice(0, 15).map((ev, i) => {
                          const top = 15 + ((ev.name.length * (i + 1)) % 70) + "%";
                          const left = 15 + ((ev.name.length * 7 * (i + 1)) % 70) + "%";
                          return (
                            <div key={ev.id} className="map-pin group" style={{ position: "absolute", top, left, transform: "translate(-50%, -50%)", cursor: "pointer", zIndex: 10 }}>
                              <div style={{ width: "16px", height: "16px", background: "var(--accent)", borderRadius: "50%", boxShadow: "0 0 16px var(--accent)", border: "2px solid #fff" }}></div>
                              <div className="map-pin-hover" style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", background: "var(--surface)", border: "1px solid var(--border)", padding: "12px", borderRadius: "8px", width: "220px", display: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
                                <p style={{ fontWeight: "800", fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>{ev.name}</p>
                                <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "8px" }}>📍 {ev.venue}</p>
                                <button className="btn-primary" style={{ padding: "8px 12px", width: "100%", fontSize: "12px" }} onClick={() => ev.url && window.open(ev.url, "_blank")}>View Event</button>
                              </div>
                            </div>
                          );
                        })}
                        <style>{`
                          .map-pin.group:hover .map-pin-hover {
                            display: block !important;
                            z-index: 100;
                          }
                        `}</style>
                      </div>
                    </div>
                  )}

                </>
              )}
            </div>
          </div>
        )}

        {/* SHOP PAGE */}
        {activePage === "shop" && (
          <div id="shop-page" style={{ padding: "64px 24px" }} className="fade-in">
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              <div className="section-header">
                <div className="section-bar" style={{ background: "var(--accent)" }}></div>
                <h2 className="section-title">Exclusive {config.teamName} Memorabilia</h2>
              </div>
              <p style={{ color: "var(--text2)", marginBottom: "32px", maxWidth: "600px", fontSize: "16px", lineHeight: "1.6" }}>
                Authentic, game-worn and signed gear. Due to extremely high demand during playoff season, all items are currently out of stock. Check back later for restocks!
              </p>
              
              <div className="events-grid">
                {[
                  { name: `${config.teamName} Autographed Home Jersey`, price: 1250, img: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=600&h=400&fit=crop" },
                  { name: `${config.teamName} Signed Game Stick`, price: 850, img: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&h=400&fit=crop" },
                  { name: `Official ${config.teamName} Game Puck (Signed)`, price: 299, img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop" },
                  { name: `${config.teamName} Limited Edition Framed Photo`, price: 450, img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop" },
                  { name: `${config.teamName} Away Game Jersey`, price: 350, img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop" },
                  { name: `Captain's Signed Helmet`, price: 1500, img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop" },
                  { name: `Game-Worn Goalie Mask`, price: 2200, img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop" },
                  { name: `Championship Celebration Canvas`, price: 320, img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop" },
                  { name: `Locker Room Nameplate`, price: 180, img: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop" },
                  { name: `Retro Heritage Jersey`, price: 420, img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop" },
                  { name: `Practice Worn Skates`, price: 650, img: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=600&h=400&fit=crop" },
                  { name: `Signed 8x10 Action Shot`, price: 150, img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop" },
                  { name: `Commemorative Pin Set`, price: 85, img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop" },
                  { name: `Game-Used Goal Netting`, price: 210, img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop" },
                  { name: `Official Team Warmup Jacket`, price: 280, img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop" },
                  { name: `Signed Player Gloves`, price: 700, img: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&h=400&fit=crop" },
                  { name: `Draft Day Podium Hat`, price: 95, img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop" },
                  { name: `Exclusive VIP Lanyard`, price: 45, img: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop" },
                  { name: `Team Logo Neon Sign`, price: 399, img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop" },
                  { name: `Arena Seat Back (Autographed)`, price: 550, img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop" },
                  { name: `Commemorative Playoff Ticket`, price: 120, img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop" },
                  { name: `Coach's Game Playbook Page`, price: 890, img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop" },
                  { name: `${config.teamName} Crystal Whiskey Glass`, price: 65, img: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=600&h=400&fit=crop" },
                  { name: `Signed Bobblehead Series`, price: 180, img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop" },
                  { name: `Stanley Cup Replica (Mini)`, price: 400, img: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&h=400&fit=crop" },
                ].map((item, i) => (
                  <div key={i} className="event-card fade-up group" style={{ animationDelay: `${i * 0.1}s`, background: `linear-gradient(135deg, rgba(var(--oilers-blue-rgb), 0.6), rgba(0,0,0,0.8))` }}>
                    <div className="event-card-img" style={{ backgroundImage: `url('${item.img}')`, filter: "grayscale(30%)", opacity: 0.8 }}>
                        <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255, 50, 50, 0.9)", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Out of Stock</div>
                    </div>
                    <div className="event-card-body">
                      <div className="event-card-cat-inline">
                        <span style={{ fontSize: "14px" }}>💎</span>
                        <span className="event-card-cat-label" style={{ color: "var(--accent)" }}>Authentic Signed</span>
                      </div>
                      <h4>{item.name}</h4>
                      <div className="event-card-price" style={{ background: "rgba(var(--accent-rgb), 0.15)", color: "var(--accent)", marginBottom: "16px" }}>${item.price} CAD</div>
                      <div className="waitlist-form" style={{ display: "flex", gap: "8px" }}>
                        <input type="email" placeholder="Email address" style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                        <button className="btn-primary" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", whiteSpace: "nowrap" }} onClick={(e) => { e.target.innerText = "Joined!"; e.target.style.background = "#4CAF50"; e.target.style.borderColor = "#4CAF50"; setTimeout(() => {e.target.innerText = "Notify Me"; e.target.style.background = "var(--accent)"; e.target.style.borderColor = "var(--accent)"; e.target.previousSibling.value = "";}, 2000); }}>Notify Me</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABOUT PAGE */}
        {activePage === "about" && (
          <div id="about-page" style={{ padding: "80px 24px" }} className="fade-in">
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="section-header">
                <div className="section-bar" style={{ background: "var(--accent)" }}></div>
                <h2 className="section-title">About {config.name} Weekend</h2>
              </div>

              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
                <div className="stat-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--accent)" }}>🎯 Our Mission</h3>
                  <p style={{ color: "var(--text2)", lineHeight: "1.8", fontSize: "16px" }}>
                    {config.name} Weekend is the ultimate local events calendar built specifically for {config.name} locals. We aggregate real-time data from Ticketmaster to bring you every concert, {config.teamName} game, festival, comedy show, and more — all in one beautiful, easy-to-use platform.
                  </p>
                </div>

                <div className="stat-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--accent)" }}>🏒 Why We Built This</h3>
                  <p style={{ color: "var(--text2)", lineHeight: "1.8", fontSize: "16px" }}>
                    We got tired of scrolling through dozens of websites just to find out what&apos;s happening this weekend. So we built the definitive source — a single page that shows you everything from sold-out {config.teamName} playoff games to hidden gem comedy nights at local venues.
                  </p>
                </div>

                <div className="stat-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--accent)" }}>⚡ How It Works</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "16px" }}>
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "36px", marginBottom: "12px" }}>📡</div>
                      <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Live Data</h4>
                      <p style={{ color: "var(--text2)", fontSize: "14px" }}>Events pulled from Ticketmaster in real-time</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "36px", marginBottom: "12px" }}>🌍</div>
                      <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Auto Detection</h4>
                      <p style={{ color: "var(--text2)", fontSize: "14px" }}>We detect your city and show local events</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "36px", marginBottom: "12px" }}>📅</div>
                      <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Add to Calendar</h4>
                      <p style={{ color: "var(--text2)", fontSize: "14px" }}>Download .ics files for any event instantly</p>
                    </div>
                  </div>
                </div>

                <div className="stat-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--accent)" }}>🏙️ Supported Cities</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                    {Object.values(CITIES).map(c => (
                      <Link key={c.id} href={c.id === 'edmonton' ? '/' : `/${c.id}`} style={{ padding: "8px 20px", borderRadius: "8px", background: "rgba(var(--accent-rgb), 0.1)", border: "1px solid rgba(var(--accent-rgb), 0.2)", color: "var(--accent)", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" }}>
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="stat-card" style={{ padding: "32px", textAlign: "center" }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--accent)" }}>💼 A Product by TownMediaLabs</h3>
                  <p style={{ color: "var(--text2)", lineHeight: "1.8", fontSize: "16px" }}>
                    Built with ❤️ in Canada. Part of the TownMediaLabs family of hyper-local digital products.
                  </p>
                  <div style={{ marginTop: "24px" }}>
                    <button className="btn-primary" onClick={() => setActivePage("events")}>Browse Events →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SAVED EVENTS PAGE */}
        {activePage === "saved" && (
          <div id="saved-page" style={{ padding: "80px 24px" }} className="fade-in">
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              <div className="section-header">
                <div className="section-bar" style={{ background: "var(--accent)" }}></div>
                <h2 className="section-title">Saved Events</h2>
              </div>
              
              {savedEventsData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💔</div>
                  <p>You haven't saved any events yet. Bookmark events to track them here!</p>
                  <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => setActivePage("events")}>Find Events</button>
                </div>
              ) : (
                <div className="events-grid">
                  {savedEventsData.map((ev, i) => (
                    <EventCard key={ev.id} ev={ev} index={i} onToast={addToast} isSaved={savedEventIds.includes(ev.id)} onSave={() => toggleSaveEvent(ev.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer>
          <div className="footer-inner">
            <div className="footer-logo">
              <img src="/logo.png" alt={`${config.name} Weekend Logo`} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover", background: "#fff" }} />
              <span className="footer-logo-text">
                {config.name}<span>Weekend</span>
              </span>
            </div>
            <p className="footer-desc">
              Built for {config.name} locals who want
              to know what&apos;s happening in their city.
            </p>
            <div className="footer-socials">
              <span className="footer-social" onClick={() => window.open('https://instagram.com/townmedialabs', '_blank')}>Instagram</span>
              <span className="footer-social" onClick={() => window.open('https://twitter.com/townmedialabs', '_blank')}>X (Twitter)</span>
              <span className="footer-social" onClick={() => window.open('https://tiktok.com/@townmedialabs', '_blank')}>TikTok</span>
            </div>
            <p className="footer-copy">
              © {new Date().getFullYear()} {config.name} Weekend • {config.name}, {config.provFull} 🇨🇦
              <br />
              <br />
              Copyright by Townmedialabs.ca
            </p>
          </div>
        </footer>
      </div>
      {showScrollTop && (
        <button className="scroll-top-btn fade-in" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      )}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
