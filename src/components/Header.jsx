import { navItems } from "../data/physics";

export default function Header({ currentPage, navigate, username, onLogin, onLogout }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("home")} aria-label="На главную">
        <span className="brand-mark">⚛</span>
        <span>
          <strong>ФизикаКосмос</strong>
          <small>Изучай физику с удовольствием</small>
        </span>
      </button>

      <nav className="main-nav" aria-label="Основная навигация">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={currentPage === item.id ? "nav-button active" : "nav-button"}
            onClick={() => navigate(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {username ? (
        <div className="profile-actions">
          <span className="user-chip">👋 {username}</span>
          <button className="ghost-button" onClick={onLogout}>Выйти</button>
        </div>
      ) : (
        <button className="primary-button header-login" onClick={onLogin}>Войти</button>
      )}
    </header>
  );
}
