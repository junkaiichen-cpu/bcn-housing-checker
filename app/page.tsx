"use client";

import React, { useState, useMemo } from "react";
import { 
  Building2, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  MapPin, 
  Loader2,
  FileText
} from "lucide-react";

const BCN_DISTRICTS = [
  { name: "Eixample (扩展区)", sub: ["Eixample Esquerra", "Eixample Dreta", "Sant Antoni", "Sagrada Família", "Fort Pienc"] },
  { name: "Gràcia (恩典区)", sub: ["Vila de Gràcia", "Camp d'en Grassot", "Vallcarca", "El Coll", "La Salut"] },
  { name: "Poblenou / Sant Martí", sub: ["El Poblenou", "Diagonal Mar", "El Besòs", "Provençals del Poblenou"] },
  { name: "Ciutat Vella (老城区)", sub: ["El Gòtic", "El Raval", "El Born / Sant Pere", "La Barceloneta"] },
  { name: "Les Corts / Pedralbes", sub: ["Les Corts", "Pedralbes", "Maternitat i Sant Ramon"] },
  { name: "Sants-Montjuïc (圣徒区)", sub: ["Sants", "Poble Sec", "Hostafrancs", "La Bordeta"] },
  { name: "Sarrià-Sant Gervasi (富人区)", sub: ["Sarrià", "Sant Gervasi - Galvany", "El Putxet", "Tres Torres"] },
  { name: "Sant Andreu / Sagrera", sub: ["Sant Andreu de Palomar", "La Sagrera", "Congrés", "Navas"] },
  { name: "Horta-Guinardó", sub: ["El Carmel", "Horta", "Guinardó", "Can Baró"] },
  { name: "Nou Barris", sub: ["Vilapicina", "Porta", "Roquetes", "Verdum"] }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"evaluate" | "risk">("evaluate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [evalForm, setEvalForm] = useState({
    intent: "rent",
    rental_type: "entire",
    barrio: "Eixample (扩展区)",
    address: "",
    price: 1300,
    area_sqm: 65,
    bedrooms: 2,
    floor_level: "Middle",
    has_elevator: true,
    condition: "good"
  });

  const [riskForm, setRiskForm] = useState({
    barrio: "Eixample (扩展区)",
    address: "",
    monthly_rent: 1300,
    deposit_amount: 2600,
    agency_fee_amount: 0,
    contract_type: "LAU_LONG_TERM",
    agency_fee_charged_to_tenant: false,
    contract_text: ""
  });

  const depositFoolproofWarning = useMemo(() => {
    const isLau = riskForm.contract_type === "LAU_LONG_TERM";
    const maxLegal = riskForm.monthly_rent * (isLau ? 3 : 2);
    if (riskForm.deposit_amount > maxLegal) {
      return `防呆预警：您填写的押金 (${riskForm.deposit_amount}€) 超过西班牙 ${isLau ? 'LAU长租法定上限 (3个月租金=' + maxLegal + '€)' : '短租标准上限 (2个月租金=' + maxLegal + '€)'}！`;
    }
    return null;
  }, [riskForm]);

  const agencyFeeFoolproofWarning = useMemo(() => {
    if (riskForm.contract_type === "LAU_LONG_TERM" && (riskForm.agency_fee_charged_to_tenant || riskForm.agency_fee_amount > 0)) {
      return "防呆预警：依据西班牙 Ley 12/2023 住房法，LAU 长租中介费强收属于【绝对违法】！";
    }
    return null;
  }, [riskForm]);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("https://bcn-housing-backend.onrender.com/api/evaluate-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalForm)
      });
      const data = await res.json();
      if (data.status === "success") setResult(data.data);
      else alert("评估失败: " + data.message);
    } catch (err) {
      alert("无法连接后端，请确认 FastAPI 正在 8000 端口运行");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("https://bcn-housing-backend.onrender.com/api/check-rental-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riskForm)
      });
      const data = await res.json();
      if (data.status === "success") setResult(data.data);
      else alert("风控检查失败: " + data.message);
    } catch (err) {
      alert("无法连接后端，请确认 FastAPI 正在 8000 端口运行");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-slate-900 text-white py-6 px-4 shadow-md mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">BCN Housing Intelligence</h1>
              <p className="text-xs text-slate-400">巴塞罗那全域房产精算与租务风控系统 v6.0</p>
            </div>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-mono">
            Pro MVP
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab("evaluate"); setResult(null); }}
            className={`flex-1 py-3 font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "evaluate" ? "bg-white shadow text-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 1. 房产估值与竞品分析
          </button>
          <button
            onClick={() => { setActiveTab("risk"); setResult(null); }}
            className={`flex-1 py-3 font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "risk" ? "bg-white shadow text-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> 2. 租房法律风控与合同审查
          </button>
        </div>

        {activeTab === "evaluate" && (
          <form onSubmit={handleEvaluate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">评估类型</label>
              <select 
                value={evalForm.intent} 
                onChange={e => setEvalForm({...evalForm, intent: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              >
                <option value="rent">租房估值 (Rent Evaluation)</option>
                <option value="buy">买房/投资评估 (Investment Evaluation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">租赁模式 (仅租房生效)</label>
              <select 
                value={evalForm.rental_type} 
                onChange={e => setEvalForm({...evalForm, rental_type: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              >
                <option value="entire">整租 (Vivienda Completa)</option>
                <option value="room">单间合租 (Habitación)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">行政区 (Distrito)</label>
              <select 
                value={evalForm.barrio} 
                onChange={e => setEvalForm({...evalForm, barrio: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              >
                {BCN_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name} ({d.sub.join(", ")})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">具体地址 / 门牌 (可选)</label>
              <input 
                type="text" 
                placeholder="例如: Carrer de Balmes 120"
                value={evalForm.address} 
                onChange={e => setEvalForm({...evalForm, address: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {evalForm.intent === "rent" ? (evalForm.rental_type === "room" ? "单间月租金 (€/月)" : "整租月租金 (€/月)") : "房屋总售价 (€)"}
              </label>
              <input 
                type="number" 
                value={evalForm.price} 
                onChange={e => setEvalForm({...evalForm, price: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {evalForm.rental_type === "room" ? "单间使用面积 (㎡)" : "整套建筑面积 (㎡)"}
              </label>
              <input 
                type="number" 
                value={evalForm.area_sqm} 
                onChange={e => setEvalForm({...evalForm, area_sqm: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">房屋总卧室数</label>
              <input 
                type="number" 
                value={evalForm.bedrooms} 
                onChange={e => setEvalForm({...evalForm, bedrooms: parseInt(e.target.value) || 1})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">房屋状况</label>
              <select 
                value={evalForm.condition} 
                onChange={e => setEvalForm({...evalForm, condition: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              >
                <option value="good">良好 (Good)</option>
                <option value="renovated">精装修 (Renovated)</option>
                <option value="needs_renovation">需翻新 (Needs Renovation)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-6 py-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={evalForm.has_elevator} 
                  onChange={e => setEvalForm({...evalForm, has_elevator: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                配备电梯 (Elevator)
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="md:col-span-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "正在调取加泰官方全域数据库精算中..." : "开始多维估值与竞品分析"}
            </button>
          </form>
        )}

        {activeTab === "risk" && (
          <form onSubmit={handleCheckRisk} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">行政区 (Distrito)</label>
              <select 
                value={riskForm.barrio} 
                onChange={e => setRiskForm({...riskForm, barrio: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              >
                {BCN_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">具体地址 (可选)</label>
              <input 
                type="text" 
                placeholder="例如: Carrer de Girona 45"
                value={riskForm.address} 
                onChange={e => setRiskForm({...riskForm, address: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">月租金 (€)</label>
              <input 
                type="number" 
                value={riskForm.monthly_rent} 
                onChange={e => setRiskForm({...riskForm, monthly_rent: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">实收押金金额 (€)</label>
              <input 
                type="number" 
                value={riskForm.deposit_amount} 
                onChange={e => setRiskForm({...riskForm, deposit_amount: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">实收中介服务费金额 (€)</label>
              <input 
                type="number" 
                value={riskForm.agency_fee_amount} 
                onChange={e => setRiskForm({...riskForm, agency_fee_amount: parseFloat(e.target.value) || 0})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">合同类型</label>
              <select 
                value={riskForm.contract_type} 
                onChange={e => setRiskForm({...riskForm, contract_type: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              >
                <option value="LAU_LONG_TERM">LAU 常规长租 (常驻/长期)</option>
                <option value="TEMPORADA">Temporada 季节性短租 (&lt;11个月)</option>
              </select>
            </div>

            {(depositFoolproofWarning || agencyFeeFoolproofWarning) && (
              <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs space-y-1">
                {depositFoolproofWarning && <div className="flex items-center gap-1 font-bold"><AlertTriangle className="w-4 h-4" /> {depositFoolproofWarning}</div>}
                {agencyFeeFoolproofWarning && <div className="flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> {agencyFeeFoolproofWarning}</div>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">粘贴合同条款 / 房东聊天记录 / 疑虑描述</label>
              <textarea 
                rows={3}
                placeholder="可以直接粘贴 WhatsApp 聊天记录或合同中关于押金退还、Gastos 水电费、保养维修等条款..."
                value={riskForm.contract_text} 
                onChange={e => setRiskForm({...riskForm, contract_text: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="md:col-span-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
              {loading ? "正在依据西班牙 12/2023 住房法深度扫描中..." : "开启法律风控合规审查"}
            </button>
          </form>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.overall_risk_level && (
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                result.overall_risk_level === "RED" ? "bg-red-50 border-red-200 text-red-900" :
                result.overall_risk_level === "YELLOW" ? "bg-amber-50 border-amber-200 text-amber-900" :
                "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}>
                {result.overall_risk_level === "RED" ? <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" /> :
                 result.overall_risk_level === "YELLOW" ? <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" /> :
                 <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />}
                <div>
                  <div className="font-bold text-lg">风险等级: {result.overall_risk_level}</div>
                  <div className="text-sm opacity-90">{result.compliance_verdict}</div>
                </div>
              </div>
            )}

            {result.valuation_summary && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase">综合评估结论</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{result.valuation_summary.rating}</div>
                  <div className="text-sm text-slate-600 mt-1">{result.valuation_summary.value_verdict}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">公允估值算力推算</div>
                  <div className="text-xl font-bold text-blue-600">{result.valuation_summary.adjusted_fair_value}</div>
                  <div className="text-xs font-semibold text-slate-500">偏差: {result.valuation_summary.variance_percentage}</div>
                </div>
              </div>
            )}

            {result.hard_legal_violations && result.hard_legal_violations.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200">
                <h3 className="font-bold text-red-600 flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5" /> 扫描到硬性违法或风险预警
                </h3>
                <ul className="space-y-2">
                  {result.hard_legal_violations.map((v: string, idx: number) => (
                    <li key={idx} className="bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                      <span className="font-bold">•</span> {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.contract_text_analysis && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> 合同/聊天记录霸王条款识别
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                  {result.contract_text_analysis}
                </div>
              </div>
            )}

            {result.location_and_address_analysis && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> 地段与周边优势分析
                </h3>
                <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-blue-950 border border-blue-100">
                  {result.location_and_address_analysis}
                </div>
              </div>
            )}

            {result.actionable_rights_recovery_steps && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> 专家建议与维权谈判行动指南
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {result.actionable_rights_recovery_steps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">{idx + 1}.</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
