import { useState } from "react";
import { text } from "../i18n.js";

const initialMessages = [
  ["👩‍🎓", "Анна", "Привет всем! Кто-нибудь может объяснить закон сохранения энергии простыми словами?", "15:32"],
  ["👨‍🔬", "Дмитрий", "Энергия не исчезает — она только переходит из одной формы в другую.", "15:38"],
  ["👩‍🚀", "София", "Например, при падении потенциальная энергия превращается в кинетическую.", "15:40"],
];

export default function CommunityPage({ locale }) {
  const l = (ru, en) => text(locale, ru, en);
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState("");

  const send = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    setMessages([...messages, ["🧑‍🚀", "Ты", value.trim(), new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })]]);
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
        <div className="online-strip"><span className="online-dot" /> 1 247 пользователей онлайн</div>
        <div className="community-messages">
          {messages.map(([avatar, name, text, time], index) => (
            <article className="community-message" key={index}>
              <span className="avatar">{avatar}</span>
              <div><header><strong>{name}</strong><time>{time}</time></header><p>{text}</p></div>
            </article>
          ))}
        </div>
        <form className="chat-input" onSubmit={send}>
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={l("Напиши сообщение...", "Write a message...")} />
          <button className="primary-button">{l("Отправить", "Send")}</button>
        </form>
      </div>
      <div className="tips-grid">
        <div>🎯 <strong>Помогай другим</strong><span>Делись опытом</span></div>
        <div>💬 <strong>Задавай вопросы</strong><span>Не бойся уточнять</span></div>
        <div>🤝 <strong>Будь вежлив</strong><span>Уважай участников</span></div>
      </div>
    </section>
  );
}
