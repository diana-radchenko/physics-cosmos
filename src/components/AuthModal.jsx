import { useState } from "react";
import { loginAccount, registerAccount } from "../utils/accountStore.js";
import { text } from "../i18n.js";

export default function AuthModal({ open, onClose, onLogin, locale }) {
  const l = (ru, en) => text(locale, ru, en);
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
        <button className="modal-close" onClick={onClose} aria-label={l("Закрыть", "Close")}>×</button>
        <div className="modal-icon">🚀</div>
        <h2>{register ? l("Регистрация", "Sign up") : l("Вход", "Log in")}</h2>
        <p>{register ? l("Создай аккаунт и начни изучать физику", "Create an account and start learning physics") : l("Войди в свой аккаунт ФизикаКосмос", "Log in to your Physics Cosmos account")}</p>
        <form onSubmit={submit}>
          {register && (
            <>
              <div className="role-selector" aria-label={l("Тип пользователя", "User type")}>
                <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>🎓 {l("Школьник", "Student")}</button>
                <button type="button" className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>👩‍🏫 {l("Учитель", "Teacher")}</button>
              </div>
              <label>
                {l("ФИО", "Full name")}
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              {role === "student" ? (
                <div className="registration-fields">
                  <label>{l("Номер класса", "Class") }<input placeholder={l("Например, 9А", "For example, 9A")} value={classNumber} onChange={(event) => setClassNumber(event.target.value)} required /></label>
                  <label>{l("Направление класса", "Class specialization")}<input placeholder={l("Физико-математическое", "Physics and mathematics")} value={classDirection} onChange={(event) => setClassDirection(event.target.value)} required /></label>
                  <label>{l("Дата рождения", "Date of birth")}<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required /></label>
                  <label>{l("Номер школы", "School number")}<input placeholder={l("Например, 57", "For example, 57")} value={schoolNumber} onChange={(event) => setSchoolNumber(event.target.value)} required /></label>
                </div>
              ) : (
                <div className="registration-fields">
                  <label>{l("Преподаваемый предмет", "Subject taught")}<input placeholder={l("Например, физика", "For example, physics")} value={subject} onChange={(event) => setSubject(event.target.value)} required /></label>
                  <label>{l("Номер школы", "School number")}<input placeholder={l("Например, 57", "For example, 57")} value={schoolNumber} onChange={(event) => setSchoolNumber(event.target.value)} required /></label>
                </div>
              )}
            </>
          )}
          <label>
            {l("Электронная почта", "Email")}
            <input type="email" placeholder={l("твой@email.com", "you@email.com")} value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            {l("Пароль", "Password")}
            <input type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button wide" type="submit" disabled={loading}>
            {loading ? l("Проверяем...", "Checking...") : register ? l("Зарегистрироваться", "Sign up") : l("Войти", "Log in")}
          </button>
        </form>
        <button className="text-button" onClick={() => setRegister(!register)}>
          {register ? l("Уже есть аккаунт? Войди", "Already have an account? Log in") : l("Нет аккаунта? Зарегистрируйся", "No account? Sign up")}
        </button>
        <small className="privacy-note">🔒 {l("Локальный аккаунт: данные сохраняются только в этом браузере.", "Local account: data is stored only in this browser.")}</small>
      </section>
    </div>
  );
}
