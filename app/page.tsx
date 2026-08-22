"use client";

import { useState } from "react";

// 后端 Render 部署地址
const BACKEND_URL = "https://bcn-housing-backend.onrender.com";

interface ValuationData {
  valuation_summary: {
    rating: string;
    adjusted_fair_value: string;
    variance_percentage: string;
    value_verdict: string;
  };
  location_and_address_analysis: string;
  district_profile: {
    livability_score: string;
    safety_score: string;
    key_pros: string[];
    key_cons: string[];
  };
  actionable_negotiation_strategy: string;
}

interface LegalRiskData {
  overall_risk_level: string;
  compliance_verdict: string;
  hard_legal_violations: string[];
  contract_text_analysis: string;
  actionable_rights_recovery_steps: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"evaluate" | "legal">("evaluate");
  const [loading, setLoading] = useState(false);

  // 评估表单状态
  const [intent, setIntent] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"entire" | "room">("entire");
  const [barrio, setBarrio] = useState("Eixample");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [floorLevel, setFloorLevel] = useState("Middle");
  const [hasElevator, setHasElevator] = useState(true);
  const [condition, setCondition] = useState("good");
  const [description, setDescription] = useState("");

  const [valuationResult, setValuationResult] = useState<ValuationData | null>(null);

  // 风控表单状态
  const [legalBarrio, setLegalBarrio] = useState("Eixample");
  const [legalAddress, setLegalAddress] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [agencyFeeAmount, setAgencyFeeAmount] = useState("");
  const [contractType, setContractType] = useState("LAU_LONG_TERM");
  const [agencyFeeCharged, setAgencyFeeCharged] = useState(false);
  const [contractText, setContractText] = useState("");

  const [legalResult, setLegalResult] = useState<LegalRiskData | null>(null);

