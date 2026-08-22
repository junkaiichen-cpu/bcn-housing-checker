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
from typing import Optional, Dict, Any, List

app = FastAPI(
    title="Barcelona Province Real Estate Intelligence & Risk Engine",
    description="覆盖全加泰罗尼亚巴塞罗那省（Provincia de Barcelona）全域房产多维评估、精准地址解析、租务风控与投资精算系统",
    version="7.0.0"
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

# Groq 算力引擎可用模型
MODEL_CANDIDATES = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "qwen/qwen3-32b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b"
]

# ==============================================================================
# 加泰罗尼亚 - 巴塞罗那省全域房产数据库 (Province-Wide Real Estate Database)
# ==============================================================================
PROVINCE_DATABASE: Dict[str, Dict[str, Any]] = {
    # ---------------- 1. 巴塞罗那市核心区 (Barcelona City Center) ----------------
    "Eixample (Barcelona)": {
        "municipality": "Barcelona",
        "sub_zones": ["Eixample Esquerra", "Eixample Dreta", "Sant Antoni", "Sagrada Família", "Fort Pienc"],
        "avg_rent_sqm": 19.8, "index_ref_sqm": 15.8, "avg_sale_sqm": 5200,
        "gross_yield": 4.5, "ibi_yearly_sqm": 7.5, "community_monthly": 85.0,
        "safety_score": 8.9, "livability_score": 9.3, "zone_tensionada": True,
        "pros": ["八角形经典街区，采光与规划极佳", "商业与生活配套全省最顶级", "资产流动性与抗跌保值率第一"],
        "cons": ["主干道车流噪声较大", "车位紧缺且物业成本偏高"]
    },
    "Gràcia (Barcelona)": {
        "municipality": "Barcelona",
        "sub_zones": ["Vila de Gràcia", "Camp d'en Grassot", "Vallcarca", "El Coll", "La Salut"],
        "avg_rent_sqm": 20.0, "index_ref_sqm": 16.2, "avg_sale_sqm": 4800,
        "gross_yield": 4.9, "ibi_yearly_sqm": 6.8, "community_monthly": 55.0,
        "safety_score": 9.1, "livability_score": 9.0, "zone_tensionada": True,
        "pros": ["步行街体验极佳，文青与小资文化浓厚", "Plaza 广场与独立店面密集"],
        "cons": ["老楼居多，普遍无电梯", "隔音一般且部分街道狭窄"]
    },
    "Poblenou / Sant Martí (Barcelona)": {
        "municipality": "Barcelona",
        "sub_zones": ["El Poblenou", "Diagonal Mar", "El Besòs i el Maresme", "Provençals del Poblenou"],
        "avg_rent_sqm": 19.2, "index_ref_sqm": 15.5, "avg_sale_sqm": 4650,
        "gross_yield": 4.8, "ibi_yearly_sqm": 8.0, "community_monthly": 95.0,
        "safety_score": 8.7, "livability_score": 9.2, "zone_tensionada": True,
        "pros": ["22@ 科技创新园区，现代高品质公寓多", "紧邻 Bogatell/Mar Bella 海滩"],
        "cons": ["工业转型街区夜间人流稍显偏僻", "近年来租金涨幅显著"]
    },
    "Les Corts / Pedralbes (Barcelona)": {
        "municipality": "Barcelona",
        "sub_zones": ["Les Corts", "Pedralbes", "Maternitat i Sant Ramon"],
        "avg_rent_sqm": 21.0, "index_ref_sqm": 17.5, "avg_sale_sqm": 6200,
        "gross_yield": 4.0, "ibi_yearly_sqm": 11.2, "community_monthly": 160.0,
        "safety_score": 9.6, "livability_score": 9.4, "zone_tensionada": True,
        "pros": ["顶级豪宅区与大学城，治安环境全省顶尖", "绿化率极高，社区档次高"],
        "cons": ["租售门槛极高", "烟火气略逊于老城区"]
    },
    "Ciutat Vella / Gòtic (Barcelona)": {
        "municipality": "Barcelona",
        "sub_zones": ["El Gòtic", "El Raval", "El Born", "La Barceloneta"],
        "avg_rent_sqm": 18.5, "index_ref_sqm": 14.8, "avg_sale_sqm": 4350,
        "gross_yield": 5.1, "ibi_yearly_sqm": 6.2, "community_monthly": 50.0,
        "safety_score": 5.8, "livability_score": 6.8, "zone_tensionada": True,
        "pros": ["巴塞罗那历史文化核心，出行极其便利", "独特哥特建筑风格"],
        "cons": ["盗窃与夜间喧闹风险较高", "老旧房屋潮湿且采光受限"]
    },
    "Sarrià-Sant Gervasi (Barcelona)": {
        "municipality": "Barcelona",
        "sub_zones": ["Sarrià", "Sant Gervasi - Galvany", "Tres Torres", "El Putxet"],
        "avg_rent_sqm": 21.8, "index_ref_sqm": 18.2, "avg_sale_sqm": 5900,
        "gross_yield": 4.3, "ibi_yearly_sqm": 10.5, "community_monthly": 130.0,
        "safety_score": 9.7, "livability_score": 9.5, "zone_tensionada": True,
        "pros": ["传统富人区，极度安全安静", "顶级私立学校与医疗资源密集"],
        "cons": ["地势坡道较多，依赖 FGC 或私家车", "日常消费偏高"]
    },

    # ---------------- 2. 巴塞罗那大都会卫星城 (Metropolitan Area) ----------------
    "L'Hospitalet de Llobregat": {
        "municipality": "L'Hospitalet de Llobregat",
        "sub_zones": ["Bellvitge", "Collblanc", "Santa Eulàlia", "Granvia Sud", "Torrassa"],
        "avg_rent_sqm": 15.8, "index_ref_sqm": 13.2, "avg_sale_sqm": 2950,
        "gross_yield": 6.2, "ibi_yearly_sqm": 5.2, "community_monthly": 45.0,
        "safety_score": 7.8, "livability_score": 8.0, "zone_tensionada": True,
        "pros": ["全省第二大城市，紧靠巴塞罗那，地铁无缝连接", "性价极高，租金收益率优异"],
        "cons": ["人口密度大，部分老街区停车困难"]
    },
    "Badalona": {
        "municipality": "Badalona",
        "sub_zones": ["Centre", "Gorg", "Progrés", "Montigalà", "Llefià"],
        "avg_rent_sqm": 15.2, "index_ref_sqm": 12.8, "avg_sale_sqm": 2800,
        "gross_yield": 6.3, "ibi_yearly_sqm": 5.0, "community_monthly": 50.0,
        "safety_score": 8.0, "livability_score": 8.2, "zone_tensionada": True,
        "pros": ["优质海滩与 Gorg 港口新开发现代公寓", "交通直达巴塞罗那市中心"],
        "cons": ["北部部分区域人员较杂", "老城区道路狭窄"]
    },
    "Sant Cugat del Vallès": {
        "municipality": "Sant Cugat del Vallès",
        "sub_zones": ["Eixample-Mirasol", "Valldoreix", "Volpelleres", "Coll Favà", "Parc Central"],
        "avg_rent_sqm": 18.5, "index_ref_sqm": 15.2, "avg_sale_sqm": 4400,
        "gross_yield": 4.8, "ibi_yearly_sqm": 8.5, "community_monthly": 110.0,
        "safety_score": 9.8, "livability_score": 9.7, "zone_tensionada": True,
        "pros": ["巴塞罗那省后花园，全省人均收入与安全度最高的城市", "绿化覆盖率极高，国际学校多"],
        "cons": ["依赖 FGC 或私家车通勤", "生活成本接近巴塞罗那富人区"]
    },
    "Cornellà de Llobregat": {
        "municipality": "Cornellà de Llobregat",
        "sub_zones": ["Almeda", "Centre", "Gavarra", "Sant Ildefons"],
        "avg_rent_sqm": 14.5, "index_ref_sqm": 12.4, "avg_sale_sqm": 2600,
        "gross_yield": 6.5, "ibi_yearly_sqm": 4.8, "community_monthly": 40.0,
        "safety_score": 8.0, "livability_score": 7.9, "zone_tensionada": True,
        "pros": ["Splau 商业中心，小快轻轨与地铁完善", "适合低总价投资和刚需租房"],
        "cons": ["部分工业园区交界处绿化较少"]
    },
    "Santa Coloma de Gramenet": {
        "municipality": "Santa Coloma de Gramenet",
        "sub_zones": ["Centre", "Singuerlín", "Fondo", "Riu Nord"],
        "avg_rent_sqm": 13.9, "index_ref_sqm": 11.8, "avg_sale_sqm": 2350,
        "gross_yield": 6.8, "ibi_yearly_sqm": 4.5, "community_monthly": 35.0,
        "safety_score": 7.3, "livability_score": 7.4, "zone_tensionada": True,
        "pros": ["租金与房价全省洼地", "餐饮烟火气浓厚"],
        "cons": ["坡道地形多，外来人口比例高"]
    },

    # ---------------- 3. 巴塞罗那省重点大区 (Outer Barcelona Province) ----------------
    "Sabadell": {
        "municipality": "Sabadell",
        "sub_zones": ["Centre", "Creu Alta", "Eixample", "Can Rull", "Zamenhof"],
        "avg_rent_sqm": 12.5, "index_ref_sqm": 10.5, "avg_sale_sqm": 2200,
        "gross_yield": 6.7, "ibi_yearly_sqm": 4.2, "community_monthly": 45.0,
        "safety_score": 8.4, "livability_score": 8.3, "zone_tensionada": True,
        "pros": ["巴省内陆产业与教育重镇，配套设施自成体系", "住房性价比极高"],
        "cons": ["距巴塞罗那市中心约 30-40 分钟车程"]
    },
    "Terrassa": {
        "municipality": "Terrassa",
        "sub_zones": ["Centre", "Vallparadís", "Ca n'Aurell", "Sant Pere"],
        "avg_rent_sqm": 12.0, "index_ref_sqm": 10.2, "avg_sale_sqm": 2100,
        "gross_yield": 6.8, "ibi_yearly_sqm": 4.0, "community_monthly": 40.0,
        "safety_score": 8.3, "livability_score": 8.2, "zone_tensionada": True,
        "pros": ["大学城与科技园区，租赁需求稳定", "公园绿化环境好"],
        "cons": ["高峰期前往巴塞罗那交通偏拥堵"]
    },
    "Castelldefels / Gavà": {
        "municipality": "Castelldefels",
        "sub_zones": ["Castelldefels Platja", "Gran Via Mar", "Gavà Mar", "Centre"],
        "avg_rent_sqm": 17.5, "index_ref_sqm": 14.5, "avg_sale_sqm": 3950,
        "gross_yield": 5.2, "ibi_yearly_sqm": 7.8, "community_monthly": 90.0,
        "safety_score": 9.2, "livability_score": 9.1, "zone_tensionada": True,
        "pros": ["顶级海岸线与别墅/海景公寓区", "临近机场，深受外籍高管与球星喜爱"],
        "cons": ["夏季游客较多，公共交通相对单一"]
    }
}

