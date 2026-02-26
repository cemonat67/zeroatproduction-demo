import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="Zero@Production API Shim", version="0.1")

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

@app.get("/health")
def health():
    return {"ok": True, "service": "zp-api-shim", "version": "0.1"}

@app.get("/cfo_shock/latest")
def cfo_shock_latest(facility: str = "MERKEZ"):
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_ANON_KEY", "").strip()

    if not url or not key or "YOUR_" in url or "YOUR_" in key:
        return JSONResponse(demo_payload(facility))

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
            return JSONResponse(demo_payload(facility))

        return JSONResponse(map_row(data[0]))

    except Exception:
        return JSONResponse(demo_payload(facility))
