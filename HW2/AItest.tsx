import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import NpsHeader from './NpsHeader';

export type Part = { text: string };
export type ChatMsg = { role: 'user' | 'model'; parts: Part[] };

type Props = {
  defaultModel?: string; // e.g. 'gemini-2.5-flash'
  starter?: string;
};

export default function Invest({
  defaultModel = 'gemini-2.5-flash',
  starter = '幫我安排3天的roadtrip行程',
}: Props) {
  const [model, setModel] = useState<string>(defaultModel);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);            // ← 新增
  const [rememberKey, setRememberKey] = useState(true);
  const [npsContext, setNpsContext] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  // Load saved key
  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // Warm welcome + starter
  useEffect(() => {
    setHistory([{ role: 'model', parts: [{ text: ' Gemini' }] }]);
    if (starter) setInput(starter);
  }, [starter]);

  // auto scroll
  useEffect(() => {
    const el = listRef.current; if (!el) return; el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  const ai = useMemo(() => {
    try { return apiKey ? new GoogleGenAI({ apiKey }) : null; }
    catch { return null; }
  }, [apiKey]);

  async function sendMessage(message?: string) {
    const raw = (message ?? input).trim();
    if (!raw || loading) return;
    if (!ai) { setError('請先輸入有效的 Gemini API Key'); return; }

    setError('');
    setLoading(true);

    // prepend NPS context
    const prefix = npsContext
      ? `【NPS context】以下為剛查詢的美國國家公園資料（JSON），請在必要時參考。\n${npsContext}\n\n【User Question】`
      : '【User Question】';
    const content = `${prefix}\n${raw}`;

    const newHistory: ChatMsg[] = [...history, { role: 'user', parts: [{ text: content }] }];
    setHistory(newHistory);
    setInput('');

    try {
      const resp = await ai.models.generateContent({
        model,
        contents: newHistory,
      });
      const reply = (resp as any).text || '[No content]';
      setHistory(h => [...h, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdownLike(text: string) {
    return text.split(/\n/).map((ln, i) => (
      <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{ln}</div>
    ));
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>

        {/* ====== 上方：NPS 搜尋區塊（會把 JSON context 回傳到這裡） ====== */}
        <NpsHeader onContext={setNpsContext} />

        

        {/* Composer */}
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={styles.composer}>
          <input
            placeholder="Gemini 有任何問題嗎?"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={styles.textInput}
          />
          <button type="submit" disabled={loading || !input.trim() || !apiKey} style={styles.sendBtn}>
            送出
          </button>
        </form>

        {/* Messages */}
        <div ref={listRef} style={styles.messages}>
          {history.map((m, idx) => (
            <div key={idx} style={{ ...styles.msg, ...(m.role === 'user' ? styles.user : styles.assistant) }}>
              <div style={styles.msgRole}>{m.role === 'user' ? 'You' : 'Gemini'}</div>
              <div style={styles.msgBody}>{renderMarkdownLike(m.parts.map(p => p.text).join('\n'))}</div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msg, ...styles.assistant }}>
              <div style={styles.msgRole}>Gemini</div>
              <div style={styles.msgBody}>思考中…</div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && <div style={styles.error}>⚠ {error}</div>}


        {/* ====== Gemini API Key Bar（Show/Clear） ====== */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 12px 0' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              const v = e.target.value; setApiKey(v);
              if (rememberKey) localStorage.setItem('gemini_api_key', v);
            }}
            placeholder="你的 Gemini API Key（只存 localStorage）"
            style={{ padding:'10px 12px', borderRadius:10, border:'1px solid #e5e7eb', flex:1 }}
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            style={{ background:'#2D5975', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer' }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            onClick={() => { setApiKey(''); localStorage.removeItem('gemini_api_key'); }}
            style={{ background:'#64748b', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer' }}
          >
            Clear
          </button>
        </div>


        <label style={{ display:'flex', alignItems:'center', gap:8, margin:'6px 12px 12px', fontSize:12 }}>
          <input
            type="checkbox"
            checked={rememberKey}
            onChange={(e)=>{
              setRememberKey(e.target.checked);
              if (!e.target.checked) localStorage.removeItem('gemini_api_key');
              else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
            }}
          />
          <span>記住在本機（localStorage）</span>
        </label>

        {/* 小提示：是否已載入 NPS context */}
        <div style={{ padding: "0 12px 8px", fontSize: 12, color: "#475569" }}>
          NPS Context：{npsContext ? '✅ 已載入（送出問題時會自動附帶）' : '— 尚未載入（可先在上方輸入 NPS Key 並 Fetch）'}
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    overflowY: 'auto',
    background: '#f3f4f6',
    paddingBottom: 400,
  },
  card: {
    width: 'min(900px, 100%)',
    background: 'transparent',
    borderRadius: 16,
    overflow: 'visible',
    marginBottom: 40,
  },
  controls: { display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', padding: 12 },
  label: { display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14 },
  messages: { padding: 12, display: 'grid', gap: 10 },
  msg: { borderRadius: 12, padding: 10, border: '1px solid #e5e7eb' },
  user: { background: '#eef2ff', borderColor: '#c7d2fe' },
  assistant: { background: '#f1f5f9', borderColor: '#e2e8f0' },
  msgRole: { fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 6 },
  msgBody: { fontSize: 14, lineHeight: 1.5 },
  error: { color: '#b91c1c', padding: '4px 12px' },

  // ❗已移除 position:'sticky'，避免覆蓋 NpsHeader 卡片
  composer: { padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, borderTop: '1px solid #e5e7eb' },
  textInput: { padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14 },
  sendBtn: { padding: '10px 14px', borderRadius: 999, border: '1px solid #111827', background: '#111827', color: '#fff', fontSize: 14, cursor: 'pointer' },
};