# ==============================================================================
# 智能解析：支持直接解析具体地址或城市/区份 (Address & Zone Resolver)
# ==============================================================================
def resolve_location(address: Optional[str], input_zone: Optional[str]) -> Tuple[str, str]:
    """
    智能分析输入，返回 (匹配的主区域 key, 结构化解析出的地址/街区描述)
    """
    target = f"{address or ''} {input_zone or ''}".strip().lower()
    
    if not target:
        return "Eixample (Barcelona)", "未提供地址，默认按巴塞罗那 Eixample 区评估"

    # 优先匹配数据库中的具体子区域和主区域
    for key, data in PROVINCE_DATABASE.items():
        # 匹配主 key 或 城市名
        if key.lower() in target or data["municipality"].lower() in target:
            return key, address or input_zone or key
        
        # 匹配子区域
        for sub in data.get("sub_zones", []):
            if sub.lower() in target:
                return key, f"{sub} ({data['municipality']})"

    # 如果无法精准对应，模糊 fallback 匹配
    if "sants" in target or "poble sec" in target:
        return "Eixample (Barcelona)", address or input_zone or "Sants-Montjuïc"
    if "gotic" in target or "raval" in target or "born" in target:
        return "Ciutat Vella / Gòtic (Barcelona)", address or input_zone
    if "pobl" in target or "diagonal mar" in target:
        return "Poblenou / Sant Martí (Barcelona)", address or input_zone

    return "Eixample (Barcelona)", address or input_zone or "Eixample (Barcelona)"


