"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BedDouble,
  Building2,
  MapPin,
  Ruler,
} from "lucide-react";
import { useEffect, useState } from "react";
import { publicApi, Property } from "@/lib/api";
import { useLanguage } from "./language";

type ToolTab = "evaluate" | "compare" | "legal";

const copy = {
  zh: {
    eyebrow: "巴塞罗那房产，清晰决策",
    headline: "在巴塞罗那，找到真正适合你的家。",
    intro:
      "以清晰的房屋需求为起点，连接真实可用房源、本地市场信息与专业人士。中文沟通，安心做决定。",
    buy: "寻找买房机会",
    rent: "寻找租住房屋",
    localFocus: "专注巴塞罗那及周边地区",
    heroAlt: "巴塞罗那城市与圣家堂景观",
    howEyebrow: "简单、清晰、有人协助",
    howTitle: "从需求到下一步",
    steps: [
      ["01", "告诉我们你的计划", "选择买房或租房，填写预算、区域和重要要求。"],
      ["02", "查看可用房源", "浏览后端当前提供的房源与匹配说明；演示房源会明确标记。"],
      ["03", "联系本地专业人士", "提交看房申请，让团队了解你的计划与时间安排。"],
    ],
    servicesEyebrow: "平台服务",
    servicesTitle: "在找房每一步，提供有用的信息",
    services: [
      ["房源匹配", "按你的需求查看当前可用房源，并阅读匹配说明。", "找房需求与看房申请"],
      ["房产估值", "参考区域数据，评估房屋价格与租金。", "估算房屋价值"],
      ["租赁风险分析", "检查租金、押金、中介费与合同内容。", "查看租赁风险"],
      ["区域比较", "比较周边区域的租金、售价、宜居度等指标。", "比较区域"],
    ],
    listingsEyebrow: "当前可用房源",
    listingsTitle: "来自房源服务的数据",
    listingsIntro: "只展示后端实际返回的房源；演示内容均有明确标识。",
    listingsLoading: "正在读取当前房源…",
    listingsError: "暂时无法读取房源，请稍后重试。",
    listingsRetry: "重新加载",
    listingsEmpty: "目前没有可展示的房源。提交你的需求后，我们仍可记录你的偏好。",
    viewAll: "提交找房需求",
    perMonth: "/ 月",
    bedrooms: "卧室",
    area: "平方米",
    demo: "DEMO · 演示房源",
    real: "REAL · 房源",
    noImage: "暂无房源图片",
    whyEyebrow: "为巴塞罗那生活而设计",
    whyTitle: "本地化、清晰、有中文支持",
    benefits: [
      ["中文沟通", "可使用中文填写需求并查看平台界面。"],
      ["巴塞罗那本地重点", "围绕巴塞罗那及周边地区的房屋需求和区域信息设计。"],
      ["结构化需求", "把预算、区域、面积和时间安排整理成清晰的找房要求。"],
      ["专业人士协助", "按需提交看房申请，与本地专业人士进一步沟通。"],
    ],
    ctaEyebrow: "开始你的巴塞罗那找房计划",
    ctaTitle: "先说说你想找什么样的家。",
    ctaBody: "填写需求后即可查看服务返回的匹配结果，并申请看房。",
    cta: "提交找房需求",
    footer:
      "房源、匹配及分析结果仅供参考。标注 DEMO 的房源为演示内容，并非真实挂牌信息。",
    home: "首页",
    search: "找房",
    valuation: "房产估值",
    risk: "租赁风险",
    admin: "管理后台",
  },
  es: {
    eyebrow: "Decisiones inmobiliarias más claras en Barcelona",
    headline: "Encuentra en Barcelona un hogar que encaje contigo.",
    intro:
      "Empieza con tus preferencias y consulta inmuebles disponibles, información del mercado local y ayuda profesional. Atención en chino para que decidas con confianza.",
    buy: "Buscar para comprar",
    rent: "Buscar para alquilar",
    localFocus: "Especialistas en Barcelona y su entorno",
    heroAlt: "Vista de Barcelona y la Sagrada Familia",
    howEyebrow: "Un proceso claro, paso a paso",
    howTitle: "De tus preferencias al siguiente paso",
    steps: [
      ["01", "Cuéntanos qué necesitas", "Elige entre comprar o alquilar e indica presupuesto, zonas y prioridades."],
      ["02", "Consulta los inmuebles disponibles", "Revisa los inmuebles devueltos por el servicio y sus motivos de coincidencia. Las viviendas demo están identificadas."],
      ["03", "Contacta con profesionales locales", "Solicita una visita y comparte tus preferencias y disponibilidad."],
    ],
    servicesEyebrow: "Servicios",
    servicesTitle: "Información útil en cada etapa de la búsqueda",
    services: [
      ["Coincidencias", "Consulta los inmuebles disponibles según tus preferencias y los motivos de coincidencia.", "Buscar vivienda"],
      ["Valoración", "Consulta estimaciones de precios y alquileres con datos de la zona.", "Valorar una vivienda"],
      ["Riesgos del alquiler", "Revisa el alquiler, la fianza, los honorarios y las cláusulas del contrato.", "Consultar riesgos"],
      ["Comparativa de zonas", "Compara alquileres, precios de venta y otros indicadores de las zonas.", "Comparar zonas"],
    ],
    listingsEyebrow: "Inmuebles disponibles",
    listingsTitle: "Datos del servicio de inmuebles",
    listingsIntro: "Mostramos únicamente los inmuebles devueltos por el backend. Las viviendas demo están identificadas.",
    listingsLoading: "Consultando los inmuebles disponibles…",
    listingsError: "No se pudieron cargar los inmuebles. Inténtalo de nuevo más tarde.",
    listingsRetry: "Volver a cargar",
    listingsEmpty: "No hay inmuebles disponibles para mostrar en este momento. Puedes enviarnos tus preferencias.",
    viewAll: "Enviar mis preferencias",
    perMonth: "/ mes",
    bedrooms: "dormitorios",
    area: "m²",
    demo: "DEMO · Vivienda de demostración",
    real: "REAL · Vivienda",
    noImage: "Sin imagen del inmueble",
    whyEyebrow: "Pensado para vivir en Barcelona",
    whyTitle: "Atención local, información clara y soporte en chino",
    benefits: [
      ["Atención en chino", "Puedes indicar tus preferencias y utilizar la plataforma en chino."],
      ["Enfoque local", "Diseñado para necesidades de vivienda en Barcelona y municipios cercanos."],
      ["Preferencias bien definidas", "Organiza presupuesto, zonas, superficie y plazos en una solicitud clara."],
      ["Apoyo profesional", "Solicita una visita y continúa la conversación con profesionales locales."],
    ],
    ctaEyebrow: "Empieza tu búsqueda en Barcelona",
    ctaTitle: "Cuéntanos cómo sería tu próximo hogar.",
    ctaBody: "Envía tus preferencias para consultar coincidencias y solicitar una visita.",
    cta: "Enviar mis preferencias",
    footer:
      "Los inmuebles, coincidencias y análisis son orientativos. Los inmuebles con la etiqueta DEMO son ejemplos, no anuncios reales.",
    home: "Inicio",
    search: "Buscar vivienda",
    valuation: "Valoración",
    risk: "Riesgos del alquiler",
    admin: "Administración",
  },
} as const;

