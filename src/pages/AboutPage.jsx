import { text } from "../i18n.js";

const values = [
  ["💜", "Страсть к знаниям", "Passion for knowledge", "Я верю, что каждый человек может полюбить физику, если объяснять её понятно и увлекательно.", "I believe anyone can fall in love with physics when it is explained clearly and engagingly."],
  ["✨", "Инновации в обучении", "Innovation in learning", "Я использую интерактивные технологии, чтобы сделать обучение наглядным и интересным.", "I use interactive technology to make learning visual and engaging."],
  ["🌍", "Доступность", "Accessibility", "Для меня важно, чтобы качественные знания были доступны каждому.", "I want high-quality knowledge to be accessible to everyone."],
  ["🤝", "Поддержка", "Support", "Я создаю пространство, в котором ученики могут общаться, задавать вопросы и помогать друг другу.", "I create a space where students can connect, ask questions, and help one another."],
];

export default function AboutPage({ navigate, locale }) {
  const l = (ru, en) => text(locale, ru, en);
  return (
    <section className="section page-section">
      <div className="section-heading">
        <p className="eyebrow">{l("Моя история", "My story")}</p>
        <h1>{l("Обо мне", "About me")}</h1>
        <p>{l("Я создаю образовательные инструменты, которые делают физику доступной, понятной и увлекательной.", "I create educational tools that make physics accessible, clear, and engaging.")}</p>
      </div>
      <div className="mission-grid">
        <div>
          <h2>{l("Моя миссия", "My mission")}</h2>
          <p className="lead small">{l("Моя миссия — показать красоту физики с помощью интерактивных симуляций и помочь каждому человеку понять сложные идеи через практику, а не зубрёжку.", "My mission is to reveal the beauty of physics through interactive simulations and help everyone understand difficult ideas through practice, not memorization.")}</p>
          <button className="primary-button" onClick={() => navigate("physics")}>{l("Начать изучение", "Start learning")}</button>
        </div>
        <img src="/assets/images/student-science.jpg" alt={l("Изучение науки", "Learning science")} />
      </div>
      <div className="section-heading compact-heading"><p className="eyebrow">{l("Мои ценности", "My values")}</p><h2>{l("Принципы, которыми я руководствуюсь", "The principles that guide me")}</h2></div>
      <div className="feature-grid">
        {values.map(([icon, titleRu, titleEn, bodyRu, bodyEn]) => <article className="feature-card static" key={titleRu}><span className="feature-icon">{icon}</span><h3>{l(titleRu, titleEn)}</h3><p>{l(bodyRu, bodyEn)}</p></article>)}
      </div>
      <div className="story-panel">
        <img src="/assets/images/technology-waves.jpg" alt={l("Технологии и волны", "Technology and waves")} />
        <div><p className="eyebrow">{l("2025 — настоящее время", "2025 — present")}</p><h2>{l("Как я создала проект", "How I created the project")}</h2><p>{l("В 2025 году я начала работу над образовательной платформой, где законы физики можно не только изучать в теории, но и наблюдать в действии. Я разработала интерактивные разделы, симуляции и инструменты для общения. Так появился проект «ФизикаКосмос».", "In 2025, I began building an educational platform where the laws of physics could be studied in theory and observed in action. I developed interactive lessons, simulations, and communication tools. That is how Physics Cosmos was born.")}</p></div>
      </div>
      <div className="section-heading compact-heading"><p className="eyebrow">{l("Автор проекта", "Project author")}</p><h2>{l("Создательница «ФизикаКосмос»", "Creator of Physics Cosmos")}</h2></div>
      <div className="team-grid"><article><span>👩‍💻</span><h3>{l("Радченко Диана", "Diana Radchenko")}</h3><p>{l("Создательница и разработчица проекта", "Project creator and developer")}</p></article></div>
    </section>
  );
}
