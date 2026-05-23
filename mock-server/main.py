from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from typing import Optional
import re

app = FastAPI()


# ── CORS (нужен withCredentials=true): echo-back origin ──────────────────────
class CORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        origin = request.headers.get("origin", "")
        if request.method == "OPTIONS":
            r = JSONResponse({})
            r.headers.update({
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "*",
            })
            return r
        r = await call_next(request)
        if origin:
            r.headers["Access-Control-Allow-Origin"] = origin
            r.headers["Access-Control-Allow-Credentials"] = "true"
        return r


# ── Убираем /{SALON_ID}/ префикс (добавляется axios-интерцептором) ───────────
class StripSalonIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        path = request.scope["path"]
        new = re.sub(r"^/\d+(?=/)", "", path)
        if new != path:
            request.scope["path"] = new
        return await call_next(request)


app.add_middleware(StripSalonIdMiddleware)
app.add_middleware(CORSMiddleware)


# ── Статические данные ────────────────────────────────────────────────────────

SALON = {
    "name": "Салон «Люкс»",
    "description": "Салон красоты полного цикла",
    "about_company": "Работаем с 2010 года. Команда опытных мастеров.",
    "address": "г. Москва, ул. Пушкина, д. 10",
    "address_url": "https://yandex.ru/maps/",
    "map_url": "https://yandex.ru/maps/",
    "logo_url": "",
    "rating": "4.8",
    "telegram_link": "https://t.me/salon_lux",
    "telegram_username": "@salon_lux",
    "timezone": "Europe/Moscow",
}

SERVICE_TYPES = [
    {"id": 1, "name": "Маникюр и педикюр"},
    {"id": 2, "name": "Волосы"},
    {"id": 3, "name": "Тело и лицо"},
]

SERVICES = [
    {"id": 1, "name": "Маникюр классический",  "price": 1500, "service_type_id": 1},
    {"id": 2, "name": "Педикюр классический",   "price": 2000, "service_type_id": 1},
    {"id": 3, "name": "Маникюр гель-лак",       "price": 2500, "service_type_id": 1},
    {"id": 4, "name": "Стрижка женская",         "price": 2500, "service_type_id": 2},
    {"id": 5, "name": "Окрашивание корней",      "price": 3500, "service_type_id": 2},
    {"id": 6, "name": "Массаж спины",            "price": 3000, "service_type_id": 3},
    {"id": 7, "name": "Уход за лицом",           "price": 4000, "service_type_id": 3},
]

STAFF = [
    {"id": 1, "name": "Анна Иванова",   "photo": "", "specializations": ["Маникюр", "Педикюр"],         "about": "Мастер маникюра, 5 лет опыта."},
    {"id": 2, "name": "Мария Петрова",  "photo": "", "specializations": ["Стрижка", "Окрашивание"],      "about": "Стилист высшей категории."},
    {"id": 3, "name": "Елена Сидорова", "photo": "", "specializations": ["Массаж", "Уход за лицом"],     "about": "Косметолог-эстетист, 8 лет опыта."},
]

USER = {
    "id": 1,
    "name": "Иван",
    "last_name": "Тестов",
    "middle_name": "",
    "phone": "+79001234567",
    "email": "test@example.com",
    "telegram_id": 123456789,
}


# ── Изменяемое состояние ──────────────────────────────────────────────────────

_slots: dict = {}   # (staff_id, date_str) -> ["HH:MM:SS", ...]
_visits: dict = {}
_next_id = [1]

AVAILABLE_YEAR, AVAILABLE_MONTH = 2026, 9  # доступны только даты этого месяца


def _day_slots(date_str: str) -> list:
    d = datetime.strptime(date_str, "%Y-%m-%d")
    # Слоты только в сентябре 2026, пн–сб
    if d.year != AVAILABLE_YEAR or d.month != AVAILABLE_MONTH or d.weekday() == 6:
        return []
    slots, t = [], datetime(d.year, d.month, d.day, 9, 0)
    while t.hour < 18:
        slots.append(t.strftime("%H:%M:%S"))
        t += timedelta(minutes=30)
    return slots


def _get_slots(staff_id: int, date_str: str) -> list:
    key = (staff_id, date_str)
    if key not in _slots:
        _slots[key] = _day_slots(date_str)
    return _slots[key]


def _book_slot(staff_id: int, dt_str: str):
    dt = datetime.fromisoformat(dt_str)
    slots = _get_slots(staff_id, dt.strftime("%Y-%m-%d"))
    t = dt.strftime("%H:%M:%S")
    if t in slots:
        slots.remove(t)


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/telegram/login/")
@app.post("/auth/max/login/")
async def login(response: Response):
    response.set_cookie("session", "mock", samesite="lax", httponly=False)
    return {"access_token": "mock-token", "refresh_token": "mock-refresh", **USER}

