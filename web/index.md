---
layout: home
title: Calagopus — Панель управления игровыми серверами с открытым исходным кодом
titleTemplate: false
description: Calagopus — это современная панель управления игровыми серверами с открытым исходным кодом, написанная на Rust. Развёртывание, мониторинг и управление серверами Minecraft, Rust и других игр с производительностью, задающей стандарты в отрасли.

hero:
  name: Calagopus
  text: Современная. Быстрая. Безопасная.
  tagline: Панель управления игровыми серверами с открытым исходным кодом, написанная на Rust — с пропускной способностью до 32 800% выше, чем у альтернатив.
  actions:
    - theme: brand
      text: Начать
      link: /docs
    - theme: alt
      text: Демо
      link: https://demo.calagopus.com
    - theme: alt
      text: Discord
      link: https://discord.gg/uSM8tvTxBV
---

<script setup lang="ts">
import FeaturedSponsors from '../.vitepress/components/FeaturedSponsors.vue';
import Features from '../.vitepress/components/Features.vue';
import Stats from '../.vitepress/components/Stats.vue';
import { faqs } from '../.vitepress/data/faqs.ts';
import browserPreviewSrcset from './browser-preview.webp?w=480;760;1200;1520&as=srcset';
import mobilePreviewSrcset from './mobile-preview.webp?w=360;500;720;1000&as=srcset';
</script>

<Stats />

<div class="preview-container">
  <img
    :srcset="browserPreviewSrcset"
    sizes="(min-width: 768px) 65vw, 100vw"
    src="./browser-preview.webp"
    alt="Админ-панель Calagopus: панель управления серверами с двумя серверами Minecraft"
    class="browser-preview"
    loading="eager"
    fetchpriority="high"
    width="1200"
    height="900"
  />
  <img
    :srcset="mobilePreviewSrcset"
    sizes="(min-width: 768px) 35vw, min(100vw, 500px)"
    src="./mobile-preview.webp"
    alt="Мобильный интерфейс Calagopus: живая консоль сервера на iPhone"
    class="mobile-preview"
    loading="lazy"
    width="500"
    height="500"
  />
</div>

<Features />

<section class="switch-wrapper" aria-labelledby="switch-heading">
  <h2 id="switch-heading" class="section-heading">Переходите с другой панели?</h2>
  <p class="switch-intro">
    Calagopus управляет всем, что запускается в Linux-контейнере Docker — Minecraft (Java и Bedrock), Rust,
    ARK, Valheim, FiveM и другими. Эгги Pterodactyl работают без изменений, а инструменты миграции
    встроены. Посмотрите, как панель выглядит на фоне той, которую вы используете сейчас:
  </p>
  <div class="switch-grid">
    <a class="switch-card" href="/compare/calagopus-vs-pterodactyl">
      <strong>Calagopus против Pterodactyl</strong>
      <span>Сравнение бок о бок и путь миграции узел за узлом.</span>
    </a>
    <a class="switch-card" href="/compare/calagopus-vs-pelican">
      <strong>Calagopus против Pelican</strong>
      <span>Чем два преемника Pterodactyl отличаются друг от друга.</span>
    </a>
    <a class="switch-card" href="/compare/calagopus-vs-amp">
      <strong>Calagopus против AMP</strong>
      <span>Панель с открытым исходным кодом против лицензионной альтернативы.</span>
    </a>
  </div>
  <p class="switch-more">
    <a href="/compare/">Сравнение всех альтернатив Pterodactyl</a> ·
    <a href="/docs/additional/migrations/pterodactyl">Руководство по миграции с Pterodactyl</a> ·
    <a href="/docs/additional/migrations/pelican">Руководство по миграции с Pelican</a>
  </p>
</section>

<section class="faq-wrapper" aria-labelledby="faq-heading">
  <h2 id="faq-heading" class="section-heading">Часто задаваемые вопросы</h2>
  <div class="faq-list">
    <details v-for="(faq, i) in faqs" :key="i" class="faq-item">
      <summary class="faq-question">{{ faq.q }}</summary>
      <p class="faq-answer">{{ faq.a }}</p>
    </details>
  </div>
  <p class="faq-more">
    <a href="/docs/about/what-is-calagopus">Ещё вопросы →</a>
  </p>
</section>

<FeaturedSponsors />

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  margin: 48px 0;
}

.browser-preview,
.mobile-preview {
  border-radius: 12px;
  height: auto;
}

.mobile-preview {
  width: 100%;
  max-width: 500px;
}

@media (min-width: 768px) {
  .preview-container {
    flex-direction: row;
    align-items: center;
  }

  .browser-preview {
    width: 65%;
  }

  .mobile-preview {
    width: 35%;
  }
}

.switch-wrapper {
  padding: 48px 24px 0;
  margin: 0 auto;
  max-width: 1152px;
}

.switch-intro {
  margin: 0 auto;
  max-width: 800px;
  text-align: center;
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.switch-grid {
  display: grid;
  gap: 16px;
  margin: 32px auto 0;
  max-width: 1152px;
}

@media (min-width: 640px) {
  .switch-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.switch-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-bg-soft);
  transition: border-color 0.25s;
  text-decoration: none;
}

.switch-card:hover {
  border-color: var(--vp-c-brand-1);
}

.switch-card strong {
  font-size: 15px;
  color: var(--vp-c-brand-1);
}

.switch-card span {
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.switch-more {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.switch-more a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.switch-more a:hover {
  color: var(--vp-c-brand-2);
}

.faq-wrapper {
  padding: 48px 24px;
  margin: 0 auto;
  max-width: 800px;
}

.section-heading {
  margin: 0 0 32px;
  font-size: 28px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-align: center;
  border: none;
  padding: 0;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-bg-soft);
  transition: border-color 0.25s;
  overflow: hidden;
}

.faq-item:hover,
.faq-item[open] {
  border-color: var(--vp-c-brand-1);
}

.faq-question {
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-question::after {
  content: '+';
  font-size: 20px;
  color: var(--vp-c-text-2);
  transition: transform 0.2s ease;
  font-weight: 400;
}

.faq-item[open] .faq-question::after {
  transform: rotate(45deg);
}

.faq-answer {
  padding: 0 20px 16px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.faq-more {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
}

.faq-more a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.faq-more a:hover {
  color: var(--vp-c-brand-2);
}
</style>
