import { navItems } from "../data/physics";
import { navLabels, text } from "../i18n.js";

export default function Header({ currentPage, navigate, username, onLogin, onLogout, locale, onLocaleChange }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("home")} aria-label={text(locale, "На главную", "Home")}>
        <span className="brand-mark">⚛</span>
        <span>
          <strong>ФизикаКосмос</strong>
          <small>{text(locale, "Изучай физику с удовольствием", "Enjoy learning physics")}</small>
        </span>
      </button>

      <nav className="main-nav" aria-label={text(locale, "Основная навигация", "Main navigation")}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={currentPage === item.id ? "nav-button active" : "nav-button"}
            onClick={() => navigate(item.id)}
          >
            <span>{item.icon}</span>
            {locale === "en" ? navLabels.en[item.id] : item.label}
          </button>
        ))}
      </nav>

      <div className="language-switch" aria-label="Language">
        <button className={locale === "ru" ? "active" : ""} onClick={() => onLocaleChange("ru")}>РУС</button>
        <button className={locale === "en" ? "active" : ""} onClick={() => onLocaleChange("en")}>ENG</button>
      </div>
      {username ? (
        <div className="profile-actions">
          <span className="user-chip">👋 {username}</span>
          <button className="ghost-button" onClick={onLogout}>{text(locale, "Выйти", "Log out")}</button>
        </div>
      ) : (
        <button className="primary-button header-login" onClick={onLogin}>{text(locale, "Войти", "Log in")}</button>
      )}
    </header>
  );
}
