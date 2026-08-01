import { useState } from "react";
import { text } from "../i18n.js";

const initialMessages = [
  ["👩‍🎓", "Анна", "Anna", "Привет всем! Кто-нибудь может объяснить закон сохранения энергии простыми словами?", "Hi everyone! Can someone explain the law of conservation of energy in simple terms?", "15:32"],
  ["👨‍🔬", "Дмитрий", "Dmitry", "Энергия не исчезает — она только переходит из одной формы в другую.", "Energy does not disappear; it only changes from one form to another.", "15:38"],
  ["👩‍🚀", "София", "Sofia", "Например, при падении потенциальная энергия превращается в кинетическую.", "For example, as an object falls, potential energy becomes kinetic energy.", "15:40"],
];

export default function CommunityPage({ locale }) {
  const l = (ru, en) => text(locale, ru, en);
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState("");

  const send = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    setMessages([...messages, ["🧑‍🚀", l("Ты", "You"), l("Ты", "You"), value.trim(), value.trim(), new Date().toLocaleTimeString(locale === "en" ? "en" : "ru", { hour: "2-digit", minute: "2-digit" })]]);
    setValue("");
  };

  return (
    <section className="section page-section narrow-page">
      <div className="section-heading">
        <p className="eyebrow">{l("Учимся вместе", "Learning together")}</p>
        <h1>{l("Чат сообщества", "Community chat")}</h1>
        <p>{l("Общайся с учениками, делись знаниями и задавай вопросы.", "Talk with students, share knowledge, and ask questions.")}</p>
      </div>
      <div className="chat-window">
        <div className="online-strip"><span className="online-dot" /> {l("1 247 пользователей онлайн", "1,247 users online")}</div>
        <div className="community-messages">
          {messages.map(([avatar, nameRu, nameEn, bodyRu, bodyEn, time], index) => (
            <article className="community-message" key={index}>
              <span className="avatar">{avatar}</span>
              <div><header><strong>{locale === "en" ? nameEn : nameRu}</strong><time>{time}</time></header><p>{locale === "en" ? bodyEn : bodyRu}</p></div>
            </article>
          ))}
        </div>
        <form className="chat-input" onSubmit={send}>
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={l("Напиши сообщение...", "Write a message...")} />
          <button className="primary-button">{l("Отправить", "Send")}</button>
        </form>
      </div>
      <div className="tips-grid">
        <div>🎯 <strong>{l("Помогай другим", "Help others")}</strong><span>{l("Делись опытом", "Share your experience")}</span></div>
        <div>💬 <strong>{l("Задавай вопросы", "Ask questions")}</strong><span>{l("Не бойся уточнять", "Do not be afraid to ask")}</span></div>
        <div>🤝 <strong>{l("Будь вежлив", "Be kind")}</strong><span>{l("Уважай участников", "Respect the community")}</span></div>
      </div>
    </section>
  );
}
