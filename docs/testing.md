# Тестирование

## Backend, Python 3.12

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-dev.txt
$env:SECRET_KEY = "local-ci-only-not-for-production"
.\.venv\Scripts\ruff.exe check .
.\.venv\Scripts\ruff.exe format --check .
.\.venv\Scripts\mypy.exe .
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test
```

### Linux Bash

```bash
cd backend
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt -r requirements-dev.txt
export SECRET_KEY="local-ci-only-not-for-production"
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/mypy .
.venv/bin/python manage.py check
.venv/bin/python manage.py makemigrations --check --dry-run
.venv/bin/python manage.py test
```

`manage.py test` создаёт отдельную тестовую базу Django, не используйте рабочие данные для ручного тестирования.

## Frontend

```sh
cd frontend
npm ci
npm run lint
npm run build
npm run test -- --run --passWithNoTests
```

!!! warning "Неполное покрытие"
    `--passWithNoTests` пока разрешает отсутствие frontend-тестов. Следующий этап - реальные тесты React и удаление этого флага.

## Документация

```sh
python -m pip install -r docs/requirements.txt
python -m mkdocs build --strict
```

## Перед merge

- Проверить актуальный SHA ветки и зелёные backend, frontend, docs проверки.
- Повторить основной сценарий: вход, создание места, создание чека с несколькими позициями, изменение и удаление.
- Проверить карту, фильтрацию собственных мест и отсутствие доступа к чужим данным.
- Проверить панель «Мои места»: открытие/закрытие, пустое состояние, поиск по названию и адресу, сброс запроса, сортировку, переход к **нужному** маркеру, открытие popup и ссылку «Подробнее». Поиск своих мест должен отсутствовать в строке поиска адреса над картой. На телефоне проверить нижнюю панель, прокрутку длинного списка и отсутствие перекрытия элементов управления.
- Проверить чеки: разворачивание и сворачивание, редактирование и удаление чека, добавление/изменение/удаление позиции, длинные названия и адаптацию на телефоне. Нет последовательных анимаций появления и скачков карточек.
- Проверить запуск Docker Compose и правильные порты.
- Если менялась схема БД, проверить миграции и сохранность существующих данных.
- После merge повторить CI на `main`.

Это единый чек-лист для текущих изменений. По мере реализации фото и статистики расширять его, не плодить отдельные чек-листы.
