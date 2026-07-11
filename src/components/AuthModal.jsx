import { useState } from "react";

export default function AuthModal({ open, onClose, onLogin }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    onLogin(name.trim() || email.split("@")[0] || "Исследователь");
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">×</button>
        <div className="modal-icon">🚀</div>
        <h2>{register ? "Регистрация" : "Вход"}</h2>
        <p>{register ? "Создай аккаунт и начни изучать физику" : "Войди в свой аккаунт ФизикаКосмос"}</p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Имя пользователя
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          )}
          <label>
            Электронная почта
            <input type="email" placeholder="твой@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Пароль
            <input type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="primary-button wide" type="submit">{register ? "Зарегистрироваться" : "Войти"}</button>
        </form>
        <button className="text-button" onClick={() => setRegister(!register)}>
          {register ? "Уже есть аккаунт? Войди" : "Нет аккаунта? Зарегистрируйся"}
        </button>
        <small className="privacy-note">🔒 Данные сохраняются только в этом браузере.</small>
      </section>
    </div>
  );
}
