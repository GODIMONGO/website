import { fileURLToPath } from 'node:url';
import { imagetools } from 'vite-imagetools';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';
import { compareFaqs } from './data/compare-faqs.ts';
import { dbAgentConfigDoc } from './data/config/db-agent.ts';
import { wingsConfigDoc } from './data/config/wings.ts';
import { faqs } from './data/faqs.ts';
import { acceptMarkdownPlugin } from './plugins/accept-markdown.ts';
import { aiDocPlugin } from './plugins/ai-doc.ts';
import { writeConfigDocs } from './plugins/config-docs.ts';
import { generateLlmsArtifacts } from './plugins/llms.ts';
import { imageAssetsPlugin, imageMime, writeImageManifest } from './plugins/mcp-images.ts';
import { recordPage, writePageManifest } from './plugins/mcp-manifest.ts';
import { expandReleaseMarkdown } from './plugins/releases.ts';
import { expandFeaturedSponsorsMarkdown } from './plugins/sponsor-sections.ts';
import { expandSponsorsMarkdown } from './plugins/sponsors.ts';

const SITE_URL = process.env.SITE_URL ?? 'https://calagopus.com';
const SRC_DIR = 'web';
// Base path for the built site. Override via BASE_PATH for deployments served
// from a subpath (e.g. GitHub Pages at https://<user>.github.io/<repo>/).
const BASE_PATH = process.env.BASE_PATH ?? '/';

// Config reference pages are generated from their definitions before VitePress
// reads the source tree, so the rendered page, the raw `.md` and the example
// config block can never drift apart.
await writeConfigDocs([wingsConfigDoc, dbAgentConfigDoc], SRC_DIR);

interface SidebarNode {
  text?: string;
  link?: string;
  items?: SidebarNode[];
}

interface BreadcrumbEntry {
  name: string;
  item?: string;
}

let breadcrumbMap: Map<string, BreadcrumbEntry[]> | null = null;

function buildBreadcrumbMap(sidebar: SidebarNode[]): Map<string, BreadcrumbEntry[]> {
  const map = new Map<string, BreadcrumbEntry[]>();
  const walk = (items: SidebarNode[], trail: BreadcrumbEntry[]) => {
    for (const node of items) {
      const entry: BreadcrumbEntry = {
        name: node.text ?? '',
        item: node.link ? `${SITE_URL}${node.link.replace(/\/$/, '')}` : undefined,
      };
      if (node.link) map.set(node.link.replace(/\/$/, ''), [...trail, entry]);
      if (node.items) walk(node.items, [...trail, entry]);
    }
  };
  walk(sidebar, [{ name: 'Документация', item: `${SITE_URL}/docs` }]);
  return map;
}

