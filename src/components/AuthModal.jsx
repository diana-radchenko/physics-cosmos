import { useState } from "react";
import { loginAccount, registerAccount } from "../utils/accountStore.js";

export default function AuthModal({ open, onClose, onLogin }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [classNumber, setClassNumber] = useState("");
  const [classDirection, setClassDirection] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [schoolNumber, setSchoolNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const account = register
        ? await registerAccount({ name, email, password, role, classNumber, classDirection, birthDate, schoolNumber, subject })
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
            <>
              <div className="role-selector" aria-label="Тип пользователя">
                <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>🎓 Школьник</button>
                <button type="button" className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>👩‍🏫 Учитель</button>
              </div>
              <label>
                ФИО
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              {role === "student" ? (
                <div className="registration-fields">
                  <label>Номер класса<input placeholder="Например, 9А" value={classNumber} onChange={(event) => setClassNumber(event.target.value)} required /></label>
                  <label>Направление класса<input placeholder="Физико-математическое" value={classDirection} onChange={(event) => setClassDirection(event.target.value)} required /></label>
                  <label>Дата рождения<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required /></label>
                  <label>Номер школы<input placeholder="Например, 57" value={schoolNumber} onChange={(event) => setSchoolNumber(event.target.value)} required /></label>
                </div>
              ) : (
                <div className="registration-fields">
                  <label>Преподаваемый предмет<input placeholder="Например, физика" value={subject} onChange={(event) => setSubject(event.target.value)} required /></label>
                  <label>Номер школы<input placeholder="Например, 57" value={schoolNumber} onChange={(event) => setSchoolNumber(event.target.value)} required /></label>
                </div>
              )}
            </>
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
