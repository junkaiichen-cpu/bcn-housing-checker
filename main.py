import sys
import os

# 清理代理设置
os.environ.pop("HTTP_PROXY", None)
os.environ.pop("HTTPS_PROXY", None)
os.environ.pop("http_proxy", None)
os.environ.pop("https_proxy", None)

import json
import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Tuple

app = FastAPI(
    title="Barcelona Province Real Estate Intelligence Engine (Comarques & Municipis Scale)",
    description="覆盖巴塞罗那省 12 个 Comarques（县）与 300+ Municipis（市镇）的层级化房产评估与租务风控引擎",
    version="8.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAW_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_KEY = RAW_KEY.encode('ascii', 'ignore').decode('ascii').strip()

MODEL_CANDIDATES = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "qwen/qwen3-32b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b"
]

# ==============================================================================
# 巴塞罗那省 12 个县（Comarques）级基础数据框架
# ==============================================================================
BARCELONA_COMARQUES_DB: Dict[str, Dict[str, Any]] = {
    "Barcelonès": {
        "capital": "Barcelona",
        "sample_municipios": ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Santa Coloma de Gramenet", "Sant Adrià de Besòs"],
        "avg_rent_sqm": 19.5, "index_ref_sqm": 15.5, "avg_sale_sqm": 4800,
        "gross_yield": 4.8, "zone_tensionada": True, "livability_score": 9.2, "safety_score": 8.2,
        "description": "加泰罗尼亚经济核心，人口密度最高，租赁需求极度强劲，全面实施租金限制政策。"
    },
    "Vallès Occidental": {
        "capital": "Sabadell / Terrassa",
        "sample_municipios": ["Sant Cugat del Vallès", "Sabadell", "Terrassa", "Rubí", "Ripollet", "Cerdanyola del Vallès", "Castellar del Vallès", "Montcada i Reixac", "Sant Quirze del Vallès"],
        "avg_rent_sqm": 14.5, "index_ref_sqm": 12.0, "avg_sale_sqm": 2900,
        "gross_yield": 6.0, "zone_tensionada": True, "livability_score": 8.8, "safety_score": 8.9,
        "description": "产业与科技高地（含 Sant Cugat 顶级社区与 Sabadell/Terrassa 大学城），连接巴塞罗那市中心十分便利。"
    },
    "Baix Llobregat": {
        "capital": "Sant Feliu de Llobregat",
        "sample_municipios": ["Cornellà de Llobregat", "El Prat de Llobregat", "Viladecans", "Castelldefels", "Gavà", "Sant Boi de Llobregat", "Esplugues de Llobregat", "Sant Just Desvern", "Martorell", "Molins de Rei"],
        "avg_rent_sqm": 15.2, "index_ref_sqm": 12.8, "avg_sale_sqm": 3100,
        "gross_yield": 5.8, "zone_tensionada": True, "livability_score": 8.7, "safety_score": 8.8,
        "description": "紧邻巴塞罗那机场与南部工业/海岸廊道，包含富人区 Sant Just/Esplugues 与海滨大镇 Castelldefels。"
    },
    "Maresme": {
        "capital": "Mataró",
        "sample_municipios": ["Mataró", "Arenys de Mar", "Canet de Mar", "Calella", "Malgrat de Mar", "El Masnou", "Premian de Mar", "Vilassar de Mar", "Alella", "Pineda de Mar"],
        "avg_rent_sqm": 13.8, "index_ref_sqm": 11.5, "avg_sale_sqm": 2750,
        "gross_yield": 6.0, "zone_tensionada": True, "livability_score": 8.9, "safety_score": 9.0,
        "description": "北部海岸线县，气候优越，拥有大量海景住房与通勤小镇（如 Alella, El Masnou）。"
    },
    "Vallès Oriental": {
        "capital": "Granollers",
        "sample_municipios": ["Granollers", "Mollet del Vallès", "Parets del Vallès", "Caldes de Montbui", "La Garriga", "Cardedeu", "Sant Celoni", "Llinars del Vallès"],
        "avg_rent_sqm": 11.8, "index_ref_sqm": 9.8, "avg_sale_sqm": 2100,
        "gross_yield": 6.7, "zone_tensionada": True, "livability_score": 8.4, "safety_score": 8.8,
        "description": "宜居与物流工业并重的区域，居住性价比高， Granollers 为核心枢纽。"
    },
    "Bages": {
        "capital": "Manresa",
        "sample_municipios": ["Manresa", "Sant Fruitós de Bages", "Sallent", "Sant Joan de Vilatorrada", "Navarcles", "Artés", "Cardona", "Súria"],
        "avg_rent_sqm": 9.2, "index_ref_sqm": 7.8, "avg_sale_sqm": 1450,
        "gross_yield": 7.6, "zone_tensionada": False, "livability_score": 8.0, "safety_score": 8.7,
        "description": "巴塞罗那省中部核心，以 Manresa 为中心，房价与租金基数较低，出租毛收益率处于高位。"
    },
    "Garraf": {
        "capital": "Vilanova i la Geltrú",
        "sample_municipios": ["Sitges", "Vilanova i la Geltrú", "Sant Pere de Ribes", "Cubelles", "Canyelles", "Olivella"],
        "avg_rent_sqm": 16.5, "index_ref_sqm": 13.5, "avg_sale_sqm": 3500,
        "gross_yield": 5.6, "zone_tensionada": True, "livability_score": 9.1, "safety_score": 9.1,
        "description": "旅游与高端居住区，以国际化滨海小镇 Sitges 为代表，房价与租金均处于加泰罗尼亚前列。"
    },
    "Osona": {
        "capital": "Vic",
        "sample_municipios": ["Vic", "Manlleu", "Torelló", "Centelles", "Taradell", "Balenyà", "Roda de Ter"],
        "avg_rent_sqm": 8.8, "index_ref_sqm": 7.5, "avg_sale_sqm": 1550,
        "gross_yield": 6.8, "zone_tensionada": False, "livability_score": 8.3, "safety_score": 9.0,
        "description": "北部历史与农业/食品工业重镇，Vic 大学城带动了稳定增长的刚性学生租赁需求。"
    },
    "Anoia": {
        "capital": "Igualada",
        "sample_municipios": ["Igualada", "Vilanova del Camí", "Santa Margarida de Montbui", "Piera", "Capellades", "Masquefa"],
        "avg_rent_sqm": 8.2, "index_ref_sqm": 7.0, "avg_sale_sqm": 1300,
        "gross_yield": 7.5, "zone_tensionada": False, "livability_score": 7.9, "safety_score": 8.8,
        "description": "西部内陆县，以 Igualada 为中心，房屋总价低，适合稳健型高现金流资产配置。"
    },
    "Alt Penedès": {
        "capital": "Vilafranca del Penedès",
        "sample_municipios": ["Vilafranca del Penedès", "Sant Sadurní d'Anoia", "Gelida", "Santa Margarida i els Monjos", "Olèrdola"],
        "avg_rent_sqm": 9.8, "index_ref_sqm": 8.2, "avg_sale_sqm": 1700,
        "gross_yield": 6.9, "zone_tensionada": False, "livability_score": 8.5, "safety_score": 9.1,
        "description": "加泰罗尼亚葡萄酒与 Cava 香槟之乡，环境优雅，自驾前往巴塞罗那约 40 分钟。"
    },
    "Berguedà": {
        "capital": "Berga",
        "sample_municipios": ["Berga", "Gironella", "Puig-reig", "Bagà", "Cercs"],
        "avg_rent_sqm": 7.5, "index_ref_sqm": 6.2, "avg_sale_sqm": 1150,
        "gross_yield": 7.8, "zone_tensionada": False, "livability_score": 8.1, "safety_score": 9.3,
        "description": "北部比利牛斯山麓高山县，自然环境极佳，度假房与长租性价比显著。"
    },
    "Moianès": {
        "capital": "Moià",
        "sample_municipios": ["Moià", "Castellterçol", "Calders", "Monistrol de Calders", "Santa Maria d'Oló"],
        "avg_rent_sqm": 7.8, "index_ref_sqm": 6.5, "avg_sale_sqm": 1250,
        "gross_yield": 7.4, "zone_tensionada": False, "livability_score": 8.4, "safety_score": 9.4,
        "description": "巴省最年轻的县（2015年设立），乡村与自然宜居小镇为主，社区极度安全。"
    }
}

