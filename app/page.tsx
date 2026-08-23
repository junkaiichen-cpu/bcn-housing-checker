"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Building2, Check, ChevronDown,
  CircleHelp, FileCheck2, Home as HomeIcon, Info, Loader2, MapPin, Minus,
  RefreshCw, Scale, Search, ShieldCheck, Sparkles, Target, TrendingUp,
  Users, WalletCards, XCircle,
} from "lucide-react";
import { BACKEND_URL, fetchFromBackend } from "@/lib/api";

type TabKey = "evaluate" | "compare" | "legal" | "concierge" | "marketplace";
type Intent = "rent" | "buy";
type RentalType = "entire" | "studio" | "private_room" | "shared_room";
type Condition = "good" | "renovated" | "needs_renovation";
type FloorLevel = "Middle" | "Ático" | "Bajo";
type PriceMode = "monthly" | "total";

interface MunicipalityNode { barrios: string[]; zone_tensionada?: boolean; avg_rent_sqm?: number; avg_sale_sqm?: number; }
interface GeoNode { description?: string; municipios: Record<string, MunicipalityNode>; }
type GeoTree = Record<string, GeoNode>;

const FALLBACK_TREE: GeoTree = {
  Barcelonès: { description: "巴塞罗那核心都市圈。", municipios: {
    Barcelona: { barrios: ["Eixample", "Gràcia", "Sarrià-Sant Gervasi", "Poblenou / Sant Martí", "Ciutat Vella / Gòtic"], zone_tensionada: true },
    Badalona: { barrios: ["Centre / Dalt de la Vila", "Gorg / Port", "La Salut / Llefià"], zone_tensionada: true },
  }},
  "Vallès Occidental": { description: "科技、大学与近郊居住板块。", municipios: {
    "Sant Cugat del Vallès": { barrios: ["Volpelleres", "Mirasol", "Centre Station"], zone_tensionada: true },
    Sabadell: { barrios: ["Centre", "Creu Alta"], zone_tensionada: true },
  }},
  Maresme: { description: "地中海海岸与近郊生活板块。", municipios: {
    Mataró: { barrios: ["Centre", "Cerdanyola de Mataró"], zone_tensionada: true },
    "El Masnou": { barrios: ["Centre / Port"], zone_tensionada: true },
  }},
};

const RENTAL_OPTIONS: { value: RentalType; label: string; hint: string }[] = [
  { value: "entire", label: "整套公寓", hint: "Entire apartment" },
  { value: "studio", label: "Studio", hint: "独立开放式住宅" },
  { value: "private_room", label: "独立卧室", hint: "Private room" },
  { value: "shared_room", label: "共享卧室", hint: "Shared room" },
];

const FLOOR_LABELS: Record<FloorLevel, string> = { Middle: "中间楼层", Ático: "顶楼 / 阁楼", Bajo: "底层" };
const CONDITION_LABELS: Record<Condition, string> = { good: "良好", renovated: "已翻新", needs_renovation: "需要翻修" };
const CONTRACT_LABELS: Record<string, string> = { LAU_LONG_TERM: "长期住宅合同", TEMPORADA: "季节性 / 临时租赁合同", ROOM: "合租房间合同" };

const panelClass = "rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.28)] backdrop-blur";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
const selectClass = `${inputClass} appearance-none pr-10`;
const mutedLabel = "mb-2 block text-[11px] font-semibold tracking-[0.08em] text-slate-500";

