import React, { useEffect, useMemo, useState } from "react";

type Props = { onContext?: (ctx: string) => void };
type Resource = "parks" | "campgrounds" | "visitorcenters" | "alerts" | "thingstodo";

type ParkLike = {
  id?: string;
  parkCode?: string;
  fullName?: string;
  name?: string;
  title?: string;
  states?: string;
  description?: string;
  url?: string;
  images?: { url: string; altText?: string; caption?: string }[];
  latitude?: string;
  longitude?: string;
  activities?: { name: string }[];
};

const THEME = "#2D5975";

export default function NpsHeader({ onContext = () => {} }: Props) {
  const [resource, setResource] = useState<Resource>("parks");
  const [q, setQ] = useState("Yosemite");
  const [stateCode, setStateCode] = useState("");
  const [parkCode, setParkCode] = useState("");
  const [limit, setLimit] = useState(8);

  // NPS API key (localStorage)
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("nps_api_key");
    if (saved) setApiKey(saved);
  }, []);
  useEffect(() => {
    if (apiKey) localStorage.setItem("nps_api_key", apiKey);
  }, [apiKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ParkLike[]>([]);
  const [selectedList, setSelectedList] = useState<ParkLike[]>([]);
  const [hover, setHover] = useState<number | null>(null);

  const resourceLabel = useMemo(() => {
    switch (resource) {
      case "parks": return "Parks";
      case "campgrounds": return "Campgrounds";
      case "visitorcenters": return "Visitor Centers";
      case "alerts": return "Alerts";
      case "thingstodo": return "Things To Do";
    }
  }, [resource]);

  function buildQuery() {
    const params: Record<string, string> = {};
    if (q.trim()) params.q = q.trim();
    if (stateCode.trim()) params.stateCode = stateCode.trim().toUpperCase();
    if (parkCode.trim()) params.parkCode = parkCode.trim().toLowerCase();
    params.limit = String(limit);
    const fields = ["images", "activities"];
    if (["parks", "visitorcenters", "campgrounds"].includes(resource)) fields.push("addresses");
    params.fields = fields.join(",");
    return new URLSearchParams(params).toString();
  }

  async function fetchNps() {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedList([]);
    onContext("");

    try {
      if (!apiKey.trim()) throw new Error("請輸入你的 NPS API Key");

      const url = `https://developer.nps.gov/api/v1/${resource}?${buildQuery()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "X-Api-Key": apiKey.trim(), "Accept": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("403 Forbidden：API Key 無效或未被允許");
        if (res.status === 429) throw new Error("429 Too Many Requests：超出速率限制，稍後再試");
        throw new Error(`NPS 請求失敗：${res.status}`);
      }

      const json = await res.json();
      const arr: ParkLike[] = json?.data || [];
      if (!arr.length) throw new Error("找不到資料，請調整關鍵字或資源類別");
      setResults(arr);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function normalizeDisplay(p: ParkLike) {
    const title = p.fullName || p.name || p.title || "(No title)";
    const states = p.states;
    const img = p.images?.[0]?.url || "";
    const desc = p.description || "";
    const url = p.url;
    return { title, states, img, desc, url };
  }

  function chooseItem(p: ParkLike) {
    setSelectedList(prev => {
      // 去重（用 id；沒有 id 時用名稱比對）
      const exists = prev.some(x =>
        (x.id && p.id && x.id === p.id) ||
        ((x.fullName || x.name) === (p.fullName || p.name))
      );
      const next = exists ? prev : [...prev, p];

      // 組成要給 AI 的精簡 context（多筆）
      const payload = next.map(it => ({
        resource,
        title: it.fullName || it.name || it.title || "(No title)",
        states: it.states || undefined,
        parkCode: it.parkCode || undefined,
        description: it.description || "",
        image: it.images?.[0]?.url || undefined,
        officialUrl: it.url || undefined,
        coords: it.latitude && it.longitude ? { lat: it.latitude, lng: it.longitude } : undefined,
        activities: (it.activities || []).map(a => a.name),
      }));

      onContext(JSON.stringify(payload, null, 2));
      return next;
    });
  }


  const styles: Record<string, React.CSSProperties> = {
    page: { background: "#f3f4f6", color: "#1e293b", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: 1080, margin: "0 auto", padding: "0 20px" },
    titleBlock: { textAlign: "center", padding: "60px 0 30px" },
    title: { fontSize: 36, fontWeight: 800, color: THEME },
    subtitle: { fontSize: 15, color: "#64748b", marginTop: 6 },
    apiBar: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, margin: "0 0 12px", alignItems: "center" },
    controls: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 0.8fr auto", gap: 10, marginBottom: 30 },
    input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", background: "#fff" },
    fetchBtn: { background: THEME, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 60 },
    card: { position: "relative", background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease" },
    cardHover: { transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(45,89,117,0.15)" },
    cardImg: { width: "100%", height: 180, objectFit: "cover" },
    cardBody: { padding: 16 },
    cardTitle: { fontWeight: 700, fontSize: 16, color: THEME },
    cardMeta: { fontSize: 13, color: "#64748b", marginTop: 4 },
    cardDesc: { fontSize: 14, color: "#475569", marginTop: 8, maxHeight: 72, overflow: "auto" },
    miniBtn: { background: THEME, color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer", marginTop: 10 },
    tip: { fontSize: 12, color: "#475569" },
    selectionBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      color: "#334155",
      fontSize: 14,
      boxShadow: "0 4px 8px rgba(0,0,0,0.04)",
      marginBottom: 60
    },
  };

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        <section style={styles.titleBlock}>
          <h1 style={styles.title}>Discover America's National Parks</h1>
          <p style={styles.subtitle}>Search and explore parks, campgrounds, and visitor centers</p>
        </section>

        {/* API Key */}
        <section style={styles.apiBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type={showKey ? "text" : "password"}
              placeholder="Enter your NPS API Key (stored locally)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{ background: THEME, color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              {showKey ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => { localStorage.removeItem("nps_api_key"); setApiKey(""); }}
              style={{ background: "#64748b", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              Clear
            </button>
          </div>
        </section>

        {/* Controls */}
        <section style={styles.controls}>
          <input placeholder="Search keyword (e.g. Yosemite)" value={q} onChange={(e) => setQ(e.target.value)} style={styles.input} />
          <select value={resource} onChange={(e) => setResource(e.target.value as Resource)} style={styles.input}>
            <option value="parks">Parks</option>
            <option value="campgrounds">Campgrounds</option>
            <option value="visitorcenters">Visitor Centers</option>
            <option value="thingstodo">Things To Do</option>
            <option value="alerts">Alerts</option>
          </select>
          <input placeholder="State code (CA / UT)" value={stateCode} onChange={(e) => setStateCode(e.target.value)} style={styles.input} />
          <input placeholder="Park code (yose / zion)" value={parkCode} onChange={(e) => setParkCode(e.target.value)} style={styles.input} />
          <input type="number" min={1} max={50} value={limit} onChange={(e) => setLimit(Number(e.target.value) || 1)} style={styles.input} />
          <button onClick={fetchNps} style={styles.fetchBtn} disabled={!apiKey || loading}>
            {loading ? "Loading..." : "Fetch"}
          </button>
        </section>

        {error && <div style={{ color: "#b91c1c", marginBottom: 20 }}>⚠ {error}</div>}

        {/* Results */}
        <section style={styles.grid}>
          {results.slice(0, 8).map((p, i) => {
            const { title, states, img, desc, url } = normalizeDisplay(p);
            return (
              <div
                key={i}
                style={{ ...styles.card, ...(hover === i ? styles.cardHover : {}) }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {img && <img src={img} alt={title} style={styles.cardImg} />}
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{title}</div>
                  <div style={styles.cardMeta}>{states ? `(${states})` : ""} · {resourceLabel}</div>
                  <div style={styles.cardDesc}>{desc}</div>

                  {/* 官方頁面連結 */}
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-block", color: THEME, fontSize: 13, fontWeight: 600, textDecoration: "none", marginTop: 8 }}
                    >
                      官方頁面    
                    </a>
                  )}

                  {/* button */}
                  <button type="button" style={styles.miniBtn} onClick={() => chooseItem(p)}>選擇這個</button>
                </div>
              </div>
            );
          })}
        </section>

        {/* === 已選狀態列 === */}
        <div style={styles.selectionBar}>
          <div>
            已選：
            {selectedList.length === 0
              ? "— 尚未選擇"
              : `${selectedList.length} 個 · ${selectedList.map(x => x.fullName || x.name).join("、")}`}
          </div>
          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={() => { setSelectedList([]); onContext(""); }}
              style={{ background:"#e2e8f0", border:"1px solid #cbd5e1", borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:12 }}
            >
              清空
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