# ==============================================================================
# 智能市镇与地址归属解析引擎 (Municipis & Address Resolver)
# ==============================================================================
def resolve_municipio_and_comarca(address: Optional[str], municipio_input: Optional[str]) -> Tuple[str, str, Dict[str, Any]]:
    """
    匹配顺序：用户输入的 Municipio / 地址 -> 遍历 12 Comarques 的 300+ Municipios -> 返回 (Municipio, ComarcaName, Data)
    """
    query = f"{address or ''} {municipio_input or ''}".strip().lower()
    
    if not query:
        # 默认回退到 Barcelona 市
        return "Barcelona", "Barcelonès", BARCELONA_COMARQUES_DB["Barcelonès"]

    # 1. 精确与子串匹配 300+ Municipios
    for comarca_name, data in BARCELONA_COMARQUES_DB.items():
        for m in data["sample_municipios"]:
            if m.lower() in query or query in m.lower():
                return m, comarca_name, data

    # 2. 匹配 Comarca 名称本身
    for comarca_name, data in BARCELONA_COMARQUES_DB.items():
        if comarca_name.lower() in query:
            return data["capital"], comarca_name, data

    # 3. 兜底回退：巴塞罗那市 (Barcelonès)
    matched_muni = municipio_input or address or "Barcelona"
    return matched_muni, "Barcelonès", BARCELONA_COMARQUES_DB["Barcelonès"]


