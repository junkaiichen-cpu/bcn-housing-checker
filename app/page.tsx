"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"evaluate" | "risk">("evaluate");
  
  // 评估表单状态
  const [intent, setIntent] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"entire" | "room">("entire");
  const [inputMode, setInputMode] = useState<"address" | "zone">("address");
  const [address, setAddress] = useState("");
  const [zoneOrCity, setZoneOrCity] = useState("Eixample (Barcelona)");
  const [price, setPrice] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [condition, setCondition] = useState("good");

  // 风控表单状态
  const [riskAddress, setRiskAddress] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [agencyFeeAmount, setAgencyFeeAmount] = useState("");
  const [contractType, setContractType] = useState("LAU_LONG_TERM");
  const [chargedAgencyFee, setChargedAgencyFee] = useState(false);
  const [contractText, setContractText] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 巴塞罗那省全域预设列表
  const provinceZones = [
    { label: "巴塞罗那 - Eixample (扩建区)", value: "Eixample (Barcelona)" },
    { label: "巴塞罗那 - Gràcia (格拉西亚区)", value: "Gràcia (Barcelona)" },
    { label: "巴塞罗那 - Poblenou / Sant Martí", value: "Poblenou / Sant Martí (Barcelona)" },
    { label: "巴塞罗那 - Les Corts / Pedralbes", value: "Les Corts / Pedralbes (Barcelona)" },
    { label: "巴塞罗那 - Ciutat Vella (老城区)", value: "Ciutat Vella / Gòtic (Barcelona)" },
    { label: "巴塞罗那 - Sarrià-Sant Gervasi", value: "Sarrià-Sant Gervasi (Barcelona)" },
    { label: "Hospitalet (哈斯皮塔莱特市)", value: "L'Hospitalet de Llobregat" },
    { label: "Badalona (巴达洛纳市)", value: "Badalona" },
    { label: "Sant Cugat (圣库加特市)", value: "Sant Cugat del Vallès" },
    { label: "Sabadell (萨瓦德尔市)", value: "Sabadell" },
    { label: "Terrassa (特拉萨市)", value: "Terrassa" },
    { label: "Castelldefels / Gavà (海滨别墅区)", value: "Castelldefels / Gavà" },
  ];

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      intent,
      rental_type: rentalType,
      address: inputMode === "address" ? address : undefined,
      zone_or_city: inputMode === "zone" ? zoneOrCity : undefined,
      price: parseFloat(price),
      area_sqm: areaSqm ? parseFloat(areaSqm) : undefined,
      bedrooms: parseInt(bedrooms),
      condition,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "success") setResult(data.data);
      else alert("分析失败：" + data.message);
    } catch (err) {
      alert("连接后端服务失败，请确保 backend 已启动");
    } finally {
      setLoading(false);
    }
  };

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      address: riskAddress,
      monthly_rent: parseFloat(monthlyRent),
      deposit_amount: depositAmount ? parseFloat(depositAmount) : undefined,
      agency_fee_amount: agencyFeeAmount ? parseFloat(agencyFeeAmount) : undefined,
      contract_type: contractType,
      agency_fee_charged_to_tenant: chargedAgencyFee,
      contract_text: contractText,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/check-rental-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "success") setResult(data.data);
      else alert("风控诊断失败：" + data.message);
    } catch (err) {
      alert("连接后端服务失败，请确保 backend 已启动");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 头部标题与简短用法介绍 */}
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
          巴塞罗那房产智能评估与租务风控引擎
        </h1>
        
        {/* 替换后的简短用法介绍卡片 */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 md:gap-6 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md px-6 py-3 rounded-full text-xs md:text-sm text-slate-200 shadow-lg">
          <span className="flex items-center gap-1 font-medium">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">1</span> 
            选择租房/买房模式
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="flex items-center gap-1 font-medium">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">2</span> 
            输入具体地址或选择区份城市
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="flex items-center gap-1 font-medium text-emerald-400 font-semibold">
            ⚡ 自动诊断公核限价与法律风险
          </span>
        </div>
      </header>

      {/* 功能切换 Tab */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shadow-inner flex gap-2">
          <button
            onClick={() => { setActiveTab("evaluate"); setResult(null); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "evaluate"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏠 全域房产智能评估
          </button>
          <button
            onClick={() => { setActiveTab("risk"); setResult(null); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "risk"
                ? "bg-red-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚖️ 租务法律风控诊断
          </button>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100">
        {activeTab === "evaluate" ? (
          <form onSubmit={handleEvaluateSubmit} className="space-y-5">
            {/* 意向与房屋类型 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">交易意向</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIntent("rent")}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      intent === "rent" ? "bg-blue-600/30 border-blue-500 text-blue-200" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    租房 (Alquiler)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntent("buy")}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      intent === "buy" ? "bg-blue-600/30 border-blue-500 text-blue-200" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    买房 (Compra)
                  </button>
                </div>
              </div>

              {intent === "rent" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">租赁模式</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRentalType("entire")}
                      className={`py-2 rounded-lg text-xs font-semibold border ${
                        rentalType === "entire" ? "bg-blue-600/30 border-blue-500 text-blue-200" : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      整租 (Vivienda)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentalType("room")}
                      className={`py-2 rounded-lg text-xs font-semibold border ${
                        rentalType === "room" ? "bg-blue-600/30 border-blue-500 text-blue-200" : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      单间合租 (Habitación)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 位置定位模式切换：精准地址 OR 城市区份 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">位置定位方式</label>
                <div className="flex gap-4 text-xs">
                  <label className="cursor-pointer flex items-center gap-1 text-slate-300">
                    <input
                      type="radio"
                      name="inputMode"
                      checked={inputMode === "address"}
                      onChange={() => setInputMode("address")}
                      className="accent-blue-500"
                    />
                    填写具体地址
                  </label>
                  <label className="cursor-pointer flex items-center gap-1 text-slate-300">
                    <input
                      type="radio"
                      name="inputMode"
                      checked={inputMode === "zone"}
                      onChange={() => setInputMode("zone")}
                      className="accent-blue-500"
                    />
                    选择巴塞罗那省城市/区份
                  </label>
                </div>
              </div>

              {inputMode === "address" ? (
                <input
                  type="text"
                  placeholder="如: Carrer de Balmes 120, Barcelona 或 Sant Cugat"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              ) : (
                <select
                  value={zoneOrCity}
                  onChange={(e) => setZoneOrCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {provinceZones.map((z) => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 价格与面积 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {intent === "rent" ? "期望/报价月租金 (€)" : "房屋挂牌买卖总价 (€)"}
                </label>
                <input
                  type="number"
                  placeholder="例如: 1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">建筑面积 (㎡)</label>
                <input
                  type="number"
                  placeholder="例如: 75"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">装修与状况</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="renovated">精装修 / 极佳 (Renovado)</option>
                  <option value="good">良好 / 可直接入住 (Buen Estado)</option>
                  <option value="needs_renovation">需翻新 (A Reformar)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold py-3 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 mt-4"
            >
              {loading ? "正在调取加泰罗尼亚全域数据库精算中..." : "🚀 启动多维公允估值与区域分析"}
            </button>
          </form>
        ) : (
          /* 租务风控诊断表单 */
          <form onSubmit={handleRiskSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">具体地址或所在城市/区份</label>
              <input
                type="text"
                placeholder="如: Gran Via 580, Barcelona 或 Sant Cugat"
                value={riskAddress}
                onChange={(e) => setRiskAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">月租金 (€)</label>
                <input
                  type="number"
                  placeholder="如: 1300"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">收取押金总额 (€)</label>
                <input
                  type="number"
                  placeholder="如: 2600"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">合同类型</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500"
                >
                  <option value="LAU_LONG_TERM">常规长租 (LAU 5年/7年)</option>
                  <option value="TEMPORADA">季节性/短期租赁 (Temporada)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                id="feeCheck"
                checked={chargedAgencyFee}
                onChange={(e) => setChargedAgencyFee(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <label htmlFor="feeCheck" className="text-xs text-slate-200 cursor-pointer">
                中介向作为租客的我收取了中介费 / 服务费
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold py-3 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 mt-4"
            >
              {loading ? "正在对照西班牙 Housing Law 条款比对中..." : "🛡️ 诊断租务合同与合规风险"}
            </button>
          </form>
        )}

        {/* 智能分析结果展示区域 */}
        {result && (
          <div className="mt-8 border-t border-slate-800 pt-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              📊 分析报告结果
            </h2>

            {result.valuation_summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">评估评级</span>
                  <p className="text-lg font-bold text-blue-400 mt-1">{result.valuation_summary.rating}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">模型公允估值</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{result.valuation_summary.adjusted_fair_value}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">报价偏差率</span>
                  <p className="text-lg font-bold text-amber-400 mt-1">{result.valuation_summary.variance_percentage}</p>
                </div>
              </div>
            )}

            {result.location_and_address_analysis && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-400 mb-2">📍 地址与区域区位分析</h3>
                <p className="text-sm text-slate-200 leading-relaxed">{result.location_and_address_analysis}</p>
              </div>
            )}

            {result.district_profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-semibold text-emerald-400 mb-2">✅ 区域优势 (Pros)</h3>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {result.district_profile.key_pros?.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-semibold text-rose-400 mb-2">⚠️ 潜在隐患 (Cons)</h3>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {result.district_profile.key_cons?.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {result.hard_legal_violations && result.hard_legal_violations.length > 0 && (
              <div className="bg-red-950/40 border border-red-800/80 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-red-400 mb-2">🚨 侦测到的硬性违法条款</h3>
                <ul className="text-xs text-red-200 space-y-1.5">
                  {result.hard_legal_violations.map((v: string, i: number) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.actionable_negotiation_strategy && (
              <div className="bg-blue-950/40 border border-blue-800/80 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-blue-300 mb-2">💡 专家建议与议价策略</h3>
                <p className="text-xs text-slate-200 leading-relaxed">{result.actionable_negotiation_strategy}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}