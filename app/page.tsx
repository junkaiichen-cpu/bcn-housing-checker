"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"evaluate" | "risk">("evaluate");
  
  // 智能模式：'address' (具体地址) 或 'municipio' (选择/填写市镇)
  const [locationMode, setLocationMode] = useState<"address" | "municipio">("address");
  
  // 表单状态
  const [intent, setIntent] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"entire" | "room">("entire");
  const [address, setAddress] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("Barcelona");
  const [customMunicipio, setCustomMunicipio] = useState("");
  const [price, setPrice] = useState<string>("");
  const [areaSqm, setAreaSqm] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [description, setDescription] = useState("");
  
  // 租务风控表单
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [agencyFeeAmount, setAgencyFeeAmount] = useState<string>("");
  const [contractType, setContractType] = useState("LAU_LONG_TERM");
  const [chargedAgencyFee, setChargedAgencyFee] = useState(false);
  const [contractText, setContractText] = useState("");

  // 后端 Comarques & Municipis 列表数据
  const [municipiosData, setMunicipiosData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const API_BASE = "https://bcn-housing-backend.onrender.com";

  // 获取巴塞罗那省 12 县与市镇数据
  useEffect(() => {
    fetch(`${API_BASE}/api/municipios-list`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setMunicipiosData(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const finalMunicipio = customMunicipio.trim() || selectedMunicipio;

    try {
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          rental_type: rentalType,
          address: locationMode === "address" ? address : undefined,
          municipio: locationMode === "municipio" ? finalMunicipio : undefined,
          price: parseFloat(price) || 0,
          area_sqm: areaSqm ? parseFloat(areaSqm) : undefined,
          bedrooms,
          description,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setResult(data.data);
      } else {
        setError(data.message || "评估失败，请检查数据输入");
      }
    } catch (err: any) {
      setError("连接后端服务失败，请确保 backend 已启动");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const finalMunicipio = customMunicipio.trim() || selectedMunicipio;

    try {
      const res = await fetch(`${API_BASE}/api/check-rental-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: locationMode === "address" ? address : undefined,
          municipio: locationMode === "municipio" ? finalMunicipio : undefined,
          monthly_rent: parseFloat(price) || 0,
          deposit_amount: depositAmount ? parseFloat(depositAmount) : undefined,
          agency_fee_amount: agencyFeeAmount ? parseFloat(agencyFeeAmount) : undefined,
          contract_type: contractType,
          agency_fee_charged_to_tenant: chargedAgencyFee,
          contract_text: contractText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setResult(data.data);
      } else {
        setError(data.message || "风控分析失败，请稍后再试");
      }
    } catch (err: any) {
      setError("连接后端服务失败，请确保 backend 已启动");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-100">
      {/* 头部标题区域 */}
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
          巴塞罗那房产智能评估与租务风控引擎
        </h1>
        {/* 用法的简短介绍 */}
        <p className="text-slate-200 text-sm md:text-base font-medium drop-shadow-md mt-2 max-w-2xl mx-auto">
          💡 输入巴塞罗那省任意地址或市镇（Municipis），一键获取价格公允度精算与加泰罗尼亚租务法合规诊断
        </p>
      </header>

      {/* 功能切换 Tab */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60 flex space-x-2 backdrop-blur-md">
          <button
            onClick={() => { setActiveTab("evaluate"); setResult(null); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "evaluate"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            🏠 房产估值与投资分析
          </button>
          <button
            onClick={() => { setActiveTab("risk"); setResult(null); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "risk"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            ⚖️ 租房合同与风控排查
          </button>
        </div>
      </div>

      {/* 主输入卡片 */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl mb-8">
        {/* 位置匹配模式切换 */}
        <div className="mb-6 pb-6 border-b border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            📍 第一步：选择位置定位模式
          </label>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setLocationMode("address")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                locationMode === "address"
                  ? "bg-slate-700 text-white border border-blue-500/50"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              输入具体街道地址 (Dirección)
            </button>
            <button
              type="button"
              onClick={() => setLocationMode("municipio")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                locationMode === "municipio"
                  ? "bg-slate-700 text-white border border-blue-500/50"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              选择/填写市镇 (300+ Municipis)
            </button>
          </div>

          {locationMode === "address" ? (
            <div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例如: Carrer de Mallorca 200, Barcelona 或 Av. Cerdanya 12, Sant Cugat"
                className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">选择巴塞罗那省核心市镇</label>
                <select
                  value={selectedMunicipio}
                  onChange={(e) => { setSelectedMunicipio(e.target.value); setCustomMunicipio(""); }}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {municipiosData ? (
                    Object.entries(municipiosData).map(([comarca, info]: [string, any]) => (
                      <optgroup key={comarca} label={`县: ${comarca} (${info.capital})`}>
                        {info.sample_municipios.map((m: string) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <>
                      <option value="Barcelona">Barcelona (Barcelonès)</option>
                      <option value="Sant Cugat del Vallès">Sant Cugat del Vallès</option>
                      <option value="Badalona">Badalona</option>
                      <option value="L'Hospitalet de Llobregat">L'Hospitalet</option>
                      <option value="Sitges">Sitges (Garraf)</option>
                      <option value="Sabadell">Sabadell (Vallès Occ.)</option>
                      <option value="Terrassa">Terrassa (Vallès Occ.)</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">或直接手写输入任意 Municipis</label>
                <input
                  type="text"
                  value={customMunicipio}
                  onChange={(e) => setCustomMunicipio(e.target.value)}
                  placeholder="如: Mataró, Vic, Manresa, Castelldefels..."
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* 评估表单 */}
        {activeTab === "evaluate" ? (
          <form onSubmit={handleEvaluate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">评估目的</label>
                <div className="flex bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIntent("rent")}
                    className={`flex-1 py-2 text-xs font-bold rounded ${intent === "rent" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                  >
                    租房 assessment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntent("buy")}
                    className={`flex-1 py-2 text-xs font-bold rounded ${intent === "buy" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                  >
                    买房 investment
                  </button>
                </div>
              </div>

              {intent === "rent" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">租赁形式</label>
                  <div className="flex bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRentalType("entire")}
                      className={`flex-1 py-2 text-xs font-bold rounded ${rentalType === "entire" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                    >
                      整租 Vivienda
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentalType("room")}
                      className={`flex-1 py-2 text-xs font-bold rounded ${rentalType === "room" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                    >
                      单间 Habitación
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  {intent === "rent" ? "月租金 (€/月)" : "房屋总售价 (€)"}
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={intent === "rent" ? "例如: 1200" : "例如: 350000"}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">建筑面积 (㎡)</label>
                <input
                  type="number"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  placeholder="例如: 75"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">补充需求/备注描述</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例如: 带阳台、有电梯、近地铁站..."
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center"
            >
              {loading ? "正在对全省数据库与精算模型进行分析..." : "🚀 开始智能精算与价格评估"}
            </button>
          </form>
        ) : (
          /* 租务风控表单 */
          <form onSubmit={handleCheckRisk} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">约定月租金 (€)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="例如: 1300"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">收取押金总额 (€)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="例如: 2600"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">收取中介费/服务费 (€)</label>
                <input
                  type="number"
                  value={agencyFeeAmount}
                  onChange={(e) => setAgencyFeeAmount(e.target.value)}
                  placeholder="例如: 1560"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                id="agencyFeeCheck"
                checked={chargedAgencyFee}
                onChange={(e) => setChargedAgencyFee(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="agencyFeeCheck" className="text-sm font-medium text-slate-200 cursor-pointer">
                中介/房东要求我（租客）支付中介服务费 (Honorarios de Agencia)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">合同关键条款/疑虑描述</label>
              <textarea
                rows={3}
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="请粘贴合同条款或中介发来的费用要求明细..."
                className="w-full bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex justify-center items-center"
            >
              {loading ? "正在依照西班牙 Ley 12/2023 进行排查..." : "🛡️ 审查租务合同与合规风险"}
            </button>
          </form>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl mb-8 backdrop-blur-md">
          🚨 {error}
        </div>
      )}

      {/* 结果展示 */}
      {result && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center">
            <span className="mr-2">📊</span> 分析诊断报告
          </h2>

          {activeTab === "evaluate" && result.valuation_summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">综合评估评级</div>
                  <div className="text-lg font-extrabold text-blue-400 mt-1">
                    {result.valuation_summary.rating}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">模型估算公允价格</div>
                  <div className="text-lg font-extrabold text-white mt-1">
                    {result.valuation_summary.adjusted_fair_value}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">价格偏差率</div>
                  <div className="text-lg font-extrabold text-amber-400 mt-1">
                    {result.valuation_summary.variance_percentage}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-300 mb-2">📌 价值诊断评语</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.valuation_summary.value_verdict}
                </p>
              </div>

              {result.municipio_and_comarca_analysis && (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">🗺️ 市镇与县域区位深度分析</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.municipio_and_comarca_analysis}
                  </p>
                </div>
              )}

              {result.actionable_negotiation_strategy && (
                <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-blue-300 mb-2">💡 议价与砍价实操建议</h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {result.actionable_negotiation_strategy}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "risk" && result.overall_risk_level && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">整体风险评级</div>
                <div className={`text-xl font-extrabold mt-1 ${
                  result.overall_risk_level === "RED" ? "text-red-400" :
                  result.overall_risk_level === "YELLOW" ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {result.overall_risk_level === "RED" ? "🔴 高风险 / 存在硬性违法" :
                   result.overall_risk_level === "YELLOW" ? "🟡 中风险 / 需注意条款" : "🟢 合规 / 低风险"}
                </div>
              </div>

              {result.hard_legal_violations && result.hard_legal_violations.length > 0 && (
                <div className="bg-red-950/40 border border-red-900/60 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-red-300 mb-2">⚠️ 检测到违法/超标项</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-200">
                    {result.hard_legal_violations.map((v: string, idx: number) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.compliance_verdict && (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">📝 法律合规诊断结论</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.compliance_verdict}
                  </p>
                </div>
              )}

              {result.actionable_rights_recovery_steps && (
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-emerald-300 mb-2">⚖️ 加泰罗尼亚官方维权与追讨步骤</h3>
                  <ul className="list-decimal list-inside space-y-2 text-sm text-slate-200">
                    {result.actionable_rights_recovery_steps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