class SmartEvaluationRequest(BaseModel):
    intent: str = Field("rent", description="'rent' (租房) 或 'buy' (购房)")
    rental_type: str = Field("entire", description="'entire' (整租) 或 'room' (单间合租)")
    address: Optional[str] = Field(None, description="完整具体地址，如: Carrer de Balmes 120, Barcelona")
    zone_or_city: Optional[str] = Field(None, description="城市/区份，如: Sant Cugat, Badalona, Eixample")
    price: float = Field(..., description="月租金 (€) 或 购房总价 (€)")
    area_sqm: Optional[float] = Field(None, description="房屋建筑面积 (㎡)")
    bedrooms: Optional[int] = Field(1, description="卧室数量")
    floor_level: Optional[str] = Field("Middle", description="楼层 (如: Ático, Bajo, Middle)")
    has_elevator: Optional[bool] = Field(True, description="是否有电梯")
    condition: Optional[str] = Field("good", description="房屋状况 ('renovated', 'good', 'needs_renovation')")
    description: Optional[str] = Field(None, description="特殊需求或自由描述")


class LegalComplianceRequest(BaseModel):
    address: Optional[str] = Field(None, description="具体地址")
    zone_or_city: Optional[str] = Field(None, description="城市或区份")
    monthly_rent: float = Field(..., description="月租金(欧元)")
    deposit_amount: Optional[float] = Field(None, description="实收押金金额 (€)")
    agency_fee_amount: Optional[float] = Field(None, description="实收中介费金额 (€)")
    contract_type: str = Field("LAU_LONG_TERM", description="'LAU_LONG_TERM' (常规长租) 或 'TEMPORADA' (季节性短租)")
    agency_fee_charged_to_tenant: bool = Field(False, description="是否向租客收取了中介费")
    contract_text: Optional[str] = Field(None, description="合同条款或聊天记录")


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


