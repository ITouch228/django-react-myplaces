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
npm run test:ci
```

!!! note "Текущий уровень покрытия"
    `npm run test:ci` запускает реальные Vitest-тесты и **завершается ошибкой при отсутствии тестов**. Проверяются поиск, сортировка, выбор и состояния пустого списка, а также валидация, отправка, отмена и блокировка формы создания места. Полный browser E2E и проверки реального Leaflet пока не реализованы.

## Документация

```sh
python -m pip install -r docs/requirements.txt
python -m mkdocs build --strict
```

Панель «Мои места»: при любом непустом поисковом запросе показывается ровно одна кнопка «Сбросить поиск», даже если совпадений нет. При пустом запросе кнопки нет. Компонентный тест проверяет оба состояния.

## Перед merge

- Проверить актуальный SHA ветки и зелёные backend, frontend, docs проверки.
- Повторить основной сценарий: вход, создание места, создание чека с несколькими позициями, изменение и удаление.
- Проверить новую форму добавления места: клик по карте открывает окно с координатами; название обязательно, пробелы обрезаются, название длиной более 200 символов отклоняется, адрес необязателен; отмена/крестик/Escape не создают запись; при сохранении кнопки блокируются; ошибка API показывает сообщение без потери ввода; успешный POST показывает новый маркер и запись в панели. Проверить на телефоне, включая появление клавиатуры.
- Проверить карту, фильтрацию собственных мест и отсутствие доступа к чужим данным.
- Проверить панель «Мои места»: открытие/закрытие, пустое состояние, поиск по названию и адресу, сброс запроса (кнопки «Очистить поле поиска» и «Сбросить поиск» имеют разные доступные имена и не конфликтуют в тестах), сортировку, переход к **нужному** маркеру, открытие popup и ссылку «Подробнее». Поиск своих мест должен отсутствовать в строке поиска адреса над картой. На телефоне проверить нижнюю панель, прокрутку длинного списка и отсутствие перекрытия элементов управления.
- Проверить чеки: разворачивание и сворачивание, редактирование и удаление чека, добавление/изменение/удаление позиции, длинные названия и адаптацию на телефоне. Нет последовательных анимаций появления и скачков карточек.
- Проверить запуск Docker Compose и правильные порты.
- Если менялась схема БД, проверить миграции и сохранность существующих данных.
- После merge повторить CI на `main`.

Это единый чек-лист для текущих изменений. По мере реализации фото и статистики расширять его, не плодить отдельные чек-листы.

## Обязательные frontend-тесты в CI

Jenkins и GitHub Actions запускают **одну и ту же команду**:

```sh
cd frontend
npm ci
npm run test:ci
```

Vitest обнаруживает файлы `*.test.ts` и `*.test.tsx`. Компонентные тесты используют окружение `jsdom`, React Testing Library и MemoryRouter. Пустой набор тестов или упавший тест означает красную сборку. Мокировать запросы или `MapContainer` в следующих тестах нужно локально и детерминированно; не обращаться к реальному Nominatim в CI.

Для ветки `test/frontend-component-baseline` перед merge обязательно проверить: тесты запускаются в Jenkins на последнем SHA, весь frontend gate зелёный, в логах есть исполняемые кейсы `CreatePlaceDialog` и `PlacesPanel`; ручной smoke карты на ПК и телефоне не заменён тестами компонентов.