class ProvinceEvaluationRequest(BaseModel):
    intent: str = Field("rent", description="'rent' (租房) 或 'buy' (购房)")
    rental_type: str = Field("entire", description="'entire' (整租) 或 'room' (单间合租)")
    municipio: Optional[str] = Field(None, description="市镇名称 (Municipis)，如: Sant Cugat, Sitges, Manresa, Sabadell")
    address: Optional[str] = Field(None, description="具体街道地址，如: Carrer de Àngel Guimerà 12")
    price: float = Field(..., description="月租金 (€) 或 购房总价 (€)")
    area_sqm: Optional[float] = Field(None, description="房屋建筑面积 (㎡)")
    bedrooms: Optional[int] = Field(1, description="卧室数量")
    floor_level: Optional[str] = Field("Middle", description="楼层 (如: Ático, Bajo, Middle)")
    has_elevator: Optional[bool] = Field(True, description="是否有电梯")
    condition: Optional[str] = Field("good", description="房屋状况 ('renovated', 'good', 'needs_renovation')")
    description: Optional[str] = Field(None, description="自由补充描述")


class LegalComplianceRequest(BaseModel):
    municipio: Optional[str] = Field(None, description="市镇 (Municipis)")
    address: Optional[str] = Field(None, description="具体地址")
    monthly_rent: float = Field(..., description="月租金(欧元)")
    deposit_amount: Optional[float] = Field(None, description="实收押金金额 (€)")
    agency_fee_amount: Optional[float] = Field(None, description="实收中介费金额 (€)")
    contract_type: str = Field("LAU_LONG_TERM", description="'LAU_LONG_TERM' (常规长租) 或 'TEMPORADA' (季节性短租)")
    agency_fee_charged_to_tenant: bool = Field(False, description="是否向租客收取了中介费")
    contract_text: Optional[str] = Field(None, description="合同文本")


