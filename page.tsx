"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  Home,
  Info,
  Landmark,
  Loader2,
  MapPin,
  Minus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";
import { BACKEND_URL, fetchFromBackend } from "@/lib/api";

type TabKey = "evaluate" | "compare" | "legal" | "concierge" | "marketplace";
type Intent = "rent" | "buy";
type RentalType = "entire" | "room";
type Condition = "good" | "renovated" | "needs_renovation";
type FloorLevel = "Middle" | "Ático" | "Bajo";

interface MunicipalityNode {
  barrios: string[];
  zone_tensionada?: boolean;
  avg_rent_sqm?: number;
  avg_sale_sqm?: number;
}

interface GeoNode {
  description?: string;
  municipios: Record<string, MunicipalityNode>;
}

type GeoTree = Record<string, GeoNode>;

const FALLBACK_TREE: GeoTree = {
  Barcelonès: {
    description: "巴塞罗那核心都市圈。",
    municipios: {
      Barcelona: {
        barrios: ["Eixample", "Gràcia", "Sarrià-Sant Gervasi", "Poblenou / Sant Martí", "Ciutat Vella / Gòtic"],
        zone_tensionada: true,
      },
      Badalona: {
        barrios: ["Centre / Dalt de la Vila", "Gorg / Port", "La Salut / Llefià"],
        zone_tensionada: true,
      },
    },
  },
  "Vallès Occidental": {
    description: "科技、大学与近郊居住板块。",
    municipios: {
      "Sant Cugat del Vallès": {
        barrios: ["Volpelleres", "Mirasol", "Centre Station"],
        zone_tensionada: true,
      },
      Sabadell: {
        barrios: ["Centre", "Creu Alta"],
        zone_tensionada: true,
      },
    },
  },
  Maresme: {
    description: "地中海海岸与近郊生活板块。",
    municipios: {
      Mataró: {
        barrios: ["Centre", "Cerdanyola de Mataró"],
        zone_tensionada: true,
      },
      "El Masnou": {
        barrios: ["Centre / Port"],
        zone_tensionada: true,
      },
    },
  },
};

const panelClass =
  "rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.28)] backdrop-blur";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
const selectClass = `${inputClass} appearance-none pr-10`;
const mutedLabel = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500";

