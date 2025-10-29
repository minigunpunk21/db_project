# TaskManager Full v3 (Fullstack)
Полный проект: **backend + красивый frontend + SQL**. Работает поверх твоей схемы `issue_tracker`.

## 1) Подготовка БД
В `mysql` (Windows: только прямые слэши `/`):
```
SOURCE C:/Users/User/Desktop/prikol.sql                            -- твой DDL
SOURCE C:/Users/User/Desktop/taskmanager_full_v3_fullstack/sql/logging_triggers.sql
SOURCE C:/Users/User/Desktop/taskmanager_full_v3_fullstack/sql/indexes_mysql8.sql
SOURCE C:/Users/User/Desktop/taskmanager_full_v3_fullstack/sql/auth_seed.sql       -- демо-пароли
```

## 2) Backend
```
cd backend
npm i
copy .env.example .env   # укажи DB_PASS, JWT_SECRET
npm run dev
```
- Все /api/** закрыты JWT, кроме /api/health и /api/auth.
- /api/auth/login — вход; /api/auth/me — проверка токена.

## 3) Frontend
```
cd frontend
npm i
copy .env.example .env   # VITE_API_URL=http://localhost:3001/api
npm run dev
```
Открой http://localhost:5173 → сначала попадёшь на Login.

### Демо-аккаунты
(alice/alice123, carol/carol123, dave/dave123, erin/erin123).

## 4) Стек
- Backend: Node + Express + mysql2, JWT, CORS
- Frontend: React + Vite + Tailwind + Framer Motion + lucide + Toaster
- SQL: триггеры логирования, индексы (через information_schema), seed паролей

Удачи!