@app.post("/api/evaluate")
@app.post("/api/evaluate-property")
async def evaluate_property(req: SmartEvaluationRequest):
    try:
        matched_key, parsed_location = resolve_location(req.address, req.zone_or_city)
        db = PROVINCE_DATABASE[matched_key]
        
        sqm = req.area_sqm if (req.area_sqm and req.area_sqm > 0) else (20.0 if req.rental_type == "room" else {1: 45.0, 2: 65.0, 3: 85.0}.get(req.bedrooms, 60.0))
        
        # 修正系数加权
        adj_factor = 1.0
        if req.condition == "renovated": adj_factor += 0.08
        elif req.condition == "needs_renovation": adj_factor -= 0.12
        if req.floor_level in ["Ático", "顶楼"]: adj_factor += 0.07
        elif req.floor_level in ["Bajo", "底层"] and not req.has_elevator: adj_factor -= 0.10
        if not req.has_elevator and sqm > 40: adj_factor -= 0.08
        if req.rental_type == "room": adj_factor *= 1.15

        if req.intent == "buy":
            base_fair_val = db["avg_sale_sqm"] * sqm
            adj_fair_val = round(base_fair_val * adj_factor, 2)
            variance_pct = round(((req.price - adj_fair_val) / adj_fair_val) * 100, 1)
            metrics = {
                "municipality": db["municipality"],
                "total_cost": f"{round(req.price * 1.125, 2)}€ (含10% ITP税金与公证注册费)",
                "estimated_gross_yield": f"{round(((db['avg_rent_sqm'] * sqm * 12) / req.price) * 100, 2)}%",
                "regional_avg_sale_sqm": f"{db['avg_sale_sqm']}€/㎡"
            }
        else:
            base_fair_val = db["avg_rent_sqm"] * sqm
            adj_fair_val = round(base_fair_val * adj_factor, 2)
            official_limit = round(db["index_ref_sqm"] * sqm, 2)
            variance_pct = round(((req.price - adj_fair_val) / adj_fair_val) * 100, 1)
            metrics = {
                "municipality": db["municipality"],
                "rental_type": "单间合租 (Habitación)" if req.rental_type == "room" else "整租 (Vivienda Completa)",
                "catalunya_official_index_limit": f"{official_limit}€ (加泰罗尼亚官方参考租金限价上限)",
                "over_official_limit_pct": f"{round(((req.price - official_limit)/official_limit)*100, 1)}%",
                "sub_zones_covered": ", ".join(db["sub_zones"])
            }

        prompt = f'''
你也是加泰罗尼亚与巴塞罗那省房产评估专家。请针对以下房产进行全域对比与精算报告解析，并返回 JSON：
- 结构化定位: 城市/行政区 [{db['municipality']} -> {matched_key}] | 输入解析地址: {parsed_location}
- 用户补充备注/要求: {req.description or '无'}
- 模式: {req.intent} ({req.rental_type})
- 用户报价: {req.price}€ | 系统模型公允估值: {adj_fair_val}€ | 溢价/折价率: {variance_pct}%
- 基础指标: {json.dumps(metrics, ensure_ascii=False)}

请严格返回以下 JSON 结构：
{{
  "valuation_summary": {{
     "rating": "强烈推荐 / 价格合理 / 偏贵溢价 / 不建议考虑",
     "adjusted_fair_value": "{adj_fair_val}€",
     "variance_percentage": "{variance_pct}%",
     "value_verdict": "结合具体地址与巴塞罗那省宏观市场的公允度评语"
  }},
  "location_and_address_analysis": "针对具体地址/城市的交通便利度、区域发展趋势及配套分析",
  "district_profile": {{
     "municipality": "{db['municipality']}",
     "livability_score": "{db['livability_score']}/10",
     "safety_score": "{db['safety_score']}/10",
     "key_pros": {json.dumps(db['pros'], ensure_ascii=False)},
     "key_cons": {json.dumps(db['cons'], ensure_ascii=False)}
  }},
  "actionable_negotiation_strategy": "针对此地址房源在巴塞罗那省当前政策下的具体砍价与议价策略"
}}
'''
        result = call_groq_llm(prompt, "You are a top real estate appraiser for the Province of Barcelona, Catalonia. Reply in valid JSON.")
        return {"status": "success", "data": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.post("/api/check-rental-risk")
async def check_rental_risk(req: LegalComplianceRequest):
    try:
        matched_key, parsed_location = resolve_location(req.address, req.zone_or_city)
        db = PROVINCE_DATABASE[matched_key]
        violations = []
        is_lau = req.contract_type.upper() == "LAU_LONG_TERM"
        
        max_legal_deposit = req.monthly_rent * (3 if is_lau else 2)
        actual_deposit = req.deposit_amount if req.deposit_amount is not None else (req.monthly_rent * 2)
        actual_agency_fee = req.agency_fee_amount if req.agency_fee_amount is not None else (req.monthly_rent * 1.2 if req.agency_fee_charged_to_tenant else 0)

        # 依据西班牙最新 Housing Law (Ley 12/2023)
        if is_lau and (req.agency_fee_charged_to_tenant or actual_agency_fee > 0):
            violations.append("【严重违法】依据西班牙 Ley 12/2023 住房法，LAU 长租中介费必须由房东 100% 承担。向租客收取任何名义的服务费/中介费均属于违法行为。")

        if actual_deposit > max_legal_deposit:
            violations.append(f"【押金超标】实收押金 ({actual_deposit}€) 超过加泰罗尼亚法定上限 ({max_legal_deposit}€，即 {3 if is_lau else 2} 个月租金)。")

        prompt = f'''
请分析巴塞罗那省租房法律风险并返回 JSON：
- 位置: {parsed_location} ({db['municipality']})
- 提交月租: {req.monthly_rent}€ | 提交押金: {actual_deposit}€ | 中介费: {actual_agency_fee}€
- 合同类型: {req.contract_type}
- 触发硬性违法: {json.dumps(violations, ensure_ascii=False)}
- 合同与补充文本: {req.contract_text or '未提供文本'}

返回 JSON 结构：
{{
  "overall_risk_level": "RED / YELLOW / GREEN",
  "compliance_verdict": "合规性总评结论",
  "hard_legal_violations": {json.dumps(violations, ensure_ascii=False)},
  "contract_text_analysis": "文本霸王条款诊断（如非法加租、违规扣押金条款）",
  "actionable_rights_recovery_steps": [
     "针对加泰罗尼亚租务仲裁的具体维权退款步骤"
  ]
}}
'''
        result = call_groq_llm(prompt, "You are a expert Spanish & Catalan housing law attorney. Reply in valid JSON.")
        return {"status": "success", "data": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)
