import { useEffect, useMemo, useState } from "react";
import { text } from "../i18n.js";

const directories = {
  friends: [
    { id: "friend-alex", icon: "👨‍🎓", name: "Александр Петров", details: "Изучает механику", online: true },
    { id: "friend-maria", icon: "👩‍🔬", name: "Мария Сидорова", details: "Увлекается оптикой", online: true },
    { id: "friend-ivan", icon: "🧑‍🚀", name: "Иван Кузнецов", details: "Готовится к олимпиаде", online: false },
    { id: "friend-sofia", icon: "👩‍💻", name: "София Новикова", details: "Изучает электричество", online: true },
  ],
  teachers: [
    { id: "teacher-elena", icon: "👩‍🏫", name: "Елена Викторовна", details: "Механика и термодинамика", online: true },
    { id: "teacher-sergey", icon: "👨‍🏫", name: "Сергей Андреевич", details: "Электродинамика", online: false },
    { id: "teacher-olga", icon: "👩‍🔬", name: "Ольга Михайловна", details: "Оптика и астрономия", online: true },
  ],
};

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export default function ContactsPage({ type, username, onRequireLogin, locale }) {
  const l = (ru, en) => text(locale, ru, en);
  const isTeachers = type === "teachers";
  const title = isTeachers ? l("Учителя", "Teachers") : l("Друзья", "Friends");
  const storagePrefix = `physics-${type}`;
  const [mode, setMode] = useState("chat");
  const [contactIds, setContactIds] = useState(() => read(`${storagePrefix}-contacts`, []));
  const [chats, setChats] = useState(() => read(`${storagePrefix}-chats`, {}));
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => localStorage.setItem(`${storagePrefix}-contacts`, JSON.stringify(contactIds)), [contactIds, storagePrefix]);
  useEffect(() => localStorage.setItem(`${storagePrefix}-chats`, JSON.stringify(chats)), [chats, storagePrefix]);
  useEffect(() => {
    setContactIds(read(`${storagePrefix}-contacts`, []));
    setChats(read(`${storagePrefix}-chats`, {}));
    setActiveId(null);
    setMode("chat");
  }, [storagePrefix]);

  const directory = directories[type];
  const contacts = directory.filter((person) => contactIds.includes(person.id));
  const active = directory.find((person) => person.id === activeId);
  const candidates = useMemo(
    () => directory.filter((person) => person.name.toLowerCase().includes(search.toLowerCase())),
    [directory, search],
  );

  const addContact = (id) => {
    if (!username) return onRequireLogin();
    setContactIds((current) => current.includes(id) ? current : [...current, id]);
  };

  const send = (event) => {
    event.preventDefault();
    if (!username) return onRequireLogin();
    if (!activeId || !value.trim()) return;
    const message = { id: crypto.randomUUID(), from: "user", text: value.trim(), time: new Date().toISOString() };
    setChats((current) => ({ ...current, [activeId]: [...(current[activeId] || []), message] }));
    setValue("");
  };

  return (
    <section className="section page-section contacts-page">
      <div className="section-heading contact-heading">
        <p className="eyebrow">{l("Личный кабинет", "Personal account")}</p>
        <h1>{title}</h1>
        <p>{isTeachers ? l("Добавляйте преподавателей и обсуждайте учебные вопросы.", "Add teachers and discuss your studies.") : l("Добавляйте друзей и решайте задачи вместе.", "Add friends and solve problems together.")}</p>
      </div>

      {!username && (
        <div className="account-notice glass-panel">
          <span>🔐</span><div><strong>{l("Войдите в личный кабинет", "Log in to your account")}</strong><p>{l("Вход нужен, чтобы сохранять контакты и переписку.", "Log in to save contacts and messages.")}</p></div>
          <button className="primary-button" onClick={onRequireLogin}>{l("Войти", "Log in")}</button>
        </div>
      )}

      <div className="contact-workspace glass-panel">
        <div className="workspace-tabs" role="tablist">
          <button className={mode === "chat" ? "active" : ""} onClick={() => setMode("chat")}>💬 {l("Чат", "Chat")} <span>{contacts.length}</span></button>
          <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>＋ {isTeachers ? l("Добавить учителя", "Add teacher") : l("Добавить друга", "Add friend")}</button>
        </div>

        {mode === "add" ? (
          <div className="contact-directory">
            <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isTeachers ? l("Найти учителя...", "Find a teacher...") : l("Найти друга...", "Find a friend...")} />
            <div className="directory-list">
              {candidates.map((person) => {
                const added = contactIds.includes(person.id);
                return <article className="person-row" key={person.id}>
                  <span className="avatar">{person.icon}</span>
                  <div><strong>{person.name}</strong><small>{person.details} · {person.online ? "В сети" : "Не в сети"}</small></div>
                  <button className="primary-button small-button" disabled={added} onClick={() => addContact(person.id)}>{added ? l("Добавлен", "Added") : l("Добавить", "Add")}</button>
                </article>;
              })}
            </div>
          </div>
        ) : (
          <div className="contact-chat-layout">
            <aside className="contact-list">
              {contacts.length ? contacts.map((person) => (
                <button key={person.id} className={activeId === person.id ? "active" : ""} onClick={() => setActiveId(person.id)}>
                  <span className="avatar">{person.icon}</span><span><strong>{person.name}</strong><small>{person.online ? "В сети" : "Не в сети"}</small></span>
                </button>
              )) : <div className="empty-mini"><span>👋</span><p>{l("Пока никого нет", "No contacts yet")}</p><button className="text-button" onClick={() => setMode("add")}>{l("Добавить контакт", "Add contact")}</button></div>}
            </aside>
            <div className="contact-dialog">
              {active ? <>
                <header><span className="avatar">{active.icon}</span><div><strong>{active.name}</strong><small>{active.online ? "В сети" : "Не в сети"}</small></div></header>
                <div className="dialog-body">
                  <div className="message ai">{l("Здравствуйте! Напишите сообщение — оно сохранится в вашем личном кабинете.", "Hello! Write a message — it will be saved in your account.")}</div>
                  {(chats[active.id] || []).map((message) => <div className="message user" key={message.id}>{message.text}</div>)}
                </div>
                <form className="chat-input" onSubmit={send}><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={l("Написать сообщение...", "Write a message...")} disabled={!username} /><button className="primary-button" disabled={!username || !value.trim()}>{l("Отправить", "Send")}</button></form>
              </> : <div className="empty-state"><span>💬</span><h3>{l("Выберите контакт", "Choose a contact")}</h3><p>{l("Переписка откроется здесь.", "The conversation will appear here.")}</p></div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
