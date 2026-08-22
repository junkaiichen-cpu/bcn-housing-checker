"use client";

import React, { useState } from 'react';

const DISTRICT_BARRIOS: Record<string, string[]> = {
  "Eixample (扩展区)": ["Eixample Esquerra (左扩展)", "Eixample Dreta (右扩展)", "Sant Antoni", "Sagrada Família", "Fort Pienc"],
  "Gràcia (恩典区)": ["Vila de Gràcia", "Camp d'en Grassot", "Vallcarca i els Penitents", "El Coll", "La Salut"],
  "Poblenou / Sant Martí": ["El Poblenou", "Diagonal Mar i el Front Marítim", "El Besòs i el Maresme", "Provençals del Poblenou", "Sant Martí de Provençals", "El Clot"],
  "Ciutat Vella (老城区)": ["El Gòtic", "El Raval", "El Born / Sant Pere", "La Barceloneta"],
  "Les Corts / Pedralbes": ["Les Corts", "Pedralbes", "La Maternitat i Sant Ramon"],
  "Sants-Montjuïc": ["Sants", "Poble Sec", "Hostafrancs", "La Bordeta", "Font de la Guatlla", "La Marina"],
  "Sarrià-Sant Gervasi (富人区)": ["Sarrià", "Sant Gervasi - Galvany", "Sant Gervasi - La Bonanova", "El Putxet i el Farró", "Les Tres Torres", "Vallvidrera"],
  "Sant Andreu / Sagrera": ["Sant Andreu de Palomar", "La Sagrera", "El Congrés i els Indians", "Navas"],
  "Horta-Guinardó": ["El Carmel", "Horta", "El Guinardó", "Can Baró"],
  "Nou Barris": ["Vilapicina i la Torre Llobeta", "Porta", "Roquetes", "Verdum", "Trinitat Nova"],
  "近郊热门区域 (Outer BCN)": ["L'Hospitalet de Llobregat", "Badalona", "Sant Cugat del Vallès", "Esplugues de Llobregat"]
};

// 后端域名地址
const API_BASE_URL = "https://bcn-housing-backend.onrender.com";

interface ValuationData {
  valuation_summary?: {
    rating?: string;
    adjusted_fair_value?: string;
    variance_percentage?: string;
    value_verdict?: string;
  };
  location_and_address_analysis?: string;
  district_profile?: {
    livability_score?: string;
    safety_score?: string;
    key_pros?: string[];
    key_cons?: string[];
  };
  actionable_negotiation_strategy?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'eval' | 'risk'>('eval');
  const [loading, setLoading] = useState(false);
  
