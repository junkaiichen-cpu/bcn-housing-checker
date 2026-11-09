"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  DoorOpen,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  adminApi,
  Agent,
  ApiError,
  Lead,
  MatchingResponse,
  Property,
  ViewingRequest,
} from "@/lib/api";
import { useLanguage, type Language } from "../language";

type DashboardTab = "leads" | "matches" | "agents" | "properties" | "viewings";

const labels = {
  zh: {
    title: "管理员工作台",
    subtitle: "客户线索、房源匹配与看房请求",
    language: "语言",
    buy: "买房",
    rent: "租房",
    apartment: "公寓",
    house: "独栋 / 联排",
    room: "房间",
    other: "其他",
    chinese: "中文",
    spanish: "西班牙语",
    leadStatusValues: {
      NEW: "新线索",
      REVIEWING: "正在跟进",
      MATCHED: "已匹配",
      CONTACTED: "已联系",
      VIEWING_SCHEDULED: "已安排看房",
      CONVERTED: "已转化",
      CLOSED: "已关闭",
    },
    viewingStatusValues: {
      NEW: "新请求",
      SCHEDULED: "已安排",
      COMPLETED: "已完成",
      CANCELLED: "已取消",
    },
    username: "管理员账号",
    password: "密码",
    login: "登录",
    loggingIn: "正在验证…",
    loginError: "无法登录，请检查账号密码或后端配置。",
    loginHint: "管理员账号由后端环境变量配置；请勿在前端代码中填写凭据。",
    logout: "退出登录",
    back: "返回平台",
    leads: "客户线索",
    matches: "匹配房源",
    agents: "经纪人",
    properties: "房源",
    viewings: "看房请求",
    refresh: "刷新数据",
    loading: "正在安全加载管理数据…",
    loadError: "无法载入管理数据。",
    unauthorized: "登录已失效，请重新登录。",
    noLeads: "暂无客户线索。",
    noAgents: "暂无经纪人。",
    noProperties: "暂无房源。",
    noViewings: "暂无看房请求。",
    requirements: "客户需求",
    name: "姓名",
    contact: "联系方式",
    languageValue: "偏好语言",
    type: "交易类型",
    budget: "预算",
    locations: "偏好区域",
    propertyType: "房屋类型",
    bedrooms: "卧室至少",
    area: "面积至少",
    timeline: "计划时间",
    extras: "其他要求",
    leadStatus: "线索状态",
    assignAgent: "分配经纪人",
    selectAgent: "选择经纪人",
    saveAssignment: "分配",
    matchesButton: "查看匹配",
    matchingLoading: "正在读取匹配房源…",
    noMatches: "目前没有匹配房源。",
    score: "匹配度",
    explanation: "匹配说明",
    notGuarantee: "匹配分数仅供参考，不构成保证。",
    demo: "DEMO · 演示房源",
    real: "REAL · 房源",
    active: "启用",
    inactive: "停用",
    verified: "已验证",
    notVerified: "未验证",
    agentStatus: "经纪人状态",
    propertyStatus: "房源状态",
    available: "可用",
    unavailable: "不可用",
    closed: "已关闭",
    viewingStatus: "看房状态",
    scheduled: "已安排",
    completed: "已完成",
    cancelled: "已取消",
    customer: "客户",
    preferredAt: "期望时间",
    notes: "客户备注",
    assigned: "已分配经纪人",
    unassigned: "未分配",
    requestStatus: "请求状态",
    save: "保存",
    statusSaved: "状态已更新。",
    assignmentSaved: "分配已更新。",
    adminOnly: "管理员专用数据。仅在已登录的会话中请求。",
    created: "创建时间",
    noContact: "未提供",
    retry: "重试",
  },
  es: {
    title: "Panel de administración",
    subtitle: "Clientes, coincidencias y solicitudes de visita",
    language: "Idioma",
    buy: "Compra",
    rent: "Alquiler",
    apartment: "Piso",
    house: "Casa",
    room: "Habitación",
    other: "Otro",
    chinese: "Chino",
    spanish: "Español",
    leadStatusValues: {
      NEW: "Nuevo",
      REVIEWING: "En revisión",
      MATCHED: "Con coincidencias",
      CONTACTED: "Contactado",
      VIEWING_SCHEDULED: "Visita programada",
      CONVERTED: "Convertido",
      CLOSED: "Cerrado",
    },
    viewingStatusValues: {
      NEW: "Nueva",
      SCHEDULED: "Programada",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
    },
    username: "Usuario administrador",
    password: "Contraseña",
    login: "Iniciar sesión",
    loggingIn: "Verificando…",
    loginError: "No se pudo iniciar sesión. Revisa las credenciales o la configuración del backend.",
    loginHint: "Las credenciales se configuran en el backend. No las incluyas en el código del frontend.",
    logout: "Cerrar sesión",
    back: "Volver a la plataforma",
    leads: "Clientes",
    matches: "Coincidencias",
    agents: "Agentes",
    properties: "Inmuebles",
    viewings: "Visitas",
    refresh: "Actualizar datos",
    loading: "Cargando datos protegidos…",
    loadError: "No se pudieron cargar los datos de administración.",
    unauthorized: "La sesión ha caducado. Inicia sesión de nuevo.",
    noLeads: "No hay clientes todavía.",
    noAgents: "No hay agentes todavía.",
    noProperties: "No hay inmuebles todavía.",
    noViewings: "No hay solicitudes de visita.",
    requirements: "Requisitos del cliente",
    name: "Nombre",
    contact: "Contacto",
    languageValue: "Idioma preferido",
    type: "Operación",
    budget: "Presupuesto",
    locations: "Zonas preferidas",
    propertyType: "Tipo de vivienda",
    bedrooms: "Dormitorios mínimos",
    area: "Superficie mínima",
    timeline: "Plazo",
    extras: "Otros requisitos",
    leadStatus: "Estado del cliente",
    assignAgent: "Asignar agente",
    selectAgent: "Selecciona un agente",
    saveAssignment: "Asignar",
    matchesButton: "Ver coincidencias",
    matchingLoading: "Cargando coincidencias…",
    noMatches: "No hay inmuebles coincidentes por ahora.",
    score: "Coincidencia",
    explanation: "Motivos",
    notGuarantee: "La puntuación es orientativa y no constituye una garantía.",
    demo: "DEMO · Vivienda de demostración",
    real: "REAL · Vivienda",
    active: "Activo",
    inactive: "Inactivo",
    verified: "Verificado",
    notVerified: "Sin verificar",
    agentStatus: "Estado del agente",
    propertyStatus: "Estado del inmueble",
    available: "Disponible",
    unavailable: "No disponible",
    closed: "Cerrado",
    viewingStatus: "Estado de la visita",
    scheduled: "Programada",
    completed: "Completada",
    cancelled: "Cancelada",
    customer: "Cliente",
    preferredAt: "Fecha preferida",
    notes: "Notas del cliente",
    assigned: "Agente asignado",
    unassigned: "Sin asignar",
    requestStatus: "Estado de la solicitud",
    save: "Guardar",
    statusSaved: "Estado actualizado.",
    assignmentSaved: "Asignación actualizada.",
    adminOnly: "Datos privados de administración. Solo se solicitan durante una sesión autenticada.",
    created: "Creado",
    noContact: "No indicado",
    retry: "Reintentar",
  },
} as const;