@app.post("/auth/max/login/resolve/")
async def resolve_salon():
    return {"salon_id": 1}

@app.post("/auth/logout/")
async def logout(response: Response):
    response.delete_cookie("session")
    return {"success": True}

@app.get("/auth/me/")
async def get_me():
    return USER

@app.patch("/auth/me/")
@app.put("/auth/me/")
@app.post("/auth/me/")
async def update_me(request: Request):
    body = await request.json()
    USER.update({k: v for k, v in body.items() if k in USER})
    return USER


# ── Salon ─────────────────────────────────────────────────────────────────────

@app.get("/salon/info/")
def salon_info():
    return SALON


# ── Services ──────────────────────────────────────────────────────────────────

@app.get("/services/types/")
def service_types():
    return SERVICE_TYPES

@app.get("/services/")
def services():
    return SERVICES


# ── Staff (статичные маршруты — раньше параметрических) ──────────────────────

@app.get("/staff/specializations/")
def specializations():
    result = set()
    for s in STAFF:
        result.update(s["specializations"])
    return list(result)

@app.get("/staff/free_time/")
def free_time(date: str, staff_id: int, service_id: Optional[int] = None):
    slots = _get_slots(staff_id, date)
    return [{"free_slots": [{"start_time": f"{date}T{t}"} for t in slots]}]

@app.get("/staff/")
def staff_list():
    return STAFF

@app.get("/staff/{staff_id}/schedule/")
def schedule(staff_id: int, date_from: str, date_to: str):
    result = []
    d = datetime.strptime(date_from, "%Y-%m-%d")
    end = datetime.strptime(date_to, "%Y-%m-%d")
    while d <= end:
        ds = d.strftime("%Y-%m-%d")
        in_sep = d.year == AVAILABLE_YEAR and d.month == AVAILABLE_MONTH
        wh = [{"start": "09:00", "end": "18:00"}] if in_sep and d.weekday() != 6 else []
        result.append({"date": ds, "working_hours": wh, "booked_slots": []})
        d += timedelta(days=1)
    return {"success": True, "data": result}

@app.get("/staff/{staff_id}")
def staff_detail(staff_id: int):
    return next((s for s in STAFF if s["id"] == staff_id), {})


# ── Visits (статичные маршруты — раньше параметрических) ─────────────────────

@app.post("/visits/")
async def create_visit(request: Request):
    body = await request.json()
    sid = body.get("service_id")
    if isinstance(sid, list):
        sid = sid[0] if sid else None
    vid = _next_id[0]; _next_id[0] += 1
    visit = {
        "id": vid,
        "staff_id": body.get("staff_id"),
        "service_id": sid,
        "visit_date_time": body.get("visit_date_time"),
        "comment": body.get("comment", ""),
        "status": "pending",
        "will_come": False,
    }
    _visits[vid] = visit
    if visit["staff_id"] and visit["visit_date_time"]:
        _book_slot(visit["staff_id"], visit["visit_date_time"])
    return visit

@app.get("/visits/current/")
def visits_current():
    now = datetime.now()
    return [v for v in _visits.values() if datetime.fromisoformat(v["visit_date_time"]) >= now]

@app.get("/visits/old/")
def visits_old():
    now = datetime.now()
    return [v for v in _visits.values() if datetime.fromisoformat(v["visit_date_time"]) < now]

@app.get("/visits/{visit_id}")
def get_visit(visit_id: int):
    return _visits.get(visit_id, {})

@app.patch("/visits/{visit_id}/confirm")
def confirm_visit(visit_id: int):
    if visit_id in _visits:
        _visits[visit_id]["status"] = "confirmed"
        _visits[visit_id]["will_come"] = True
    return _visits.get(visit_id, {})

@app.patch("/visits/{visit_id}")
async def update_visit(visit_id: int, request: Request):
    body = await request.json()
    if visit_id in _visits:
        v = _visits[visit_id]
        if "visit_date_time" in body and v.get("staff_id"):
            _book_slot(v["staff_id"], body["visit_date_time"])
        v.update(body)
    return _visits.get(visit_id, {})

@app.delete("/visits/{visit_id}")
def delete_visit(visit_id: int):
    _visits.pop(visit_id, None)
    return {"success": True}


# ── Clients ───────────────────────────────────────────────────────────────────

@app.get("/clients/{telegram_id}")
def get_client(telegram_id: str):
    return USER
