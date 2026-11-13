# Один Jenkins и один общий агент

MyPlaces использует существующий Jenkins MyInventory на **http://localhost:8092**, без второго контроллера или агента. Общий агент собирается **только** из репозитория [MyInventory](https://github.com/ITouch228/fastapi-react-my_inventory), ветка `ci/shared-agent-python312-node22` до её слияния с main.

## Архитектура

```text
Jenkins controller :8092 (существующий)
  └── Jenkins agent (один контейнер, один executor)
      ├── MyInventory job
      ├── MyPlaces job
      └── MyFiles job (после подготовки Jenkinsfile)
```

Контроллеру установить **0 executors**; общему агенту оставить **1 executor** и назначить label `shared-ci`. Имя существующего агента `myinventory-node22` можно **сохранить**. Меняется лишь label Jenkins Node: добавить `shared-ci` (старый label можно оставить для совместимости). Это исключает необходимость регистрировать новое Jenkins Node.

## Подготовка единого агента

1. Слить ветку `ci/shared-agent-python312-node22` в репозитории MyInventory после проверки. Dockerfile агента теперь включает Python 3.12, Node 22, Git и npm.
2. Пересобрать **только агент** из MyInventory. Не удалять `jenkins_home` и не пересоздавать контроллер.

Windows PowerShell и Linux Bash, из корня MyInventory:

```sh
docker compose -f ci/jenkins/compose.yaml --profile agent up -d --build agent
docker compose -f ci/jenkins/compose.yaml --profile agent ps
docker compose -f ci/jenkins/compose.yaml --profile agent logs --tail=100 agent
```

3. В **Manage Jenkins -> Nodes** у существующего агента поставить label `shared-ci`, **1 executor**, проверить статус Online.
4. Убедиться в наличии `python3.12 --version`, `node --version`, `npm --version` через Jenkins pipeline.

!!! warning "Никакого второго Jenkins"
    В MyPlaces **нет** собственного compose, Dockerfile агента и конфигурации второго контроллера. Используется агент из MyInventory. Не запускайте вторую Jenkins-инфраструктуру.

## Подключение MyPlaces

Создать **New Item -> Multibranch Pipeline** с именем `MyPlaces`.

- Git URL: `git@github.com:ITouch228/django-react-myplaces.git`.
- Credentials: SSH Username with private key, username `git`; ключ хранить в Jenkins Credentials.
- Script Path: `Jenkinsfile`; agent label `shared-ci`.
- Включить Branch Indexing и проверить Scan Multibranch Pipeline Now.
- Запустить ветку `docs/mkdocs-shared-jenkins` и проверить актуальный SHA.

`pollSCM` проверяет уже найденные ветки; Branch Indexing обнаруживает новые. Проверяйте SSH host key, не отключайте его проверку.

## Что проверяется

| Этап | Проверка |
| --- | --- |
| Backend | Ruff, mypy, Django checks, миграции, тесты, coverage |
| Frontend | npm ci, ESLint, Vite/TypeScript build, Vitest |
| Документация | MkDocs strict и проверка собранного HTML |

MyInventory использует тот же label `shared-ci`. Для MyFiles отдельный Jenkinsfile ещё предстоит добавить, не создавая другого агента.

Рабочие директории jobs изолированы Jenkins. Python virtualenv создаётся внутри workspace каждого задания. Docker socket, рабочие SQLite-базы и каталоги файлов не передаются агенту.

## Переход с GitHub Actions

GitHub Actions MyPlaces оставляем как резерв до подтверждения успешного Jenkins на нескольких коммитах. Только после проверки поведения Multibranch Pipeline можно отключить дублирующий Actions отдельным изменением.

## Приёмка

1. В Jenkins один контроллер, **один Online агент** с label `shared-ci`.
2. MyInventory и MyPlaces jobs работают по очереди и проходят CI на последнем SHA.
3. Ошибка Ruff/TypeScript приводит к FAILED, исправленный коммит вызывает новый запуск.
4. MkDocs strict проходит в обоих проектах.
5. После merge проверен `main`.
