import { useState } from "react";
import { loginAccount, registerAccount } from "../utils/accountStore.js";

export default function AuthModal({ open, onClose, onLogin }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const account = register
        ? await registerAccount({ name, email, password })
        : await loginAccount({ email, password });
      onLogin(account);
      setPassword("");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
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
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button wide" type="submit" disabled={loading}>
            {loading ? "Проверяем..." : register ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>
        <button className="text-button" onClick={() => setRegister(!register)}>
          {register ? "Уже есть аккаунт? Войди" : "Нет аккаунта? Зарегистрируйся"}
        </button>
        <small className="privacy-note">🔒 Локальный аккаунт: данные сохраняются только в этом браузере.</small>
      </section>
    </div>
  );
}
