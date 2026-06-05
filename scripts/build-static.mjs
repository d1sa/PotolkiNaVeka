import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { landingContent } from '../src/data/landingContent.js';

const distDir = new URL('../dist/', import.meta.url);
const stylesPath = new URL('../src/styles/main.css', import.meta.url);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function paragraph(value, className = '') {
  if (!hasText(value)) return '';
  const classAttribute = className ? ` class="${className}"` : '';
  return `<p${classAttribute}>${escapeHtml(value)}</p>`;
}

function heading(level, value, attributes = '') {
  if (!hasText(value)) return '';
  return `<h${level}${attributes}>${escapeHtml(value)}</h${level}>`;
}

function renderNotice() {
  return `<section class="notice" aria-labelledby="notice-title">
  <div>
    <p class="section-kicker">SEO content lock</p>
    <h1 id="notice-title">Финальный SEO-текст не найден в контейнере</h1>
    <p>Лендинг готов к дословному переносу утверждённых текстов: заполните поля в <code>src/data/landingContent.js</code> без редактирования формулировок, и сборщик выведет их с сохранением исходных строк.</p>
  </div>
</section>`;
}

function renderHero() {
  const { hero } = landingContent;
  const hasHero = hasText(hero.eyebrow) || hasText(hero.title) || hasText(hero.lead);
  if (!hasHero) return renderNotice();

  const primaryAction = hasText(hero.primaryAction)
    ? `<a class="button button--primary" href="#contact">${escapeHtml(hero.primaryAction)}<span aria-hidden="true">→</span></a>`
    : '';
  const secondaryAction = hasText(hero.secondaryAction)
    ? `<a class="button button--secondary" href="#content">${escapeHtml(hero.secondaryAction)}</a>`
    : '';

  return `<section class="hero" aria-labelledby="hero-title">
  <div class="hero__content">
    ${paragraph(hero.eyebrow, 'section-kicker')}
    ${heading(1, hero.title, ' id="hero-title" class="hero__title"')}
    ${paragraph(hero.lead, 'hero__lead')}
    <div class="hero__actions" aria-label="Основные действия">${primaryAction}${secondaryAction}</div>
  </div>
  <div class="hero__card" aria-hidden="true">
    <div class="hero__orb"></div>
    <div class="hero__panel">✦</div>
  </div>
</section>`;
}

function renderSections() {
  if (!Array.isArray(landingContent.sections) || landingContent.sections.length === 0) return '';
  const sections = landingContent.sections.map((section, index) => {
    const paragraphs = Array.isArray(section.paragraphs)
      ? section.paragraphs.map((item) => paragraph(item)).join('\n    ')
      : '';

    return `<article class="text-section" id="section-${index + 1}">
    ${paragraph(section.kicker, 'section-kicker')}
    ${heading(2, section.title)}
    ${paragraphs}
  </article>`;
  }).join('\n');

  return `<section id="content" class="content-flow" aria-label="SEO-разделы">${sections}</section>`;
}

function renderBenefits() {
  const benefits = landingContent.benefits;
  if (!benefits || !Array.isArray(benefits.items) || benefits.items.length === 0) return '';
  const cards = benefits.items.map((benefit) => `<article class="feature-card">
    <div class="feature-card__icon" aria-hidden="true">●</div>
    ${heading(3, benefit.title)}
    ${paragraph(benefit.text)}
  </article>`).join('\n');

  return `<section class="cards-section" aria-labelledby="benefits-title">
  <div class="section-heading">
    ${paragraph(benefits.kicker, 'section-kicker')}
    ${heading(2, benefits.title, ' id="benefits-title"')}
  </div>
  <div class="cards-grid">${cards}</div>
</section>`;
}

function renderProcess() {
  const process = landingContent.process;
  if (!process || !Array.isArray(process.items) || process.items.length === 0) return '';
  const items = process.items.map((item, index) => `<li>
    <span class="timeline__index">${String(index + 1).padStart(2, '0')}</span>
    <div>${heading(3, item.title)}${paragraph(item.text)}</div>
  </li>`).join('\n');

  return `<section class="process" aria-labelledby="process-title">
  <div class="section-heading">
    ${paragraph(process.kicker, 'section-kicker')}
    ${heading(2, process.title, ' id="process-title"')}
  </div>
  <ol class="timeline">${items}</ol>
</section>`;
}

function renderFaq() {
  const faq = landingContent.faq;
  if (!faq || !Array.isArray(faq.items) || faq.items.length === 0) return '';
  const items = faq.items.map((item) => `<details>
    <summary>${escapeHtml(item.question)}</summary>
    ${paragraph(item.answer)}
  </details>`).join('\n');

  return `<section class="faq" aria-labelledby="faq-title">
  <div class="section-heading">
    ${paragraph(faq.kicker, 'section-kicker')}
    ${heading(2, faq.title, ' id="faq-title"')}
  </div>
  <div class="faq__list">${items}</div>
</section>`;
}

function renderContact() {
  const { contact } = landingContent;
  const hasContact = hasText(contact.title) || hasText(contact.text) || hasText(contact.phone) || hasText(contact.messenger) || hasText(contact.address);
  if (!hasContact) return '';

  const phoneHref = hasText(contact.phone) ? contact.phone.replace(/[^+\d]/g, '') : '';
  const phone = hasText(contact.phone) ? `<a href="tel:${escapeHtml(phoneHref)}">${escapeHtml(contact.phone)}</a>` : '';
  const messenger = hasText(contact.messenger) ? `<a href="${escapeHtml(contact.messenger)}">${escapeHtml(contact.messenger)}</a>` : '';
  const address = hasText(contact.address) ? `<span>${escapeHtml(contact.address)}</span>` : '';

  return `<section id="contact" class="contact" aria-labelledby="contact-title">
  <div>
    ${paragraph(contact.kicker, 'section-kicker')}
    ${heading(2, contact.title, ' id="contact-title"')}
    ${paragraph(contact.text)}
  </div>
  <address>${phone}${messenger}${address}</address>
</section>`;
}

function renderPage(css) {
  const title = escapeHtml(landingContent.meta.title || 'Potolki Na Veka');
  const description = hasText(landingContent.meta.description)
    ? `<meta name="description" content="${escapeHtml(landingContent.meta.description)}" />`
    : '';
  const body = [renderHero(), renderSections(), renderBenefits(), renderProcess(), renderFaq(), renderContact()].filter(Boolean).join('\n');

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    ${description}
    <title>${title}</title>
    <style>${css}</style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>
`;
}

await mkdir(distDir, { recursive: true });
const css = await readFile(stylesPath, 'utf8');
await writeFile(new URL('index.html', distDir), renderPage(css));
