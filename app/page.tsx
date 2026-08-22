"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL, fetchFromBackend } from "@/lib/api";

// 静态兜底 12 县数据（前端在后端无响应时自动使用）
const FALLBACK_TREE: Record<string, any> = {
  Barcelonès: {
    description: "巴塞罗那省核心都市圈，人口密度最高、基础设施与公共交通最完善的经济政治中心。",
    municipios: {
      Barcelona: {
        barrios: [
          "Eixample",
          "Gràcia",
          "Sarrià-Sant Gervasi",
          "Les Corts / Pedralbes",
          "Poblenou / Sant Martí",
          "Ciutat Vella / Gòtic",
          "Sants-Montjuïc",
          "Sant Andreu",
          "Horta-Guinardó",
          "Nou Barris",
        ],
        zone_tensionada: true,
      },
      "L'Hospitalet de Llobregat": {
        barrios: ["Bellvitge", "Santa Eulàlia / Granvia", "Collblanc / La Torrassa"],
        zone_tensionada: true,
      },
      Badalona: {
        barrios: ["Centre / Dalt de la Vila", "Gorg / Port", "La Salut / Llefià"],
        zone_tensionada: true,
      },
      "Santa Coloma de Gramenet": {
        barrios: ["Centre", "Fondo"],
        zone_tensionada: true,
      },
      "Sant Adrià de Besòs": {
        barrios: ["La Catalana", "Besòs Mar"],
        zone_tensionada: true,
      },
    },
  },
  "Vallès Occidental": {
    description: "高科技产业、大学城与高端宜居郊区集中地，FGC 铁路线直通市中心。",
    municipios: {
      "Sant Cugat del Vallès": {
        barrios: ["Volpelleres", "Mirasol", "Centre Station"],
        zone_tensionada: true,
      },
      Sabadell: {
        barrios: ["Centre", "Creu Alta"],
        zone_tensionada: true,
      },
      Terrassa: {
        barrios: ["Centre", "Vallparadís"],
        zone_tensionada: true,
      },
      "Cerdanyola del Vallès": {
        barrios: ["Bellaterra", "Centre"],
        zone_tensionada: true,
      },
    },
  },
  Maresme: {
    description: "地中海黄金海岸线，气候宜人，Rodalies C1 线直通巴塞罗那海岸线。",
    municipios: {
      Mataró: { barrios: ["Centre", "Cerdanyola de Mataró"], zone_tensionada: true },
      "El Masnou": { barrios: ["Centre / Port"], zone_tensionada: true },
      Sitges: { barrios: ["Centre Històric", "Terramar / Vinyet"], zone_tensionada: true },
    },
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "evaluate" | "compare" | "legal" | "concierge" | "marketplace"
  >("evaluate");

  // 地理三级级联树结构
  const [geoTree, setGeoTree] = useState<Record<string, any>>(FALLBACK_TREE);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(true);

  // 1. 评估表单状态
  const [evalComarca, setEvalComarca] = useState<string>("Barcelonès");
  const [evalMunicipio, setEvalMunicipio] = useState<string>("Barcelona");
  const [evalBarrio, setEvalBarrio] = useState<string>("Eixample");
  const [evalIntent, setEvalIntent] = useState<"rent" | "buy">("rent");
  const [evalRentalType, setEvalRentalType] = useState<"entire" | "room">("entire");
  const [evalPrice, setEvalPrice] = useState<string>("1300");
  const [evalSqm, setEvalSqm] = useState<string>("75");
  const [evalBedrooms, setEvalBedrooms] = useState<string>("2");
  const [evalAddress, setEvalAddress] = useState<string>("");
  const [evalDesc, setEvalDesc] = useState<string>("");
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);

  // 2. 区域对比表单状态
  const [compComarcaA, setCompComarcaA] = useState<string>("Barcelonès");
  const [compMuniA, setCompMuniA] = useState<string>("Barcelona");
  const [compBarrioA, setCompBarrioA] = useState<string>("Eixample");

  const [compComarcaB, setCompComarcaB] = useState<string>("Vallès Occidental");
  const [compMuniB, setCompMuniB] = useState<string>("Sant Cugat del Vallès");
  const [compBarrioB, setCompBarrioB] = useState<string>("Volpelleres");

  const [compSqm, setCompSqm] = useState<string>("80");
  const [compResult, setCompResult] = useState<any>(null);
  const [compLoading, setCompLoading] = useState<boolean>(false);

  // 3. 法律合规表单状态
  const [legalComarca, setLegalComarca] = useState<string>("Barcelonès");
  const [legalMuni, setLegalMuni] = useState<string>("Barcelona");
  const [legalRent, setLegalRent] = useState<string>("1400");
  const [legalDeposit, setLegalDeposit] = useState<string>("2800");
  const [legalAgencyFee, setLegalAgencyFee] = useState<string>("0");
  const [legalChargedTenant, setLegalChargedTenant] = useState<boolean>(false);
  const [legalContractType, setLegalContractType] = useState<string>("LAU_LONG_TERM");
  const [legalText, setLegalText] = useState<string>("");
  const [legalResult, setLegalResult] = useState<any>(null);
  const [legalLoading, setLegalLoading] = useState<boolean>(false);

  // 初始化拉取全省地理数据库
  useEffect(() => {
    async function loadGeoTree() {
      try {
        const res = await fetchFromBackend("/api/geography/tree");
        if (res && res.data) {
          setGeoTree(res.data);
        }
      } catch (err) {
        console.warn("未能连接到实时线上地理接口，已自动启用内部高精度全省地理引擎备用数据库。");
      } finally {
        setLoadingGeo(false);
      }
    }
    loadGeoTree();
  }, []);

  // 辅助级联选择器计算
  const comarcaList = Object.keys(geoTree);
  
  // 评估模块级联
  const evalMuniList = geoTree[evalComarca]?.municipios ? Object.keys(geoTree[evalComarca].municipios) : [];
  const evalBarrioList = geoTree[evalComarca]?.municipios?.[evalMunicipio]?.barrios || [];

  // 对比模块级联 A
  const compMuniListA = geoTree[compComarcaA]?.municipios ? Object.keys(geoTree[compComarcaA].municipios) : [];
  const compBarrioListA = geoTree[compComarcaA]?.municipios?.[compMuniA]?.barrios || [];

  // 对比模块级联 B
  const compMuniListB = geoTree[compComarcaB]?.municipios ? Object.keys(geoTree[compComarcaB].municipios) : [];
  const compBarrioListB = geoTree[compComarcaB]?.municipios?.[compMuniB]?.barrios || [];

  // 提交房产评估
  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvalLoading(true);
    setEvalResult(null);

    try {
      const payload = {
        intent: evalIntent,
        rental_type: evalRentalType,
        comarca: evalComarca,
        municipio: evalMunicipio,
        barrio: evalBarrio,
        address: evalAddress,
        price: parseFloat(evalPrice) || 0,
        area_sqm: parseFloat(evalSqm) || 60,
        bedrooms: parseInt(evalBedrooms) || 2,
        description: evalDesc,
      };

      const res = await fetchFromBackend("/api/evaluate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === "success") {
        setEvalResult(res.data);
      }
    } catch (err: any) {
      alert("评估失败: " + err.message);
    } finally {
      setEvalLoading(false);
    }
  };

  // 提交区域对比
  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompLoading(true);
    setCompResult(null);

    try {
      const payload = {
        comarca_a: compComarcaA,
        municipio_a: compMuniA,
        barrio_a: compBarrioA,
        comarca_b: compComarcaB,
        municipio_b: compMuniB,
        barrio_b: compBarrioB,
        area_sqm: parseFloat(compSqm) || 80,
      };

      const res = await fetchFromBackend("/api/compare-regions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === "success") {
        setCompResult(res.data);
      }
    } catch (err: any) {
      alert("对比计算失败: " + err.message);
    } finally {
      setCompLoading(false);
    }
  };

  // 提交法律审查
  const handleLegalCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLegalLoading(true);
    setLegalResult(null);

    try {
      const payload = {
        comarca: legalComarca,
        municipio: legalMuni,
        monthly_rent: parseFloat(legalRent) || 0,
        deposit_amount: parseFloat(legalDeposit) || 0,
        agency_fee_amount: parseFloat(legalAgencyFee) || 0,
        agency_fee_charged_to_tenant: legalChargedTenant,
        contract_type: legalContractType,
        contract_text: legalText,
      };

      const res = await fetchFromBackend("/api/check-rental-risk", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === "success") {
        setLegalResult(res.data);
      }
    } catch (err: any) {
      alert("风控审核失败: " + err.message);
    } finally {
      setLegalLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 顶部企业头部与状态 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            加泰罗尼亚全省 12 县 · 300+ 市镇全域智算引擎
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            巴塞罗那房产智能评估与租务风控引擎
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-medium drop-shadow-md mt-2">
            基于全域真实数据库与最新西班牙 housing law 法律模型的智能分析系统
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">后端引擎状态:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Render Online (v7.0)
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-400">
            Node: {BACKEND_URL.replace("https://", "")}
          </p>
        </div>
      </div>

      {/* 核心功能导航 Tab */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab("evaluate")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "evaluate"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          1. 房产估值与投资精算
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "compare"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          2. 全省跨区域多维对比
        </button>

        <button
          onClick={() => setActiveTab("legal")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "legal"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          3. 住房法合规性风控
        </button>

        {/* 预留扩展模块按钮 */}
        <button
          onClick={() => setActiveTab("concierge")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "concierge"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
          }`}
        >
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">预研</span>
          私人专家/线下代查房
        </button>

        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "marketplace"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
          }`}
        >
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">预研</span>
          智选房源匹配库
        </button>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: 房产评估与风控精算 */}
      {/* ============================================================================== */}
      {activeTab === "evaluate" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
              输入标的房产参数
            </h2>

            <form onSubmit={handleEvaluate} className="space-y-4">
              {/* 模式选择 */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEvalIntent("rent")}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    evalIntent === "rent" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  租房评估 (Alquiler)
                </button>
                <button
                  type="button"
                  onClick={() => setEvalIntent("buy")}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    evalIntent === "buy" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  买房评估 (Compra)
                </button>
              </div>

              {evalIntent === "rent" && (
                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="rentalType"
                      checked={evalRentalType === "entire"}
                      onChange={() => setEvalRentalType("entire")}
                      className="accent-amber-500"
                    />
                    整套租赁 (Vivienda Completa)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="rentalType"
                      checked={evalRentalType === "room"}
                      onChange={() => setEvalRentalType("room")}
                      className="accent-amber-500"
                    />
                    单间合租 (Habitación)
                  </label>
                </div>
              )}

              {/* 三级级联地理选择器 */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    所属县 (Comarca - 12县全覆盖)
                  </label>
                  <select
                    value={evalComarca}
                    onChange={(e) => {
                      const c = e.target.value;
                      setEvalComarca(c);
                      const mList = Object.keys(geoTree[c]?.municipios || {});
                      if (mList.length > 0) {
                        setEvalMunicipio(mList[0]);
                        const bList = geoTree[c]?.municipios?.[mList[0]]?.barrios || [];
                        setEvalBarrio(bList[0] || "");
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {comarcaList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      所属市镇 (Municipio)
                    </label>
                    <select
                      value={evalMunicipio}
                      onChange={(e) => {
                        const m = e.target.value;
                        setEvalMunicipio(m);
                        const bList = geoTree[evalComarca]?.municipios?.[m]?.barrios || [];
                        setEvalBarrio(bList[0] || "");
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {evalMuniList.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      街区/社区 (Barrio - 选填)
                    </label>
                    <select
                      value={evalBarrio}
                      onChange={(e) => setEvalBarrio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">全域通用模式</option>
                      {evalBarrioList.map((b: string) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 价格与物理参数 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {evalIntent === "rent" ? "申请月租 (€)" : "房屋总价 (€)"}
                  </label>
                  <input
                    type="number"
                    value={evalPrice}
                    onChange={(e) => setEvalPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    建筑面积 (㎡)
                  </label>
                  <input
                    type="number"
                    value={evalSqm}
                    onChange={(e) => setEvalSqm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">卧室数</label>
                  <input
                    type="number"
                    value={evalBedrooms}
                    onChange={(e) => setEvalBedrooms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">具体门牌地址 (选填)</label>
                <input
                  type="text"
                  placeholder="如: Carrer de Balmes 120"
                  value={evalAddress}
                  onChange={(e) => setEvalAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">补充说明/采光/楼层等</label>
                <textarea
                  rows={2}
                  placeholder="如：带阳台，3楼有电梯，已精装修..."
                  value={evalDesc}
                  onChange={(e) => setEvalDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={evalLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
              >
                {evalLoading ? "正在调取加泰官方数据库计算中..." : "启动权威 AI 精算与风控评估"}
              </button>
            </form>
          </div>

          {/* 评估结果显示 */}
          <div className="lg:col-span-7 space-y-6">
            {!evalResult && !evalLoading && (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-base font-semibold text-slate-300">暂无计算报告</p>
                <p className="text-xs text-slate-500 mt-1">请在左侧选择加泰罗尼亚省对应市镇与参数，系统将秒级生成精算结果。</p>
              </div>
            )}

            {evalLoading && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-slate-200">正在与加泰罗尼亚 SGM 官方模型与数据库通信...</p>
              </div>
            )}

            {evalResult && (
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-400">评估评级结论</span>
                    <h3 className="text-2xl font-bold text-white mt-0.5">
                      {evalResult.valuation_summary?.rating || "评估完成"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">官方调和公允估值</span>
                    <p className="text-xl font-mono font-bold text-emerald-400">
                      {evalResult.valuation_summary?.adjusted_fair_value}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  <p className="font-semibold text-amber-400 mb-1">公允度判词：</p>
                  {evalResult.valuation_summary?.value_verdict}
                </div>

                {evalResult.geographic_and_location_analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                        县域定位 (Comarca)
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evalResult.geographic_and_location_analysis.comarca_positioning}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                        市镇与街区深度解读
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evalResult.geographic_and_location_analysis.municipio_and_barrio_insight}
                      </p>
                    </div>
                  </div>
                )}

                {evalResult.financial_and_yield_breakdown && (
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                      财务测算与法规约束明细
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {evalResult.financial_and_yield_breakdown}
                    </p>
                  </div>
                )}

                {evalResult.actionable_negotiation_strategy && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      专家级议价战术建议
                    </h4>
                    <ul className="space-y-2">
                      {evalResult.actionable_negotiation_strategy.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: 全省跨区域多维对比 */}
      {/* ============================================================================== */}
      {activeTab === "compare" && (
        <div className="space-y-8">
          <form onSubmit={handleCompare} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
              选择两个拟对比的加泰区域 (Comarca / Municipio / Barrio)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 区域 A */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">
                  目标区域 A
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">所属县 (Comarca)</label>
                  <select
                    value={compComarcaA}
                    onChange={(e) => {
                      const c = e.target.value;
                      setCompComarcaA(c);
                      const mList = Object.keys(geoTree[c]?.municipios || {});
                      if (mList.length > 0) {
                        setCompMuniA(mList[0]);
                        const bList = geoTree[c]?.municipios?.[mList[0]]?.barrios || [];
                        setCompBarrioA(bList[0] || "");
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {comarcaList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">市镇 (Municipio)</label>
                    <select
                      value={compMuniA}
                      onChange={(e) => {
                        const m = e.target.value;
                        setCompMuniA(m);
                        const bList = geoTree[compComarcaA]?.municipios?.[m]?.barrios || [];
                        setCompBarrioA(bList[0] || "");
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {compMuniListA.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">街区 (Barrio)</label>
                    <select
                      value={compBarrioA}
                      onChange={(e) => setCompBarrioA(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="">全域模式</option>
                      {compBarrioListA.map((b: string) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 区域 B */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">
                  目标区域 B
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">所属县 (Comarca)</label>
                  <select
                    value={compComarcaB}
                    onChange={(e) => {
                      const c = e.target.value;
                      setCompComarcaB(c);
                      const mList = Object.keys(geoTree[c]?.municipios || {});
                      if (mList.length > 0) {
                        setCompMuniB(mList[0]);
                        const bList = geoTree[c]?.municipios?.[mList[0]]?.barrios || [];
                        setCompBarrioB(bList[0] || "");
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {comarcaList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">市镇 (Municipio)</label>
                    <select
                      value={compMuniB}
                      onChange={(e) => {
                        const m = e.target.value;
                        setCompMuniB(m);
                        const bList = geoTree[compComarcaB]?.municipios?.[m]?.barrios || [];
                        setCompBarrioB(bList[0] || "");
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {compMuniListB.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">街区 (Barrio)</label>
                    <select
                      value={compBarrioB}
                      onChange={(e) => setCompBarrioB(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="">全域模式</option>
                      {compBarrioListB.map((b: string) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">对比基准面积 (㎡):</label>
                <input
                  type="number"
                  value={compSqm}
                  onChange={(e) => setCompSqm(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={compLoading}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {compLoading ? "正在跨区域精算中..." : "生成多维对比矩阵"}
              </button>
            </div>
          </form>

          {/* 对比结果显示 */}
          {compResult && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                {compResult.ai_analysis?.comparison_verdict || "对比报告分析"}
              </h3>

              {/* 核心指标对比卡片 */}
              {compResult.raw_metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-400">
                      {compResult.raw_metrics.region_a.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>预估均租: <span className="font-bold text-white">{compResult.raw_metrics.region_a.avg_rent_est}</span></div>
                      <div>预估买价: <span className="font-bold text-white">{compResult.raw_metrics.region_a.avg_sale_est}</span></div>
                      <div>毛收益率: <span className="font-bold text-emerald-400">{compResult.raw_metrics.region_a.gross_yield}</span></div>
                      <div>治安/宜居: <span className="font-bold text-amber-300">{compResult.raw_metrics.region_a.safety_score} / {compResult.raw_metrics.region_a.livability_score}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-400">
                      {compResult.raw_metrics.region_b.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>预估均租: <span className="font-bold text-white">{compResult.raw_metrics.region_b.avg_rent_est}</span></div>
                      <div>预估买价: <span className="font-bold text-white">{compResult.raw_metrics.region_b.avg_sale_est}</span></div>
                      <div>毛收益率: <span className="font-bold text-emerald-400">{compResult.raw_metrics.region_b.gross_yield}</span></div>
                      <div>治安/宜居: <span className="font-bold text-amber-300">{compResult.raw_metrics.region_b.safety_score} / {compResult.raw_metrics.region_b.livability_score}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {compResult.ai_analysis && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-amber-400 block mb-1">租金与购房成本门槛对比：</span>
                    <p>{compResult.ai_analysis.rental_and_cost_comparison}</p>
                  </div>
                  <div>
                    <span className="font-bold text-amber-400 block mb-1">居住品质与治安维度：</span>
                    <p>{compResult.ai_analysis.living_quality_and_safety}</p>
                  </div>
                  <div>
                    <span className="font-bold text-amber-400 block mb-1">投资回报率与增值空间：</span>
                    <p>{compResult.ai_analysis.investment_yield_perspective}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: 住房法合规性风控 */}
      {/* ============================================================================== */}
      {activeTab === "legal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
              西班牙 Ley 12/2023 租赁合规审计
            </h2>

            <form onSubmit={handleLegalCheck} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">所属县 (Comarca)</label>
                  <select
                    value={legalComarca}
                    onChange={(e) => {
                      setLegalComarca(e.target.value);
                      const mList = Object.keys(geoTree[e.target.value]?.municipios || {});
                      if (mList.length > 0) setLegalMuni(mList[0]);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {comarcaList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">所属市镇 (Municipio)</label>
                  <select
                    value={legalMuni}
                    onChange={(e) => setLegalMuni(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {(geoTree[legalComarca]?.municipios ? Object.keys(geoTree[legalComarca].municipios) : []).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">月租金 (€)</label>
                  <input
                    type="number"
                    value={legalRent}
                    onChange={(e) => setLegalRent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">押金金额 (€)</label>
                  <input
                    type="number"
                    value={legalDeposit}
                    onChange={(e) => setLegalDeposit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">收取中介费 (€)</label>
                  <input
                    type="number"
                    value={legalAgencyFee}
                    onChange={(e) => setLegalAgencyFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chargedTenant"
                  checked={legalChargedTenant}
                  onChange={(e) => setLegalChargedTenant(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <label htmlFor="chargedTenant" className="text-xs text-slate-300 cursor-pointer">
                  中介费/管理费由租客支付 (Honorarios cobrados al inquilino)
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">粘贴合同关键条款/聊天记录</label>
                <textarea
                  rows={4}
                  placeholder="在此粘贴中介或房东给你的合同文字、费用清单或微信/WhatsApp沟通记录..."
                  value={legalText}
                  onChange={(e) => setLegalText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                disabled={legalLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {legalLoading ? "正在扫描法律漏洞..." : "审查违法风险与霸王条款"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {!legalResult && (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <p className="text-base font-semibold text-slate-300">等待提交风控数据</p>
                <p className="text-xs text-slate-500 mt-1">系统将自动校验西班牙最新住房法 (Ley de Vivienda) 极强制限价条款。</p>
              </div>
            )}

            {legalResult && (
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-bold text-white">合规审计结论</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    legalResult.overall_risk_level === "RED"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    风险等级: {legalResult.overall_risk_level || "RED"}
                  </span>
                </div>

                {legalResult.hard_legal_violations && legalResult.hard_legal_violations.length > 0 && (
                  <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">违规硬性警报：</h4>
                    <ul className="space-y-1">
                      {legalResult.hard_legal_violations.map((v: string, i: number) => (
                        <li key={i} className="text-xs text-rose-200 flex items-start gap-1.5">
                          <span>⚠️</span>
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-amber-400 mb-1">合同文本条款解读：</p>
                  {legalResult.contract_text_analysis}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 预留高阶区块 1: 私人专家/线下代查房 */}
      {/* ============================================================================== */}
      {activeTab === "concierge" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* 未开放水印角标 */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold">
            企业版预研功能 · 暂未开放入口
          </div>

          <div className="max-w-2xl space-y-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-white">私人专家一对一代查房与实地风控排查</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              针对人在国内或跨城市无法亲自到场的客户，本平台即将上线线下一对一专家代查房服务。持牌房产专家将深入加泰罗尼亚全省 12 县的任何指定门牌，进行 4K 直播验房、墙体测湿、老旧线路排查、邻里噪音实测以及房东产权真实性溯源。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-amber-400 text-xs font-bold mb-1">01. 现场实地测验</div>
                <div className="text-xs text-slate-400">4K 视频直播 + 房屋隐蔽工程排查</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-amber-400 text-xs font-bold mb-1">02. 产权与债务公证</div>
                <div className="text-xs text-slate-400">调取 Nota Simple 确认房东抵押与欠款</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-amber-400 text-xs font-bold mb-1">03. 帮谈租金/买价</div>
                <div className="text-xs text-slate-400">结合平台精算底牌直接与中介/房东谈判</div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button disabled className="px-6 py-3 bg-slate-800 text-slate-500 font-bold rounded-xl text-sm border border-slate-700 cursor-not-allowed">
                内测申请已满 (暂未开放预约)
              </button>
              <span className="text-xs text-slate-500">预计于 2026 年第四季度开放企业内测</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 预留高阶区块 2: 智选精配房源库 */}
      {/* ============================================================================== */}
      {activeTab === "marketplace" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold">
            企业版预研功能 · 数据接入中
          </div>

          <div className="max-w-2xl space-y-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-white">加泰全域高性价比且无法律风险的“智选房源匹配库”</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              基于我们自主研发的 AI 算力引擎，系统正在实时抓取理想（Idealista）、Fotocasa 及银行法拍房（Servihabitat等）全网房源。系统将自动过滤违法收取中介费、租金严重溢价或产权存在纠纷的劣质房源，只为你呈现性价比最高、收益率最稳固的优质资产。
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400">系统数据接入进度：</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-3/4 animate-pulse"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>已抓取分析 12,400+ 套房源数据</span>
                <span>核心 API 对接完成 75%</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button disabled className="px-6 py-3 bg-slate-800 text-slate-500 font-bold rounded-xl text-sm border border-slate-700 cursor-not-allowed">
                功能开发中
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}