"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export type Language = "zh" | "es";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
} | null>(null);

const commonCopy = {
  zh: {
    home: "首页",
    search: "查找房源",
    valuation: "房产估值",
    risk: "租赁风险分析",
    about: "关于我们",
    findHome: "寻找理想房屋",
    admin: "管理后台",
    menu: "打开导航菜单",
    closeMenu: "关闭导航菜单",
    language: "界面语言",
  },
  es: {
    home: "Inicio",
    search: "Buscar vivienda",
    valuation: "Valoración",
    risk: "Riesgos del alquiler",
    about: "Sobre nosotros",
    findHome: "Encuentra tu vivienda",
    admin: "Administración",
    menu: "Abrir menú de navegación",
    closeMenu: "Cerrar menú de navegación",
    language: "Idioma",
  },
} satisfies Record<Language, Record<string, string>>;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");

  useEffect(() => {
    let savedLanguage: string | null = null;
    try {
      savedLanguage = window.localStorage.getItem("bcn_housing_language");
    } catch (error) {
      console.error("Could not read the saved language preference.", error);
    }
    const detectedLanguage =
      savedLanguage === "zh" || savedLanguage === "es"
        ? savedLanguage
        : window.navigator.language.toLowerCase().startsWith("es")
          ? "es"
          : "zh";
    queueMicrotask(() => setLanguageState(detectedLanguage));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "zh"
        ? "BCN Housing | 巴塞罗那房产"
        : "BCN Housing | Vivienda en Barcelona";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        language === "zh"
          ? "巴塞罗那房源搜索、房产估值与租赁信息。"
          : "Búsqueda de vivienda, valoración inmobiliaria e información del alquiler en Barcelona.",
      );
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem("bcn_housing_language", nextLanguage);
    } catch (error) {
      console.error("Could not save the language preference.", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }
  return context;
}

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const copy = commonCopy[language];
  return (
    <div
      role="group"
      aria-label={copy.language}
      className="flex items-center gap-1 rounded-full border border-[#d9d3c8] bg-white/70 p-1 text-xs font-semibold"
    >
      <button
        type="button"
        aria-pressed={language === "zh"}
        onClick={() => setLanguage("zh")}
        className={`rounded-full px-2.5 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d57] ${
          language === "zh"
            ? "bg-[#14283b] text-white"
            : "text-[#43515e] hover:bg-[#f0ede6]"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        aria-pressed={language === "es"}
        onClick={() => setLanguage("es")}
        className={`rounded-full px-2.5 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d57] ${
          language === "es"
            ? "bg-[#14283b] text-white"
            : "text-[#43515e] hover:bg-[#f0ede6]"
        }`}
      >
        ES
      </button>
    </div>
  );
}

export function AppNavigation() {
  const { language } = useLanguage();
  const copy = commonCopy[language];
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: copy.home },
    { href: "/customer", label: copy.search },
    { href: "/#tool-evaluate", label: copy.valuation },
    { href: "/#tool-legal", label: copy.risk },
    { href: "/#about", label: copy.about },
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[#e8e2d7] bg-[#faf9f6]/95 backdrop-blur">
      <nav
        aria-label={language === "zh" ? "主导航" : "Navegación principal"}
        className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-sm text-[#14283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b08d57]"
        >
          <span className="flex h-9 w-9 items-center justify-center border border-[#b08d57] text-[10px] font-bold tracking-tight text-[#14283b]">
            BCN
          </span>
          <span className="text-[12px] font-bold tracking-[0.16em] sm:text-sm">
            BCN HOUSING
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-[13px] font-medium text-[#52606b] transition hover:text-[#14283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b08d57]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSelector />
          <Link
            href="/customer"
            className="rounded-sm bg-[#14283b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#203c54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d57]"
          >
            {copy.findHome}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector />
          <button
            type="button"
            aria-label={menuOpen ? copy.closeMenu : copy.menu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#d9d3c8] text-[#14283b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d57]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="border-t border-[#e8e2d7] bg-[#faf9f6] px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:px-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-sm px-3 py-3 text-sm font-medium text-[#384957] hover:bg-[#f0ede6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b08d57]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded-sm px-3 py-3 text-sm font-medium text-[#384957] hover:bg-[#f0ede6]"
            >
              {copy.admin}
            </Link>
            <Link
              href="/customer"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-sm bg-[#14283b] px-3 py-3 text-center text-sm font-semibold text-white"
            >
              {copy.findHome}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

const homeToolCopy: Record<string, string> = {
  "01 · Property analysis": "01 · Análisis del inmueble",
  "02 · Regional benchmark": "02 · Datos de referencia de la zona",
  "03 · Rental compliance": "03 · Normativa del alquiler",
  "CUSTOMER SERVICE": "ATENCIÓN AL CLIENTE",
  "PROPERTY MATCHING": "COINCIDENCIAS DE INMUEBLES",
  "Backend endpoint": "Dirección del backend",
  "Comparison verdict": "Conclusión comparativa",
  "Core benchmark": "Datos clave de referencia",
  "Decision support": "Información para decidir",
  "FastAPI": "FastAPI",
  "Location intelligence": "Análisis de ubicación",
  "Risk level": "Nivel de riesgo",
  "Risk review": "Revisión de riesgos",
  "上面的公平价值来自当前房源参数和区域基准；你拿到房东报价后，可以直接回来填写进行比价。": "El valor razonable se calcula con los datos del inmueble y la zona. Cuando recibas una oferta, podrás volver para compararla.",
  "不填写价格也可以继续，系统会直接给出合理价格预测。": "Puedes continuar sin indicar el precio; obtendrás una estimación orientativa.",
  "不指定": "Sin especificar",
  "与公平价值偏差": "Desviación respecto al valor razonable",
  " / 月": " / mes",
  "/ 月": "/ mes",
  "专家服务": "Asesoramiento profesional",
  "中介费 · €": "Honorarios de agencia · €",
  "中间楼层": "Planta intermedia",
  "买房": "Comprar",
  "价格可以不填。系统会先预测合理租金；填写后再与你的报价进行比对。": "El precio es opcional. Primero estimamos un alquiler razonable y, si añades una oferta, la comparamos.",
  "位置": "Ubicación",
  "你的月度报价": "Tu oferta mensual",
  "例如 Carrer de Balmes 120": "Por ejemplo, Carrer de Balmes 120",
  "先预测，再核价；从租金合理性一路检查到合同与风险。": "Primero estima, después compara: del precio del alquiler a la revisión del contrato y sus riesgos.",
  "全域": "Toda la zona",
  "共享卧室": "Habitación compartida",
  "区域": "Zona",
  "区域 A": "Zona A",
  "区域 B": "Zona B",
  "区域与位置": "Zona y ubicación",
  "区域定位": "Análisis de zona",
  "区域对比": "Comparativa de zonas",
  "区域数据已连接": "Datos de zona conectados",
  "区域核心指标": "Indicadores clave de la zona",
  "区域状态": "Estado de la zona",
  "卧室": "Dormitorios",
  "县": "Comarca",
  "县 · Comarca": "Comarca",
  "发现的问题": "Aspectos detectados",
  "可核对的核心指标": "Indicadores clave para comparar",
  "合同 · 押金 · 中介费": "Contrato · fianza · agencia",
  "合同内容分析": "Análisis del contrato",
  "合同条款、房东消息或中介说明……": "Cláusulas del contrato, mensajes del propietario o información de la agencia…",
  "合同类型": "Tipo de contrato",
  "合租房间合同": "Contrato de habitación",
  "同步区域数据": "Actualizar datos de zona",
  "售价估算": "Estimación de precio de venta",
  "地中海海岸与近郊生活板块。": "Costa mediterránea y entorno residencial metropolitano.",
  "地址 · 可选": "Dirección · opcional",
  "填写房屋基本信息即可开始。价格不是必填项。": "Añade los datos básicos de la vivienda. El precio es opcional.",
  "季节性 / 临时租赁合同": "Contrato de temporada",
  "宜居度": "Calidad de vida",
  "实时区域数据暂时不可用": "Los datos de zona no están disponibles temporalmente",
  "对比服务未返回有效结果。": "El servicio de comparación no devolvió resultados válidos.",
  "对比结论": "Conclusión comparativa",
  "已分析": "Analizado",
  "已完成房源分析": "Análisis del inmueble completado",
  "已完成报价比对": "Comparación de oferta completada",
  "已完成风险检查": "Revisión de riesgos completada",
  "已翻新": "Reformado",
  "巴塞罗那房产智能决策平台": "Decisiones inmobiliarias más claras en Barcelona",
  "巴塞罗那核心都市圈。": "Área metropolitana de Barcelona.",
  "市镇": "Municipio",
  "市镇 · Municipio": "Municipio",
  "市镇与街区": "Municipio y barrio",
  "底层": "Planta baja",
  "开始提交找房需求": "Empezar mi búsqueda",
  "开始评估": "Analizar inmueble",
  "开始风险检查": "Analizar riesgos",
  "当前使用轻量兜底数据，连接恢复后可重新同步。": "Se muestran datos de referencia básicos. Podrás actualizarlos cuando se restablezca la conexión.",
  "当前结果未返回硬性违法项。": "El resultado no señala incumplimientos legales graves.",
  "当前计算基准": "Referencia del cálculo actual",
  "当前选择：": "Selección actual:",
  "总价": "Precio total",
  "总体风险": "Riesgo general",
  "房产评估": "Valoración inmobiliaria",
  "房屋状况": "Estado de conservación",
  "房屋状态": "Estado del inmueble",
  "房源": "Inmueble",
  "房源匹配": "Coincidencias",
  "房源类型": "Tipo de inmueble",
  "找房需求与看房申请": "Búsqueda de vivienda y visitas",
  "报价 · 可选": "Oferta · opcional",
  "押金 · €": "Fianza · €",
  "提交买房或租房需求，查看后端返回的匹配房源，并申请看房。": "Indica tus preferencias de compra o alquiler, consulta las coincidencias disponibles y solicita una visita.",
  "提交后会与模型预测区间进行比较。": "Compararemos tu oferta con el intervalo estimado.",
  "整套公寓": "Piso completo",
  "无": "No",
  "暂无数据": "Sin datos disponibles",
  "月租": "Alquiler mensual",
  "月租 · €": "Alquiler mensual · €",
  "月租估算": "Estimación del alquiler",
  "有": "Sí",
  "核心参数": "Datos principales",
  "根据真实房源进行匹配": "Coincidencias basadas en inmuebles disponibles",
  "检查租金、押金、中介费及合同内容。": "Revisa el alquiler, la fianza, los honorarios y las cláusulas del contrato.",
  "楼层": "Planta",
  "正在分析房源": "Analizando el inmueble",
  "正在同步区域数据": "Actualizando datos de zona",
  "正在生成预测与风险分析": "Preparando estimaciones y análisis de riesgos",
  "比较两个区域的租金、售价、收益率、安全度与宜居度。": "Compara alquileres, precios de venta, rentabilidad, seguridad y calidad de vida.",
  "毛收益率": "Rentabilidad bruta",
  "没有填写报价。": "No has indicado una oferta.",
  "浏览后端当前可用房源。提交需求后会显示匹配分数、说明和演示房源标识。": "Consulta los inmuebles disponibles. Al enviar tus preferencias verás la puntuación, los motivos y las etiquetas de demostración.",
  "浏览房源并查找匹配": "Ver inmuebles y buscar coincidencias",
  "独立卧室": "Habitación privada",
  "独立开放式住宅": "Estudio",
  "生成区域对比": "Comparar zonas",
  "电梯": "Ascensor",
  "留空 = 自动预测": "Déjalo en blanco para estimar",
  "看房 · 核验 · 谈判": "Visitas · comprobaciones · negociación",
  "科技、大学与近郊居住板块。": "Tecnología, universidades y barrios residenciales del entorno.",
  "租务风控": "Análisis de riesgos del alquiler",
  "租务风险检查": "Revisión de riesgos del alquiler",
  "租客承担中介费 / 管理费": "El inquilino paga honorarios / gestión",
  "租房": "Alquilar",
  "租期 · 月": "Duración · meses",
  "租赁形式": "Tipo de alquiler",
  "租金 · 资产 · 宜居": "Alquiler · patrimonio · calidad de vida",
  "等待区域对比": "Pendiente de comparar zonas",
  "等待房源分析": "Pendiente de analizar el inmueble",
  "等待风险检查": "Pendiente de revisar riesgos",
  "结果用于辅助决策，不替代律师或注册估价师的正式意见。": "Este análisis es orientativo y no sustituye el asesoramiento de un abogado ni una tasación oficial.",
  "统一面积 · ㎡": "Superficie · m²",
  "自动预测模式": "Estimación automática",
  "良好": "Buen estado",
  "街区": "Barrio",
  "街区 · Barrio": "Barrio",
  "补充说明 · 可选": "Información adicional · opcional",
  "计价方式": "Periodicidad",
  "评估完成": "Valoración completada",
  "评估服务未返回有效结果。": "El servicio de valoración no devolvió resultados válidos.",
  "请求失败，请稍后重试。": "No se pudo completar la solicitud. Inténtalo de nuevo más tarde.",
  "财务与风险摘要": "Resumen financiero y de riesgos",
  "购房总价 · 可选": "Precio de compra · opcional",
  "输入房源信息": "Datos del inmueble",
  "长期住宅合同": "Contrato de vivienda habitual",
  "阳台、采光、装修、看房备注等": "Balcón, luz natural, reformas o notas para la visita",
  "需要翻修": "Necesita reforma",
  "面积": "Superficie",
  "面积 · ㎡": "Superficie · m²",
  "顶楼 / 阁楼": "Ático",
  "预测 / 公平价值": "Estimación / valor razonable",
  "预测 · 比价 · 风险": "Estimar · comparar · revisar riesgos",
  "预算 · 区域 · 合规": "Presupuesto · zona · normativa",
  "风控服务未返回有效结果。": "El servicio de riesgos no devolvió resultados válidos.",
  "风险检查": "Revisión de riesgos",
};

const homeOptionCopy: Record<Language, Record<string, string>> = {
  zh: {
    Middle: "中间楼层",
    "Ático": "顶楼 / 阁楼",
    Bajo: "底层",
    "": "不指定",
  },
  es: {
    Middle: "Planta intermedia",
    "Ático": "Ático",
    Bajo: "Planta baja",
    "": "Sin especificar",
  },
};

export function localizeHomeOption(value: string, language: Language) {
  return homeOptionCopy[language][value] ?? value;
}

export function homeToolText(value: string, language: Language) {
  return language === "zh" ? value : homeToolCopy[value] ?? value;
}

function translatedText(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const translation = homeToolText(normalized, "es");
  if (!translation) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translation}${trailing}`;
}

function translateValue(value: unknown): unknown {
  if (typeof value === "string") return translatedText(value);
  if (Array.isArray(value)) {
    return Children.map(value as ReactNode, (child) =>
      translateValue(child) as ReactNode,
    );
  }
  if (isValidElement<Record<string, unknown>>(value)) {
    const props = { ...value.props };
    for (const [key, prop] of Object.entries(props)) {
      if (key !== "value" && key !== "defaultValue") {
        props[key] = translateValue(prop);
      }
    }
    return cloneElement(value, props);
  }
  return value;
}

export function HomeToolTranslation({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  if (language === "zh") return children;
  return Children.map(children, (child) => translateValue(child) as ReactNode);
}
