import { useEffect, useMemo, useState } from "react";

const directories = {
  friends: [
    { id: "friend-alex", icon: "👨‍🎓", name: "Александр Петров", details: "Изучает механику", online: true },
    { id: "friend-maria", icon: "👩‍🔬", name: "Мария Сидорова", details: "Увлекается оптикой", online: true },
    { id: "friend-ivan", icon: "🧑‍🚀", name: "Иван Кузнецов", details: "Готовится к олимпиаде", online: false },
    { id: "friend-sofia", icon: "👩‍💻", name: "София Новикова", details: "Изучает электричество", online: true },
  ],
};

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export default function ContactsPage({ type, username, onRequireLogin }) {
  const isTeachers = type === "teachers";
  const title = isTeachers ? "Учителя" : "Друзья";
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
        <p className="eyebrow">Личный кабинет</p>
        <h1>{title}</h1>
        <p>{isTeachers ? "Добавляйте преподавателей и обсуждайте учебные вопросы." : "Добавляйте друзей и решайте задачи вместе."}</p>
      </div>

      {!username && (
        <div className="account-notice glass-panel">
          <span>🔐</span><div><strong>Войдите в личный кабинет</strong><p>Вход нужен, чтобы сохранять контакты и переписку.</p></div>
          <button className="primary-button" onClick={onRequireLogin}>Войти</button>
        </div>
      )}

      <div className="contact-workspace glass-panel">
        <div className="workspace-tabs" role="tablist">
          <button className={mode === "chat" ? "active" : ""} onClick={() => setMode("chat")}>💬 Чат <span>{contacts.length}</span></button>
          <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>＋ Добавить {isTeachers ? "учителя" : "друга"}</button>
        </div>

        {mode === "add" ? (
          <div className="contact-directory">
            <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Найти ${isTeachers ? "учителя" : "друга"}...`} />
            <div className="directory-list">
              {candidates.map((person) => {
                const added = contactIds.includes(person.id);
                return <article className="person-row" key={person.id}>
                  <span className="avatar">{person.icon}</span>
                  <div><strong>{person.name}</strong><small>{person.details} · {person.online ? "В сети" : "Не в сети"}</small></div>
                  <button className="primary-button small-button" disabled={added} onClick={() => addContact(person.id)}>{added ? "Добавлен" : "Добавить"}</button>
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
              )) : <div className="empty-mini"><span>👋</span><p>Пока никого нет</p><button className="text-button" onClick={() => setMode("add")}>Добавить контакт</button></div>}
            </aside>
            <div className="contact-dialog">
              {active ? <>
                <header><span className="avatar">{active.icon}</span><div><strong>{active.name}</strong><small>{active.online ? "В сети" : "Не в сети"}</small></div></header>
                <div className="dialog-body">
                  <div className="message ai">Здравствуйте! Напишите сообщение — оно сохранится в вашем личном кабинете.</div>
                  {(chats[active.id] || []).map((message) => <div className="message user" key={message.id}>{message.text}</div>)}
                </div>
                <form className="chat-input" onSubmit={send}><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Написать сообщение..." disabled={!username} /><button className="primary-button" disabled={!username || !value.trim()}>Отправить</button></form>
              </> : <div className="empty-state"><span>💬</span><h3>Выберите контакт</h3><p>Переписка откроется здесь.</p></div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
