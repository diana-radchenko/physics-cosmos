const values = [
  ["💜", "Страсть к знаниям", "Я верю, что каждый человек может полюбить физику, если объяснять её понятно и увлекательно."],
  ["✨", "Инновации в обучении", "Я использую интерактивные технологии, чтобы сделать обучение наглядным и интересным."],
  ["🌍", "Доступность", "Для меня важно, чтобы качественные знания были доступны каждому."],
  ["🤝", "Поддержка", "Я создаю пространство, в котором ученики могут общаться, задавать вопросы и помогать друг другу."],
];

const profile = ["👩‍💻", "Радченко Диана", "Создательница и разработчица проекта"];

export default function AboutPage({ navigate }) {
  return (
    <section className="section page-section">
      <div className="section-heading">
        <p className="eyebrow">Моя история</p>
        <h1>Обо мне</h1>
        <p>Я создаю образовательные инструменты, которые делают физику доступной, понятной и увлекательной.</p>
      </div>
      <div className="mission-grid">
        <div>
          <h2>Моя миссия</h2>
          <p className="lead small">Моя миссия — показать красоту физики с помощью интерактивных симуляций и помочь каждому человеку понять сложные идеи через практику, а не зубрёжку.</p>
          <button className="primary-button" onClick={() => navigate("physics")}>Начать изучение</button>
        </div>
        <img src="/assets/images/student-science.jpg" alt="Изучение науки" />
      </div>
      <div className="section-heading compact-heading"><p className="eyebrow">Мои ценности</p><h2>Принципы, которыми я руководствуюсь</h2></div>
      <div className="feature-grid">
        {values.map(([icon, title, text]) => <article className="feature-card static" key={title}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
      <div className="story-panel">
        <img src="/assets/images/technology-waves.jpg" alt="Технологии и волны" />
        <div><p className="eyebrow">2025 — настоящее время</p><h2>Как я создала проект</h2><p>В 2025 году я начала работу над образовательной платформой, где законы физики можно не только изучать в теории, но и наблюдать в действии. Я разработала интерактивные разделы, симуляции и инструменты для общения. Так появился проект «ФизикаКосмос».</p></div>
      </div>
      <div className="section-heading compact-heading"><p className="eyebrow">Автор проекта</p><h2>Создательница «ФизикаКосмос»</h2></div>
      <div className="team-grid">
        <article>
          <span>{profile[0]}</span>
          <h3>{profile[1]}</h3>
          <p>{profile[2]}</p>
        </article>
      </div>
    </section>
  );
}