  const [evalResult, setEvalResult] = useState<ValuationData | null>(null);
  const [riskResult, setRiskResult] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    intent: "rent",
    rental_type: "entire",
    barrio: "Eixample (扩展区)",
    sub_barrio: "Eixample Esquerra (左扩展)",
    address: "", // 具体地址
    price: 1300,
    area_sqm: 75,
    bedrooms: 2,
    bathrooms: 1,
    floor_level: "Middle",
    condition: "renovated",
    has_elevator: true,
    has_balcony: true,
    user_description: "", // 房产自由描述表达
    contract_type: "LAU_LONG_TERM",
    deposit_amount: 2600,
    agency_fee_charged: false,
    contract_text: "" // 法律风控备注文本
  });

  const handleDistrictChange = (d: string) => {
    const defaultSub = DISTRICT_BARRIOS[d]?.[0] || "";
    setFormData({ ...formData, barrio: d, sub_barrio: defaultSub });
  };

  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEvalResult(null);

    const fullAddress = formData.address 
      ? `${formData.sub_barrio}, ${formData.address}`
      : `${formData.sub_barrio}`;

    const payload = {
      intent: formData.intent,
      rental_type: formData.rental_type,
      barrio: formData.barrio.split(" ")[0],
      address: fullAddress,
      price: formData.price,
      area_sqm: formData.area_sqm,
      bedrooms: formData.bedrooms,
      floor_level: formData.floor_level,
      has_elevator: formData.has_elevator,
      condition: formData.condition,
      description: formData.user_description
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/evaluate-property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        setEvalResult(data.data);
      } else {
        alert("评估失败: " + JSON.stringify(data));
      }
    } catch (err: any) {
      alert("网络请求异常，请检查后端服务连通性");
    } finally {
      setLoading(false);
    }
  };

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRiskResult(null);

    const payload = {
      barrio: formData.barrio.split(" ")[0],
      address: formData.address,
      monthly_rent: formData.price,
      deposit_amount: formData.deposit_amount,
      contract_type: formData.contract_type,
      agency_fee_charged_to_tenant: formData.agency_fee_charged,
      contract_text: formData.contract_text
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/check-rental-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        setRiskResult(data.data);
      } else {
        alert("风控审查失败: " + JSON.stringify(data));
      }
    } catch (err: any) {
      alert("网络请求异常，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-slate-100">
        <header className="mb-8 border-b pb-4 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-indigo-600">🏰 BCN Housing Intelligence Pro</h1>
          <p className="text-slate-500 mt-1">巴塞罗那全域房产精算、租务法律风控与智能房源匹配系统</p>
        </header>

        {/* 双功能切换 Tab */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('eval')}
            className={`flex-1 py-3 font-bold rounded-lg text-sm transition-all ${
              activeTab === 'eval' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏠 房产智能精算与估值
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-3 font-bold rounded-lg text-sm transition-all ${
              activeTab === 'risk' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚖️ 租务合规与霸王条款审查
          </button>
        </div>

        {/* 表单区域 */}
        <form onSubmit={activeTab === 'eval' ? handleEvalSubmit : handleRiskSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">交易意图与模式</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                value={formData.intent}
                onChange={e => setFormData({...formData, intent: e.target.value})}
              >
                <option value="rent">租房 (Alquiler)</option>
                <option value="buy">买房/投资 (Compra)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">租赁方式</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                value={formData.rental_type}
                onChange={e => setFormData({...formData, rental_type: e.target.value})}
              >
                <option value="entire">整租 (Vivienda Completa - LAU 5年/7年)</option>
                <option value="room">单间合租 (Habitación)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">行政区 (Distrito)</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                value={formData.barrio}
                onChange={e => handleDistrictChange(e.target.value)}
              >
                {Object.keys(DISTRICT_BARRIOS).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">具体街区 (Barrio)</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                value={formData.sub_barrio}
                onChange={e => setFormData({...formData, sub_barrio: e.target.value})}
              >
                {DISTRICT_BARRIOS[formData.barrio]?.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 补充具体地址输入框 */}
          <div>
            <label className="block text-sm font-semibold mb-2">具体地址 / 门牌号（选填，精确分析地段与周边）</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="例如: Carrer de Balmes 120, 3º 1ª"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">价格 (€/月 或 总价)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">建筑面积 (㎡)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.area_sqm}
                onChange={e => setFormData({...formData, area_sqm: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">卧室数量</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.bedrooms}
                onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">所在楼层</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                value={formData.floor_level}
                onChange={e => setFormData({...formData, floor_level: e.target.value})}
              >
                <option value="Middle">中层 (Planta Media)</option>
                <option value="Ático">顶楼带露台 (Ático)</option>
                <option value="Bajo">底层/沿街 (Bajo)</option>
              </select>
            </div>
          </div>

          {/* 评估模式下的自由表达输入框 */}
          {activeTab === 'eval' && (
            <div>
              <label className="block text-sm font-semibold mb-2">房源自由补充表达（选填，如采光、新旧程度、交通要求等）</label>
              <textarea 
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：精装修带家具、靠近 L3 地铁站、带有 20 平方米南向大露台、带独立车库等..."
                value={formData.user_description}
                onChange={e => setFormData({...formData, user_description: e.target.value})}
              />
            </div>
          )}

          {/* 风控专有选项 */}
          {activeTab === 'risk' && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-4">
              <h3 className="font-bold text-rose-800 text-sm">⚖️ 租务合规与霸王条款专项审查</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">合同类型</label>
                  <select 
                    className="w-full p-3 border rounded-lg bg-white"
                    value={formData.contract_type}
                    onChange={e => setFormData({...formData, contract_type: e.target.value})}
                  >
                    <option value="LAU_LONG_TERM">LAU 长期居留合同 (5年/7年)</option>
                    <option value="TEMPORADA">Temporada 季节性/短期合同</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">实收押金 (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border rounded-lg"
                    value={formData.deposit_amount}
                    onChange={e => setFormData({...formData, deposit_amount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="agency_fee"
                  checked={formData.agency_fee_charged} 
                  onChange={e => setFormData({...formData, agency_fee_charged: e.target.checked})}
                  className="w-5 h-5 text-rose-600 rounded"
                />
                <label htmlFor="agency_fee" className="text-sm font-semibold text-rose-900 cursor-pointer">
                  中介/房东向你（租客）收取了中介服务费 (Honorarios de Agencia)
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">粘贴合同条款或对话记录（AI 审查霸王条款）</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="例如：合同规定退租时扣除 500 欧清洁费、或者要求提前 3 个月书面通知等..."
                  value={formData.contract_text}
                  onChange={e => setFormData({...formData, contract_text: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.has_elevator} 
                onChange={e => setFormData({...formData, has_elevator: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium">配备电梯 (Ascensor)</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-4 rounded-xl shadow-lg transition duration-200 text-white ${
              activeTab === 'eval' 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            {loading ? "正在调取巴塞罗那数据库与 AI 深度算力分析中..." : (activeTab === 'eval' ? "生成深度精算评估报告" : "提交租务风险判定审查")}
          </button>
        </form>

        {/* 结果展示卡片：房产精算结果 */}
        {evalResult && (
          <div className="mt-10 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 border-b pb-2">📊 房产估值与溢价分析报告</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl">
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">评级推荐</span>
                <p className="text-xl font-black text-indigo-900 mt-1">{evalResult.valuation_summary?.rating}</p>
              </div>
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">公允估值</span>
                <p className="text-xl font-black text-emerald-900 mt-1">{evalResult.valuation_summary?.adjusted_fair_value}</p>
              </div>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">价格偏差率</span>
                <p className="text-xl font-black text-amber-900 mt-1">{evalResult.valuation_summary?.variance_percentage}</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-800">💡 评估综合诊断结论</h3>
              <p className="text-slate-600 leading-relaxed">{evalResult.valuation_summary?.value_verdict}</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-800">📍 地段与交通宜居分析</h3>
              <p className="text-slate-600 leading-relaxed">{evalResult.location_and_address_analysis}</p>
            </div>

            <div className="p-5 bg-indigo-900 text-white rounded-xl space-y-2 shadow-lg">
              <h3 className="font-bold text-indigo-200">🤝 建议谈判与议价策略</h3>
              <p className="text-indigo-100 leading-relaxed">{evalResult.actionable_negotiation_strategy}</p>
            </div>
          </div>
        )}

        {/* 结果展示卡片：租务风控诊断 */}
        {riskResult && (
          <div className="mt-10 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 border-b pb-2">⚖️ 租务合规诊断书</h2>

            <div className={`p-5 rounded-xl border ${
              riskResult.overall_risk_level === 'RED' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">风险等级判定：{riskResult.overall_risk_level}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{riskResult.compliance_verdict}</p>
            </div>

            {riskResult.hard_legal_violations?.length > 0 && (
              <div className="p-5 bg-rose-100 border border-rose-300 rounded-xl space-y-2">
                <h3 className="font-bold text-rose-900">🚨 确诊违法/违规条款</h3>
                <ul className="list-disc pl-5 space-y-1 text-rose-800 text-sm">
                  {riskResult.hard_legal_violations.map((v: string, idx: number) => (
                    <li key={idx}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-800">📄 详细条款分析</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{riskResult.contract_text_analysis}</p>
            </div>

            {riskResult.actionable_rights_recovery_steps?.length > 0 && (
              <div className="p-5 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                <h3 className="font-bold text-emerald-400">🛡️ 维权与退款行动指南</h3>
                <ul className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
                  {riskResult.actionable_rights_recovery_steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
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