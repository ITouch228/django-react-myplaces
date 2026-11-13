# Единый Jenkins для MyPlaces, MyInventory и MyFiles

**Один ПК, один Jenkins-контроллер, отдельные Multibranch Pipeline jobs.** Новый контроллер MyPlaces не запускается: используйте уже работающий Jenkins MyInventory на http://localhost:8092.

## Целевая схема

```text
ПК / Docker
  Jenkins controller :8092 (существующий)
    +-- MyInventory (Multibranch Pipeline)
    +-- MyPlaces    (Multibranch Pipeline)
    +-- MyFiles     (добавить при переносе с GitHub Actions)
         |
         +-- build agents (изолированные executors)
```

Контроллеру выставить **0 executors**. На рабочих агентах должны быть Git, Python 3.12, Node.js 22 с npm и доступ к репозиторию. Агенту не нужен Docker socket, и ему нельзя монтировать рабочие базы данных или каталоги с фотографиями других проектов.

Текущий агент MyInventory `myinventory-node22` уже содержит Node 22 и Python из дистрибутива, но **версия Python 3.12 не подтверждена**. Нельзя считать его совместимым с Django 6.1 без проверки.

Для MyPlaces Jenkinsfile использует label `myplaces-python312-node22`. В репозитории есть **отдельный inbound-agent** (`ci/jenkins/agent/Dockerfile`), содержащий Python 3.12 + Node 22. Он подключается к существующему контроллеру по внутренней Docker-сети; **второй Jenkins-сервер не создаётся**. Альтернатива: назначить label уже существующему агенту, если у него есть совместимый Python 3.12.

### Запуск дополнительного агента

1. В Jenkins создай **Manage Jenkins -> Nodes -> New Node**, имя `myplaces-python312-node22`, Permanent Agent, один executor, Remote root directory `/home/jenkins/agent`, Launch method **Launch agent by connecting it to the controller**, WebSocket.
2. Скопируй выданный Jenkins secret. Проверь имя сети, в которой работает контроллер MyInventory: `docker network ls` (обычно `jenkins_ci`; фактическое имя может отличаться).
3. Создай локальный файл `ci/jenkins/.env` из шаблона. Укажи `JENKINS_NETWORK` и `JENKINS_SECRET`. Никогда не коммить секрет.
4. Из корня MyPlaces запусти:

Windows PowerShell:

```powershell
Copy-Item ci/jenkins/.env.example ci/jenkins/.env
# Заполни JENKINS_SECRET и реальное JENKINS_NETWORK
docker compose -f ci/jenkins/compose.yaml up -d --build agent
docker compose -f ci/jenkins/compose.yaml logs --tail=100 agent
```

Linux Bash:

```bash
cp ci/jenkins/.env.example ci/jenkins/.env
# Заполни JENKINS_SECRET и реальное JENKINS_NETWORK
docker compose -f ci/jenkins/compose.yaml up -d --build agent
docker compose -f ci/jenkins/compose.yaml logs --tail=100 agent
```

Агент не содержит Jenkins-контроллер, не публикует порты и не получает Docker socket. Проверить, что Node появился **Online**, прежде чем запускать Pipeline.

## Подключение MyPlaces

1. В существующем Jenkins убедиться, что агент `myplaces-python312-node22` в статусе **Online**, содержит Python 3.12, Node 22, Git и npm.
2. Создать **New Item -> Multibranch Pipeline** с именем `MyPlaces`.
3. Branch Source -> Git, URL `git@github.com:ITouch228/django-react-myplaces.git`.
4. Credentials: SSH Username with private key (пользователь `git`) из **Jenkins Credentials**, без приватных ключей в репозитории.
5. Script Path: `Jenkinsfile`. Включить периодическое **Branch Indexing** для поиска новых веток; `pollSCM` опрашивает уже обнаруженные ветки.
6. Выполнить **Scan Multibranch Pipeline Now**, затем запустить ветку `docs/mkdocs-shared-jenkins`.
7. Убедиться, что все этапы зелёные и последний SHA совпадает с push.

Если GitHub SSH host key ещё не известен Jenkins, настройте проверенный ключ в Git Host Key Verification Configuration; **не отключайте** host verification.

## Этапы pipeline

| Этап | Команда / проверка |
| --- | --- |
| Checkout | Git + версии Python/Node |
| Backend deps | `pip install` в виртуальное окружение workspace |
| Backend lint/types | Ruff lint/format, mypy |
| Django | system check, контроль миграций |
| Backend tests | Django TestCase и coverage |
| Frontend deps | `npm ci` |
| Frontend quality | ESLint, TypeScript/Vite build |
| Frontend tests | Vitest (пока поддерживает пустой набор) |
| Docs | MkDocs strict, проверка итогового HTML |

Jenkinsfile не собирает APK (MyPlaces - веб-приложение), не выкладывает новые версии, не монтирует Docker socket и **не подключается к действующей базе**. Отчёты coverage хранятся как артефакты без пользовательских файлов. `buildDiscarder` ограничивает историю.

## GitHub Actions

На время внедрения Jenkins текущий GitHub Actions workflow **оставлен** как проверенный резервный CI. После того как Jenkins прогонит несколько коммитов и будет проверяться при push, можно отдельным PR выключить дублирующий Actions. Не отключайте работающий CI до подтверждения нового.

## Обслуживание одного Jenkins

- Для MyInventory и MyPlaces используйте разные workspace и lock-файлы, не общий `node_modules`.
- Ограничьте параллелизм по памяти ПК: один executor на агенте - безопасная начальная настройка.
- Храните Jenkins credentials только в Jenkins, отдельно от Git репозиториев.
- Периодически сохраняйте `jenkins_home` и проверяйте восстановление; не используйте `docker compose down -v` на действующей установке.
- Не копируйте `ci/jenkins/compose.yaml` MyInventory в MyPlaces: он содержит определение **того же контроллера**, что привело бы к дублированию.

## Приёмка Jenkins-перехода

1. Агент online и виден MyPlaces job.
2. Изменение в feature-ветке запускает pipeline.
3. Ошибка Ruff/TypeScript/теста приводит к FAILED.
4. Исправленный commit запускает новый build.
5. Проверка docs выполняет `mkdocs build --strict`.
6. Последний SHA зелёный; после merge отдельно проверен main.
