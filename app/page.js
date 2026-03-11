"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
const API_KEY = "CZh3AiubZmcsAENwPOyUU5J0ZL0Ff2fA";
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
    priceMin: ev.priceRanges?.[0]?.min || null,
    priceMax: ev.priceRanges?.[0]?.max || null,
    url: ev.url || "#",
    image: ev.images?.sort((a, b) => (b.width || 0) - (a.width || 0))?.[0]?.url || null,
    status: ev.dates?.status?.code || "onsale",
  };
}

function generateDemoEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const demoList = [
    ["Edmonton Oilers vs Calgary Flames", "Sports", "Rogers Place", 85, 350, 0],
    ["Edmonton Oilers vs Vancouver Canucks", "Sports", "Rogers Place", 65, 280, 3],
    ["Edmonton Oilers vs Toronto Maple Leafs", "Sports", "Rogers Place", 95, 500, 7],
    ["Edmonton Oilers vs Winnipeg Jets", "Sports", "Rogers Place", 60, 260, 12],
    ["Edmonton Oilers vs Montreal Canadiens", "Sports", "Rogers Place", 70, 300, 18],
    ["Edmonton Oilers vs Colorado Avalanche", "Sports", "Rogers Place", 90, 400, 24],
    ["Karan Aujla — It Was All A Dream Tour", "Concert", "Rogers Place", 89, 250, 1],
    ["Diljit Dosanjh — Dil-Luminati Tour", "Concert", "Commonwealth Stadium", 99, 350, 5],
    ["AP Dhillon Live in Edmonton", "Concert", "Rogers Place", 79, 220, 9],
    ["Drake — Anita Max Wynn Tour", "Concert", "Rogers Place", 120, 450, 14],
    ["The Weeknd — After Hours Til Dawn", "Concert", "Commonwealth Stadium", 110, 380, 20],
    ["Morgan Wallen — One Night At A Time", "Concert", "Rogers Place", 85, 300, 22],
    ["Edmonton Symphony Orchestra", "Concert", "Winspear Centre", 35, 110, 4],
    ["Taylor Swift — The Eras Tour", "Concert", "Commonwealth Stadium", 150, 800, 27],
    ["Kevin Hart — Reality Check", "Comedy", "Rogers Place", 65, 180, 6],
    ["Hasan Minhaj Live", "Comedy", "Northern Alberta Jubilee Auditorium", 55, 120, 11],
    ["Russell Peters — Act Your Age", "Comedy", "Rogers Place", 60, 150, 16],
    ["Punjabi Comedy Night", "Comedy", "Citadel Theatre", 40, 80, 21],
    ["Cirque du Soleil — KOOZA", "Theatre", "Edmonton EXPO Centre", 45, 165, 2],
    ["Frozen — The Musical", "Theatre", "Northern Alberta Jubilee Auditorium", 55, 200, 10],
    ["Edmonton International Fringe Festival", "Theatre", "Old Strathcona", 15, 45, 17],
    ["Les Misérables", "Theatre", "Northern Alberta Jubilee Auditorium", 50, 180, 25],
    ["K-Days Festival", "Festival", "Edmonton EXPO Centre", 30, 60, 8],
    ["Edmonton Folk Music Festival", "Festival", "Gallagher Park", 40, 120, 15],
    ["Heritage Festival", "Festival", "Hawrelak Park", 0, 0, 19],
    ["Taste of Edmonton", "Festival", "Churchill Square", 5, 15, 23],
    ["Monster Jam", "Family", "Commonwealth Stadium", 30, 85, 3],
    ["Disney On Ice — Find Your Hero", "Family", "Rogers Place", 35, 120, 13],
    ["PAW Patrol Live!", "Family", "Northern Alberta Jubilee Auditorium", 25, 75, 19],
    ["Harlem Globetrotters", "Family", "Rogers Place", 30, 90, 26],
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
    const dt = new Date(y, m, day, 19 + (i % 3), i % 2 === 0 ? 0 : 30);
    return {
      id: `demo-${i}`,
      name,
      category: cat,
      meta,
      venue,
      address: "",
      date: dt,
      localDate: dt.toISOString().split("T")[0],
      priceMin: pMin || null,
      priceMax: pMax || null,
      url: "#",
      image: i < 12 ? imgs[i % imgs.length] : null,
      status: "onsale",
    };
  });
}

