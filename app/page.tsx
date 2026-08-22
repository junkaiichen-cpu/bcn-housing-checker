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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  const [formData, setFormData] = useState({
    eval_type: "rent",
    lease_mode: "complete",
    district: "Eixample (扩展区)",
    neighborhood: "Eixample Esquerra (左扩展)",
    address: "",
    price: 1300,
    size: 75,
    bedrooms: 2,
    bathrooms: 1,
    floor: "3楼 (3º Piso)",
    condition: "Renovated (精装修)",
    elevator: true,
    balcony: true,
    furnished: "带全套家具 (Furnished)",
    energy_certificate: "D",
    user_custom_requirements: ""
  });

  const handleDistrictChange = (d: string) => {
    const defaultNeighborhood = DISTRICT_BARRIOS[d]?.[0] || "";
    setFormData({ ...formData, district: d, neighborhood: defaultNeighborhood });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalysisResult("");

    try {
      const res = await fetch("https://bcn-housing-backend.onrender.com/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === "success") {
        setAnalysisResult(data.analysis);
      } else {
        alert("分析失败: " + JSON.stringify(data));
      }
    } catch (err: any) {
      alert("请求异常，请稍后重试: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-slate-100">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-indigo-600">BCN Housing Intelligence v6.5 Pro</h1>
          <p className="text-slate-500 mt-1">巴塞罗那全域房产精算、租务法律风控与智能房源匹配系统</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 模式与类型 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">评估类型</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.eval_type}
                onChange={e => setFormData({...formData, eval_type: e.target.value})}
              >
                <option value="rent">租房估值与风控 (Rent Evaluation)</option>
                <option value="investment">买房/投资回报评估 (Investment Evaluation)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">租赁类型</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.lease_mode}
                onChange={e => setFormData({...formData, lease_mode: e.target.value})}
              >
                <option value="complete">常驻长租-整租 (LAU 5年/7年)</option>
                <option value="temporal">中短期常驻 (Temporal 3-11个月)</option>
                <option value="room">单间合租 (Habitación)</option>
                <option value="coliving">品牌青年公寓/Co-living</option>
              </select>
            </div>
          </div>

          {/* 行政区与具体 Barrio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">行政区 (Distrito)</label>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.district}
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
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.neighborhood}
                onChange={e => setFormData({...formData, neighborhood: e.target.value})}
              >
                {DISTRICT_BARRIOS[formData.district]?.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 价格与物理属性 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">价格 (€/月 或 总价)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">建筑面积 (㎡)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg"
                value={formData.size}
                onChange={e => setFormData({...formData, size: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">卧室数量</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg"
                value={formData.bedrooms}
                onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">卫浴数量</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg"
                value={formData.bathrooms}
                onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* 楼层、装修、家具 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">所在楼层</label>
              <select 
                className="w-full p-3 border rounded-lg"
                value={formData.floor}
                onChange={e => setFormData({...formData, floor: e.target.value})}
              >
                <option value="Planta Baja (底层/沿街)">Planta Baja (底层/沿街)</option>
                <option value="Principal / Entresuelo (一楼/夹层)">Principal / Entresuelo (一楼/夹层)</option>
                <option value="3-5楼 (Planta Media)">3-5楼 (Planta Media)</option>
                <option value="Ático / Sobreático (顶层带露台)">Ático / Sobreático (顶层/顶层带露台)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">房屋状况</label>
              <select 
                className="w-full p-3 border rounded-lg"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
              >
                <option value="Good (良好可直接入住)">良好 (Good)</option>
                <option value="Renovated (精装修)">精装修 (Renovated)</option>
                <option value="Needs Renovation (需翻新)">需翻新 (Needs Renovation)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">家具配置</label>
              <select 
                className="w-full p-3 border rounded-lg"
                value={formData.furnished}
                onChange={e => setFormData({...formData, furnished: e.target.value})}
              >
                <option value="带全套家具 (Furnished)">带全套家具 (Furnished)</option>
                <option value="不带家具 (Unfurnished)">不带家具 (Unfurnished)</option>
                <option value="部分家具 (Semi-furnished)">部分家具 (Semi-furnished)</option>
              </select>
            </div>
          </div>

          {/* 选项复选框 */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.elevator} 
                onChange={e => setFormData({...formData, elevator: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium">配备电梯 (Ascensor)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.balcony} 
                onChange={e => setFormData({...formData, balcony: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium">带阳台/露台 (Balcón/Terraza)</span>
            </label>
          </div>

          {/* 自定义需求与房源查找输入 */}
          <div>
            <label className="block text-sm font-semibold mb-2">个性化需求与房源寻找偏好（用于AI推荐与深度风控）</label>
            <textarea 
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：我是 UPF 的学生，希望租金控制在 1200€ 以内，通勤在 25 分钟以内，希望带采光好的阳台。或者粘贴具体的 Idealista 链接描述..."
              value={formData.user_custom_requirements}
              onChange={e => setFormData({...formData, user_custom_requirements: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-200"
          >
            {loading ? "正在调取巴塞罗那数据库与 AI 深度算力分析中..." : "生成深度精算报告与房源推荐"}
          </button>
        </form>

        {/* 结果显示区域 */}
        {analysisResult && (
          <div className="mt-10 p-6 bg-slate-900 text-slate-100 rounded-xl shadow-2xl overflow-auto leading-relaxed whitespace-pre-wrap">
            <h2 className="text-xl font-bold text-green-400 mb-4 pb-2 border-b border-slate-700">分析与推荐报告</h2>
            {analysisResult}
          </div>
        )}
      </div>
    </main>
  );
}