function safeText(value: unknown, fallback = "暂无数据") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function parseJsonError(error: unknown) { return error instanceof Error ? error.message : "请求失败，请稍后重试。"; }
function statusTone(level: string | undefined) {
  const n = String(level || "").toUpperCase();
  if (n === "RED") return "border-rose-200 bg-rose-50 text-rose-700";
  if (n === "YELLOW") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const styles = { neutral: "border-slate-200 bg-slate-50 text-slate-600", success: "border-emerald-200 bg-emerald-50 text-emerald-700", warning: "border-amber-200 bg-amber-50 text-amber-700", danger: "border-rose-200 bg-rose-50 text-rose-700" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
function SelectField({ label, value, options, onChange, hint }: { label: string; value: string; options: string[]; onChange: (v: string) => void; hint?: string }) {
  return <div><label className={mutedLabel}>{label}</label><div className="relative"><select value={value} onChange={e => onChange(e.target.value)} className={selectClass}>{options.map(o => <option key={o} value={o}>{o || "不指定"}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></div>{hint && <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>}</div>;
}
function MetricCard({ label, value, detail, icon: Icon, accent = "indigo" }: { label: string; value: string; detail?: string; icon: React.ComponentType<{ className?: string }>; accent?: "indigo" | "emerald" | "amber" | "rose" | "slate" }) {
  const iconMap = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600", slate: "bg-slate-100 text-slate-600" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-medium tracking-[0.08em] text-slate-400">{label}</p><p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{value}</p>{detail && <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>}</div><div className={`rounded-xl p-2.5 ${iconMap[accent]}`}><Icon className="h-4 w-4" /></div></div></div>;
}
function EmptyState({ title, body, icon: Icon }: { title: string; body: string; icon: React.ComponentType<{ className?: string }> }) {
  return <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-8 text-center"><div className="max-w-md"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200"><Icon className="h-6 w-6" /></div><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></div></div>;
}
function SectionCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><div>{eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p>}<h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3></div><div className="mt-4">{children}</div></section>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("evaluate");
  const [geoTree, setGeoTree] = useState<GeoTree>(FALLBACK_TREE);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [geoError, setGeoError] = useState("");

  const [evalComarca, setEvalComarca] = useState("Barcelonès");
  const [evalMunicipio, setEvalMunicipio] = useState("Barcelona");
  const [evalBarrio, setEvalBarrio] = useState("Eixample");
  const [evalIntent, setEvalIntent] = useState<Intent>("rent");
  const [evalRentalType, setEvalRentalType] = useState<RentalType>("entire");
  const [evalPrice, setEvalPrice] = useState("");
  const [evalPriceMode, setEvalPriceMode] = useState<PriceMode>("monthly");
  const [evalTermMonths, setEvalTermMonths] = useState("12");
  const [evalSqm, setEvalSqm] = useState("75");
  const [evalBedrooms, setEvalBedrooms] = useState("2");
  const [evalFloor, setEvalFloor] = useState<FloorLevel>("Middle");
  const [evalElevator, setEvalElevator] = useState(true);
  const [evalCondition, setEvalCondition] = useState<Condition>("good");
  const [evalAddress, setEvalAddress] = useState("");
  const [evalDesc, setEvalDesc] = useState("");
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState("");
  const [priceWasProvided, setPriceWasProvided] = useState(false);

  const [compComarcaA, setCompComarcaA] = useState("Barcelonès");
  const [compMuniA, setCompMuniA] = useState("Barcelona");
  const [compBarrioA, setCompBarrioA] = useState("Eixample");
  const [compComarcaB, setCompComarcaB] = useState("Vallès Occidental");
  const [compMuniB, setCompMuniB] = useState("Sant Cugat del Vallès");
  const [compBarrioB, setCompBarrioB] = useState("Volpelleres");
  const [compSqm, setCompSqm] = useState("80");
  const [compResult, setCompResult] = useState<any>(null);
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState("");

  const [legalComarca, setLegalComarca] = useState("Barcelonès");
  const [legalMuni, setLegalMuni] = useState("Barcelona");
  const [legalBarrio, setLegalBarrio] = useState("Eixample");
  const [legalRent, setLegalRent] = useState("1400");
  const [legalDeposit, setLegalDeposit] = useState("2800");
  const [legalAgencyFee, setLegalAgencyFee] = useState("0");
  const [legalChargedTenant, setLegalChargedTenant] = useState(false);
  const [legalContractType, setLegalContractType] = useState("LAU_LONG_TERM");
  const [legalText, setLegalText] = useState("");
  const [legalResult, setLegalResult] = useState<any>(null);
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalError, setLegalError] = useState("");

  const comarcaList = useMemo(() => Object.keys(geoTree), [geoTree]);
  const evalMuniList = useMemo(() => Object.keys(geoTree[evalComarca]?.municipios ?? {}), [geoTree, evalComarca]);
  const evalBarrioList = geoTree[evalComarca]?.municipios?.[evalMunicipio]?.barrios ?? [];
  const compMuniListA = useMemo(() => Object.keys(geoTree[compComarcaA]?.municipios ?? {}), [geoTree, compComarcaA]);
  const compBarrioListA = geoTree[compComarcaA]?.municipios?.[compMuniA]?.barrios ?? [];
  const compMuniListB = useMemo(() => Object.keys(geoTree[compComarcaB]?.municipios ?? {}), [geoTree, compComarcaB]);
  const compBarrioListB = geoTree[compComarcaB]?.municipios?.[compMuniB]?.barrios ?? [];
  const legalMuniList = useMemo(() => Object.keys(geoTree[legalComarca]?.municipios ?? {}), [geoTree, legalComarca]);
  const legalBarrioList = geoTree[legalComarca]?.municipios?.[legalMuni]?.barrios ?? [];

  const refreshGeo = async () => { setLoadingGeo(true); setGeoError(""); try { const res = await fetchFromBackend("/api/geography/tree"); if (res?.data) setGeoTree(res.data as GeoTree); } catch (e) { setGeoError(parseJsonError(e)); } finally { setLoadingGeo(false); } };
  useEffect(() => { refreshGeo(); }, []);

  const resetLocation = (tree: GeoTree, comarca: string, setMuni: (v: string) => void, setBarrio: (v: string) => void) => {
    const municipalities = Object.keys(tree[comarca]?.municipios ?? {}); const muni = municipalities[0] ?? ""; const barrio = tree[comarca]?.municipios?.[muni]?.barrios?.[0] ?? ""; setMuni(muni); setBarrio(barrio);
  };

  const predictedFallbackPrice = () => {
    const muni = geoTree[evalComarca]?.municipios?.[evalMunicipio];
    const area = Number(evalSqm) || 0;
    const adj = evalBarrio && evalBarrioList.length ? 1.0 : 1.0;
    if (!muni || !area) return 0;
    const typeFactor = evalRentalType === "private_room" ? 1.15 : evalRentalType === "shared_room" ? 0.9 : evalRentalType === "studio" ? 1.04 : 1;
    return Math.max(1, Math.round((muni.avg_rent_sqm || 0) * area * typeFactor * adj));
  };

  const handleEvaluate = async (e: FormEvent) => {
    e.preventDefault(); setEvalLoading(true); setEvalResult(null); setEvalError("");
    try {
      const userEnteredPrice = Number(evalPrice) > 0;
      const fallbackPrice = predictedFallbackPrice() || 1000;
      const monthlyPrice = userEnteredPrice ? (evalPriceMode === "total" ? Number(evalPrice) / Math.max(1, Number(evalTermMonths) || 12) : Number(evalPrice)) : fallbackPrice;
      setPriceWasProvided(userEnteredPrice);
      const payload = {
        intent: evalIntent, rental_type: evalRentalType === "private_room" || evalRentalType === "shared_room" ? "room" : evalRentalType,
        comarca: evalComarca, municipio: evalMunicipio, barrio: evalBarrio || null, address: evalAddress || null,
        price: monthlyPrice, area_sqm: Number(evalSqm) || null, bedrooms: Number(evalBedrooms) || 1,
        floor_level: evalFloor, has_elevator: evalElevator, condition: evalCondition, description: evalDesc || null,
      };
      const res = await fetchFromBackend("/api/evaluate", { method: "POST", body: JSON.stringify(payload) });
      if (res?.status === "success") setEvalResult({ ...res.data, __input: { monthlyPrice, userEnteredPrice, priceMode: evalPriceMode, termMonths: Number(evalTermMonths) || 12 } });
      else throw new Error(res?.message || "评估服务未返回有效结果。");
    } catch (e) { setEvalError(parseJsonError(e)); } finally { setEvalLoading(false); }
  };

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault(); setCompLoading(true); setCompResult(null); setCompError("");
    try { const res = await fetchFromBackend("/api/compare-regions", { method: "POST", body: JSON.stringify({ comarca_a: compComarcaA, municipio_a: compMuniA, barrio_a: compBarrioA || null, comarca_b: compComarcaB, municipio_b: compMuniB, barrio_b: compBarrioB || null, area_sqm: Number(compSqm) || 80 }) }); if (res?.status === "success") setCompResult(res.data); else throw new Error(res?.message || "对比服务未返回有效结果。"); }
    catch (e) { setCompError(parseJsonError(e)); } finally { setCompLoading(false); }
  };

  const handleLegalCheck = async (e: FormEvent) => {
    e.preventDefault(); setLegalLoading(true); setLegalResult(null); setLegalError("");
    try { const res = await fetchFromBackend("/api/check-rental-risk", { method: "POST", body: JSON.stringify({ comarca: legalComarca, municipio: legalMuni, barrio: legalBarrio || null, monthly_rent: Number(legalRent) || 0, deposit_amount: Number(legalDeposit) || 0, agency_fee_amount: Number(legalAgencyFee) || 0, agency_fee_charged_to_tenant: legalChargedTenant, contract_type: legalContractType, contract_text: legalText || null }) }); if (res?.status === "success") setLegalResult(res.data); else throw new Error(res?.message || "风控服务未返回有效结果。"); }
    catch (e) { setLegalError(parseJsonError(e)); } finally { setLegalLoading(false); }
  };

  const tabs: { key: TabKey; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "evaluate", label: "房产评估", sub: "预测 · 比价 · 风险", icon: BarChart3 },
    { key: "compare", label: "区域对比", sub: "租金 · 资产 · 宜居", icon: TrendingUp },
    { key: "legal", label: "租务风控", sub: "合同 · 押金 · 中介费", icon: ShieldCheck },
    { key: "concierge", label: "专家服务", sub: "看房 · 核验 · 谈判", icon: Users },
    { key: "marketplace", label: "房源匹配", sub: "预算 · 区域 · 合规", icon: Target },
  ];

  const renderBenchmark = () => {
    const raw = evalResult?.valuation_benchmark;
    const fallback = evalResult?.__input;
    const metrics: Record<string, { label: string; value: string }> = {};
    if (raw && typeof raw === "object") Object.entries(raw).forEach(([k, v]: [string, any]) => { metrics[k] = typeof v === "object" && v?.label ? v : { label: k.replaceAll("_", " "), value: safeText(v) }; });
    const price = fallback?.monthlyPrice;
    if (!metrics.estimated_rent && price) metrics.estimated_rent = { label: "当前计算基准", value: `€${Math.round(price).toLocaleString("es-ES")} / 月` };
    if (!metrics.area) metrics.area = { label: "面积", value: `${Number(evalSqm) || 0} m²` };
    if (!metrics.location) metrics.location = { label: "区域", value: `${evalMunicipio} · ${evalBarrio || "全域"}` };
    if (!metrics.property_type) metrics.property_type = { label: "房源类型", value: RENTAL_OPTIONS.find(x => x.value === evalRentalType)?.label || "房源" };
    if (!metrics.floor) metrics.floor = { label: "楼层", value: FLOOR_LABELS[evalFloor] };
    if (!metrics.elevator) metrics.elevator = { label: "电梯", value: evalElevator ? "有" : "无" };
    if (!metrics.condition) metrics.condition = { label: "房屋状况", value: CONDITION_LABELS[evalCondition] };
    return Object.entries(metrics).map(([key, item]) => <div key={key} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold tracking-[0.08em] text-slate-400">{item.label}</p><p className="mt-1 text-sm font-medium text-slate-800">{safeText(item.value)}</p></div>);
  };

  return <main className="min-h-screen bg-[#f4f7fb] text-slate-950"><div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
    <header className="mb-6 overflow-hidden rounded-[32px] bg-[#0b1220] text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)]"><div className="relative px-5 py-6 sm:px-8 lg:px-10 lg:py-8"><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(99,102,241,0.23),transparent_36%),radial-gradient(circle_at_12%_95%,rgba(34,211,238,0.1),transparent_30%)]" /><div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-4xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-200"><Sparkles className="h-3.5 w-3.5 text-cyan-300" />BCN HOUSING INTELLIGENCE</div><h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">巴塞罗那房产智能决策平台</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">先预测，再核价；从租金合理性一路检查到合同与风险。</p><div className="mt-5 flex flex-wrap gap-2"><StatusPill label={loadingGeo ? "正在同步区域数据" : "区域数据已连接"} tone={loadingGeo ? "warning" : "success"} /><StatusPill label="FastAPI" /><StatusPill label="AI analysis" /></div></div><div className="min-w-[270px] rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Backend endpoint</p><p className="mt-1 truncate text-sm font-medium">{BACKEND_URL.replace("https://", "")}</p><button type="button" onClick={refreshGeo} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200"><RefreshCw className={`h-3.5 w-3.5 ${loadingGeo ? "animate-spin" : ""}`} />同步区域数据</button></div></div></div></header>
    {geoError && <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><Info className="mt-0.5 h-4 w-4" /><div><b>实时区域数据暂时不可用</b><p className="mt-1 text-xs">当前使用轻量兜底数据，连接恢复后可重新同步。</p></div></div>}
    <section className="mb-6 grid gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm md:grid-cols-5">{tabs.map(({ key, label, sub, icon: Icon }) => <button key={key} type="button" onClick={() => setActiveTab(key)} className={`group flex min-h-[72px] items-center gap-3 rounded-xl px-4 py-3 text-left transition ${activeTab === key ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"}`}><div className={`rounded-xl p-2.5 ${activeTab === key ? "bg-white/10 text-cyan-300" : "bg-slate-100 text-slate-500"}`}><Icon className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{label}</p><p className={`mt-0.5 text-[11px] ${activeTab === key ? "text-slate-300" : "text-slate-400"}`}>{sub}</p></div></button>)}</section>

    {activeTab === "evaluate" && <section className="grid gap-6 xl:grid-cols-[410px_minmax(0,1fr)]"><div className={panelClass}><div className="border-b border-slate-100 p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">01 · Property analysis</p><h2 className="mt-1 text-xl font-semibold">输入房源信息</h2><p className="mt-1 text-xs leading-5 text-slate-500">价格可以不填。系统会先预测合理租金；填写后再与你的报价进行比对。</p></div><form onSubmit={handleEvaluate} className="space-y-5 p-5 sm:p-6">
      <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1"><button type="button" onClick={() => setEvalIntent("rent")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${evalIntent === "rent" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>租房</button><button type="button" onClick={() => setEvalIntent("buy")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${evalIntent === "buy" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>买房</button></div>
      {evalIntent === "rent" && <div><p className={mutedLabel}>租赁形式</p><div className="grid grid-cols-2 gap-2">{RENTAL_OPTIONS.map(o => <button key={o.value} type="button" onClick={() => setEvalRentalType(o.value)} className={`rounded-xl border px-3 py-3 text-left transition ${evalRentalType === o.value ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}><p className="text-sm font-semibold">{o.label}</p><p className="mt-1 text-[10px] text-slate-400">{o.hint}</p></button>)}</div></div>}
      <div className="space-y-3"><p className={mutedLabel}>位置</p><SelectField label="县 · Comarca" value={evalComarca} options={comarcaList} onChange={v => { setEvalComarca(v); resetLocation(geoTree, v, setEvalMunicipio, setEvalBarrio); }} /><div className="grid gap-3 sm:grid-cols-2"><SelectField label="市镇 · Municipio" value={evalMunicipio} options={evalMuniList} onChange={v => { setEvalMunicipio(v); setEvalBarrio(geoTree[evalComarca]?.municipios?.[v]?.barrios?.[0] ?? ""); }} /><SelectField label="街区 · Barrio" value={evalBarrio} options={["", ...evalBarrioList]} onChange={setEvalBarrio} /></div></div>
      <div><p className={mutedLabel}>核心参数</p><div className="grid grid-cols-2 gap-3"><div className="col-span-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3"><div className="grid grid-cols-[1fr_auto] gap-2"><div><label className={mutedLabel}>{evalIntent === "rent" ? "报价 · 可选" : "购房总价 · 可选"}</label><input inputMode="decimal" type="number" min="0" value={evalPrice} onChange={e => setEvalPrice(e.target.value)} className={inputClass} placeholder="留空 = 自动预测" /></div>{evalIntent === "rent" && <div><label className={mutedLabel}>计价方式</label><select value={evalPriceMode} onChange={e => setEvalPriceMode(e.target.value as PriceMode)} className={`${selectClass} min-w-[120px]`}><option value="monthly">月租</option><option value="total">总价</option></select></div>}</div>{evalIntent === "rent" && evalPriceMode === "total" && <div className="mt-2"><label className={mutedLabel}>租期 · 月</label><input type="number" min="1" value={evalTermMonths} onChange={e => setEvalTermMonths(e.target.value)} className={inputClass} /></div>}<p className="mt-2 text-[11px] text-indigo-600">{evalPrice ? "提交后会与模型预测区间进行比较。" : "不填写价格也可以继续，系统会直接给出合理价格预测。"}</p></div><div><label className={mutedLabel}>面积 · ㎡</label><input type="number" min="1" value={evalSqm} onChange={e => setEvalSqm(e.target.value)} className={inputClass} required /></div><div><label className={mutedLabel}>卧室</label><input type="number" min="0" value={evalBedrooms} onChange={e => setEvalBedrooms(e.target.value)} className={inputClass} /></div><SelectField label="楼层" value={evalFloor} options={Object.keys(FLOOR_LABELS)} onChange={v => setEvalFloor(v as FloorLevel)} /></div></div>
      <div><p className={mutedLabel}>房屋状态</p><div className="grid grid-cols-3 gap-2">{Object.entries(CONDITION_LABELS).map(([v, l]) => <button key={v} type="button" onClick={() => setEvalCondition(v as Condition)} className={`rounded-xl border px-2 py-2.5 text-xs font-medium ${evalCondition === v ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{l}</button>)}</div></div>
      <button type="button" onClick={() => setEvalElevator(v => !v)} className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm ${evalElevator ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}><span className="flex items-center gap-2"><Building2 className="h-4 w-4" />电梯</span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${evalElevator ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{evalElevator && <Check className="h-3 w-3" />}</span></button>
      <div><label className={mutedLabel}>地址 · 可选</label><div className="relative"><MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={evalAddress} onChange={e => setEvalAddress(e.target.value)} placeholder="例如 Carrer de Balmes 120" className={`${inputClass} pl-9`} /></div></div><div><label className={mutedLabel}>补充说明 · 可选</label><textarea rows={3} value={evalDesc} onChange={e => setEvalDesc(e.target.value)} placeholder="阳台、采光、装修、看房备注等" className={inputClass} /></div>
      {evalError && <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs text-rose-700"><AlertTriangle className="h-4 w-4 shrink-0" />{evalError}</div>}<button disabled={evalLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{evalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{evalLoading ? "正在分析房源" : "开始评估"}</button>
    </form></div>
    <div className="space-y-6">{!evalResult && !evalLoading && <EmptyState icon={Search} title="等待房源分析" body="填写房屋基本信息即可开始。价格不是必填项。" />}{evalLoading && <div className={`${panelClass} flex min-h-[420px] items-center justify-center text-center`}><div><Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" /><p className="mt-4 text-sm font-semibold">正在生成预测与风险分析</p></div></div>}{evalResult && <div className="space-y-6">
      <div className={`${panelClass} overflow-hidden`}><div className="border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f6f8ff_100%)] p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap gap-2"><StatusPill label={safeText(evalResult.valuation_summary?.rating, "评估完成")} tone="success" />{priceWasProvided ? <StatusPill label="已完成报价比对" tone="success" /> : <StatusPill label="自动预测模式" tone="warning" />}</div><h2 className="mt-4 text-2xl font-semibold tracking-tight">{safeText(evalResult.valuation_summary?.value_verdict, "已完成房源分析")}</h2></div><div className="rounded-2xl bg-slate-950 px-4 py-4 text-white sm:min-w-[230px]"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">预测 / 公平价值</p><p className="mt-1 text-2xl font-semibold">{safeText(evalResult.valuation_summary?.adjusted_fair_value)}</p></div></div></div>
        {priceWasProvided && <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6"><MetricCard label="你的月度报价" value={`€${Math.round(evalResult.__input.monthlyPrice).toLocaleString("es-ES")}`} icon={WalletCards} accent="indigo" /><MetricCard label="与公平价值偏差" value={safeText(evalResult.valuation_summary?.variance_percentage)} icon={BarChart3} accent="amber" /><MetricCard label="区域状态" value={safeText(evalResult.compliance_status, "已分析")} icon={ShieldCheck} accent="emerald" /></div>}
        {!priceWasProvided && <div className="border-t border-slate-100 bg-indigo-50/50 px-5 py-4 text-sm text-indigo-900 sm:px-6"><b>没有填写报价。</b> 上面的公平价值来自当前房源参数和区域基准；你拿到房东报价后，可以直接回来填写进行比价。</div>}</div>
      <SectionCard title="可核对的核心指标" eyebrow="Core benchmark"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{renderBenchmark()}</div></SectionCard>
      <SectionCard title="区域与位置" eyebrow="Location intelligence"><div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">区域定位</p><p className="mt-2 text-sm leading-6 text-slate-700">{safeText(evalResult.geographic_and_location_analysis?.comarca_positioning)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">市镇与街区</p><p className="mt-2 text-sm leading-6 text-slate-700">{safeText(evalResult.geographic_and_location_analysis?.municipio_and_barrio_insight)}</p></div></div></SectionCard>
      <SectionCard title="财务与风险摘要" eyebrow="Decision support"><p className="text-sm leading-7 text-slate-700">{safeText(evalResult.financial_and_yield_breakdown)}</p>{Array.isArray(evalResult.actionable_negotiation_strategy) && <div className="mt-5 grid gap-3 md:grid-cols-2">{evalResult.actionable_negotiation_strategy.map((x: string, i: number) => <div key={`${x}-${i}`} className="rounded-2xl border border-slate-200 p-4"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">{i + 1}</span><p className="text-sm leading-6 text-slate-700">{x}</p></div></div>)}</div>}</SectionCard>
      <SectionCard title="风险检查" eyebrow="Risk review"><div className="grid gap-3 sm:grid-cols-3"><MetricCard label="合同类型" value={CONTRACT_LABELS["LAU_LONG_TERM"]} icon={FileCheck2} accent="slate" /><MetricCard label="楼层" value={FLOOR_LABELS[evalFloor]} icon={Building2} accent="indigo" /><MetricCard label="电梯" value={evalElevator ? "有" : "无"} icon={Check} accent={evalElevator ? "emerald" : "amber"} /></div></SectionCard>
    </div>}</div></section>}

    {activeTab === "compare" && <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]"><div className={panelClass}><div className="border-b border-slate-100 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">02 · Regional benchmark</p><h2 className="mt-1 text-xl font-semibold">区域对比</h2></div><form onSubmit={handleCompare} className="space-y-5 p-5"><div className="rounded-2xl border border-slate-200 p-4"><p className="mb-3 text-sm font-semibold">区域 A</p><SelectField label="县" value={compComarcaA} options={comarcaList} onChange={v => { setCompComarcaA(v); resetLocation(geoTree, v, setCompMuniA, setCompBarrioA); }} /><div className="mt-3"><SelectField label="市镇" value={compMuniA} options={compMuniListA} onChange={v => { setCompMuniA(v); setCompBarrioA(geoTree[compComarcaA]?.municipios?.[v]?.barrios?.[0] ?? ""); }} /></div><div className="mt-3"><SelectField label="街区" value={compBarrioA} options={["", ...compBarrioListA]} onChange={setCompBarrioA} /></div></div><div className="rounded-2xl border border-slate-200 p-4"><p className="mb-3 text-sm font-semibold">区域 B</p><SelectField label="县" value={compComarcaB} options={comarcaList} onChange={v => { setCompComarcaB(v); resetLocation(geoTree, v, setCompMuniB, setCompBarrioB); }} /><div className="mt-3"><SelectField label="市镇" value={compMuniB} options={compMuniListB} onChange={v => { setCompMuniB(v); setCompBarrioB(geoTree[compComarcaB]?.municipios?.[v]?.barrios?.[0] ?? ""); }} /></div><div className="mt-3"><SelectField label="街区" value={compBarrioB} options={["", ...compBarrioListB]} onChange={setCompBarrioB} /></div></div><div><label className={mutedLabel}>统一面积 · ㎡</label><input type="number" min="1" value={compSqm} onChange={e => setCompSqm(e.target.value)} className={inputClass} /></div>{compError && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{compError}</p>}<button disabled={compLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white">{compLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}生成区域对比</button></form></div><div>{!compResult && !compLoading ? <EmptyState icon={TrendingUp} title="等待区域对比" body="比较两个区域的租金、售价、收益率、安全度与宜居度。" /> : null}{compLoading && <div className={`${panelClass} flex min-h-[420px] items-center justify-center`}><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>}{compResult && <div className="space-y-6"><SectionCard title="对比结论" eyebrow="Comparison verdict"><p className="text-lg font-semibold leading-7">{safeText(compResult.ai_analysis?.comparison_verdict)}</p></SectionCard><SectionCard title="区域核心指标"><div className="grid gap-4 lg:grid-cols-2">{[compResult.raw_metrics?.region_a, compResult.raw_metrics?.region_b].map((r: any, i: number) => <div key={i} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">区域 {i ? "B" : "A"}</p><h3 className="mt-1 font-semibold">{safeText(r?.name)}</h3><div className="mt-4 grid grid-cols-2 gap-2"><MetricCard label="月租估算" value={safeText(r?.avg_rent_est)} icon={WalletCards} /><MetricCard label="售价估算" value={safeText(r?.avg_sale_est)} icon={Building2} accent="emerald" /><MetricCard label="毛收益率" value={safeText(r?.gross_yield)} icon={TrendingUp} accent="amber" /><MetricCard label="宜居度" value={safeText(r?.livability_score)} icon={HomeIcon} accent="slate" /></div></div>)}</div></SectionCard></div>}</div></section>}

    {activeTab === "legal" && <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]"><div className={panelClass}><div className="border-b border-slate-100 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">03 · Rental compliance</p><h2 className="mt-1 text-xl font-semibold">租务风险检查</h2></div><form onSubmit={handleLegalCheck} className="space-y-5 p-5"><SelectField label="县" value={legalComarca} options={comarcaList} onChange={v => { setLegalComarca(v); resetLocation(geoTree, v, setLegalMuni, setLegalBarrio); }} /><div className="grid grid-cols-2 gap-3"><SelectField label="市镇" value={legalMuni} options={legalMuniList} onChange={v => { setLegalMuni(v); setLegalBarrio(geoTree[legalComarca]?.municipios?.[v]?.barrios?.[0] ?? ""); }} /><SelectField label="街区" value={legalBarrio} options={["", ...legalBarrioList]} onChange={setLegalBarrio} /></div><div className="grid grid-cols-2 gap-3"><div><label className={mutedLabel}>月租 · €</label><input type="number" min="0" value={legalRent} onChange={e => setLegalRent(e.target.value)} className={inputClass} required /></div><div><label className={mutedLabel}>押金 · €</label><input type="number" min="0" value={legalDeposit} onChange={e => setLegalDeposit(e.target.value)} className={inputClass} /></div><div><label className={mutedLabel}>中介费 · €</label><input type="number" min="0" value={legalAgencyFee} onChange={e => setLegalAgencyFee(e.target.value)} className={inputClass} /></div><SelectField label="合同类型" value={legalContractType} options={Object.keys(CONTRACT_LABELS)} onChange={setLegalContractType} /></div><p className="-mt-2 text-[11px] text-slate-400">当前选择：{CONTRACT_LABELS[legalContractType]}</p><button type="button" onClick={() => setLegalChargedTenant(v => !v)} className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm ${legalChargedTenant ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500"}`}><span>租客承担中介费 / 管理费</span>{legalChargedTenant ? <XCircle className="h-5 w-5" /> : <Minus className="h-5 w-5" />}</button><textarea rows={7} value={legalText} onChange={e => setLegalText(e.target.value)} placeholder="合同条款、房东消息或中介说明……" className={inputClass} />{legalError && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{legalError}</p>}<button disabled={legalLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white">{legalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}开始风险检查</button></form></div><div>{!legalResult && !legalLoading ? <EmptyState icon={ShieldCheck} title="等待风险检查" body="检查租金、押金、中介费及合同内容。" /> : null}{legalLoading && <div className={`${panelClass} flex min-h-[420px] items-center justify-center`}><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>}{legalResult && <div className="space-y-6"><SectionCard title="总体风险" eyebrow="Risk level"><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusTone(legalResult.overall_risk_level)}`}>{safeText(legalResult.overall_risk_level, "UNKNOWN")}</span><h2 className="mt-4 text-xl font-semibold">{safeText(legalResult.compliance_verdict, "已完成风险检查")}</h2></SectionCard><SectionCard title="发现的问题"><div className="space-y-3">{Array.isArray(legalResult.hard_legal_violations) && legalResult.hard_legal_violations.length ? legalResult.hard_legal_violations.map((x: string, i: number) => <div key={i} className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{x}</div>) : <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">当前结果未返回硬性违法项。</div>}</div></SectionCard><SectionCard title="合同内容分析"><p className="text-sm leading-7 text-slate-700">{safeText(legalResult.contract_text_analysis)}</p></SectionCard></div>}</div></section>}

    {(activeTab === "concierge" || activeTab === "marketplace") && <section className={`${panelClass} p-8 lg:p-12`}><div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">Next product line</p><h2 className="mt-2 text-3xl font-semibold">{activeTab === "concierge" ? "专家服务工作台" : "智能房源匹配库"}</h2><p className="mt-4 text-sm leading-7 text-slate-600">{activeTab === "concierge" ? "下一阶段接入看房清单、资料核验和议价服务。" : "下一阶段把预算、区域、通勤、租金与合规评分整合进房源排序。"}</p><div className="mt-6 flex flex-wrap gap-2"><StatusPill label="预算" /><StatusPill label="区域" /><StatusPill label="收益" /><StatusPill label="合规" /></div></div></section>}

    <footer className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>BCN Housing Intelligence · Next.js + React + TypeScript</p><span className="inline-flex items-center gap-1.5"><CircleHelp className="h-3.5 w-3.5" />结果用于辅助决策，不替代律师或注册估价师的正式意见。</span></footer>
  </div></main>;
}
