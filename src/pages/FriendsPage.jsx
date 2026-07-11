import { useState } from "react";

const people = [
  ["👨‍🎓", "Александр Петров", "В сети"],
  ["👩‍🔬", "Мария Сидорова", "В сети"],
  ["🧑‍🚀", "Иван Кузнецов", "Не в сети"],
  ["👩‍💻", "София Новикова", "В сети"],
];

export default function FriendsPage() {
  const [tab, setTab] = useState("friends");
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState([]);
  const filtered = people.filter((person) => person[1].toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="section page-section narrow-page">
      <div className="section-heading">
        <p className="eyebrow">Сообщество</p>
        <h1>Друзья</h1>
        <p>Добавляй друзей и учись вместе.</p>
      </div>
      <div className="friend-tabs">
        <button className={tab === "friends" ? "active" : ""} onClick={() => setTab("friends")}>Мои друзья (2)</button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>Запросы (1)</button>
        <button className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}>Найти друзей</button>
      </div>
      <div className="glass-panel people-panel">
        {tab === "search" && <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск пользователей..." />}
        {(tab === "friends" ? people.slice(0, 2) : tab === "requests" ? people.slice(2, 3) : filtered).map(([avatar, name, status]) => (
          <article className="person-row" key={name}>
            <span className="avatar">{avatar}</span>
            <div><strong>{name}</strong><small className={status === "В сети" ? "online-text" : ""}>{status}</small></div>
            {tab === "requests" && <div className="row-actions"><button className="primary-button small-button">Принять</button><button className="ghost-button small-button">Отклонить</button></div>}
            {tab === "search" && <button className="primary-button small-button" disabled={added.includes(name)} onClick={() => setAdded([...added, name])}>{added.includes(name) ? "Запрос отправлен" : "Добавить"}</button>}
          </article>
        ))}
      </div>
      <div className="stats friend-stats">
        <div><strong>2</strong><span>Друзей</span></div>
        <div><strong>2</strong><span>Онлайн</span></div>
        <div><strong>1</strong><span>Запрос</span></div>
      </div>
    </section>
  );
}
