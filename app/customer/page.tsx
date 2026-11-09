"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  Clock3,
  Home,
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  ApiError,
  MatchingResponse,
  Property,
  PropertyMatch,
  RequirementResponse,
  publicApi,
} from "@/lib/api";
import { useLanguage, type Language } from "../language";
type TransactionType = "BUY" | "RENT";

const copy = {
  zh: {
    back: "返回平台",
    eyebrow: "BCN HOUSING · PERSONAL SEARCH",
    title: "找到适合你的巴塞罗那房子",
    intro: "告诉我们你的需求，平台会根据真实的后端房源数据进行匹配。所有演示房源都会明确标注。",
    language: "界面语言",
    buy: "买房",
    rent: "租房",
    transactionType: "交易类型",
    requirements: "你的房屋需求",
    locations: "目标区域",
    locationsHint: "可填写城市、区或街区，多个地点用逗号分隔",
    propertyType: "房屋类型",
    anyType: "不限",
    apartment: "公寓",
    house: "独栋 / 联排",
    room: "房间",
    other: "其他",
    budgetMin: "最低预算 (€)",
    budgetMax: "最高预算 (€)",
    bedrooms: "卧室至少",
    minArea: "最小面积 (m²)",
    timeline: "计划时间",
    timelineHint: "例如：一个月内",
    extras: "其他要求",
    contact: "联系方式",
    name: "姓名",
    email: "电子邮箱",
    phone: "电话",
    contactHint: "邮箱和电话至少填写一项。",
    submit: "提交需求并查找匹配",
    submitting: "正在提交并查找房源…",
    available: "当前可用房源",
    loadingProperties: "正在读取后端房源…",
    noProperties: "当前后端没有可展示的房源。",
    propertyError: "暂时无法读取房源，请稍后重试。",
    matches: "为你找到的匹配房源",
    noMatches: "暂时没有匹配房源。你的需求已提交，后续可联系平台协助。",
    matchError: "需求已成功提交，但暂时无法读取匹配结果。",
    retryMatches: "重试读取匹配",
    loadingMatches: "正在读取匹配结果…",
    confirmation: "需求已提交",
    reference: "需求编号",
    score: "匹配度",
    scoreNote: "匹配分数仅供参考，不构成保证。",
    reasons: "匹配说明",
    unverified: "未核实 / 未指定",
    requestViewing: "申请看房",
    viewingDate: "期望看房时间（可选）",
    viewingNotes: "看房备注（可选）",
    sendViewing: "提交看房申请",
    sendingViewing: "正在提交…",
    viewingSuccess: "看房申请已提交。",
    demo: "DEMO · 演示房源",
    real: "REAL · 房源",
    priceRent: "/ 月",
    bedroomsLabel: "卧室",
    area: "面积",
    emptyContact: "请填写邮箱或电话号码。",
    budgetOrder: "最低预算不能高于最高预算。",
    genericError: "提交失败，请检查信息后重试。",
    notGuarantee: "匹配结果由后端规则计算；房源情况和分数不构成可租售或成交保证。",
    contactPrivacy: "联系信息仅用于处理需求；公共房源与匹配响应不会返回你的联系方式。",
    referencePrivacy: "本流程不提供客户账号或身份验证。需求编号用于读取匹配结果，请妥善保管。",
  },
  es: {
    back: "Volver a la plataforma",
    eyebrow: "BCN HOUSING · BÚSQUEDA PERSONAL",
    title: "Encuentra tu próximo hogar en Barcelona",
    intro: "Cuéntanos qué buscas. Compararemos tus requisitos con los inmuebles disponibles en el backend. Las propiedades de demostración se identifican claramente.",
    language: "Idioma",
    buy: "Comprar",
    rent: "Alquilar",
    transactionType: "Tipo de operación",
    requirements: "Qué vivienda buscas",
    locations: "Zonas preferidas",
    locationsHint: "Ciudad, distrito o barrio; separa varias zonas con comas",
    propertyType: "Tipo de vivienda",
    anyType: "Cualquiera",
    apartment: "Piso",
    house: "Casa",
    room: "Habitación",
    other: "Otro",
    budgetMin: "Presupuesto mínimo (€)",
    budgetMax: "Presupuesto máximo (€)",
    bedrooms: "Dormitorios mínimos",
    minArea: "Superficie mínima (m²)",
    timeline: "Plazo previsto",
    timelineHint: "Por ejemplo: dentro de un mes",
    extras: "Otros requisitos",
    contact: "Datos de contacto",
    name: "Nombre",
    email: "Correo electrónico",
    phone: "Teléfono",
    contactHint: "Indica al menos un correo o teléfono.",
    submit: "Enviar requisitos y buscar",
    submitting: "Enviando y buscando…",
    available: "Inmuebles disponibles",
    loadingProperties: "Consultando inmuebles del backend…",
    noProperties: "El backend no tiene inmuebles disponibles para mostrar.",
    propertyError: "No se pudieron cargar los inmuebles. Inténtalo más tarde.",
    matches: "Inmuebles que coinciden",
    noMatches: "No hay coincidencias por ahora. Hemos recibido tus requisitos.",
    matchError: "Tus requisitos se enviaron, pero no se pudieron cargar las coincidencias.",
    retryMatches: "Reintentar coincidencias",
    loadingMatches: "Cargando coincidencias…",
    confirmation: "Requisitos enviados",
    reference: "Referencia",
    score: "Coincidencia",
    scoreNote: "La puntuación es orientativa y no constituye una garantía.",
    reasons: "Motivos de coincidencia",
    unverified: "Sin especificar / no verificado",
    requestViewing: "Solicitar visita",
    viewingDate: "Fecha y hora preferidas (opcional)",
    viewingNotes: "Notas para la visita (opcional)",
    sendViewing: "Enviar solicitud de visita",
    sendingViewing: "Enviando…",
    viewingSuccess: "La solicitud de visita se ha enviado.",
    demo: "DEMO · Vivienda de demostración",
    real: "REAL · Vivienda",
    priceRent: "/ mes",
    bedroomsLabel: "dormitorios",
    area: "Superficie",
    emptyContact: "Indica un correo electrónico o un teléfono.",
    budgetOrder: "El presupuesto mínimo no puede superar el máximo.",
    genericError: "No se pudo enviar. Revisa los datos e inténtalo de nuevo.",
    notGuarantee: "Las coincidencias se calculan con reglas del backend. La disponibilidad y puntuación no garantizan una operación.",
    contactPrivacy: "Los datos de contacto solo se usan para atender tu solicitud y no se muestran en las respuestas públicas.",
    referencePrivacy: "Este flujo no ofrece cuenta ni verificación de identidad. Guarda la referencia de tu solicitud.",
  },
} as const;

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
const labelClass = "block text-xs font-semibold text-slate-600";

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function PropertyCard({
  property,
  t,
  match,
  onViewing,
}: {
  property: Property;
  t: (typeof copy)[Language];
  match?: PropertyMatch;
  onViewing?: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 p-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-950">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {property.location}
            {property.neighborhood ? ` · ${property.neighborhood}` : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            property.data_label === "DEMO"
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {property.data_label === "DEMO" ? t.demo : t.real}
        </span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <p className="text-xl font-semibold text-slate-950">
            €{property.price.toLocaleString("es-ES")}
            {property.transaction_type === "RENT" ? t.priceRent : ""}
          </p>
          {typeof property.bedrooms === "number" && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} {t.bedroomsLabel}
            </span>
          )}
          <span className="text-xs text-slate-500">
            {t.area}: {property.area_sqm} m²
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {property.property_type}
          {property.description ? ` · ${property.description}` : ""}
        </p>
        {match && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <p className="text-sm font-semibold text-indigo-900">
              {t.score}: {match.match_score.toFixed(0)}%
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-600">
              {t.reasons}
            </p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-xs leading-5 text-slate-600">
              {match.explanations.map((reason, index) => (
                <li key={`${reason}-${index}`}>{reason}</li>
              ))}
              {match.missing_or_unverified.map((reason, index) => (
                <li key={`missing-${index}`}>
                  {t.unverified}: {reason}
                </li>
              ))}
            </ul>
            {onViewing && (
              <ViewingButton onClick={onViewing} t={t} propertyId={property.id} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ViewingButton({
  onClick,
  t,
  propertyId,
}: {
  onClick: () => void;
  t: (typeof copy)[Language];
  propertyId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-property-id={propertyId}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
    >
      <Home className="h-4 w-4" />
      {t.requestViewing}
    </button>
  );
}

export default function CustomerPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const propertyErrorMessage = useRef(t.propertyError);
  const [transactionType, setTransactionType] = useState<TransactionType>("RENT");
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");
  const [locations, setLocations] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [area, setArea] = useState("");
  const [timeline, setTimeline] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirement, setRequirement] = useState<RequirementResponse | null>(
    null,
  );
  const [matches, setMatches] = useState<MatchingResponse | null>(null);
  const [matchesError, setMatchesError] = useState("");
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [viewingPropertyId, setViewingPropertyId] = useState("");
  const [viewingDate, setViewingDate] = useState("");
  const [viewingNotes, setViewingNotes] = useState("");
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewingMessage, setViewingMessage] = useState("");
  const [viewingError, setViewingError] = useState("");

  useEffect(() => {
    propertyErrorMessage.current = t.propertyError;
  }, [t.propertyError]);

  useEffect(() => {
    const requestedTransaction = new URLSearchParams(window.location.search).get(
      "transaction",
    );
    if (requestedTransaction === "BUY" || requestedTransaction === "RENT") {
      const timer = window.setTimeout(() => {
        setTransactionType(requestedTransaction);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    let active = true;
    publicApi
      .listProperties(transactionType)
      .then((response) => {
        if (active) setProperties(response.properties);
      })
      .catch((error: unknown) => {
        if (active) {
          setPropertiesError(errorText(error, propertyErrorMessage.current));
        }
      })
      .finally(() => {
        if (active) setPropertiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [transactionType]);

  const submitRequirement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setMatchesError("");
    setRequirement(null);
    setMatches(null);
    setViewingMessage("");
    setViewingError("");

    if (!contactEmail.trim() && !contactPhone.trim()) {
      setFormError(t.emptyContact);
      return;
    }
    if (
      budgetMin &&
      budgetMax &&
      Number(budgetMin) > Number(budgetMax)
    ) {
      setFormError(t.budgetOrder);
      return;
    }

    const preferredLocations = locations
      .split(",")
      .map((location) => location.trim())
      .filter(Boolean);
    const payload = {
      transaction_type: transactionType,
      preferred_locations: preferredLocations,
      preferred_language: language,
      contact_name: contactName.trim(),
      ...(budgetMin ? { budget_min: Number(budgetMin) } : {}),
      ...(budgetMax ? { budget_max: Number(budgetMax) } : {}),
      ...(propertyType ? { property_type: propertyType } : {}),
      ...(bedrooms !== "" ? { bedrooms_min: Number(bedrooms) } : {}),
      ...(area ? { area_min_sqm: Number(area) } : {}),
      ...(timeline.trim() ? { timeline: timeline.trim() } : {}),
      ...(additionalRequirements.trim()
        ? { additional_requirements: additionalRequirements.trim() }
        : {}),
      ...(contactEmail.trim() ? { contact_email: contactEmail.trim() } : {}),
      ...(contactPhone.trim() ? { contact_phone: contactPhone.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      const submitted = await publicApi.createRequirement(payload);
      setRequirement(submitted);
      setMatchesLoading(true);
      try {
        setMatches(await publicApi.getMatches(submitted.id));
      } catch (error) {
        setMatchesError(errorText(error, t.matchError));
      } finally {
        setMatchesLoading(false);
      }
    } catch (error) {
      setFormError(errorText(error, t.genericError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryMatches = async () => {
    if (!requirement) return;
    setMatchesError("");
    setMatchesLoading(true);
    try {
      setMatches(await publicApi.getMatches(requirement.id));
    } catch (error) {
      setMatchesError(errorText(error, t.matchError));
    } finally {
      setMatchesLoading(false);
    }
  };

  const submitViewing = async (propertyId: string) => {
    if (!requirement) return;
    setViewingPropertyId(propertyId);
    setViewingError("");
    setViewingMessage("");
    setViewingLoading(true);
    try {
      const preferredAt = viewingDate
        ? new Date(viewingDate).toISOString()
        : undefined;
      await publicApi.requestViewing({
        requirement_id: requirement.id,
        property_id: propertyId,
        ...(preferredAt ? { preferred_at: preferredAt } : {}),
        ...(viewingNotes.trim()
          ? { customer_notes: viewingNotes.trim() }
          : {}),
      });
      setViewingMessage(t.viewingSuccess);
    } catch (error) {
      setViewingError(errorText(error, t.genericError));
    } finally {
      setViewingLoading(false);
    }
  };

  const changeTransactionType = (intent: TransactionType) => {
    if (intent === transactionType) return;
    setPropertiesLoading(true);
    setPropertiesError("");
    setTransactionType(intent);
  };

  const inputOptions = (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        {t.budgetMin}
        <input
          className={fieldClass}
          type="number"
          min="0"
          step="any"
          value={budgetMin}
          onChange={(event) => setBudgetMin(event.target.value)}
        />
      </label>
      <label className={labelClass}>
        {t.budgetMax}
        <input
          className={fieldClass}
          type="number"
          min="0"
          step="any"
          value={budgetMax}
          onChange={(event) => setBudgetMax(event.target.value)}
        />
      </label>
      <label className={labelClass}>
        {t.bedrooms}
        <input
          className={fieldClass}
          type="number"
          min="0"
          max="20"
          value={bedrooms}
          onChange={(event) => setBedrooms(event.target.value)}
        />
      </label>
      <label className={labelClass}>
        {t.minArea}
        <input
          className={fieldClass}
          type="number"
          min="0.01"
          max="10000"
          step="any"
          value={area}
          onChange={(event) => setArea(event.target.value)}
        />
      </label>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
        <header className="mb-6 overflow-hidden rounded-[30px] bg-[#0b1220] px-6 py-7 text-white shadow-xl sm:px-9 sm:py-9">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                {t.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">{t.intro}</p>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                01 · YOUR SEARCH
              </p>
              <h2 className="mt-1 text-xl font-semibold">{t.requirements}</h2>
            </div>
            <form
              onSubmit={submitRequirement}
              className="space-y-5 p-5 sm:p-6"
            >
              <div
                className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1"
                aria-label={t.transactionType}
              >
                {(["BUY", "RENT"] as const).map((intent) => (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => changeTransactionType(intent)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      transactionType === intent
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {intent === "BUY" ? t.buy : t.rent}
                  </button>
                ))}
              </div>
              <label className={labelClass}>
                {t.locations}
                <input
                  className={fieldClass}
                  value={locations}
                  maxLength={3219}
                  onChange={(event) => setLocations(event.target.value)}
                  placeholder="Barcelona, Eixample"
                />
                <span className="mt-1 block font-normal text-slate-400">
                  {t.locationsHint}
                </span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  {t.propertyType}
                  <select
                    className={fieldClass}
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                  >
                    <option value="">{t.anyType}</option>
                    <option value="apartment">{t.apartment}</option>
                    <option value="house">{t.house}</option>
                    <option value="room">{t.room}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </label>
                <label className={labelClass}>
                  {t.timeline}
                  <input
                    className={fieldClass}
                    maxLength={200}
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value)}
                    placeholder={t.timelineHint}
                  />
                </label>
              </div>
              {inputOptions}
              <label className={labelClass}>
                {t.extras}
                <textarea
                  className={fieldClass}
                  rows={3}
                  maxLength={3000}
                  value={additionalRequirements}
                  onChange={(event) =>
                    setAdditionalRequirements(event.target.value)
                  }
                />
              </label>
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.contact}
                </h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className={`${labelClass} sm:col-span-2`}>
                    {t.name}
                    <input
                      className={fieldClass}
                      required
                      maxLength={160}
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                    />
                  </label>
                  <label className={labelClass}>
                    {t.email}
                    <input
                      className={fieldClass}
                      type="email"
                      maxLength={320}
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </label>
                  <label className={labelClass}>
                    {t.phone}
                    <input
                      className={fieldClass}
                      type="tel"
                      maxLength={40}
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      autoComplete="tel"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-slate-500">{t.contactHint}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {t.contactPrivacy}
                </p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-400">
                            {t.referencePrivacy}
                          </p>
              </div>
              {formError && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isSubmitting ? t.submitting : t.submit}
              </button>
            </form>
          </section>

          <div className="space-y-6">
            {requirement && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="font-semibold">{t.confirmation}</h2>
                    <p className="mt-1 text-sm">
                      {t.reference}:{" "}
                      <span className="break-all font-mono text-xs">
                        {requirement.id}
                      </span>
                    </p>
                  </div>
                </div>
              </section>
            )}
            {matchesError && (
              <div
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              >
                <p>{matchesError}</p>
                {requirement && (
                  <button
                    type="button"
                    disabled={matchesLoading}
                    onClick={() => void retryMatches()}
                    className="mt-2 inline-flex items-center gap-2 font-semibold underline disabled:opacity-60"
                  >
                    {matchesLoading && (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {t.retryMatches}
                  </button>
                )}
              </div>
            )}
            {matchesLoading && requirement && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {t.loadingMatches}
              </p>
            )}
            {matches && (
              <section className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                    02 · PROPERTY MATCHING
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{t.matches}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {t.notGuarantee}
                  </p>
                </div>
                {matches.matches.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                    {matches.message || t.noMatches}
                  </p>
                )}
                {matches.matches.map((match) => (
                  <PropertyCard
                    key={match.property_id}
                    property={match.property}
                    match={match}
                    t={t}
                    onViewing={() => {
                      setViewingPropertyId(match.property_id);
                      setViewingMessage("");
                      setViewingError("");
                    }}
                  />
                ))}
                {viewingPropertyId && (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submitViewing(viewingPropertyId);
                    }}
                    className="space-y-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {t.requestViewing}
                    </h3>
                    <label className={labelClass}>
                      {t.viewingDate}
                      <input
                        className={fieldClass}
                        type="datetime-local"
                        value={viewingDate}
                        onChange={(event) => setViewingDate(event.target.value)}
                      />
                    </label>
                    <label className={labelClass}>
                      {t.viewingNotes}
                      <textarea
                        className={fieldClass}
                        rows={2}
                        maxLength={2000}
                        value={viewingNotes}
                        onChange={(event) => setViewingNotes(event.target.value)}
                      />
                    </label>
                    {viewingError && (
                      <p role="alert" className="text-sm text-rose-700">
                        {viewingError}
                      </p>
                    )}
                    {viewingMessage && (
                      <p
                        role="status"
                        className="flex items-center gap-2 text-sm text-emerald-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {viewingMessage}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={viewingLoading || Boolean(viewingMessage)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {viewingLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Clock3 className="h-4 w-4" />
                      )}
                      {viewingLoading
                        ? t.sendingViewing
                        : viewingMessage || t.sendViewing}
                    </button>
                  </form>
                )}
              </section>
            )}
            <section className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                  03 · LIVE INVENTORY
                </p>
                <h2 className="mt-1 text-xl font-semibold">{t.available}</h2>
              </div>
              {propertiesLoading && (
                <div className="flex items-center gap-2 rounded-2xl bg-white p-5 text-sm text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {t.loadingProperties}
                </div>
              )}
              {propertiesError && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  {propertiesError}
                </p>
              )}
              {!propertiesLoading && !propertiesError && properties.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                  {t.noProperties}
                </p>
              )}
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} t={t} />
              ))}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