// https://vitepress.dev/reference/site-config
export default withMermaid({
  buildConcurrency: 128,
  base: BASE_PATH,
  srcDir: SRC_DIR,
  cleanUrls: true,

  vite: {
    plugins: [
      acceptMarkdownPlugin(),
      aiDocPlugin([
        {
          route: '/ai-doc/extensions.md',
          title: 'Extensions',
          sourceDir: 'docs/panel/extensions',
        },
      ]),
      imagetools({
        defaultDirectives: async (url, metadata) => {
          const ext = url.pathname.split('.').pop()?.toLowerCase() ?? '';
          const params = new URLSearchParams();
          if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return params;
          if (ext !== 'webp') params.set('format', 'webp');
          if (!url.searchParams.has('w') && ((await metadata()).width ?? 0) > 1600) {
            params.set('w', '1600');
          }
          return params;
        },
      }),
      imageAssetsPlugin(),
      ViteImageOptimizer({
        exclude: /\.webp$/i,
        png: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        svg: {
          multipass: true,
        },
      }),
    ],
    build: {
      assetsInlineLimit: (filePath) => (imageMime(filePath) === undefined ? undefined : false),
    },
    optimizeDeps: {
      // mermaid is only imported behind a <ClientOnly> component, so Vite's
      // dependency scanner never discovers it and its CJS deps (e.g. fastdom)
      // get served unbundled, which breaks on their missing default export.
      include: ['mermaid'],
    },
    server: {
      allowedHosts: true,
    },
    resolve: {
      alias: [
        {
          find: /^.*\/VPDocFooterLastUpdated\.vue$/,
          replacement: fileURLToPath(new URL('./components/LastUpdated.vue', import.meta.url)),
        },
        {
          find: /^.*\/VPNavBarSocialLinks\.vue$/,
          replacement: fileURLToPath(new URL('./components/NavBarSocialLinks.vue', import.meta.url)),
        },
      ],
    },
  },

  markdown: {
    image: { lazyLoad: true },
    config(md) {
      md.use(tabsMarkdownPlugin);

      const defaultCodeInline = md.renderer.rules.code_inline!;
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet('v-pre', '');
        return defaultCodeInline(tokens, idx, options, env, self);
      };
    },
  },

  lang: 'ru-RU',
  lastUpdated: true,
  title: 'Calagopus',
  description:
    'Calagopus — это современная панель управления игровыми серверами с открытым исходным кодом, написанная на Rust. Развёртывание, мониторинг и управление серверами Minecraft, Hytale и других игр с производительностью, задающей стандарты в отрасли.',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: 'https://calagopus.com/fulllogo.png' }],
    ['meta', { property: 'og:site_name', content: 'Calagopus' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://calagopus.com/fulllogo.png' }],
    ['meta', { name: 'twitter:image:alt', content: 'Calagopus Logo' }],
    [
      'meta',
      {
        name: 'darkreader-lock',
      },
    ],
    ['link', { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' }],
    ['link', { rel: 'alternate', type: 'text/markdown', href: '/llms.txt' }],
    [
      'script',
      {
        async: '',
        src: 'https://cat.rjns.dev/js/pa-UGDhLytrpOd8s1bLYPQQt.js',
      },
    ],
    [
      'script',
      {},
      `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}}; plausible.init()`,
    ],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Calagopus',
            url: SITE_URL,
            logo: `${SITE_URL}/fulllogo.png`,
            sameAs: ['https://github.com/calagopus', 'https://discord.gg/uSM8tvTxBV'],
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'Calagopus',
            url: SITE_URL,
            publisher: { '@id': `${SITE_URL}/#organization` },
          },
          {
            '@type': 'SoftwareApplication',
            '@id': `${SITE_URL}/#software`,
            name: 'Calagopus',
            description: 'An open-source game server management panel built in Rust.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Linux',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            url: SITE_URL,
            image: `${SITE_URL}/fulllogo.png`,
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            license: 'https://github.com/calagopus/panel/blob/main/LICENSE',
            downloadUrl: 'https://github.com/calagopus/panel/releases/latest',
            softwareHelp: `${SITE_URL}/docs`,
          },
        ],
      }),
    ],
  ],

  themeConfig: {
    logo: '/icon.svg',

    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Что такое Calagopus?', link: '/docs/about/what-is-calagopus' },
      {
        text: 'Сравнение',
        items: [
          { text: 'Сравнение альтернатив Pterodactyl', link: '/compare/' },
          { text: 'Calagopus против Pterodactyl', link: '/compare/calagopus-vs-pterodactyl' },
          { text: 'Calagopus против Pelican', link: '/compare/calagopus-vs-pelican' },
          { text: 'Calagopus против AMP', link: '/compare/calagopus-vs-amp' },
          { text: 'Pterodactyl против Pelican', link: '/compare/pterodactyl-vs-pelican' },
          { text: 'Бенчмарки', link: '/docs/about/benchmarks' },
          { text: 'Справочник функций', link: '/docs/about/features' },
        ],
      },
      { text: 'Релизы', link: '/docs/releases/' },
      { text: 'Блог', link: '/blog/' },
      { text: 'Документация', link: '/docs' },
    ],

    sidebar: [
      {
        text: 'О Calagopus',
        items: [
          { text: 'Что такое Calagopus?', link: '/docs/about/what-is-calagopus' },
          { text: 'Справочник функций', link: '/docs/about/features' },
          { text: 'Бенчмарки', link: '/docs/about/benchmarks' },
          { text: 'Безопасность', link: '/docs/about/security' },
          { text: 'Спонсоры', link: '/docs/about/sponsors' },
          { text: 'MCP-сервер документации', link: '/docs/about/mcp-server' },
          {
            text: 'Принципы',
            collapsed: true,
            items: [
              { text: 'Архитектура', link: '/docs/about/architecture' },
              { text: 'Брендинг', link: '/docs/about/branding' },
              { text: 'Переводы', link: '/docs/about/translations' },
              { text: 'Лицензии', link: '/docs/about/licenses' },
            ],
          },
          {
            text: 'Blog',
            link: '/blog/',
            collapsed: true,
            items: [{ text: 'Вышел Calagopus 1.2.0', link: '/blog/release-1.2.0' }],
          },
        ],
      },

      {
        text: 'Релизы',
        link: '/docs/releases/',
        items: [
          { text: 'Панель', link: '/docs/releases/panel' },
          { text: 'Wings', link: '/docs/releases/wings' },
          { text: 'DB Agent', link: '/docs/releases/db-agent' },
        ],
      },

      {
        text: 'Панель',
        link: '/docs/panel/',
        items: [
          { text: 'Обзор', link: '/docs/panel/overview' },
          { text: 'Окружение', link: '/docs/panel/environment' },
          {
            text: 'Функции',
            link: '/docs/panel/features/',
            collapsed: true,
            items: [
              {
                text: 'Аутентификация',
                link: '/docs/panel/features/auth/',
                collapsed: true,
                items: [
                  { text: 'Вход', link: '/docs/panel/features/auth/login' },
                  { text: 'Регистрация', link: '/docs/panel/features/auth/register' },
                  { text: 'Сброс пароля', link: '/docs/panel/features/auth/password-reset' },
                ],
              },
              {
                text: 'Панель управления',
                link: '/docs/panel/features/dashboard/',
                collapsed: true,
                items: [
                  { text: 'Серверы', link: '/docs/panel/features/dashboard/servers' },
                  { text: 'Аккаунт', link: '/docs/panel/features/dashboard/account' },
                  { text: 'Ключи безопасности', link: '/docs/panel/features/dashboard/security-keys' },
                  {
                    text: 'API-ключи',
                    link: '/docs/panel/features/dashboard/api-keys',
                    collapsed: true,
                    items: [{ text: 'Справочник разрешений', link: '/docs/panel/features/dashboard/permissions' }],
                  },
                  { text: 'SSH-ключи', link: '/docs/panel/features/dashboard/ssh-keys' },
                  { text: 'Сниппеты команд', link: '/docs/panel/features/dashboard/command-snippets' },
                  { text: 'OAuth-подключения', link: '/docs/panel/features/dashboard/oauth-links' },
                  { text: 'Сессии', link: '/docs/panel/features/dashboard/sessions' },
                  { text: 'Горячие клавиши', link: '/docs/panel/features/dashboard/keyboard-shortcuts' },
                  { text: 'Активность', link: '/docs/panel/features/dashboard/activity' },
                ],
              },
              {
                text: 'Сервер',
                link: '/docs/panel/features/server/',
                collapsed: true,
                items: [
                  { text: 'Консоль', link: '/docs/panel/features/server/console' },
                  { text: 'Файлы', link: '/docs/panel/features/server/files' },
                  { text: 'Базы данных', link: '/docs/panel/features/server/databases' },
                  { text: 'Расписания', link: '/docs/panel/features/server/schedules' },
                  { text: 'Субпользователи', link: '/docs/panel/features/server/subusers' },
                  { text: 'Резервные копии', link: '/docs/panel/features/server/backups' },
                  {
                    text: 'Сеть',
                    link: '/docs/panel/features/server/network/',
                    collapsed: true,
                    items: [
                      { text: 'Распределения', link: '/docs/panel/features/server/network/allocations' },
                      { text: 'Брандмауэр', link: '/docs/panel/features/server/network/firewall' },
                      { text: 'Соединения', link: '/docs/panel/features/server/network/connections' },
                    ],
                  },
                  { text: 'Запуск', link: '/docs/panel/features/server/startup' },
                  { text: 'Монтирования', link: '/docs/panel/features/server/mounts' },
                  { text: 'Настройки', link: '/docs/panel/features/server/settings' },
                  { text: 'Активность', link: '/docs/panel/features/server/activity' },
                ],
              },
              {
                text: 'Администрирование',
                link: '/docs/panel/features/admin/',
                collapsed: true,
                items: [
                  {
                    text: 'Система',
                    collapsed: true,
                    items: [
                      { text: 'Настройки', link: '/docs/panel/features/admin/settings' },
                      { text: 'Объявления', link: '/docs/panel/features/admin/announcements' },
                      { text: 'Ресурсы', link: '/docs/panel/features/admin/assets' },
                      { text: 'Расширения', link: '/docs/panel/features/admin/extensions' },
                    ],
                  },
                  {
                    text: 'Инфраструктура',
                    collapsed: true,
                    items: [
                      { text: 'Локации', link: '/docs/panel/features/admin/locations' },
                      { text: 'Узлы', link: '/docs/panel/features/admin/nodes' },
                      { text: 'Серверы', link: '/docs/panel/features/admin/servers' },
                    ],
                  },
                  {
                    text: 'Пользователи и доступ',
                    collapsed: true,
                    items: [
                      { text: 'Пользователи', link: '/docs/panel/features/admin/users' },
                      { text: 'Роли', link: '/docs/panel/features/admin/roles' },
                      { text: 'OAuth-провайдеры', link: '/docs/panel/features/admin/oauth-providers' },
                      { text: 'Активность', link: '/docs/panel/features/admin/activity' },
                    ],
                  },
                  {
                    text: 'Сеты и эгги',
                    collapsed: true,
                    items: [
                      { text: 'Сеты', link: '/docs/panel/features/admin/nests' },
                      { text: 'Конфигурации эггов', link: '/docs/panel/features/admin/egg-configurations' },
                      { text: 'Репозитории эггов', link: '/docs/panel/features/admin/egg-repositories' },
                    ],
                  },
                  {
                    text: 'Базы данных',
                    collapsed: true,
                    items: [
                      { text: 'Хосты баз данных', link: '/docs/panel/features/admin/database-hosts' },
                      { text: 'Хосты агента баз данных', link: '/docs/panel/features/admin/database-agent-hosts' },
                      { text: 'Шаблоны агента баз данных', link: '/docs/panel/features/admin/database-agent-templates' },
                    ],
                  },
                  {
                    text: 'Хранилище',
                    collapsed: true,
                    items: [
                      { text: 'Монтирования', link: '/docs/panel/features/admin/mounts' },
                      { text: 'Конфигурации резервных копий', link: '/docs/panel/features/admin/backup-configurations' },
                      { text: 'Системные политики резервного копирования', link: '/docs/panel/features/admin/system-backup-policies' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            text: 'Установка',
            link: '/docs/panel/installation/',
            collapsed: true,
            items: [
              { text: 'Ваш первый VPS', link: '/docs/panel/installation/first-vps' },
              { text: 'Docker', link: '/docs/panel/installation/docker' },
              { text: 'Бинарный файл', link: '/docs/panel/installation/binary' },
              { text: 'Менеджер пакетов', link: '/docs/panel/installation/pkgmanager' },
              {
                text: 'Сторонние методы',
                link: '/docs/panel/installation/external-methods',
                collapsed: true,
                items: [
                  { text: 'TrueNAS SCALE', link: '/docs/panel/installation/external-methods/truenas' },
                  { text: 'Unraid', link: '/docs/panel/installation/external-methods/unraid' },
                  { text: 'Hostinger', link: '/docs/panel/installation/external-methods/hostinger' },
                ],
              },
            ],
          },
          { text: 'Обновление', link: '/docs/panel/updating' },
          {
            text: 'Дальнейшие шаги',
            link: '/docs/panel/next-steps/',
            collapsed: true,
            items: [{ text: 'Добавление репозиториев эггов', link: '/docs/panel/next-steps/egg-repos' }],
          },
          {
            text: 'Расширения',
            link: '/docs/panel/extensions/',
            collapsed: true,
            items: [
              { text: 'Установка расширений', link: '/docs/panel/extensions/installing-extensions' },
              { text: 'Удаление расширений', link: '/docs/panel/extensions/uninstalling-extensions' },
              { text: 'Отключение расширений', link: '/docs/panel/extensions/disabling-extensions' },
              { text: 'Переход на тяжёлый образ', link: '/docs/panel/extensions/switching-to-the-heavy-image' },
              { text: 'Исправление и добавление переводов', link: '/docs/panel/extensions/patching-translations' },
              { text: 'Среда разработки', link: '/docs/panel/extensions/dev-environment' },
              { text: 'Структура файлов расширения', link: '/docs/panel/extensions/file-structure' },
              { text: 'Подготовка расширения', link: '/docs/panel/extensions/getting-your-extension-ready' },
              {
                text: 'Концепции',
                collapsed: true,
                items: [
                  { text: 'Темизация', link: '/docs/panel/extensions/concepts/theming' },
                  { text: 'События', link: '/docs/panel/extensions/concepts/events' },
                  { text: 'Настройки', link: '/docs/panel/extensions/concepts/settings' },
                  { text: 'Пользовательские настройки', link: '/docs/panel/extensions/concepts/user-settings' },
                  { text: 'Маршрутизация', link: '/docs/panel/extensions/concepts/routing' },
                  { text: 'Разрешения', link: '/docs/panel/extensions/concepts/permissions' },
                  { text: 'CLI-команды', link: '/docs/panel/extensions/concepts/cli-commands' },
                  {
                    text: 'Фоновые задачи и обработчики завершения',
                    link: '/docs/panel/extensions/concepts/background-tasks-and-shutdown-handlers',
                  },
                  {
                    text: 'Проверка обновлений и вызовы расширений',
                    link: '/docs/panel/extensions/concepts/update-checks-and-extension-calls',
                  },
                  { text: 'Вызовы API из фронтенда', link: '/docs/panel/extensions/concepts/frontend-api' },
                  { text: 'Журналирование активности', link: '/docs/panel/extensions/concepts/activity-logging' },
                  { text: 'Переводы', link: '/docs/panel/extensions/concepts/translations' },
                  { text: 'Монтирование UI', link: '/docs/panel/extensions/concepts/mounting-ui' },
                  { text: 'Быстрые действия', link: '/docs/panel/extensions/concepts/quick-actions' },
                  { text: 'Формы', link: '/docs/panel/extensions/concepts/forms' },
                  { text: 'Тосты', link: '/docs/panel/extensions/concepts/toasts' },
                  { text: 'Расширение моделей', link: '/docs/panel/extensions/concepts/extending-models' },
                  { text: 'Шаблоны писем', link: '/docs/panel/extensions/concepts/email-templates' },
                  { text: 'Обращение к игровым протоколам', link: '/docs/panel/extensions/concepts/speaking-game-protocols' },
                  { text: 'Файловое хранилище', link: '/docs/panel/extensions/concepts/file-storage' },
                ],
              },
            ],
          },
        ],
      },
      {
        text: 'Wings',
        link: '/docs/wings/',
        items: [
          { text: 'Обзор', link: '/docs/wings/overview' },
          { text: 'Конфигурация', link: '/docs/wings/configuration' },
          {
            text: 'Установка',
            link: '/docs/wings/installation/',
            collapsed: true,
            items: [
              { text: 'Docker', link: '/docs/wings/installation/docker' },
              { text: 'Бинарный файл', link: '/docs/wings/installation/binary' },
              { text: 'Менеджер пакетов', link: '/docs/wings/installation/pkgmanager' },
            ],
          },
          { text: 'Обновление', link: '/docs/wings/updating' },
          {
            text: 'Дальнейшие шаги',
            link: '/docs/wings/next-steps/',
            collapsed: true,
            items: [
              { text: 'Настройка нового узла', link: '/docs/wings/next-steps/configure-node' },
              { text: 'Настройка распределений', link: '/docs/wings/next-steps/setting-up-allocations' },
            ],
          },
          {
            text: 'Ограничители диска',
            link: '/docs/wings/disk-limiters/',
            collapsed: true,
            items: [
              { text: 'Fusequota', link: '/docs/wings/disk-limiters/fusequota' },
              { text: 'BTRFS subvolume', link: '/docs/wings/disk-limiters/btrfs-subvolume' },
              { text: 'ZFS Dataset', link: '/docs/wings/disk-limiters/zfs-dataset' },
              { text: 'XFS Quota', link: '/docs/wings/disk-limiters/xfs-quota' },
            ],
          },
          {
            text: 'Дополнительно',
            link: '/docs/wings/advanced/',
            collapsed: true,
            items: [
              { text: 'Конфигурации резервных копий', link: '/docs/wings/advanced/backup-configurations' },
              { text: 'Доступ к Wings в домашней лаборатории', link: '/docs/wings/advanced/exposing-wings-in-a-homelab' },
              { text: 'Частная сеть', link: '/docs/wings/advanced/private-network' },
              { text: 'Запуск Wings с Podman', link: '/docs/wings/advanced/running-wings-with-podman' },
            ],
          },
        ],
      },
      {
        text: 'DB Agent',
        link: '/docs/db-agent/',
        items: [
          { text: 'Обзор', link: '/docs/db-agent/overview' },
          { text: 'Конфигурация', link: '/docs/db-agent/configuration' },
          { text: 'Шаблоны', link: '/docs/db-agent/templates' },
          {
            text: 'Установка',
            link: '/docs/db-agent/installation/',
            collapsed: true,
            items: [
              { text: 'Docker', link: '/docs/db-agent/installation/docker' },
              { text: 'Бинарный файл', link: '/docs/db-agent/installation/binary' },
              { text: 'Менеджер пакетов', link: '/docs/db-agent/installation/pkgmanager' },
            ],
          },
          { text: 'Обновление', link: '/docs/db-agent/updating' },
        ],
      },
      {
        text: 'Дополнительно',
        link: '/docs/additional/',
        items: [
          {
            text: 'Миграции',
            link: '/docs/additional/migrations/',
            collapsed: true,
            items: [
              {
                text: 'Из другой панели',
                collapsed: true,
                items: [
                  { text: 'Pterodactyl', link: '/docs/additional/migrations/pterodactyl' },
                  { text: 'Pelican', link: '/docs/additional/migrations/pelican' },
                ],
              },
              {
                text: 'На другой экземпляр',
                collapsed: true,
                items: [
                  { text: 'Docker', link: '/docs/additional/migrations/calagopus/docker' },
                  { text: 'Автономно', link: '/docs/additional/migrations/calagopus/standalone' },
                ],
              },
            ],
          },
          {
            text: 'Хосты баз данных',
            link: '/docs/additional/database-hosts/',
            collapsed: true,
            items: [
              { text: 'MySQL (MariaDB)', link: '/docs/additional/database-hosts/mysql' },
              { text: 'PostgreSQL', link: '/docs/additional/database-hosts/postgres' },
              { text: 'MongoDB', link: '/docs/additional/database-hosts/mongodb' },
            ],
          },
          { text: 'SSL-сертификаты', link: '/docs/additional/ssl-certificates' },
          { text: 'Обратные прокси', link: '/docs/additional/reverse-proxies' },
          {
            text: 'Настройка OAuth',
            link: '/docs/additional/setting-up-oauth/',
            collapsed: true,
            items: [
              { text: 'GitHub', link: '/docs/additional/setting-up-oauth/github' },
              { text: 'Google', link: '/docs/additional/setting-up-oauth/google' },
              { text: 'Discord', link: '/docs/additional/setting-up-oauth/discord' },
              { text: 'Универсальный', link: '/docs/additional/setting-up-oauth/generic' },
            ],
          },
          { text: 'Устранение неполадок', link: '/docs/additional/troubleshooting' },
        ],
      },

      {
        text: 'Интеграции',
        link: '/docs/integrations/',
        items: [
          { text: 'VS Code', link: '/docs/integrations/vscode' },
          { text: 'Paymenter', link: '/docs/integrations/paymenter' },
          { text: 'WHMCS', link: '/docs/integrations/whmcs' },
          { text: 'Blesta', link: '/docs/integrations/blesta' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/calagopus' },
      { icon: 'discord', link: 'https://discord.gg/uSM8tvTxBV' },
    ],

    footer: {
      message:
        '<a href="https://github.com/calagopus" target="_blank" rel="noreferrer">GitHub</a> · <a href="https://discord.gg/uSM8tvTxBV" target="_blank" rel="noreferrer">Discord</a> · <a href="mailto:contact@calagopus.com">contact@calagopus.com</a> · <a href="/llms.txt">llms.txt</a>',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/calagopus/website/edit/main/web/:path',
      text: 'Редактировать эту страницу на GitHub',
    },
  },

  sitemap: {
    hostname: SITE_URL,
  },

  async buildEnd(siteConfig) {
    await generateLlmsArtifacts(siteConfig, SITE_URL);
    await expandReleaseMarkdown(siteConfig.outDir);
    await expandSponsorsMarkdown(siteConfig.outDir);
    await expandFeaturedSponsorsMarkdown(siteConfig.outDir);
    await writePageManifest(siteConfig.outDir, SITE_URL);
    await writeImageManifest(siteConfig.outDir);
  },

  transformPageData(pageData, { siteConfig }) {
    const urlPath = `/${pageData.relativePath}`.replace(/index\.md$/, '').replace(/\.md$/, '');
    const canonicalUrl = `${SITE_URL}${urlPath}`;

    recordPage({
      name: urlPath === '/' ? '/' : urlPath.replace(/\/$/, ''),
      relativePath: pageData.relativePath,
      title: pageData.title ?? '',
      description: pageData.description ?? '',
      lastUpdated: pageData.lastUpdated,
    });

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }]);

    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: pageData.title || siteConfig.site.title }],
      ['meta', { property: 'og:description', content: pageData.description || siteConfig.site.description }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
    );

    if (pageData.lastUpdated) {
      const modified = new Date(pageData.lastUpdated).toISOString();
      pageData.frontmatter.head.push(['meta', { property: 'article:modified_time', content: modified }]);

      if (pageData.relativePath.startsWith('blog/') && pageData.frontmatter.date) {
        pageData.frontmatter.head.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${canonicalUrl}#article`,
            headline: pageData.title,
            description: pageData.description || undefined,
            url: canonicalUrl,
            datePublished: new Date(pageData.frontmatter.date).toISOString(),
            dateModified: modified,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
          }),
        ]);
      }

      if (pageData.relativePath.startsWith('docs/')) {
        pageData.frontmatter.head.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            '@id': `${canonicalUrl}#article`,
            headline: pageData.title,
            description: pageData.description || undefined,
            url: canonicalUrl,
            dateModified: modified,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
          }),
        ]);
      }
    }

    const pageFaqs = compareFaqs[pageData.relativePath];
    if (pageFaqs) {
      pageData.frontmatter.head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: pageFaqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
          })),
        }),
      ]);
    }

    if (pageData.relativePath === 'docs/index.md') {
      pageData.frontmatter.head.push([
        'link',
        { rel: 'preload', as: 'image', href: '/fulllogo.svg', fetchpriority: 'high' },
      ]);
    }

    if (pageData.relativePath.startsWith('compare/')) {
      const trail = [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Сравнение', item: `${SITE_URL}/compare/` },
      ];
      if (pageData.relativePath !== 'compare/index.md') {
        trail.push({ '@type': 'ListItem', position: 3, name: pageData.title, item: canonicalUrl });
      }
      pageData.frontmatter.head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail }),
      ]);
    }

    if (pageData.relativePath === 'index.md') {
      pageData.frontmatter.head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }),
      ]);
    }

    const sidebar = siteConfig.site.themeConfig?.sidebar;
    if (Array.isArray(sidebar)) {
      breadcrumbMap ??= buildBreadcrumbMap(sidebar as SidebarNode[]);
      const trail = breadcrumbMap.get(urlPath.replace(/\/$/, ''));
      const linked = trail?.filter((entry) => entry.item);
      if (linked && linked.length > 1) {
        pageData.frontmatter.head.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: linked.map((entry, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: entry.name,
              item: entry.item,
            })),
          }),
        ]);
      }
    }
  },
});
