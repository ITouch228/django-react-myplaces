# Процесс разработки

MyPlaces развиваем небольшими feature-ветками от актуального `main`. Ветки `feat/`, `fix/`, `docs/`, `test/`, `chore/` создаются под отдельный набор изменений.

1. Синхронизировать main и создать feature-ветку.
2. Реализовать изменение с тестами и соответствующей документацией.
3. Запустить локальные проверки из [Тестирования](testing.md).
4. Push; дождаться успешного CI на **последнем SHA** (GitHub Actions до завершения Jenkins-перехода).
5. Пройти относящиеся к изменению сценарии из [единого чек-листа](testing.md#перед-merge).
6. Вручную выполнить merge после проверки, затем проверить CI для main.

Команды Git одинаковые для Windows PowerShell и Linux Bash:

```sh
git switch main
git pull --ff-only
git switch -c feat/example
# Работа, commit, проверки
git push -u origin feat/example
# После успешной проверки
git switch main
git pull --ff-only
git merge --no-ff feat/example
git push origin main
git branch -d feat/example
git push origin --delete feat/example
```

При необходимости PR можно создавать для code review; обязательным он не является. Не используйте force push в main.

Документация - пользовательский и технический источник правды. Реализованные возможности описывайте отдельно от планируемых, не храните заметки для ИИ в пользовательских разделах.

Подробнее о CI: [Jenkins](jenkins.md); приёмка: [Тестирование](testing.md).
