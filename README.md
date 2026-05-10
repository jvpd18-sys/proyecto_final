# SplitSmart — Gestión de Gastos Compartidos con IA

Aplicación web para gestionar gastos compartidos entre grupos de personas, con categorización automática e IA para recomendaciones de ahorro personalizadas.

**Universidad Manuela Beltrán · Facultad de Ingeniería · Ingeniería de Software · Bogotá D.C., 2026**

## Equipo

- Santiago Colmenares
- Luilly Perea
- David Pinzón
- Jésika Pachón

## Tecnologías

- **Backend:** Python 3.13 · Django 4.2 · Django REST Framework · JWT · MariaDB
- **Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios · Recharts
- **Base de datos:** MariaDB 10.4 (XAMPP), normalizada en 3FN
- **IA:** Claude API (categorización automática y recomendaciones de ahorro)

## Estructura del proyecto

```
splitsmart/
├── backend/              # Django + DRF
│   ├── splitsmart/       # Configuración Django
│   ├── apps/
│   │   ├── users/        # Autenticación JWT
│   │   ├── groups/       # Grupos y miembros
│   │   ├── expenses/     # Gastos, categorías y balances
│   │   ├── payments/     # Pagos entre usuarios
│   │   └── ai_assistant/ # Integración Claude API
│   └── fixtures/         # Categorías predefinidas
├── frontend/             # React + Vite + Tailwind
│   └── src/
│       ├── pages/        # 9 vistas
│       ├── components/   # UI + Layout
│       ├── auth/         # Contexto de autenticación
│       └── api/          # Cliente Axios + interceptores JWT
├── start.bat             # Lanza ambos servicios
└── README.md
```

## Instalación y ejecución

### Prerrequisitos

- Python 3.13
- Node.js 18+
- XAMPP con MariaDB corriendo (o MariaDB instalado por separado)

### 1. Configurar la base de datos

Abre phpMyAdmin o un cliente MariaDB y ejecuta:

```sql
CREATE DATABASE splitsmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar el backend

```bat
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edita `.env` con tu contraseña de MariaDB y tu `ANTHROPIC_API_KEY`.

```bat
python manage.py migrate
python manage.py loaddata fixtures/categories.json
python manage.py runserver 8000
```

### 3. Configurar el frontend

```bat
cd frontend
npm install
npm run dev
```

### Opción rápida — `start.bat`

Doble click en `start.bat`. Abre dos terminales (backend y frontend) y el navegador en `http://localhost:5173`.

> Asegúrate de haber corrido las migraciones y el `loaddata` antes del primer uso.

## URLs

| Servicio | URL |
|---|---|
| Panel web | http://localhost:5173 |
| API Django | http://localhost:8000 |
| Swagger UI | http://localhost:8000/api/docs/ |

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register/` | — | Registro |
| POST | `/api/auth/login/` | — | Login + JWT |
| GET/PUT | `/api/auth/me/` | JWT | Perfil |
| GET/POST | `/api/groups/` | JWT | Listar/crear grupos |
| POST | `/api/groups/{id}/invite/` | JWT | Invitar miembro |
| GET/POST | `/api/expenses/` | JWT | Listar/crear gastos |
| GET | `/api/expenses/groups/{id}/balances/` | JWT | Balances del grupo |
| GET | `/api/expenses/groups/{id}/settlement/` | JWT | Liquidación mínima |
| GET/POST | `/api/payments/` | JWT | Pagos entre usuarios |
| POST | `/api/ai/categorize/` | JWT | Categorizar gasto con IA |
| GET | `/api/ai/recommendations/` | JWT | Recomendaciones de ahorro |
| GET | `/api/expenses/dashboard/summary/` | JWT | KPIs del dashboard |

## Modelo de datos (3FN)

```
usuarios · grupos · grupo_miembros · categorias
gastos · gasto_participantes · pagos · recomendaciones_ia
```

## Cálculo de balances

```
balance[usuario] = Σ(gastos donde pagó) − Σ(monto_correspondiente)
```

Liquidación mediante algoritmo greedy (mínimas transferencias: ≤ N-1 para N personas).
