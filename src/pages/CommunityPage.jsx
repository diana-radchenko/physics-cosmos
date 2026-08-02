import { useEffect, useState } from "react";
import { text } from "../i18n.js";

const starterArticles = [{ id: "welcome", titleRu: "Добро пожаловать в сообщество", titleEn: "Welcome to the community", bodyRu: "Здесь администратор публикует полезные материалы по физике, новости проекта и рекомендации для учеников и учителей.", bodyEn: "Here the site administrator publishes useful physics materials, project news, and recommendations for students and teachers.", author: "Physics Cosmos", createdAt: "2026-08-02T00:00:00.000Z" }];

function readArticles() {
  try { return JSON.parse(localStorage.getItem("physics-articles") || "null") || starterArticles; }
  catch { return starterArticles; }
}

export default function CommunityPage({ locale, username, onRequireLogin }) {
  const l = (ru, en) => text(locale, ru, en);
  const [articles, setArticles] = useState(readArticles);
  const [titleRu, setTitleRu] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [bodyRu, setBodyRu] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  useEffect(() => localStorage.setItem("physics-articles", JSON.stringify(articles)), [articles]);

  const publish = (event) => {
    event.preventDefault();
    if (!username) return onRequireLogin();
    if (![titleRu, titleEn, bodyRu, bodyEn].every((value) => value.trim())) return;
    setArticles([{ id: crypto.randomUUID(), titleRu: titleRu.trim(), titleEn: titleEn.trim(), bodyRu: bodyRu.trim(), bodyEn: bodyEn.trim(), author: username, createdAt: new Date().toISOString() }, ...articles]);
    setTitleRu(""); setTitleEn(""); setBodyRu(""); setBodyEn("");
  };

  return <section className="section page-section narrow-page">
    <div className="section-heading"><p className="eyebrow">{l("Знания сообщества", "Community knowledge")}</p><h1>{l("Статьи", "Articles")}</h1><p>{l("Материалы для учеников и учителей от администратора сайта.", "Materials for students and teachers from the site administrator.")}</p></div>
    <div className="articles-list">{articles.map((article) => <article className="glass-panel story-panel" key={article.id}><div><p className="eyebrow">{new Date(article.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU")} · {article.author}</p><h2>{locale === "en" ? article.titleEn : article.titleRu}</h2><p>{locale === "en" ? article.bodyEn : article.bodyRu}</p></div></article>)}</div>
    <form className="glass-panel article-editor" onSubmit={publish}>
      <h2>{l("Публикация администратора", "Administrator publishing")}</h2>
      {!username && <div className="account-notice"><span>🔐</span><p>{l("Войдите, чтобы открыть форму публикации.", "Log in to open the publishing form.")}</p><button type="button" className="primary-button" onClick={onRequireLogin}>{l("Войти", "Log in")}</button></div>}
      {username && <><label>{l("Заголовок на русском", "Russian title")}<input value={titleRu} onChange={(e) => setTitleRu(e.target.value)} required /></label><label>{l("Заголовок на английском", "English title")}<input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required /></label><label>{l("Текст на русском", "Russian text")}<textarea value={bodyRu} onChange={(e) => setBodyRu(e.target.value)} required /></label><label>{l("Текст на английском", "English text")}<textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} required /></label><button className="primary-button">{l("Опубликовать", "Publish")}</button></>}
    </form>
  </section>;
}
