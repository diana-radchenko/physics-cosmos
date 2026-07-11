import { useState } from "react";

const conversations = [
  { id: 1, icon: "👨‍🎓", name: "Александр Петров", preview: "Привет! Как дела с физикой?", count: 2 },
  { id: 2, icon: "👥", name: "Группа по физике 🚀", preview: "Кто решил задачу про маятник?", count: 5 },
];

export default function FriendsChatPage() {
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState({});
  const [value, setValue] = useState("");

  const send = (event) => {
    event.preventDefault();
    if (!active || !value.trim()) return;
    setMessages({ ...messages, [active]: [...(messages[active] || []), value.trim()] });
    setValue("");
  };

  const current = conversations.find((item) => item.id === active);

  return (
    <section className="section page-section">
      <div className="section-heading">
        <p className="eyebrow">Своя команда</p>
        <h1>Чат с друзьями</h1>
        <p>Общайся и решай задачи вместе.</p>
      </div>
      <div className="friends-chat-layout">
        <aside className="conversations glass-panel">
          <h3>Чаты</h3>
          {conversations.map((item) => (
            <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => setActive(item.id)}>
              <span className="avatar">{item.icon}</span>
              <span><strong>{item.name}</strong><small>{item.preview}</small></span>
              <b>{item.count}</b>
            </button>
          ))}
        </aside>
        <div className="friend-dialog glass-panel">
          {current ? (
            <>
              <header><span className="avatar">{current.icon}</span><strong>{current.name}</strong></header>
              <div className="dialog-body">
                <div className="message ai">{current.preview}</div>
                {(messages[active] || []).map((message, index) => <div className="message user" key={index}>{message}</div>)}
              </div>
              <form className="chat-input" onSubmit={send}>
                <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Написать сообщение..." />
                <button className="primary-button">Отправить</button>
              </form>
            </>
          ) : <div className="empty-state"><span>💬</span><h3>Выбери чат</h3><p>Чтобы начать общение, открой разговор слева.</p></div>}
        </div>
      </div>
    </section>
  );
}
