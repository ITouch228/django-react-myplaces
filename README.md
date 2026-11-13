# MyPlaces

Личный дневник посещённых мест с картой, чеками, позициями заказов и оценками блюд.

**Стек:** Python 3.12, Django REST Framework, SQLite, React 18, TypeScript, Vite, Leaflet / OpenStreetMap. В будущем планируются PostgreSQL, каталог «Мои места» и фотографии.

## Быстрый запуск

### Windows PowerShell

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
# Замените SECRET_KEY в backend/.env на случайный секрет
docker compose up -d --build
docker compose ps
```

### Linux Bash

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Замените SECRET_KEY в backend/.env на случайный секрет
docker compose up -d --build
docker compose ps
```

| Приложение | Локальный адрес |
| --- | --- |
| Интерфейс | http://localhost:8071 |
| Django API | http://localhost:8072/api/ |
| Django Admin | http://localhost:8072/admin/ |
| Документация | http://localhost:8093 |

Используются отдельные порты, совместимые с запуском MyFiles/MyInventory на том же ПК. Файл `frontend/.env`, если был создан ранее, необходимо привести к `VITE_API_URL=http://localhost:8072`. CORS для backend должен разрешать frontend на 8071.

## Документация

Полное руководство находится в `docs/` и собирается через **MkDocs Material**. Docker поднимает статический сайт в отдельном контейнере Nginx:

```sh
docker compose up -d --build docs
```

Сборка с проверкой ссылок:

```sh
python -m pip install -r docs/requirements.txt
python -m mkdocs build --strict
```

[Главная](docs/index.md) · [Запуск](docs/getting-started.md) · [Руководство](docs/user-guide.md) · [Архитектура](docs/architecture.md) · [API](docs/api.md) · [Тесты](docs/testing.md) · [Jenkins](docs/jenkins.md) · [План](docs/roadmap.md)

## CI

В репозитории есть `Jenkinsfile` для **общего Jenkins-контроллера** MyInventory. Создаётся отдельный Multibranch Pipeline job `MyPlaces`, без нового Jenkins-сервера. Для его запуска нужен Linux agent с Python 3.12 и Node.js 22, label `myplaces-python312-node22`. Полная инструкция: [Единый Jenkins](docs/jenkins.md).

GitHub Actions пока сохранён как резервный проверенный CI: проверяет backend, frontend и документацию. Он может быть отключён отдельной задачей только после успешной проверки Jenkins.

## Текущее состояние

Реализованы авторизация, карта личных мест, чеки с ценами и оценками позиций, фильтрация по владельцу, ближайшие места и базовые тесты. **Отдельная вкладка «Мои места», фото чеков и PostgreSQL пока не реализованы.** Подробнее о приоритетах: [дорожная карта](docs/roadmap.md).

!!! Важно: это заметка для README, а не Markdown MkDocs.
При открытии базы SQLite вручную сделайте резервную копию. Не удаляйте `backend/db.sqlite3` и не используйте `docker compose down -v` как способ исправления ошибок запуска.
