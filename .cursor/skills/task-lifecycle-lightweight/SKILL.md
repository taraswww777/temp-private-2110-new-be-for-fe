---
name: task-lifecycle-lightweight
description: >-
  Ведёт легковесный жизненный цикл задач в docs/tasks без обязательного манифеста:
  frontmatter со статусами backlog/in-progress/done/cancelled, источник local/github,
  опциональная связь с GitHub Issue. Используй при создании, обновлении и закрытии задач.
---

# Легковесный жизненный цикл задач

Полный регламент и примеры: **[reference.md](reference.md)**.

## Обязательный минимум

1. Задача хранится в `docs/tasks/*.md`.
2. Статус хранится в frontmatter: `backlog | in-progress | done | cancelled`.
3. Поле исполнителя не обязательно.
4. Если есть GitHub Issue, поддерживай связь через `githubIssue`.
5. При смене статуса обновляй `updatedAt`.
