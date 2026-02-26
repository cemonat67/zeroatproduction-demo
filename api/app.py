import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="Zero@Production API Shim", version="0.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8098","http://localhost:8098"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def demo_payload(facility: str):
    # demo-safe fallback (same shape as your UI expects)
    return {
        "facility": facility,
        "asof": "DEMO",
        "shock_eur_t": 1.42,
        "water_m3": 116,
        "energy_mwh": 7.07,
        "total_co2_t": 20.58,
    }

def to_ui_shape(payload: dict):
    """
    UI expects:
      { facility, asof, batch_id, rows:[{carbon_price_eur_t, margin_after_eur, break_even_price_eur_t, shock_flag, shock_score, shock_reason}] }
    """
    facility = payload.get("facility") or payload.get("facility_code") or "MERKEZ"
    asof = payload.get("asof") or "DEMO"
    batch_id = payload.get("batch_id") or payload.get("_raw", {}).get("batch_id") or "—"

    # base numbers (demo-safe defaults)
    carbon = float(payload.get("carbon") or 12.5)         # €/t baseline
    margin_after = float(payload.get("margin_after") or 3.1)  # €/unit or €/kg (model-specific)
    break_even = float(payload.get("break_even") or 2.4)      # €/t (toy)

    # build 3 scenario rows around baseline carbon price
    prices = [max(0.0, carbon - 10.0), carbon, carbon + 20.0]

    rows = []
    for price in prices:
        # toy shock score: higher price -> higher score
        score = max(0.0, (price - break_even)) * 0.5
        if score < 3:
            flag = "SAFE"
        elif score < 8:
            flag = "PRESSURE"
        else:
            flag = "COLLAPSE"

        reason = f"Carbon price {price:.0f}€/t vs break-even {break_even:.2f}€/t"
        rows.append({
            "carbon_price_eur_t": price,
            "margin_after_eur": margin_after,
            "break_even_price_eur_t": break_even,
            "shock_flag": flag,
            "shock_score": round(score, 2),
            "shock_reason": reason
        })

    return {
        "facility": facility,
        "asof": asof,
        "batch_id": batch_id,
        "rows": rows,

        # keep some extra fields (harmless)
        "shock_eur_t": payload.get("shock_eur_t"),
        "water_m3": payload.get("water_m3"),
        "energy_mwh": payload.get("energy_mwh"),
        "total_co2_t": payload.get("total_co2_t"),
        "_raw": payload.get("_raw") or payload
    }



@app.get("/health")
def health():
    return {"ok": True, "service": "zp-api-shim", "version": "0.1"}

@app.get("/cfo_shock/latest")
def cfo_shock_latest(facility: str = "MERKEZ"):
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_ANON_KEY", "").strip()

    if not url or not key or "YOUR_" in url or "YOUR_" in key:
        return JSONResponse(to_ui_shape(demo_payload(facility)))

    def map_row(row: dict):
        # v_cfo_shock_latest -> UI-friendly shape
        # keep originals too (debug) but provide the fields UI expects
        out = {
            "facility": row.get("facility_code") or row.get("facility") or facility,
            "asof": row.get("asof"),
            "shock_eur_t": row.get("shock_eur_t"),
            "carbon": row.get("carbon"),
            "margin_after": row.get("margin_after"),
            "break_even": row.get("break_even"),
            # placeholders for UI compatibility (fill later from real views)
            "water_m3": row.get("water_m3"),
            "energy_mwh": row.get("energy_mwh"),
            "total_co2_t": row.get("total_co2_t"),
            "_raw": row,
        }

        # fill nulls with demo defaults so UI never shows blanks (demo-safe)
        if out.get('water_m3') is None: out['water_m3'] = 116
        if out.get('energy_mwh') is None: out['energy_mwh'] = 7.07
        if out.get('total_co2_t') is None: out['total_co2_t'] = 20.58

        return out
    try:
        from supabase import create_client
        sb = create_client(url, key)

        q = sb.table("v_cfo_shock_latest").select("*").eq("facility_code", facility).limit(1)
        res = q.execute()
        data = getattr(res, "data", None) or []
        if not data:
            return JSONResponse(to_ui_shape(demo_payload(facility)))

        return JSONResponse(to_ui_shape(map_row(data[0])))

    except Exception:
        return JSONResponse(to_ui_shape(demo_payload(facility)))
