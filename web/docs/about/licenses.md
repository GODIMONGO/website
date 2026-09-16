---
title: Лицензии
description: Информация о лицензиях для каждого компонента Calagopus. Всё лицензировано под MIT, если не указано иное.
---

# Лицензии

Calagopus — проект с открытым исходным кодом. Если для компонента ниже не указано иное, он
лицензирован под **лицензией MIT** (`Copyright (c) Calagopus`).

## Репозитории

| Репозиторий | Лицензия | Примечания |
| --- | --- | --- |
| [`calagopus/panel`](https://github.com/calagopus/panel) | MIT | Основная панель (бэкенд, фронтенд, общий код). |
| [`calagopus/wings`](https://github.com/calagopus/wings) | MIT | Демон на узле. |
| [`calagopus/website`](https://github.com/calagopus/website) | MIT | Сайт документации и маркетинга. |
| [`calagopus/bot`](https://github.com/calagopus/bot) | MIT | Интеграция с Discord-ботом. |
| [`calagopus/fusequota`](https://github.com/calagopus/fusequota) | GNU GPL-2.0 | Применение квот на основе FUSE для ненативных файловых систем. |
| [`calagopus/branding`](https://github.com/calagopus/branding) | Creative Commons Zero v1.0 Universal | Брендовые материалы (логотипы, иконки и т. д.). |
| [`calagopus/whmcs-module`](https://github.com/calagopus/whmcs-module) | MIT | Модуль интеграции с WHMCS. |
| [`calagopus/paymenter-module`](https://github.com/calagopus/paymenter-module) | MIT | Модуль интеграции с Paymenter. |
| [`calagopus/blesta-module`](https://github.com/calagopus/blesta-module) | MIT | Модуль интеграции с Blesta. |
| [`calagopus/vscode-extension`](https://github.com/calagopus/vscode-extension) | MIT | Расширение VSCode для Calagopus. |

## Включённые и vendored-компоненты

Некоторые репозитории vendoring'ят или оборачивают сторонний код, лицензия которого отличается от
MIT-лицензии проекта. Их нужно указать для всех, кто распространяет
Calagopus коммерчески.

| Компонент | Расположение | Лицензия | Примечания |
| --- | --- | --- | --- |
| `unrar-rs` (обёртка) | `wings/unrar-rs` | MIT OR Apache-2.0 | Rust-обёртка пермиссивная. |
| UnRAR C library | (через `unrar_sys`) | **Лицензия UnRAR** | Несвободная, ограничительная. |

## Полные лицензии зависимостей

Полный транзитивный список лицензий зависимостей доступен в SBOM.

[См. SBOM здесь](https://packages.calagopus.com/sbom/).