function isSafeImageUrl(source: string) {
  if (source.startsWith("/") && !source.startsWith("//")) return true;
  try {
    const protocol = new URL(source).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function PropertyTile({ property, language }: { property: Property; language: "zh" | "es" }) {
  const t = copy[language];
  const image = property.images.find(isSafeImageUrl);
  return (
    <article className="overflow-hidden border border-[#e4dfd5] bg-white shadow-[0_8px_24px_-20px_rgba(20,40,59,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-24px_rgba(20,40,59,0.55)]">
      <div className="relative aspect-[1.55] bg-[#e8e4da]">
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            unoptimized={!image.startsWith("/")}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[#7b817f]">
            <Building2 className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs">{t.noImage}</span>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 border px-2.5 py-1 text-[10px] font-bold tracking-wide ${
            property.data_label === "DEMO"
              ? "border-[#eadab8] bg-[#fbf4e4] text-[#775d2c]"
              : "border-white/80 bg-white/95 text-[#284254]"
          }`}
        >
          {property.data_label === "DEMO" ? t.demo : t.real}
        </span>
      </div>
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-xs text-[#6d7880]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {property.location}
            {property.neighborhood ? ` · ${property.neighborhood}` : ""}
          </span>
        </p>
        <h3 className="mt-2 line-clamp-1 text-base font-semibold text-[#14283b]">
          {property.title}
        </h3>
        <p className="mt-3 text-xl font-semibold text-[#14283b]">
          {new Intl.NumberFormat(language === "es" ? "es-ES" : "zh-CN", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(property.price)}
          {property.transaction_type === "RENT" && (
            <span className="ml-1 text-xs font-medium text-[#74808a]">{t.perMonth}</span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#eeeae2] pt-3 text-xs text-[#66747d]">
          {typeof property.bedrooms === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} {t.bedrooms}
            </span>
          )}
          {typeof property.area_sqm === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" />
              {property.area_sqm} {t.area}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HomeLanding({
  onSelectTool,
}: {
  onSelectTool: (tab: ToolTab) => void;
}) {
  const { language } = useLanguage();
  const t = copy[language];
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProperties = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await publicApi.listProperties();
      setProperties(response.properties);
    } catch (requestError) {
      console.error("Could not load homepage property inventory.", requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProperties();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main id="home" className="bg-[#faf9f6] text-[#14283b]">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#8a6e3d]">
            <span className="h-px w-8 bg-[#b08d57]" />
            {t.eyebrow}
          </p>
          <h1 className="mt-5 max-w-xl text-[2.6rem] font-semibold leading-[1.13] tracking-[-0.04em] sm:text-5xl lg:text-[3.55rem]">
            {t.headline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#596873] sm:text-[17px] sm:leading-8">
            {t.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/customer?transaction=BUY"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#14283b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#203c54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d57]"
            >
              {t.buy}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/customer?transaction=RENT"
              className="inline-flex min-h-12 items-center justify-center border border-[#c9c4ba] bg-transparent px-5 py-3 text-sm font-semibold text-[#263e50] transition hover:border-[#14283b] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d57]"
            >
              {t.rent}
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-[#73808a]">
            <MapPin className="h-3.5 w-3.5 text-[#a78750]" />
            {t.localFocus}
          </p>
        </div>
        <div className="relative min-h-[330px] overflow-hidden bg-[#e4e0d7] sm:min-h-[450px] lg:min-h-[510px]">
          <Image
            src="/back.png"
            alt={t.heroAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101d2a]/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 border-l-2 border-[#c4a66f] bg-[#faf9f6]/95 px-4 py-3 sm:bottom-7 sm:left-7 sm:right-auto sm:max-w-xs sm:px-5 sm:py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a6e3d]">
              BCN HOUSING
            </p>
            <p className="mt-1 text-sm font-semibold text-[#14283b]">{t.localFocus}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e9e4db] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a6e3d]">
              {t.howEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#14283b]">
              {t.howTitle}
            </h2>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {t.steps.map(([number, title, body]) => (
              <article key={number} className="border-t border-[#ded8cd] pt-5">
                <p className="text-xs font-bold tracking-[0.12em] text-[#9a7b45]">{number}</p>
                <h3 className="mt-4 text-lg font-semibold text-[#1b3447]">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#66747d]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a6e3d]">
              {t.servicesEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t.servicesTitle}</h2>
          </div>
          <ArrowDown className="hidden h-5 w-5 text-[#a78750] sm:block" aria-hidden="true" />
        </div>
        <div className="mt-9 grid gap-px border border-[#e2ddd3] bg-[#e2ddd3] sm:grid-cols-2 lg:grid-cols-4">
          {t.services.map(([title, body, link], index) => {
            const tool: ToolTab | null = index === 1 ? "evaluate" : index === 2 ? "legal" : index === 3 ? "compare" : null;
            const href = tool ? `#tool-${tool}` : "/customer";
            return (
              <a
                key={title}
                href={href}
                onClick={tool ? () => onSelectTool(tool) : undefined}
                className="group flex min-h-56 flex-col bg-[#faf9f6] p-5 transition hover:bg-white focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b08d57] sm:p-6"
              >
                <span className="text-xs font-semibold tracking-wide text-[#9a7b45]">
                  0{index + 1}
                </span>
                <h3 className="mt-5 text-base font-semibold text-[#1b3447]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66747d]">{body}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold text-[#263e50]">
                  {link}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#e9e4db] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a6e3d]">
                {t.listingsEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t.listingsTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-[#66747d]">{t.listingsIntro}</p>
            </div>
            <Link
              href="/customer"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#263e50] hover:text-[#8a6e3d]"
            >
              {t.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading && (
            <p role="status" className="mt-8 border border-[#e4dfd5] bg-[#faf9f6] px-4 py-5 text-sm text-[#66747d]">
              {t.listingsLoading}
            </p>
          )}
          {error && !loading && (
            <div role="alert" className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-[#ead4cd] bg-[#fcf4f1] px-4 py-4 text-sm text-[#864e40]">
              <p>{t.listingsError}</p>
              <button
                type="button"
                onClick={() => void loadProperties()}
                className="rounded-sm border border-[#c9a49a] px-3 py-2 font-semibold hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b08d57]"
              >
                {t.listingsRetry}
              </button>
            </div>
          )}
          {!loading && !error && properties.length === 0 && (
            <p className="mt-8 border border-dashed border-[#d8d1c5] bg-[#faf9f6] px-5 py-7 text-sm leading-6 text-[#66747d]">
              {t.listingsEmpty}
            </p>
          )}
          {!loading && !error && properties.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 3).map((property) => (
                <PropertyTile key={property.id} property={property} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a6e3d]">
              {t.whyEyebrow}
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight">{t.whyTitle}</h2>
          </div>
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {t.benefits.map(([title, body], index) => (
              <article key={title} className="border-t border-[#ded8cd] pt-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#9a7b45]">
                  0{index + 1}
                </p>
                <h3 className="mt-2 font-semibold text-[#1b3447]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66747d]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14283b] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-14 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d2b579]">
              {t.ctaEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t.ctaTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-[#c7d0d7]">{t.ctaBody}</p>
          </div>
          <Link
            href="/customer"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start bg-[#d2b579] px-5 py-3 text-sm font-semibold text-[#14283b] transition hover:bg-[#e2c995] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:self-auto"
          >
            {t.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e8e2d7] bg-[#f3f1eb]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-xs font-bold tracking-[0.16em] text-[#14283b]">
              BCN HOUSING
            </Link>
            <nav aria-label={language === "zh" ? "页脚导航" : "Navegación del pie"}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#566571]">
                <li><Link href="/" className="hover:text-[#14283b]">{t.home}</Link></li>
                <li><Link href="/customer" className="hover:text-[#14283b]">{t.search}</Link></li>
                <li><a href="#tool-evaluate" onClick={() => onSelectTool("evaluate")} className="hover:text-[#14283b]">{t.valuation}</a></li>
                <li><a href="#tool-legal" onClick={() => onSelectTool("legal")} className="hover:text-[#14283b]">{t.risk}</a></li>
                <li><Link href="/admin" className="hover:text-[#14283b]">{t.admin}</Link></li>
              </ul>
            </nav>
          </div>
          <p className="mt-5 max-w-4xl border-t border-[#ded8cd] pt-4 text-[11px] leading-5 text-[#77828a]">
            {t.footer}
          </p>
        </div>
      </footer>
    </main>
  );
}