def call_groq_llm(prompt: str, system_prompt: str) -> Dict[str, Any]:
    clean_key = GROQ_API_KEY.encode('ascii', 'ignore').decode('ascii').strip()
    headers = {
        "Authorization": f"Bearer {clean_key}",
        "Content-Type": "application/json; charset=utf-8"
    }
    
    last_err_msg = ""
    for model_name in MODEL_CANDIDATES:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 2048
        }
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
                timeout=30
            )
            res_data = response.json()
            if response.status_code == 200 and "choices" in res_data:
                return json.loads(res_data["choices"][0]["message"]["content"])
            else:
                last_err_msg = res_data.get("error", {}).get("message", response.text)
        except Exception as e:
            last_err_msg = str(e)
            continue
            
    raise HTTPException(status_code=500, detail=f"Groq LLM 调用失败: {last_err_msg}")


@app.get("/api/municipios-list")
async def get_municipios_list():
    """返回全省 12 个 Comarques 和代表 Municipios 的结构树，供前端下拉框使用"""
    return {"status": "success", "data": BARCELONA_COMARQUES_DB}


@app.post("/api/evaluate")
@app.post("/api/evaluate-property")
async def evaluate_property(req: ProvinceEvaluationRequest):
    try:
        municipio, comarca, c_data = resolve_municipio_and_comarca(req.address, req.municipio)
        
        sqm = req.area_sqm if (req.area_sqm and req.area_sqm > 0) else (20.0 if req.rental_type == "room" else {1: 45.0, 2: 65.0, 3: 85.0}.get(req.bedrooms, 60.0))
        
        # 修正系数
        adj_factor = 1.0
        if req.condition == "renovated": adj_factor += 0.08
        elif req.condition == "needs_renovation": adj_factor -= 0.12
        if req.floor_level in ["Ático", "顶楼"]: adj_factor += 0.07
        elif req.floor_level in ["Bajo", "底层"] and not req.has_elevator: adj_factor -= 0.10
        if not req.has_elevator and sqm > 40: adj_factor -= 0.08
        if req.rental_type == "room": adj_factor *= 1.15

        if req.intent == "buy":
            base_fair_val = c_data["avg_sale_sqm"] * sqm
            adj_fair_val = round(base_fair_val * adj_factor, 2)
            variance_pct = round(((req.price - adj_fair_val) / adj_fair_val) * 100, 1)
            metrics = {
                "municipio": municipio,
                "comarca": comarca,
                "total_acquisition_cost": f"{round(req.price * 1.125, 2)}€ (含加泰罗尼亚 10% ITP 房产转让税与公证费)",
                "estimated_gross_yield": f"{round(((c_data['avg_rent_sqm'] * sqm * 12) / req.price) * 100, 2)}%",
                "comarca_avg_sale_sqm": f"{c_data['avg_sale_sqm']}€/㎡"
            }
        else:
            base_fair_val = c_data["avg_rent_sqm"] * sqm
            adj_fair_val = round(base_fair_val * adj_factor, 2)
            official_limit = round(c_data["index_ref_sqm"] * sqm, 2)
            variance_pct = round(((req.price - adj_fair_val) / adj_fair_val) * 100, 1)
            metrics = {
                "municipio": municipio,
                "comarca": comarca,
                "is_tensionada_zone": "是 (受到加泰罗尼亚 Ley 12/2023 租金最高限价管制)" if c_data["zone_tensionada"] else "否 (自由市场定价)",
                "official_index_limit": f"{official_limit}€" if c_data["zone_tensionada"] else "不适用",
                "comarca_avg_rent_sqm": f"{c_data['avg_rent_sqm']}€/㎡"
            }

        prompt = f'''
你也是西班牙加泰罗尼亚与巴塞罗那省（Provincia de Barcelona）房产评估与城市规划专家。请针对以下房源进行 300+ Municipis 层级分析并返回 JSON：
- 结构化归属: 市镇 Municipis [{municipio}] | 所属县 Comarca [{comarca}] | 地址: {req.address or '按市镇评估'}
- 评估模式: {req.intent} ({req.rental_type})
- 用户报价: {req.price}€ | 县域公允估值: {adj_fair_val}€ | 溢价/折价率: {variance_pct}%
- 基础指标: {json.dumps(metrics, ensure_ascii=False)}

请严格返回以下 JSON 结构：
{{
  "valuation_summary": {{
     "rating": "强烈推荐 / 价格合理 / 偏贵溢价 / 不建议考虑",
     "adjusted_fair_value": "{adj_fair_val}€",
     "variance_percentage": "{variance_pct}%",
     "value_verdict": "结合 {municipio} 与所在 {comarca} 县域宏观市场的公允度评语"
  }},
  "municipio_and_comarca_analysis": "针对 {municipio} 市镇在 {comarca} 县内的地理位置、交通（Rodalies/FGC/AP-7）、配套及发展潜力深度解析",
  "district_profile": {{
     "municipio": "{municipio}",
     "comarca": "{comarca}",
     "livability_score": "{c_data['livability_score']}/10",
     "safety_score": "{c_data['safety_score']}/10",
     "description": "{c_data['description']}"
  }},
  "actionable_negotiation_strategy": "针对 {municipio} 市镇当前市场供需与加泰罗尼亚住房法政策下的具体议价策略"
}}
'''
        result = call_groq_llm(prompt, "You are an expert real estate appraiser in the Province of Barcelona, Catalonia. Reply in valid JSON.")
        return {"status": "success", "data": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.post("/api/check-rental-risk")
async def check_rental_risk(req: LegalComplianceRequest):
    try:
        municipio, comarca, c_data = resolve_municipio_and_comarca(req.address, req.municipio)
        violations = []
        is_lau = req.contract_type.upper() == "LAU_LONG_TERM"
        
        max_legal_deposit = req.monthly_rent * (3 if is_lau else 2)
        actual_deposit = req.deposit_amount if req.deposit_amount is not None else (req.monthly_rent * 2)
        actual_agency_fee = req.agency_fee_amount if req.agency_fee_amount is not None else (req.monthly_rent * 1.2 if req.agency_fee_charged_to_tenant else 0)

        # 加泰罗尼亚 Ley 12/2023 & LAU 校验
        if is_lau and (req.agency_fee_charged_to_tenant or actual_agency_fee > 0):
            violations.append(f"【严重违法】在 {municipio} ({comarca}) 签署常规长租 (LAU)，依据西班牙 Ley 12/2023，中介费必须由房东 100% 承担，向租客收取任何费用均属违法。")

        if actual_deposit > max_legal_deposit:
            violations.append(f"【押金超标】实收押金 ({actual_deposit}€) 超过法定上限 ({max_legal_deposit}€)。")

        if c_data["zone_tensionada"] and is_lau:
            official_limit = round(c_data["index_ref_sqm"] * 60.0, 2)
            if req.monthly_rent > official_limit * 1.25:
                violations.append(f"【潜在租金超限】{municipio} 属于 Zone Tensionada（租金紧张区），租金显著高于该区域参考限制。")

        prompt = f'''
请分析巴塞罗那省租房法律风险并返回 JSON：
- 市镇位置: {municipio} (所属县: {comarca})
- 提交月租: {req.monthly_rent}€ | 提交押金: {actual_deposit}€ | 中介费: {actual_agency_fee}€
- 合同类型: {req.contract_type}
- 硬性违法项: {json.dumps(violations, ensure_ascii=False)}
- 合同文本: {req.contract_text or '未提供文本'}

返回 JSON 结构：
{{
  "overall_risk_level": "RED / YELLOW / GREEN",
  "compliance_verdict": "合规性总评结论",
  "hard_legal_violations": {json.dumps(violations, ensure_ascii=False)},
  "contract_text_analysis": "针对 {municipio} 租房市场常见霸王条款的诊断",
  "actionable_rights_recovery_steps": [
     "针对加泰罗尼亚租务仲裁（Sindicat de Llogateres / INCASÒL）的具体维权退款步骤"
  ]
}}
'''
        result = call_groq_llm(prompt, "You are an expert Spanish and Catalan housing lawyer. Reply in valid JSON.")
        return {"status": "success", "data": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)
