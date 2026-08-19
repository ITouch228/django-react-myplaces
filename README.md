# My Places

Fullstack-приложение: личная карта мест с чеками и позициями. Отмечаешь на карте кафе/магазины/парки, ведёшь по ним чеки с позициями и оценками, видишь среднюю цену и рейтинг, ищешь рядом.

![Python](https://img.shields.io/badge/python-3.12-blue)
![Django](https://img.shields.io/badge/Django-6.1-092e20)
![DRF](https://img.shields.io/badge/DRF-3.18-red)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
![Coverage](https://img.shields.io/badge/coverage-83%25-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Результат

Бэкенд покрыт тестами на **83%**, **34 теста** проходят, статические проверки чистые: `ruff` — 0 ошибок, `mypy` — 0, `tsc` — 0, `eslint` — 0 ошибок.

```text
Ran 34 tests in 18.7s
OK

Name                    Stmts   Miss  Cover
places\models.py           45      0   100%
places\serializers.py      39      2    95%
places\views.py            82     31    62%
project\urls.py            10      0   100%
------------------------------------------
TOTAL                     207     36    83%
```

> 📷 Скриншот интерфейса — добавьте в `docs/screenshot.png`.

---

## Как это работает

Пользователь видит карту (Leaflet + OpenStreetMap). Клик по карте создаёт **место** (`Place`). Внутри места заводятся **чеки** (`Check`) — дата визита, комментарий и список **позиций** (`CheckItem`: название, цена, оценка 1–5). По месту автоматически считаются средняя цена, средний рейтинг и число чеков. Маркеры на карте окрашены по рейтингу. Поиск работает в двух режимах: по своим местам (название/адрес) и по карте через геокодер Nominatim. Отдельный эндпоинт `/nearby` возвращает места в радиусе от точки.

---

## Быстрый старт

Через Docker (рекомендуется):

```bash
git clone git@github.com:ITouch228/django-react-myplaces.git
cd django-react-myplaces

cp backend/.env.example backend/.env      # заполни SECRET_KEY
cp frontend/.env.example frontend/.env

docker-compose up --build -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

- Фронт — http://localhost:5173
- API — http://localhost:8000/api
- Django Admin — http://localhost:8000/admin

Без Docker:

```bash
# backend
cd backend && python -m venv .venv && .venv\Scripts\activate   # Win
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env && python manage.py migrate && python manage.py runserver

# frontend
cd frontend && npm ci && cp .env.example .env && npm run dev
```

---

## Стек

**Backend**
- **Python** 3.12.0
- **Django** 6.1 + **DRF** 3.18
- **SimpleJWT** — access/refresh токены
- **django-filter**, **django-cors-headers**
- **geopy** — расчёт расстояний (haversine)
- **SQLite** (переключаемый на PostgreSQL)
- **Ruff** (lint + format) + **mypy** (types) + **coverage**

**Frontend**
- **React** 18 + **TypeScript** 5.2 + **Vite** 5
- **React Router** 6, **TanStack Query** 5
- **React Leaflet** — карта, **Nominatim** — геокодинг
- **Axios** — с интерцептором auto-refresh JWT
- **Vitest** + Testing Library, **ESLint** + Prettier

**Инфраструктура**
- **Docker** multi-stage (base/dev/prod) + docker-compose, **Makefile**

---

## Архитектура

Два независимых приложения с REST-границей между ними.

**Backend** (`backend/`):
- `places/` — единственное доменное приложение: `models`, `serializers`, `views`, `tests`
- `project/` — `settings`, `urls`, `wsgi`/`asgi`

**Frontend** (`frontend/src/`):
- `api/` — axios-клиент + интерцептор refresh
- `context/` + `providers/` — `AuthContext` / `AuthProvider`
- `hooks/` — `useAuth`, `usePlaces`, `useChecks`, `useGeocode`, `useGeolocation`
- `pages/` — `Login`, `Register`, `Map`, `PlaceDetail`
- `components/` — `Map`, `Checks`, `Modals`, `Routes`
- `types/` — общие TS-типы

### Ключевые решения

- **Изоляция данных по владельцу.** Каждый `get_queryset()` фильтрует `filter(user=request.user)` — пользователь физически не видит чужие места и чеки (проверено тестом `test_delete_place_another_user` → 404).
- **Auto-refresh JWT с очередью запросов.** При 401 интерцептор обновляет токен ровно один раз, а параллельные упавшие запросы складываются в очередь и повторяются после обновления — без «штурма» `/token/refresh/`.
- **Один POST создаёт чек со всеми позициями.** Вложенный `CheckSerializer` с `items` принимает чек и позиции одним запросом, `create()` переписывает вложенность в два шага.
- **Регистрация сразу отдаёт токены.** `/register/` возвращает access+refresh через `RefreshToken.for_user` — фронт не делает второй round-trip на логин.
- **`/nearby` через geopy, сортировка по дистанции.** Радиус в км, haversine-расстояние, ответ отсортирован от ближайшего; валидация координат и `radius` с 400 на мусор.
- **Геокодинг Nominatim на клиенте с явным `parseFloat`.** Nominatim возвращает координаты строками — парсим и проверяем `isNaN` до передачи на карту.
- **Маркеры-иконки, окрашенные по рейтингу.** Кастомный `divIcon` с цветом от среднего рейтинга места — сила места читается на карте без клика.
- **Инвалидация кэша по ключу места.** После мутации чека `invalidateQueries(["place", id])` + `["places"]` — агрегаты (средняя цена/рейтинг) пересчитываются на фронте без ручного рефетча.

### Что решалось по ходу

- **CORS был открыт на всех (`CORS_ALLOW_ALL_ORIGINS=True`).** Опасно на проде → теперь `allow_all` только в `DEBUG`, на проде — явный список из `CORS_ALLOWED_ORIGINS`.
- **`filter(user=AnonymousUser)` ронял эндпоинты.** У `Check`/`CheckItem` стоял `IsAuthenticatedOrReadOnly`, но `get_queryset` всегда фильтровал по юзеру → гость вызывал исключение. Заменил на `IsAuthenticated`.
- **Refresh ломался вне localhost.** Интерцептор звал `/token/refresh/` через голый `axios` без `baseURL` → на проде уходил на фронт. Переключил на `api.defaults.baseURL`.
- **Старт падал с `None` без env.** `SECRET_KEY=None` → явный `RuntimeError` с инструкцией; `ALLOWED_HOSTS="".split(",")` давал `[""]` → fallback на `localhost,127.0.0.1`.
- **`requirements.txt` в UTF-16 с BOM** ломал `pip` на Linux/CI → переписан в UTF-8, убран неиспользуемый `psycopg2` (проект на SQLite).
- **Линтеры Python сведены с пяти (black/isort/flake8/bandit/mypy) к двум** — **Ruff** (lint+format+безопасность) и **mypy**. Один конфиг в `pyproject.toml`, быстрее и меньше конфликтов.

---

## Модель данных

```text
User
 └─ Place (name, address, lat, lng)
     └─ Check (visited_at, comment)
         └─ CheckItem (item_name, price, rating 1..5)
```

Агрегаты на `Place`: `avg_rating`, `avg_price`, `total_checks`.
Агрегаты на `Check`: `total`, `avg_rating`.

---

## API

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/register/` | Регистрация (сразу отдаёт токены) |
| POST | `/api/token/` | Логин (access + refresh) |
| POST | `/api/token/refresh/` | Обновить access |
| GET | `/api/user/` | Текущий юзер |
| CRUD | `/api/places/` | Места (видны только владельцу) |
| GET | `/api/places/nearby/?lat=&lng=&radius=` | Места рядом (км) |
| CRUD | `/api/checks/` | Чеки (+ вложенные позиции) |
| POST | `/api/checks/{id}/add_item/` | Добавить позицию в чек |
| CRUD | `/api/check-items/{id}/` | Позиции чека |

Все эндпоинты, кроме auth, требуют `Authorization: Bearer <access>`.

### Пример вывода

Создание чека одним запросом (чек + позиции):

```bash
POST /api/checks/
{ "place": 1, "visited_at": "2026-08-27", "comment": "Отличное место",
  "items": [{"item_name": "Кофе", "price": 150, "rating": 5},
            {"item_name": "Чизкейк", "price": 200, "rating": 4}] }
```

```json
{ "id": 1, "place": 1, "visited_at": "2026-08-27", "comment": "Отличное место",
  "total": 350.0, "avg_rating": 4.5,
  "items": [
    {"id": 1, "item_name": "Кофе", "price": 150.0, "rating": 5},
    {"id": 2, "item_name": "Чизкейк", "price": 200.0, "rating": 4}
  ] }
```

---

## Структура проекта

```text
backend/
    manage.py
    pyproject.toml           # конфиг ruff / mypy / coverage
    requirements.txt         # прод-зависимости
    requirements-dev.txt     # ruff, mypy, pytest, coverage
    .env.example             # шаблон конфига
    project/
        settings.py          # env-driven, безопасные fallback'ы
        urls.py              # роутер + JWT-эндпоинты
    places/
        models.py            # Place / Check / CheckItem + агрегаты
        serializers.py       # вложенный чек + UserSerializer
        views.py             # viewset'ы + /nearby + add_item
        tests.py             # 34 теста (модели + API + auth)
frontend/
    vite.config.ts
    .env.example
    src/
        api/api.ts           # axios + refresh-интерцептор с очередью
        context/             # AuthContext
        providers/           # AuthProvider
        hooks/               # useAuth/usePlaces/useChecks/useGeocode/...
        pages/               # Login/Register/Map/PlaceDetail
        components/          # Map/Checks/Modals/Routes
        types/               # общие TS-типы
docker-compose.yml           # backend + frontend, multi-stage
Makefile                     # команды разработки
```

---

## Команды (Makefile)

```bash
make up / make down          # контейнеры в фоне / остановить
make migrate                 # применить миграции
make createsuperuser         # завести админа

make lint                    # ruff + mypy + eslint + tsc
make lint-fix                # авто-фикс
make format                  # ruff format + prettier

make test                    # тесты фронта и бэка
make coverage                # покрытие бэка
```

Настройки линтеров — в `backend/pyproject.toml` (Ruff + mypy + coverage) и `frontend/.eslintrc.cjs`.

---

## Планы по улучшению

- **Кнопка геолокации через React Portal** вместо `document.createElement` (сейчас есть TODO в `MapController`).
- **PostgreSQL** вместо SQLite + `psycopg` (прод-таргет Docker уже на `gunicorn`).
- **Фото к позициям** через `ImageField` + медиа.
- **Деплой** (gunicorn + nginx + статика через WhiteNoise).
- **Тесты `/nearby`** и рост покрытия `views.py`.

---

## Лицензия

Учебный pet-проект. MIT. См. [LICENSE](LICENSE).