function EventCard({ ev, index }) {
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
        text: `Check out \${ev.name} happening at \${ev.venue}!`,
        url: ev.url || window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const priceHTML = ev.priceMin ? (
    <div
      className="event-card-price"
      style={{ background: `${ev.meta.accent}15`, color: ev.meta.accent }}
    >
      ${ev.priceMin}
      {ev.priceMax ? ` – $${ev.priceMax}` : "+"} CAD
    </div>
  ) : (
    <div className="event-card-notba">Price TBA</div>
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
          <button className="share-btn" onClick={handleShare} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          </button>
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
        ></div>
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

export default function Home() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activePage, setActivePage] = useState("home"); // home | events
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("calendar"); // calendar | list | map
  const [isLightMode, setIsLightMode] = useState(false);

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
    if (isLightMode) {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [isLightMode]);

  const fetchEvents = useCallback(async (dateToFetch) => {
    setLoading(true);
    setIsDemo(false);
    try {
      const start = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth(), 1);
      const end = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth() + 3, 0);
      const s = start.toISOString().split(".")[0] + "Z";
      const e = end.toISOString().split(".")[0] + "Z";
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&city=Edmonton&stateCode=AB&countryCode=CA&startDateTime=${s}&endDateTime=${e}&size=199&sort=date,asc`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const newEvents = data._embedded?.events ? data._embedded.events.map(parseEvent) : [];
      setAllEvents(newEvents);
    } catch (err) {
      console.error("API unreachable, using demo data:", err);
      setAllEvents(generateDemoEvents());
      setIsDemo(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents(currentDate);
  }, [fetchEvents, currentDate]);

  const filteredEvents = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return allEvents.filter((ev) => {
      if (activeFilter !== "all" && ev.category !== activeFilter) return false;
      if (
        search &&
        !ev.name.toLowerCase().includes(search) &&
        !ev.venue.toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });
  }, [allEvents, activeFilter, searchQuery]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredEvents
      .filter((ev) => ev.date >= today)
      .sort((a, b) => a.date - b.date);
  }, [filteredEvents]);

  // Home Page Stats
  const homeStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    const thisMonth = allEvents.filter(
      (ev) => ev.date.getMonth() === m && ev.date.getFullYear() === y
    ).length;
    const thisWeek = allEvents.filter((ev) => {
      const d = (ev.date - today) / 86400000;
      return d >= 0 && d < 7;
    }).length;
    const oilers = allEvents.filter(
      (ev) => ev.category === "Sports" && ev.name.toLowerCase().includes("oiler")
    ).length;
    const concerts = allEvents.filter((ev) => ev.category === "Concert").length;

    return { thisMonth, thisWeek, oilers, concerts };
  }, [allEvents, currentDate]);

  const thisWeekEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allEvents
      .filter((ev) => {
        const d = (ev.date - today) / 86400000;
        return d >= 0 && d < 7;
      })
      .sort((a, b) => a.date - b.date)
      .slice(0, 6);
  }, [allEvents]);

  const homeFeaturedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allEvents
      .filter((ev) => ev.date >= today && ev.image)
      .sort((a, b) => a.date - b.date)
      .slice(0, 6);
  }, [allEvents]);

  const homeOilersEvents = useMemo(() => {
    return allEvents
      .filter((ev) => ev.category === "Sports" && ev.name.toLowerCase().includes("oiler"))
      .slice(0, 8);
  }, [allEvents]);

  // Render Calendar Grid
  const CalendarGrid = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
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

  return (
    <>
      <div id="ambient"></div>
      <div id="noise"></div>
      <div id="app">
        {/* NAV */}
        <nav>
          <div className="nav-inner">
            <div className="nav-logo" onClick={() => setActivePage("home")}>
              <img src="/logo.png" alt="Edmonton Weekend Logo" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover", background: "#fff", border: "1px solid rgba(255, 76, 0, 0.3)" }} />
              <span className="nav-logo-text">
                Edmonton<span>Weekend</span>
              </span>
            </div>
            <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "2px", whiteSpace: "nowrap" }}>
              <button
                className={`nav-btn ${activePage === "home" ? "active" : ""}`}
                onClick={() => setActivePage("home")}
              >
                Home
              </button>

              <div className="nav-dropdown">
                <button
                  className={`nav-btn ${activePage === "events" ? "active" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  Events
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                </button>
                <div className="nav-dropdown-content">
                  <a href="/">Edmonton</a>
                  <a href="/toronto">Toronto</a>
                  <a href="/vancouver">Vancouver</a>
                  <a href="/calgary">Calgary</a>
                  <a href="/montreal">Montreal</a>
                  <a href="/winnipeg">Winnipeg</a>
                  <a href="/ottawa">Ottawa</a>
                </div>
              </div>

              <a href="#" className="nav-btn">Shop</a>
              <a href="#" className="nav-btn">About</a>

              <button
                className="nav-btn"
                onClick={() => setIsLightMode(!isLightMode)}
                style={{ padding: '8px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)' }}
              >
                {isLightMode ? '🌙' : '☀️'}
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
          <div id="home-page">
            {/* HERO */}
            <section className="hero">
              <div className="hero-inner fade-up">
                <div className="hero-badge">
                  <span>EDMONTON • ALBERTA • CANADA</span>
                </div>
                <h1>
                  Everything Happening
                  <br />
                  in Edmonton
                </h1>
                <p>
                  Live concerts, Oilers games, festivals, comedy nights — your one-stop
                  calendar for the city. Updated in real time.
                </p>
                <div className="hero-btns">
                  <button
                    className="btn-primary"
                    onClick={() => setActivePage("events")}
                  >
                    Browse Events →
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setActivePage("events")}
                  >
                    View Calendar
                  </button>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card fade-up" style={{ animationDelay: "0s" }}>
                  <div className="stat-icon">📅</div>
                  <div className="stat-num">{loading ? "—" : homeStats.thisMonth}</div>
                  <div className="stat-label">Events this month</div>
                </div>
                <div className="stat-card fade-up" style={{ animationDelay: "0.1s" }}>
                  <div className="stat-icon">🔥</div>
                  <div className="stat-num">{loading ? "—" : homeStats.thisWeek}</div>
                  <div className="stat-label">This week</div>
                </div>
                <div className="stat-card fade-up" style={{ animationDelay: "0.2s" }}>
                  <div className="stat-icon">🏒</div>
                  <div className="stat-num">{loading ? "—" : homeStats.oilers}</div>
                  <div className="stat-label">Oilers games</div>
                </div>
                <div className="stat-card fade-up" style={{ animationDelay: "0.3s" }}>
                  <div className="stat-icon">🎵</div>
                  <div className="stat-num">{loading ? "—" : homeStats.concerts}</div>
                  <div className="stat-label">Concerts</div>
                </div>
              </div>
            </section>

            {/* THIS WEEK */}
            {thisWeekEvents.length > 0 && (
              <section className="content-section">
                <div className="content-inner">
                  <div className="section-header">
                    <div className="section-bar"></div>
                    <h2 className="section-title">This Week in Edmonton</h2>
                  </div>
                  <div className="events-grid">
                    {thisWeekEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* FEATURED */}
            {homeFeaturedEvents.length > 0 && (
              <section className="content-section">
                <div className="content-inner">
                  <div className="section-header">
                    <div className="section-bar purple" style={{ background: "#e040fb" }}></div>
                    <h2 className="section-title">Featured Events</h2>
                  </div>
                  <div className="featured-grid">
                    {homeFeaturedEvents.map((ev, i) => (
                      <FeaturedCard key={ev.id} ev={ev} index={i} />
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
                        Edmonton <span style={{ color: "var(--accent)" }}>Oilers</span>
                      </h2>
                      <p style={{ color: "var(--text2)", fontSize: "14px" }}>
                        Upcoming games at Rogers Place
                      </p>
                    </div>
                  </div>
                  <div className="events-grid">
                    {homeOilersEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i} />
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
                  from Ticketmaster so you always know what's happening in Edmonton.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setActivePage("events")}
                >
                  Explore Full Calendar →
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
                  <div className="view-toggles">
                    <button
                      className={`view-btn ${activeView === "calendar" ? "active" : "inactive"}`}
                      onClick={() => setActiveView("calendar")}
                    >
                      📅 Calendar
                    </button>
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
                  {Object.entries({ all: { label: "🔥 All" }, ...CAT_META }).map(
                    ([key, val]) => (
                      <button
                        key={key}
                        className={`filter-pill ${activeFilter === key ? "active" : "inactive"}`}
                        onClick={() => setActiveFilter(key)}
                      >
                        {val.icon ? `${val.icon} ` : ""}
                        {val.label}
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
                                  <EventCard key={ev.id} ev={ev} index={i} />
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
                          {upcomingEvents.slice(0, 12).map((ev, i) => (
                            <EventCard key={ev.id} ev={ev} index={i} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

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
                        <div className="events-grid">
                          {upcomingEvents.map((ev, i) => (
                            <EventCard key={ev.id} ev={ev} index={i} />
                          ))}
                        </div>
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

        {/* FOOTER */}
        <footer>
          <div className="footer-inner">
            <div className="footer-logo">
              <img src="/logo.png" alt="Edmonton Weekend Logo" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover", background: "#fff" }} />
              <span className="footer-logo-text">
                Edmonton<span>Weekend</span>
              </span>
            </div>
            <p className="footer-desc">
              Built for Edmonton locals who want
              to know what's happening in their city.
            </p>
            <div className="footer-socials">
              <span className="footer-social">@edmontonweekend</span>
              <span className="footer-social">@edmontonweekend</span>
              <span className="footer-social">@edmontonweekend</span>
            </div>
            <p className="footer-copy">
              © {new Date().getFullYear()} Edmonton Weekend • Edmonton, Ontario 🇨🇦
              <br />
              <br />
              Copyright by Townmedialabs.ca
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