const leadStatuses: Lead["status"][] = [
  "NEW",
  "REVIEWING",
  "MATCHED",
  "CONTACTED",
  "VIEWING_SCHEDULED",
  "CONVERTED",
  "CLOSED",
];
const propertyStatuses: Property["status"][] = [
  "AVAILABLE",
  "UNAVAILABLE",
  "CLOSED",
];
const viewingStatuses: ViewingRequest["status"][] = [
  "NEW",
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];
const tabs: { key: DashboardTab; icon: typeof Users }[] = [
  { key: "leads", icon: ClipboardList },
  { key: "matches", icon: ShieldCheck },
  { key: "agents", icon: Users },
  { key: "properties", icon: Building2 },
  { key: "viewings", icon: DoorOpen },
];
const controlClass =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function displayError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function formatTime(date: string) {
  return new Date(date).toLocaleString();
}

function PropertyMatchList({
  result,
  t,
}: {
  result: MatchingResponse;
  t: (typeof labels)[Language];
}) {
  if (!result.matches.length) {
    return <p className="text-sm text-slate-500">{result.message || t.noMatches}</p>;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{t.notGuarantee}</p>
      {result.matches.map((match) => (
        <article
          key={match.property_id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900">
                {match.property.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                {match.property.location}
                {match.property.neighborhood
                  ? ` · ${match.property.neighborhood}`
                  : ""}
                {" · €"}
                {match.property.price.toLocaleString("es-ES")}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                match.property.data_label === "DEMO"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {match.property.data_label === "DEMO" ? t.demo : t.real}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-indigo-800">
            {t.score}: {match.match_score.toFixed(0)}%
          </p>
          {match.explanations.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-slate-600">
              {match.explanations.map((explanation, index) => (
                <li key={`${explanation}-${index}`}>{explanation}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { language } = useLanguage();
  const t = labels[language];
  const transactionLabel = (type: "BUY" | "RENT") =>
    type === "BUY" ? t.buy : t.rent;
  const propertyTypeLabel = (type: string | null) => {
    if (type === "apartment") return t.apartment;
    if (type === "house") return t.house;
    if (type === "room") return t.room;
    if (type === "other") return t.other;
    return type || "—";
  };
  const preferredLanguageLabel = (preferredLanguage: string) => {
    if (preferredLanguage === "zh") return t.chinese;
    if (preferredLanguage === "es") return t.spanish;
    return preferredLanguage;
  };
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [leadMatches, setLeadMatches] = useState<MatchingResponse | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const storedToken = window.sessionStorage.getItem("bcn_admin_token");
      if (storedToken) setToken(storedToken);
      setAuthChecked(true);
    });
  }, []);

  const clearSession = useCallback((message = "") => {
    window.sessionStorage.removeItem("bcn_admin_token");
    setToken(null);
    setLeads([]);
    setAgents([]);
    setProperties([]);
    setViewings([]);
    setError(message);
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [leadResponse, agentResponse, propertyResponse, viewingResponse] =
        await Promise.all([
          adminApi.listLeads(token),
          adminApi.listAgents(token),
          adminApi.listProperties(token),
          adminApi.listViewingRequests(token),
        ]);
      setLeads(leadResponse.leads);
      setAgents(agentResponse.agents);
      setProperties(propertyResponse.properties);
      setViewings(viewingResponse.viewing_requests);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearSession(t.unauthorized);
      } else {
        setError(displayError(requestError, t.loadError));
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession, t.loadError, t.unauthorized, token]);

  useEffect(() => {
    if (!authChecked || !token) return;
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authChecked, loadDashboard, token]);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setError("");
    try {
      const response = await adminApi.login(username.trim(), password);
      window.sessionStorage.setItem("bcn_admin_token", response.access_token);
      setPassword("");
      setToken(response.access_token);
      setNotice("");
    } catch (requestError) {
      setError(displayError(requestError, t.loginError));
    } finally {
      setLoginLoading(false);
    }
  };

  const runAdminAction = async (
    action: (authToken: string) => Promise<unknown>,
    successMessage: string,
  ) => {
    if (!token) return;
    setError("");
    setNotice("");
    try {
      await action(token);
      setNotice(successMessage);
      await loadDashboard();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearSession(t.unauthorized);
      } else {
        setError(displayError(requestError, t.loadError));
      }
    }
  };

  const showMatches = async (leadId: string) => {
    if (!token) return;
    setSelectedLeadId(leadId);
    setMatchesLoading(true);
    setError("");
    try {
      setLeadMatches(await adminApi.getLeadMatches(token, leadId));
      setActiveTab("matches");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearSession(t.unauthorized);
      } else {
        setError(displayError(requestError, t.loadError));
      }
    } finally {
      setMatchesLoading(false);
    }
  };

  const updateLeadStatus = (
    leadId: string,
    status: Lead["status"],
  ) =>
    runAdminAction(
      (authToken) => adminApi.updateLeadStatus(authToken, leadId, status),
      t.statusSaved,
    );

  const assignLeadAgent = (leadId: string, agentId: string) => {
    if (!agentId) return;
    void runAdminAction(
      (authToken) => adminApi.assignLeadAgent(authToken, leadId, agentId),
      t.assignmentSaved,
    );
  };

  const formatBudget = (lead: Lead) => {
    const min = lead.requirement.budget_min;
    const max = lead.requirement.budget_max;
    if (min === null && max === null) return "—";
    if (min !== null && max !== null) {
      return `€${min.toLocaleString("es-ES")} – €${max.toLocaleString("es-ES")}`;
    }
    return min !== null
      ? `≥ €${min.toLocaleString("es-ES")}`
      : `≤ €${max?.toLocaleString("es-ES")}`;
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>
        </div>
        <header className="mb-6 flex flex-col gap-5 rounded-[28px] bg-[#0b1220] p-6 text-white shadow-xl sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-cyan-300">
              BCN HOUSING · ADMIN
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
            <p className="mt-2 text-sm text-slate-300">{t.subtitle}</p>
          </div>
          {token && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadDashboard()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {t.refresh}
              </button>
              <button
                type="button"
                onClick={() => clearSession()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                {t.logout}
              </button>
            </div>
          )}
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <p
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4" />
            {notice}
          </p>
        )}

        {!token ? (
          <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">{t.login}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t.loginHint}</p>
            <form onSubmit={submitLogin} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold text-slate-600">
                {t.username}
                <input
                  className={`${controlClass} mt-1.5 w-full`}
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                {t.password}
                <input
                  className={`${controlClass} mt-1.5 w-full`}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loginLoading && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                {loginLoading ? t.loggingIn : t.login}
              </button>
            </form>
          </section>
        ) : (
          <>
            <p className="mb-4 text-xs text-slate-500">{t.adminOnly}</p>
            <nav className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-3 lg:grid-cols-5">
              {tabs.map(({ key, icon: Icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    activeTab === key
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t[key]}
                </button>
              ))}
            </nav>

            {loading ? (
              <div className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" />
                {t.loading}
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === "leads" && (
                  leads.length === 0 ? (
                    <EmptyPanel text={t.noLeads} />
                  ) : (
                    leads.map((lead) => (
                      <article
                        key={lead.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                              {transactionLabel(lead.requirement.transaction_type)} ·{" "}
                              {lead.id.slice(0, 8)}
                            </p>
                            <h2 className="mt-1 text-lg font-semibold">
                              {lead.requirement.contact.name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                              {lead.requirement.contact.email || t.noContact}
                              {lead.requirement.contact.phone
                                ? ` · ${lead.requirement.contact.phone}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className={controlClass}
                              aria-label={t.leadStatus}
                              value={lead.status}
                              onChange={(event) =>
                                void updateLeadStatus(
                                  lead.id,
                                  event.target.value as Lead["status"],
                                )
                              }
                            >
                              {leadStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {t.leadStatusValues[status]}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => void showMatches(lead.id)}
                              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                              {t.matchesButton}
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          <DataPoint label={t.type} value={transactionLabel(lead.requirement.transaction_type)} />
                          <DataPoint label={t.budget} value={formatBudget(lead)} />
                          <DataPoint label={t.locations} value={lead.requirement.preferred_locations.join(", ") || "—"} />
                          <DataPoint label={t.propertyType} value={propertyTypeLabel(lead.requirement.property_type)} />
                          <DataPoint label={t.bedrooms} value={lead.requirement.bedrooms_min ?? "—"} />
                          <DataPoint label={t.area} value={lead.requirement.area_min_sqm ? `${lead.requirement.area_min_sqm} m²` : "—"} />
                          <DataPoint label={t.timeline} value={lead.requirement.timeline || "—"} />
                          <DataPoint label={t.languageValue} value={preferredLanguageLabel(lead.requirement.preferred_language)} />
                          <DataPoint label={t.created} value={formatTime(lead.created_at)} />
                          {lead.requirement.additional_requirements && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <DataPoint label={t.extras} value={lead.requirement.additional_requirements} />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">
                            {t.assignAgent}:
                          </span>
                          <select
                            className={controlClass}
                            aria-label={t.selectAgent}
                            defaultValue=""
                            onChange={(event) =>
                              assignLeadAgent(lead.id, event.target.value)
                            }
                          >
                            <option value="" disabled>
                              {t.selectAgent}
                            </option>
                            {agents
                              .filter((agent) => agent.active)
                              .map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                  {agent.name}
                                  {agent.agency_name
                                    ? ` · ${agent.agency_name}`
                                    : ""}
                                </option>
                              ))}
                          </select>
                          <span className="text-xs text-slate-500">
                            {lead.assigned_agent?.name || t.unassigned}
                          </span>
                        </div>
                      </article>
                    ))
                  )
                )}

                {activeTab === "matches" && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-lg font-semibold">{t.matches}</h2>
                    {matchesLoading && (
                      <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        {t.matchingLoading}
                      </p>
                    )}
                    {!matchesLoading && !leadMatches && (
                      <p className="mt-3 text-sm text-slate-500">
                        {t.matchesButton}
                      </p>
                    )}
                    {!matchesLoading && leadMatches && (
                      <div className="mt-4">
                        {selectedLeadId && (
                          <p className="mb-3 text-xs text-slate-500">
                            {t.requirements}: {selectedLeadId}
                          </p>
                        )}
                        <PropertyMatchList result={leadMatches} t={t} />
                      </div>
                    )}
                  </section>
                )}

                {activeTab === "agents" && (
                  agents.length === 0 ? (
                    <EmptyPanel text={t.noAgents} />
                  ) : (
                    agents.map((agent) => (
                      <article
                        key={agent.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <h2 className="font-semibold text-slate-900">
                            {agent.name}
                            {agent.agency_name ? ` · ${agent.agency_name}` : ""}
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            {agent.service_areas.join(", ") || "—"} ·{" "}
                            {agent.specializations.join(", ") || "—"} ·{" "}
                            {agent.languages.join(", ") || "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {agent.contact_email || t.noContact}
                            {agent.contact_phone ? ` · ${agent.contact_phone}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {agent.active ? t.active : t.inactive} ·{" "}
                            {agent.verified ? t.verified : t.notVerified}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void runAdminAction(
                                (authToken) =>
                                  adminApi.updateAgentStatus(
                                    authToken,
                                    agent.id,
                                    !agent.active,
                                    agent.verified,
                                  ),
                                t.statusSaved,
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {agent.active ? t.inactive : t.active}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void runAdminAction(
                                (authToken) =>
                                  adminApi.updateAgentStatus(
                                    authToken,
                                    agent.id,
                                    agent.active,
                                    !agent.verified,
                                  ),
                                t.statusSaved,
                              )
                            }
                            className="rounded-lg border border-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                          >
                            {agent.verified ? t.notVerified : t.verified}
                          </button>
                        </div>
                      </article>
                    ))
                  )
                )}

                {activeTab === "properties" && (
                  properties.length === 0 ? (
                    <EmptyPanel text={t.noProperties} />
                  ) : (
                    properties.map((property) => (
                      <article
                        key={property.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-slate-900">
                              {property.title}
                            </h2>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                                property.data_label === "DEMO"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {property.data_label === "DEMO" ? t.demo : t.real}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {transactionLabel(property.transaction_type)} · {property.location}
                            {property.neighborhood
                              ? ` · ${property.neighborhood}`
                              : ""}
                            {" · €"}
                            {property.price.toLocaleString("es-ES")}
                          </p>
                        </div>
                        <label className="text-xs font-semibold text-slate-500">
                          {t.propertyStatus}
                          <select
                            className={`${controlClass} ml-2`}
                            value={property.status}
                            onChange={(event) =>
                              void runAdminAction(
                                (authToken) =>
                                  adminApi.updatePropertyStatus(
                                    authToken,
                                    property.id,
                                    event.target.value as Property["status"],
                                  ),
                                t.statusSaved,
                              )
                            }
                          >
                            {propertyStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status === "AVAILABLE"
                                  ? t.available
                                  : status === "UNAVAILABLE"
                                    ? t.unavailable
                                    : t.closed}
                              </option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))
                  )
                )}

                {activeTab === "viewings" && (
                  viewings.length === 0 ? (
                    <EmptyPanel text={t.noViewings} />
                  ) : (
                    viewings.map((viewing) => (
                      <ViewingCard
                        key={viewing.id}
                        viewing={viewing}
                        agents={agents.filter((agent) => agent.active)}
                        t={t}
                        onUpdate={(payload) =>
                          runAdminAction(
                            (authToken) =>
                              adminApi.updateViewingRequest(
                                authToken,
                                viewing.id,
                                payload,
                              ),
                            t.statusSaved,
                          )
                        }
                      />
                    ))
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function DataPoint({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-slate-700">{value}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function ViewingCard({
  viewing,
  agents,
  t,
  onUpdate,
}: {
  viewing: ViewingRequest;
  agents: Agent[];
  t: (typeof labels)[Language];
  onUpdate: (payload: {
    status: ViewingRequest["status"];
    assigned_agent_id?: string | null;
  }) => Promise<void>;
}) {
  const [status, setStatus] = useState(viewing.status);
  const [agentId, setAgentId] = useState(viewing.assigned_agent_id || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({
        status,
        assigned_agent_id: agentId || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
            {t.requestStatus}: {t.viewingStatusValues[viewing.status]}
          </p>
          <h2 className="mt-1 font-semibold text-slate-900">
            {viewing.property.title}
            {viewing.property.data_label === "DEMO" && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
                {t.demo}
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {viewing.property.location}
            {viewing.property.neighborhood
              ? ` · ${viewing.property.neighborhood}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={controlClass}
            aria-label={t.viewingStatus}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ViewingRequest["status"])
            }
          >
            {viewingStatuses.map((value) => (
              <option key={value} value={value}>
                {t.viewingStatusValues[value]}
              </option>
            ))}
          </select>
          <select
            className={controlClass}
            aria-label={t.assignAgent}
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
          >
            <option value="">{t.unassigned}</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : t.save}
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <DataPoint
          label={t.customer}
          value={`${viewing.customer.name} · ${
            viewing.customer.email || viewing.customer.phone || t.noContact
          }`}
        />
        <DataPoint
          label={t.preferredAt}
          value={viewing.preferred_at ? formatTime(viewing.preferred_at) : "—"}
        />
        {viewing.customer_notes && (
          <div className="sm:col-span-2">
            <DataPoint label={t.notes} value={viewing.customer_notes} />
          </div>
        )}
      </div>
    </article>
  );
}
