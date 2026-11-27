# Установка и запуск

## Порты на одном ПК

| Сервис | Адрес с компьютера |
| --- | --- |
| MyPlaces React | http://localhost:8071 |
| MyPlaces Django API | http://localhost:8072/api/ |
| MyPlaces документация | http://localhost:8073 |
| Общий Jenkins (уже существующий) | http://localhost:9061 |

Порты хоста: `8071` для Vite, `8072` для Django API и `8073` для MkDocs. В контейнерах Django слушает `8001`, Vite слушает `8071`, Nginx для MkDocs слушает `80`.

## Windows (PowerShell)

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
# Замените SECRET_KEY в backend/.env на случайный секрет.
# Проверьте VITE_API_URL=http://localhost:8072
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend
```

## Linux (Bash)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Замените SECRET_KEY в backend/.env на случайный секрет.
# Проверьте VITE_API_URL=http://localhost:8072
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend
```

Для новой базы Django выполняет миграции при старте контейнера. Для входа в панель администратора:

```sh
docker compose exec backend python manage.py createsuperuser
```

## Документация

```sh
docker compose up -d --build docs
```

Открой http://localhost:8073. Контейнер Nginx обслуживает статический сайт MkDocs; постоянно работающий Python на хосте не нужен.

## Диагностика

Если браузер показывает `ERR_CONNECTION_REFUSED`, сначала проверь `docker compose ps -a` и `docker compose logs --tail=100 backend`. Запросы выполняются **из браузера**, поэтому API URL должен ссылаться на опубликованный порт хоста (8072), а не на `backend:8001`.

Для API без авторизации `GET /api/places/` сейчас возвращает пустой список, не публичный каталог мест.

!!! warning "Данные и безопасность"
    Backend хранит записи в SQLite (`backend/db.sqlite3`) и монтирует директорию `backend/`. Не выполняйте удаление рабочей базы и `docker compose down -v` как метод исправления ошибок. Dev-сборку не публикуйте в интернет.