  // 提交房产评估
  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValuationResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/evaluate-property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          rental_type: rentalType,
          barrio,
          address: address || undefined,
          price: parseFloat(price) || 0,
          area_sqm: areaSqm ? parseFloat(areaSqm) : undefined,
          bedrooms: parseInt(bedrooms) || 1,
          floor_level: floorLevel,
          has_elevator: hasElevator,
          condition,
          description: description || undefined,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setValuationResult(data.data);
      } else {
        alert(`评估错误: ${data.message || "请求失败"}`);
      }
    } catch (err: any) {
      alert(`网络请求异常: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 提交风控检测
  const handleCheckLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLegalResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/check-rental-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barrio: legalBarrio,
          address: legalAddress || undefined,
          monthly_rent: parseFloat(monthlyRent) || 0,
          deposit_amount: depositAmount ? parseFloat(depositAmount) : undefined,
          agency_fee_amount: agencyFeeAmount ? parseFloat(agencyFeeAmount) : undefined,
          contract_type: contractType,
          agency_fee_charged_to_tenant: agencyFeeCharged,
          contract_text: contractText || undefined,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setLegalResult(data.data);
      } else {
        alert(`风控检测错误: ${data.message || "请求失败"}`);
      }
    } catch (err: any) {
      alert(`网络请求异常: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 w-full">
      {/* 头部标题 */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          巴塞罗那房产智能评估与租务风控引擎
        </h1>
        <p className="mt-2 text-slate-600 text-sm sm:text-base">
          基于全域真实数据库与最新西班牙 housing law 法律模型的智能分析系统
        </p>
      </header>

      {/* 选项卡 */}
      <div className="flex border-b border-slate-200 mb-8 justify-center space-x-4">
        <button
          onClick={() => setActiveTab("evaluate")}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "evaluate"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🏠 房产估值与匹配分析
        </button>
        <button
          onClick={() => setActiveTab("legal")}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "legal"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          ⚖️ 租房法律与霸王条款风控
        </button>
      </div>

      {/* 选项卡 1：房产评估 */}
      {activeTab === "evaluate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleEvaluate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">录入房产信息</h2>

            {/* 意图与出租模式 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">交易类型</label>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value as any)}
                  className="w-full p-2 border rounded-md text-sm bg-slate-50"
                >
                  <option value="rent">租房 (Rent)</option>
                  <option value="buy">买房 (Buy)</option>
                </select>
              </div>
              {intent === "rent" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">租赁类型</label>
                  <select
                    value={rentalType}
                    onChange={(e) => setRentalType(e.target.value as any)}
                    className="w-full p-2 border rounded-md text-sm bg-slate-50"
                  >
                    <option value="entire">整租 (Entire Apartment)</option>
                    <option value="room">单间合租 (Room)</option>
                  </select>
                </div>
              )}
            </div>

            {/* 街区与地址 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">目标街区 *</label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-slate-50"
                >
                  <option value="Eixample">Eixample 扩展区</option>
                  <option value="Gràcia">Gràcia 恩西亚区</option>
                  <option value="Poblenou / Sant Martí">Poblenou / Sant Martí</option>
                  <option value="Ciutat Vella / Gòtic">Ciutat Vella / 哥特老城区</option>
                  <option value="Les Corts / Pedralbes">Les Corts / Pedralbes 豪宅区</option>
                  <option value="Sants-Montjuïc">Sants-Montjuïc 蒙特惠奇</option>
                  <option value="Sarrià-Sant Gervasi">Sarrià-Sant Gervasi 富人区</option>
                  <option value="Sant Andreu / Sagrera">Sant Andreu / 圣安德烈</option>
                  <option value="Horta-Guinardó">Horta-Guinardó 绿景区</option>
                  <option value="Nou Barris">Nou Barris 新营区</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">具体地址 (选填)</label>
                <input
                  type="text"
                  placeholder="例如: Carrer de Balmes 120"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>

            {/* 价格与面积 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {intent === "rent" ? "申请月租金 (€) *" : "房屋售价 (€) *"}
                </label>
                <input
                  type="number"
                  required
                  placeholder="如: 1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">建筑面积 (㎡)</label>
                <input
                  type="number"
                  placeholder="如: 65"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>

            {/* 户型与电梯 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">卧室数量</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">楼层</label>
                <select
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-slate-50"
                >
                  <option value="Middle">中层 (Middle)</option>
                  <option value="Ático">顶楼 (Ático)</option>
                  <option value="Bajo">底层 (Bajo)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">电梯</label>
                <select
                  value={hasElevator ? "true" : "false"}
                  onChange={(e) => setHasElevator(e.target.value === "true")}
                  className="w-full p-2 border rounded-md text-sm bg-slate-50"
                >
                  <option value="true">有电梯</option>
                  <option value="false">无电梯</option>
                </select>
              </div>
            </div>

            {/* 房屋状况与自由表达 */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">房屋状况</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2 border rounded-md text-sm bg-slate-50 mb-3"
              >
                <option value="good">良好/正常入住 (Good)</option>
                <option value="renovated">精装修/新修缮 (Renovated)</option>
                <option value="needs_renovation">需翻新/老旧 (Needs Renovation)</option>
              </select>

              <label className="block text-xs font-semibold text-slate-600 mb-1">自由补充表达 (选填)</label>
              <textarea
                rows={2}
                placeholder="例如: 带有阳台采光好，紧邻地铁站，希望评估是否适合学生居住..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors shadow"
            >
              {loading ? "正在智能精算评估中..." : "🚀 生成 AI 房产评估报告"}
            </button>
          </form>

          {/* 评估结果显示 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">评估报告</h2>
            {loading && <p className="text-slate-500 text-sm animate-pulse">正在调用 Groq AI 分析巴塞罗那地产数据...</p>}
            {!loading && !valuationResult && (
              <p className="text-slate-400 text-sm">请在左侧填写房产信息并点击生成评估报告。</p>
            )}
            {valuationResult && (
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-900">{valuationResult.valuation_summary.rating}</span>
                    <span className="text-xs text-blue-700 font-semibold">
                      公允估值: {valuationResult.valuation_summary.adjusted_fair_value}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">{valuationResult.valuation_summary.value_verdict}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">📍 地段与地址分析</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{valuationResult.location_and_address_analysis}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-50 p-2 rounded">
                    <span className="font-semibold text-emerald-800">✅ 街区优势:</span>
                    <ul className="list-disc list-inside text-emerald-700 mt-1">
                      {valuationResult.district_profile.key_pros.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-50 p-2 rounded">
                    <span className="font-semibold text-rose-800">⚠️ 注意事项:</span>
                    <ul className="list-disc list-inside text-rose-700 mt-1">
                      {valuationResult.district_profile.key_cons.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">💡 议价与谈判策略</h3>
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {valuationResult.actionable_negotiation_strategy}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 选项卡 2：法律与风控检测 */}
      {activeTab === "legal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleCheckLegal} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">租房合同与合规审查</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">街区 *</label>
                <input
                  type="text"
                  required
                  value={legalBarrio}
                  onChange={(e) => setLegalBarrio(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">月租金 (€) *</label>
                <input
                  type="number"
                  required
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">实收押金金额 (€)</label>
                <input
                  type="number"
                  placeholder="例如: 2400"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">实收中介费 (€)</label>
                <input
                  type="number"
                  placeholder="例如: 1200"
                  value={agencyFeeAmount}
                  onChange={(e) => setAgencyFeeAmount(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">合同类型</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-slate-50"
                >
                  <option value="LAU_LONG_TERM">LAU 长期居留合同 (Long-Term)</option>
                  <option value="TEMPORADA">Temporada 季节性/临时合同</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agencyFeeCharged}
                    onChange={(e) => setAgencyFeeCharged(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>中介向租客收取了中介费</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">合同条款文本 / 微信聊天记录 (选填)</label>
              <textarea
                rows={4}
                placeholder="粘贴合同中的争议条款或与中介/房东的聊天记录..."
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md text-sm transition-colors shadow"
            >
              {loading ? "正在审查风控指标..." : "⚖️ 提交进行法律合规审查"}
            </button>
          </form>

          {/* 风控结果显示 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">风控合规判定报告</h2>
            {loading && <p className="text-slate-500 text-sm animate-pulse">正在比对西班牙 Ley 12/2023 住房法与加泰罗尼亚租务法...</p>}
            {!loading && !legalResult && (
              <p className="text-slate-400 text-sm">请在左侧录入租房合同相关数据进行风险检测。</p>
            )}
            {legalResult && (
              <div className="space-y-4 text-sm">
                <div
                  className={`p-3 rounded-lg border ${
                    legalResult.overall_risk_level === "RED"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : legalResult.overall_risk_level === "YELLOW"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div className="font-bold mb-1">风险等级: {legalResult.overall_risk_level}</div>
                  <p className="text-xs">{legalResult.compliance_verdict}</p>
                </div>

                {legalResult.hard_legal_violations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-rose-700 mb-1">🚨 确认的违法条款清单:</h3>
                    <ul className="list-disc list-inside text-xs text-rose-600 space-y-1 bg-rose-50 p-2 rounded">
                      {legalResult.hard_legal_violations.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">📄 文本细节与条款分析</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{legalResult.contract_text_analysis}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">🛡️ 维权与退款指引</h3>
                  <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded">
                    {legalResult.actionable_rights_recovery_steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}