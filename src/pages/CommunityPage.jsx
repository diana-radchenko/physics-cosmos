import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { text } from "../i18n.js";
import { normalizeMathMarkdown } from "../utils/mathText.js";

const starterArticles = [{ id: "welcome", titleRu: "Добро пожаловать в сообщество", titleEn: "Welcome to the community", bodyRu: "Здесь администратор публикует полезные материалы по физике, новости проекта и рекомендации для учеников и учителей.", bodyEn: "Here the site administrator publishes useful physics materials, project news, and recommendations for students and teachers.", author: "Physics Cosmos", createdAt: "2026-08-02T00:00:00.000Z" }];
const emojis = ["😊", "🚀", "🌍", "⚡", "🧲", "🔭", "🧪", "💡", "📚", "✅"];

function safeArticleUrl(url) {
  if (/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(url)) return url;
  if (/^(?:https?:\/\/|\/|#)/i.test(url)) return url;
  return "";
}

function prepareImage(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type.startsWith("image/")) return reject(new Error("not-image"));
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 1400 / image.width, 1000 / image.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/webp", 0.82));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("invalid-image")); };
    image.src = objectUrl;
  });
}

function ArticleTextEditor({ label, value, onChange, locale, contentLocale }) {
  const textareaRef = useRef(null);
  const [color, setColor] = useState("#2563eb");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const insert = (before, after = "", placeholder = "текст") => {
    const input = textareaRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };
  const addImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await prepareImage(file);
      insert(`\n![${file.name.replace(/[\[\]]/g, "")}](`, ")\n", dataUrl);
    } catch {
      window.alert(locale === "en" ? "Please select a valid image." : "Пожалуйста, выберите корректное изображение.");
    }
  };
  const formatWithAi = async () => {
    if (!value.trim() || aiLoading) return;
    const images = [];
    const textWithoutImages = value.replace(/!\[[^\]]*\]\(data:image\/(?:png|jpe?g|gif|webp);base64,[^)]+\)/gi, (imageMarkdown) => {
      const placeholder = `ARTICLE_IMAGE_${images.length + 1}`;
      images.push([placeholder, imageMarkdown]);
      return `\n${placeholder}\n`;
    });
    setAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "article-format", text: textWithoutImages, locale: contentLocale }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      let formatted = String(data.answer || "").trim();
      images.forEach(([placeholder, imageMarkdown]) => { formatted = formatted.replaceAll(placeholder, imageMarkdown); });
      onChange(formatted);
    } catch (error) {
      setAiError(error.message || (locale === "en" ? "AI formatting failed." : "Не удалось отформатировать текст с AI."));
    } finally {
      setAiLoading(false);
    }
  };
  return <label className="article-text-field">{label}
    <div className="article-toolbar">
      <button className="ai-format-button" type="button" disabled={!value.trim() || aiLoading} onClick={formatWithAi}>✨ {aiLoading ? (locale === "en" ? "Formatting…" : "Форматирование…") : (locale === "en" ? "Format with AI" : "Форматировать с AI")}</button>
      <button type="button" onClick={() => insert("**", "**")}>𝐁 {locale === "en" ? "Bold" : "Жирный"}</button>
      <span className="color-tool"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label={locale === "en" ? "Text color" : "Цвет текста"} /><button type="button" onClick={() => insert(`\`color:${color}|`, "\`")}>{locale === "en" ? "Text color" : "Цвет текста"}</button></span>
      <label className="image-tool">🖼️ {locale === "en" ? "Image / drawing" : "Картинка / рисунок"}<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={addImage} /></label>
      <span className="emoji-tools">{emojis.map((emoji) => <button type="button" key={emoji} title={locale === "en" ? "Insert emoji" : "Добавить эмоджи"} onClick={() => insert("", "", emoji)}>{emoji}</button>)}</span>
    </div>
    <textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} required />
    {aiError && <span className="article-ai-error">{aiError}</span>}
    <small>{locale === "en" ? "Select text before applying bold or color. Uploaded images are optimized automatically." : "Выделите текст перед применением жирного начертания или цвета. Загруженные изображения автоматически оптимизируются."}</small>
  </label>;
}

function ColorCode({ children, node: _node, ...props }) {
  const value = String(children).replace(/\n$/, "");
  const match = value.match(/^color:(#[0-9a-f]{6})\|([\s\S]+)$/i);
  if (match) return <span className="article-colored-text" style={{ color: match[1] }}>{match[2]}</span>;
  return <code {...props}>{children}</code>;
}

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
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem("physics-articles", JSON.stringify(articles)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [articles]);

  const publish = (event) => {
    event.preventDefault();
    if (!username) return onRequireLogin();
    if (![titleRu, titleEn, bodyRu, bodyEn].every((value) => value.trim())) return;
    setArticles([{ id: crypto.randomUUID(), titleRu: titleRu.trim(), titleEn: titleEn.trim(), bodyRu: bodyRu.trim(), bodyEn: bodyEn.trim(), author: username, createdAt: new Date().toISOString() }, ...articles]);
    setTitleRu(""); setTitleEn(""); setBodyRu(""); setBodyEn("");
  };

  return <section className="section page-section narrow-page">
    <div className="section-heading"><p className="eyebrow">{l("Знания сообщества", "Community knowledge")}</p><h1>{l("Статьи", "Articles")}</h1><p>{l("Материалы для учеников и учителей от администратора сайта.", "Materials for students and teachers from the site administrator.")}</p></div>
    <div className="articles-list">{articles.map((article) => {
      const body = locale === "en" ? article.bodyEn : article.bodyRu;
      return <article className="glass-panel story-panel" key={article.id}>
        <div>
          <p className="eyebrow">{new Date(article.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU")} · {article.author}</p>
          <h2>{locale === "en" ? article.titleEn : article.titleRu}</h2>
          <div className="article-content">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} urlTransform={safeArticleUrl} components={{ code: ColorCode, img: ({ node: _node, ...props }) => <img {...props} loading="lazy" /> }}>{normalizeMathMarkdown(body)}</ReactMarkdown>
          </div>
        </div>
      </article>;
    })}</div>
    <form className="glass-panel article-editor" onSubmit={publish}>
      <h2>{l("Публикация администратора", "Administrator publishing")}</h2>
      {storageError && <p className="auth-error">{l("Изображения занимают слишком много места. Уменьшите их количество или размер.", "The images use too much storage. Reduce their number or size.")}</p>}
      {!username && <div className="account-notice"><span>🔐</span><p>{l("Войдите, чтобы открыть форму публикации.", "Log in to open the publishing form.")}</p><button type="button" className="primary-button" onClick={onRequireLogin}>{l("Войти", "Log in")}</button></div>}
      {username && <><label>{l("Заголовок на русском", "Russian title")}<input value={titleRu} onChange={(e) => setTitleRu(e.target.value)} required /></label><label>{l("Заголовок на английском", "English title")}<input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required /></label><ArticleTextEditor label={l("Текст на русском", "Russian text")} value={bodyRu} onChange={setBodyRu} locale={locale} contentLocale="ru" /><ArticleTextEditor label={l("Текст на английском", "English text")} value={bodyEn} onChange={setBodyEn} locale={locale} contentLocale="en" /><button className="primary-button">{l("Опубликовать", "Publish")}</button></>}
    </form>
  </section>;
}