function formatNumber(value: unknown) {
  const text = String(value ?? "");
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return text;
  const n = Number(match[0]);
  if (!Number.isFinite(n)) return text;
  return n.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

function safeText(value: unknown, fallback = "暂无数据") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function parseJsonError(error: unknown) {
  return error instanceof Error ? error.message : "请求失败，请稍后重试。";
}

function statusTone(level: string | undefined) {
  const normalized = String(level || "").toUpperCase();
  if (normalized === "RED") return "border-rose-200 bg-rose-50 text-rose-700";
  if (normalized === "YELLOW") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const styles = {
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className={mutedLabel}>{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {hint ? <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "indigo",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}) {
  const iconMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
          {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
        </div>
        <div className={`rounded-xl p-2.5 ${iconMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, body, icon: Icon }: { title: string; body: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p> : null}
      <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
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
  const [evalPrice, setEvalPrice] = useState("1300");
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
  const [legalAddress, setLegalAddress] = useState("");
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

  const refreshGeo = async () => {
    setLoadingGeo(true);
    setGeoError("");
    try {
      const res = await fetchFromBackend("/api/geography/tree");
      if (res?.data) setGeoTree(res.data as GeoTree);
    } catch (error) {
      setGeoError(parseJsonError(error));
    } finally {
      setLoadingGeo(false);
    }
  };

  useEffect(() => {
    refreshGeo();
  }, []);

  const resetDependentSelect = (nextGeo: GeoTree, comarca: string, setters: { municipio: (v: string) => void; barrio: (v: string) => void }) => {
    const municipalities = Object.keys(nextGeo[comarca]?.municipios ?? {});
    const nextMunicipio = municipalities[0] ?? "";
    const nextBarrio = nextGeo[comarca]?.municipios?.[nextMunicipio]?.barrios?.[0] ?? "";
    setters.municipio(nextMunicipio);
    setters.barrio(nextBarrio);
  };

  const setEvalComarcaSafe = (value: string) => {
    setEvalComarca(value);
    resetDependentSelect(geoTree, value, { municipio: setEvalMunicipio, barrio: setEvalBarrio });
  };
  const setCompComarcaASafe = (value: string) => {
    setCompComarcaA(value);
    resetDependentSelect(geoTree, value, { municipio: setCompMuniA, barrio: setCompBarrioA });
  };
  const setCompComarcaBSafe = (value: string) => {
    setCompComarcaB(value);
    resetDependentSelect(geoTree, value, { municipio: setCompMuniB, barrio: setCompBarrioB });
  };
  const setLegalComarcaSafe = (value: string) => {
    setLegalComarca(value);
    resetDependentSelect(geoTree, value, { municipio: setLegalMuni, barrio: setLegalBarrio });
  };

  const handleEvaluate = async (e: FormEvent) => {
    e.preventDefault();
    setEvalLoading(true);
    setEvalResult(null);
    setEvalError("");
    try {
      const payload = {
        intent: evalIntent,
        rental_type: evalRentalType,
        comarca: evalComarca,
        municipio: evalMunicipio,
        barrio: evalBarrio || null,
        address: evalAddress || null,
        price: Number(evalPrice) || 0,
        area_sqm: Number(evalSqm) || 0,
        bedrooms: Number(evalBedrooms) || 1,
        floor_level: evalFloor,
        has_elevator: evalElevator,
        condition: evalCondition,
        description: evalDesc || null,
      };
      const res = await fetchFromBackend("/api/evaluate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res?.status === "success") setEvalResult(res.data);
      else throw new Error(res?.message || "评估服务未返回有效结果。 ");
    } catch (error) {
      setEvalError(parseJsonError(error));
    } finally {
      setEvalLoading(false);
    }
  };

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    setCompLoading(true);
    setCompResult(null);
    setCompError("");
    try {
      const res = await fetchFromBackend("/api/compare-regions", {
        method: "POST",
        body: JSON.stringify({
          comarca_a: compComarcaA,
          municipio_a: compMuniA,
          barrio_a: compBarrioA || null,
          comarca_b: compComarcaB,
          municipio_b: compMuniB,
          barrio_b: compBarrioB || null,
          area_sqm: Number(compSqm) || 80,
        }),
      });
      if (res?.status === "success") setCompResult(res.data);
      else throw new Error(res?.message || "对比服务未返回有效结果。 ");
    } catch (error) {
      setCompError(parseJsonError(error));
    } finally {
      setCompLoading(false);
    }
  };

  const handleLegalCheck = async (e: FormEvent) => {
    e.preventDefault();
    setLegalLoading(true);
    setLegalResult(null);
    setLegalError("");
    try {
      const res = await fetchFromBackend("/api/check-rental-risk", {
        method: "POST",
        body: JSON.stringify({
          comarca: legalComarca,
          municipio: legalMuni,
          barrio: legalBarrio || null,
          address: legalAddress || null,
          monthly_rent: Number(legalRent) || 0,
          deposit_amount: Number(legalDeposit) || 0,
          agency_fee_amount: Number(legalAgencyFee) || 0,
          agency_fee_charged_to_tenant: legalChargedTenant,
          contract_type: legalContractType,
          contract_text: legalText || null,
        }),
      });
      if (res?.status === "success") setLegalResult(res.data);
      else throw new Error(res?.message || "风控服务未返回有效结果。 ");
    } catch (error) {
      setLegalError(parseJsonError(error));
    } finally {
      setLegalLoading(false);
    }
  };

  const tabs: { key: TabKey; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "evaluate", label: "房产评估", sub: "价格 · 收益 · 风险", icon: BarChart3 },
    { key: "compare", label: "区域对比", sub: "租金 · 资产 · 宜居", icon: TrendingUp },
    { key: "legal", label: "租务风控", sub: "合同 · 押金 · 中介费", icon: ShieldCheck },
    { key: "concierge", label: "专家服务", sub: "下一阶段产品", icon: Users },
    { key: "marketplace", label: "房源匹配", sub: "下一阶段产品", icon: Target },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[-160px] h-[440px] w-[440px] rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute right-[-80px] top-[18%] h-[360px] w-[360px] rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <header className="mb-6 overflow-hidden rounded-[32px] border border-slate-200/90 bg-[#0b1220] text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)]">
          <div className="relative px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(99,102,241,0.23),transparent_36%),radial-gradient(circle_at_12%_95%,rgba(34,211,238,0.1),transparent_30%)]" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  BCN HOUSING INTELLIGENCE
                </div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                  巴塞罗那房产智能决策平台
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  把房价判断、区域比较与租务风险整合到一个清晰的决策界面。前端直接连接你的 FastAPI 房产分析后端。
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <StatusPill label={loadingGeo ? "正在同步区域数据" : "区域数据已连接"} tone={loadingGeo ? "warning" : "success"} />
                  <StatusPill label="FastAPI" tone="neutral" />
                  <StatusPill label="AI analysis" tone="neutral" />
                </div>
              </div>

              <div className="min-w-[270px] rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Backend endpoint</p>
                    <p className="mt-1 truncate text-sm font-medium text-white">{BACKEND_URL.replace("https://", "")}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshGeo}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingGeo ? "animate-spin" : ""}`} />
                  同步区域数据
                </button>
              </div>
            </div>
          </div>
        </header>

        {geoError ? (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">实时区域数据暂时不可用</p>
              <p className="mt-1 text-xs leading-5">当前页面已启用轻量演示数据，你可以继续查看界面；连接恢复后点击“同步区域数据”。</p>
            </div>
          </div>
        ) : null}

        <section className="mb-6 grid gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm md:grid-cols-5">
          {tabs.map(({ key, label, sub, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`group flex min-h-[72px] items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  active ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className={`rounded-xl p-2.5 ${active ? "bg-white/10 text-cyan-300" : "bg-slate-100 text-slate-500 group-hover:bg-white"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${active ? "text-white" : "text-slate-800"}`}>{label}</p>
                  <p className={`mt-0.5 truncate text-[11px] ${active ? "text-slate-300" : "text-slate-400"}`}>{sub}</p>
                </div>
              </button>
            );
          })}
        </section>

        {activeTab === "evaluate" ? (
          <section className="grid gap-6 xl:grid-cols-[410px_minmax(0,1fr)]">
            <div className={panelClass}>
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">01 · Property analysis</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">输入房源信息</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">输入越完整，估值和风险判断越有参考价值。</p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                    <Home className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleEvaluate} className="space-y-5 p-5 sm:p-6">
                <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button type="button" onClick={() => setEvalIntent("rent")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${evalIntent === "rent" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>
                    租房
                  </button>
                  <button type="button" onClick={() => setEvalIntent("buy")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${evalIntent === "buy" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>
                    买房
                  </button>
                </div>

                {evalIntent === "rent" ? (
                  <div>
                    <p className={mutedLabel}>租赁形式</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setEvalRentalType("entire")} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${evalRentalType === "entire" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>整套</button>
                      <button type="button" onClick={() => setEvalRentalType("room")} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${evalRentalType === "room" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>单间</button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <p className={mutedLabel}>位置</p>
                  <SelectField label="Comarca · 县" value={evalComarca} options={comarcaList} onChange={setEvalComarcaSafe} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField
                      label="Municipio · 市镇"
                      value={evalMunicipio}
                      options={evalMuniList}
                      onChange={(value) => {
                        setEvalMunicipio(value);
                        setEvalBarrio(geoTree[evalComarca]?.municipios?.[value]?.barrios?.[0] ?? "");
                      }}
                    />
                    <SelectField label="Barrio · 街区" value={evalBarrio} options={["", ...evalBarrioList]} onChange={setEvalBarrio} hint="可留空，使用全域模式。" />
                  </div>
                </div>

                <div>
                  <p className={mutedLabel}>核心参数</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={mutedLabel}>{evalIntent === "rent" ? "月租 · €" : "总价 · €"}</label><input inputMode="decimal" type="number" min="0" value={evalPrice} onChange={(e) => setEvalPrice(e.target.value)} className={inputClass} required /></div>
                    <div><label className={mutedLabel}>面积 · ㎡</label><input inputMode="decimal" type="number" min="1" value={evalSqm} onChange={(e) => setEvalSqm(e.target.value)} className={inputClass} required /></div>
                    <div><label className={mutedLabel}>卧室</label><input type="number" min="0" value={evalBedrooms} onChange={(e) => setEvalBedrooms(e.target.value)} className={inputClass} /></div>
                    <SelectField label="楼层" value={evalFloor} options={["Middle", "Ático", "Bajo"]} onChange={(value) => setEvalFloor(value as FloorLevel)} />
                  </div>
                </div>

                <div>
                  <p className={mutedLabel}>房屋状态</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["good", "良好"],
                      ["renovated", "已翻新"],
                      ["needs_renovation", "需翻修"],
                    ].map(([value, label]) => (
                      <button key={value} type="button" onClick={() => setEvalCondition(value as Condition)} className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition ${evalCondition === value ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{label}</button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEvalElevator((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm transition ${evalElevator ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}
                >
                  <span className="flex items-center gap-2"><Building2 className="h-4 w-4" />有电梯</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${evalElevator ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{evalElevator ? <Check className="h-3 w-3" /> : null}</span>
                </button>

                <div>
                  <label className={mutedLabel}>地址 · 可选</label>
                  <div className="relative"><MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={evalAddress} onChange={(e) => setEvalAddress(e.target.value)} placeholder="例如 Carrer de Balmes 120" className={`${inputClass} pl-9`} /></div>
                </div>
                <div>
                  <label className={mutedLabel}>补充说明</label>
                  <textarea rows={3} value={evalDesc} onChange={(e) => setEvalDesc(e.target.value)} placeholder="阳台、采光、装修、看房备注等" className={inputClass} />
                </div>

                {evalError ? <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs leading-5 text-rose-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{evalError}</div> : null}

                <button disabled={evalLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {evalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {evalLoading ? "正在分析房源" : "开始评估"}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              {!evalResult && !evalLoading ? (
                <EmptyState icon={Search} title="等待房源分析" body="提交左侧房源信息后，这里会展示价格判断、位置分析、风险提示与行动建议。" />
              ) : null}

              {evalLoading ? (
                <div className={`${panelClass} flex min-h-[420px] items-center justify-center px-8 text-center`}>
                  <div className="max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Loader2 className="h-7 w-7 animate-spin" /></div>
                    <h3 className="mt-5 text-xl font-semibold">正在生成分析报告</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">前端正在等待 FastAPI 返回计算结果与 AI 分析。</p>
                  </div>
                </div>
              ) : null}

              {evalResult ? (
                <div className="space-y-6">
                  <div className={`${panelClass} overflow-hidden`}>
                    <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f6f8ff_100%)] p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill label={safeText(evalResult.valuation_summary?.rating, "评估完成")} tone="success" />
                            {evalIntent === "rent" ? <StatusPill label="租赁" tone="neutral" /> : <StatusPill label="买卖" tone="neutral" />}
                          </div>
                          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{safeText(evalResult.valuation_summary?.value_verdict, "AI 已完成初步分析")}</h2>
                        </div>
                        <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white sm:min-w-[220px]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Adjusted fair value</p>
                          <p className="mt-1 text-2xl font-semibold">{safeText(evalResult.valuation_summary?.adjusted_fair_value)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6">
                      <MetricCard label="价格偏离" value={safeText(evalResult.valuation_summary?.variance_percentage)} icon={BarChart3} accent="indigo" />
                      <MetricCard label="公平价值" value={safeText(evalResult.valuation_summary?.adjusted_fair_value)} icon={WalletCards} accent="emerald" />
                      <MetricCard label="区域状态" value={evalResult.compliance_status || (evalIntent === "rent" ? "租务分析" : "资产分析")} icon={ShieldCheck} accent="amber" />
                      <MetricCard label="位置分析" value={safeText(evalResult.geographic_and_location_analysis?.municipio_and_barrio_insight, "已生成")} icon={MapPin} accent="slate" />
                    </div>
                  </div>

                  <SectionCard title="区域与位置" eyebrow="Location intelligence">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">区域定位</p><p className="mt-2 text-sm leading-6 text-slate-700">{safeText(evalResult.geographic_and_location_analysis?.comarca_positioning)}</p></div>
                      <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">市镇与街区</p><p className="mt-2 text-sm leading-6 text-slate-700">{safeText(evalResult.geographic_and_location_analysis?.municipio_and_barrio_insight)}</p></div>
                    </div>
                  </SectionCard>

                  <SectionCard title="财务与风险摘要" eyebrow="Decision support">
                    <p className="text-sm leading-7 text-slate-700">{safeText(evalResult.financial_and_yield_breakdown)}</p>
                    {Array.isArray(evalResult.actionable_negotiation_strategy) && evalResult.actionable_negotiation_strategy.length > 0 ? (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {evalResult.actionable_negotiation_strategy.map((item: string, index: number) => (
                          <div key={`${item}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">{index + 1}</div><p className="text-sm leading-6 text-slate-700">{item}</p></div></div>
                        ))}
                      </div>
                    ) : null}
                  </SectionCard>

                  <SectionCard title="可核对的核心指标" eyebrow="Backend metrics">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(evalResult.valuation_benchmark || {}).map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-slate-200 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-400">{key.replaceAll("_", " ")}</p><p className="mt-1 text-sm font-medium text-slate-800">{safeText(value)}</p></div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeTab === "compare" ? (
          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className={panelClass}>
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">02 · Regional benchmark</p>
                <h2 className="mt-1 text-xl font-semibold">对比两个区域</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">用同一套面积基准，快速比较租金、售价、收益和宜居度。</p>
              </div>
              <form onSubmit={handleCompare} className="space-y-5 p-5 sm:p-6">
                {[{name: "区域 A", comarca: compComarcaA, setComarca: setCompComarcaASafe, muni: compMuniA, setMuni: (v: string) => { setCompMuniA(v); setCompBarrioA(geoTree[compComarcaA]?.municipios?.[v]?.barrios?.[0] ?? ""); }, barrio: compBarrioA, setBarrio: setCompBarrioA, muniList: compMuniListA, barrioList: compBarrioListA}, {name: "区域 B", comarca: compComarcaB, setComarca: setCompComarcaBSafe, muni: compMuniB, setMuni: (v: string) => { setCompMuniB(v); setCompBarrioB(geoTree[compComarcaB]?.municipios?.[v]?.barrios?.[0] ?? ""); }, barrio: compBarrioB, setBarrio: setCompBarrioB, muniList: compMuniListB, barrioList: compBarrioListB}].map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">{item.name}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</span></div>
                    <div className="space-y-3">
                      <SelectField label="Comarca" value={item.comarca} options={comarcaList} onChange={item.setComarca} />
                      <SelectField label="Municipio" value={item.muni} options={item.muniList} onChange={item.setMuni} />
                      <SelectField label="Barrio" value={item.barrio} options={["", ...item.barrioList]} onChange={item.setBarrio} />
                    </div>
                  </div>
                ))}

                <div><label className={mutedLabel}>统一面积 · ㎡</label><input type="number" min="1" value={compSqm} onChange={(e) => setCompSqm(e.target.value)} className={inputClass} /></div>
                {compError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs text-rose-700">{compError}</div> : null}
                <button disabled={compLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                  {compLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {compLoading ? "正在比较" : "生成区域对比"}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              {!compResult && !compLoading ? <EmptyState icon={TrendingUp} title="等待区域对比" body="选择两个区域后，系统会返回可量化的租金、售价、收益率、安全度和宜居度。" /> : null}
              {compLoading ? <div className={`${panelClass} flex min-h-[420px] items-center justify-center`}><div className="text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" /><p className="mt-4 text-sm font-semibold">正在生成区域比较</p></div></div> : null}
              {compResult ? (
                <div className="space-y-6">
                  <div className={`${panelClass} p-5 sm:p-6`}>
                    <div className="flex items-start gap-3"><div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Scale className="h-4 w-4" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">Comparison verdict</p><h2 className="mt-1 text-xl font-semibold leading-7">{safeText(compResult.ai_analysis?.comparison_verdict)}</h2></div></div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      {[compResult.raw_metrics?.region_a, compResult.raw_metrics?.region_b].map((region: any, index: number) => (
                        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">区域 {index === 0 ? "A" : "B"}</p>
                          <h3 className="mt-1 text-base font-semibold text-slate-950">{safeText(region?.name)}</h3>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <MetricCard label="月租估算" value={safeText(region?.avg_rent_est)} icon={WalletCards} accent="indigo" />
                            <MetricCard label="售价估算" value={safeText(region?.avg_sale_est)} icon={Building2} accent="emerald" />
                            <MetricCard label="毛收益率" value={safeText(region?.gross_yield)} icon={TrendingUp} accent="amber" />
                            <MetricCard label="宜居度" value={safeText(region?.livability_score)} icon={Home} accent="slate" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <SectionCard title="市场与投资分析" eyebrow="AI comparison">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        ["租金与成本", compResult.ai_analysis?.rental_and_cost_comparison, WalletCards],
                        ["居住与安全", compResult.ai_analysis?.living_quality_and_safety, ShieldCheck],
                        ["投资回报", compResult.ai_analysis?.investment_yield_perspective, TrendingUp],
                        ["人群建议", `A：${safeText(compResult.ai_analysis?.target_persona_recommendation?.region_a_best_for)}\nB：${safeText(compResult.ai_analysis?.target_persona_recommendation?.region_b_best_for)}`, Users],
                      ].map(([title, text, Icon]) => (
                        <div key={String(title)} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Icon className="h-4 w-4" /></div>{String(title)}</div><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{String(text ?? "暂无数据")}</p></div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeTab === "legal" ? (
          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className={panelClass}>
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">03 · Rental compliance</p>
                <h2 className="mt-1 text-xl font-semibold">检查租务风险</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">适合在签约前检查租金、押金、中介费和合同内容。</p>
              </div>
              <form onSubmit={handleLegalCheck} className="space-y-5 p-5 sm:p-6">
                <div className="space-y-3">
                  <SelectField label="Comarca" value={legalComarca} options={comarcaList} onChange={setLegalComarcaSafe} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField label="Municipio" value={legalMuni} options={legalMuniList} onChange={(value) => { setLegalMuni(value); setLegalBarrio(geoTree[legalComarca]?.municipios?.[value]?.barrios?.[0] ?? ""); }} />
                    <SelectField label="Barrio" value={legalBarrio} options={["", ...legalBarrioList]} onChange={setLegalBarrio} />
                  </div>
                  <div><label className={mutedLabel}>地址 · 可选</label><input value={legalAddress} onChange={(e) => setLegalAddress(e.target.value)} className={inputClass} placeholder="例如 Carrer de Mallorca 140" /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={mutedLabel}>月租 · €</label><input type="number" min="0" value={legalRent} onChange={(e) => setLegalRent(e.target.value)} className={inputClass} required /></div>
                  <div><label className={mutedLabel}>押金 · €</label><input type="number" min="0" value={legalDeposit} onChange={(e) => setLegalDeposit(e.target.value)} className={inputClass} /></div>
                  <div><label className={mutedLabel}>中介费 · €</label><input type="number" min="0" value={legalAgencyFee} onChange={(e) => setLegalAgencyFee(e.target.value)} className={inputClass} /></div>
                  <SelectField label="合同类型" value={legalContractType} options={["LAU_LONG_TERM", "TEMPORADA"]} onChange={setLegalContractType} />
                </div>

                <button type="button" onClick={() => setLegalChargedTenant((v) => !v)} className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm ${legalChargedTenant ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500"}`}>
                  <span>租客承担中介费 / 管理费</span>
                  {legalChargedTenant ? <XCircle className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </button>

                <div><label className={mutedLabel}>合同或聊天记录 · 可选</label><textarea rows={7} value={legalText} onChange={(e) => setLegalText(e.target.value)} placeholder="粘贴合同条款、房东消息或中介说明……" className={inputClass} /></div>
                {legalError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs text-rose-700">{legalError}</div> : null}
                <button disabled={legalLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                  {legalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                  {legalLoading ? "正在检查" : "开始风险检查"}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              {!legalResult && !legalLoading ? <EmptyState icon={ShieldCheck} title="等待风险检查" body="提交租务信息后，这里会显示总体风险、硬性问题、合同分析和下一步处理建议。" /> : null}
              {legalLoading ? <div className={`${panelClass} flex min-h-[420px] items-center justify-center`}><div className="text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" /><p className="mt-4 text-sm font-semibold">正在检查租务条件</p></div></div> : null}
              {legalResult ? (
                <div className="space-y-6">
                  <div className={`${panelClass} p-5 sm:p-6`}>
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-3xl">
                        <div className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusTone(legalResult.overall_risk_level)}`}>{safeText(legalResult.overall_risk_level, "UNKNOWN")}</div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{safeText(legalResult.compliance_verdict, "已完成风险检查")}</h2>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Scale className="h-4 w-4" /> 合规检查</div><p className="mt-2 text-sm text-slate-700">根据当前提交信息生成。</p></div>
                    </div>
                  </div>

                  <SectionCard title="发现的问题" eyebrow="Risk findings">
                    {Array.isArray(legalResult.hard_legal_violations) && legalResult.hard_legal_violations.length > 0 ? (
                      <div className="space-y-3">
                        {legalResult.hard_legal_violations.map((item: string, index: number) => (
                          <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /><p className="text-sm leading-6 text-rose-800">{item}</p></div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><ShieldCheck className="h-5 w-5" />当前结果未返回硬性违法项。</div>
                    )}
                  </SectionCard>

                  <SectionCard title="合同内容分析" eyebrow="Contract review"><p className="text-sm leading-7 text-slate-700">{safeText(legalResult.contract_text_analysis)}</p></SectionCard>

                  <SectionCard title="下一步处理" eyebrow="Action plan">
                    {Array.isArray(legalResult.actionable_rights_recovery_steps) && legalResult.actionable_rights_recovery_steps.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {legalResult.actionable_rights_recovery_steps.map((item: string, index: number) => (
                          <div key={`${item}-${index}`} className="rounded-2xl border border-slate-200 p-4"><div className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">{index + 1}</div><p className="text-sm leading-6 text-slate-700">{item}</p></div></div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-500">暂无行动建议。</p>}
                  </SectionCard>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeTab === "concierge" ? (
          <section className={`${panelClass} overflow-hidden`}>
            <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_.9fr] lg:p-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">Next product line</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">专家服务工作台</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">将房源筛选、陪看、材料核验与谈判服务接入当前分析引擎。现在先保留产品入口，不影响主流程。</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[["看房", "线下检查清单"], ["核验", "资料与合同检查"], ["谈判", "价格策略支持"]].map(([title, body]) => <div key={title} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{body}</p></div>)}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950 p-6 text-white"><p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Product status</p><div className="mt-3 flex items-center gap-3"><div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300"><Users className="h-5 w-5" /></div><div><p className="font-semibold">规划中</p><p className="mt-1 text-xs text-slate-400">先验证核心分析体验，再扩展服务网络。</p></div></div></div>
            </div>
          </section>
        ) : null}

        {activeTab === "marketplace" ? (
          <section className={`${panelClass} overflow-hidden`}>
            <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_.9fr] lg:p-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">Next product line</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">智能房源匹配库</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">未来可以把房源搜索、预算、通勤、租金上限与合规评分放进同一套排序逻辑，让用户从“分析房源”进入“发现房源”。</p>
                <div className="mt-6 flex flex-wrap gap-2"><StatusPill label="预算" tone="neutral" /><StatusPill label="区域" tone="neutral" /><StatusPill label="收益" tone="neutral" /><StatusPill label="合规" tone="neutral" /></div>
              </div>
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><Target className="h-5 w-5" /></div><p className="mt-5 text-sm font-semibold">产品路线</p><p className="mt-2 text-xs leading-6 text-slate-600">先用现有 API 完成决策层，再接入真实房源数据源与个性化推荐。</p></div>
            </div>
          </section>
        ) : null}

        <footer className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>BCN Housing Intelligence · Frontend built with Next.js + React + TypeScript</p>
          <div className="flex items-center gap-3"><span className="inline-flex items-center gap-1.5"><CircleHelp className="h-3.5 w-3.5" />结果用于辅助决策，不替代律师或注册估价师的正式意见。</span><span>© 2026</span></div>
        </footer>
      </div>
    </main>
  );
}
