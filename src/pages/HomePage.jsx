const features = [
  ["⚛", "Интерактивные симуляции", "Наблюдай физические процессы в реальном времени", "physics"],
  ["✦", "AI-помощник", "Получай понятные ответы на вопросы по физике", "ai"],
  ["📚", "Структурированная теория", "Изучай материал от простого к сложному", "physics"],
  ["👥", "Сообщество учеников", "Общайся и обменивайся знаниями", "chat"],
];

export default function HomePage({ navigate }) {
  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <div className="orb-logo">⚛</div>
          <p className="eyebrow">Физика становится видимой</p>
          <h1>Открой для себя <span>мир физики</span></h1>
          <p className="lead">
            Погрузись в путешествие по законам Вселенной. Интерактивные симуляции,
            AI-помощник и живое сообщество помогут понять, как устроен наш мир.
          </p>
          <div className="button-row">
            <button className="primary-button large" onClick={() => navigate("physics")}>Начать изучение</button>
            <button className="ghost-button large" onClick={() => navigate("about")}>Узнать больше</button>
          </div>
          <div className="stats">
            {[["10+", "Симуляций"], ["24/7", "AI поддержка"], ["∞", "Знаний"], ["100%", "Бесплатно"]].map(([value, label]) => (
              <div key={label}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="planet">
            <div className="planet-ring" />
            <span>🌍</span>
          </div>
          <div className="formula-card formula-one">E = mc²</div>
          <div className="formula-card formula-two">F = ma</div>
          <div className="formula-card formula-three">λ = v/f</div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Почему ФизикаКосмос?</p>
          <h2>Учиться — значит экспериментировать</h2>
          <p>Каждый раздел можно открыть, изменить параметры и увидеть результат.</p>
        </div>
        <div className="feature-grid">
          {features.map(([icon, title, description, target]) => (
            <button className="feature-card" key={title} onClick={() => navigate(target)}>
              <span className="feature-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <b>Открыть →</b>
            </button>
          ))}
        </div>
      </section>

      <section className="section home-showcase">
        <div className="showcase-copy">
          <p className="showcase-label cyan-label">AI Помощник</p>
          <h2>Персональный учитель</h2>
          <p className="lead small">
            Застрял на сложном вопросе? Наш AI-помощник всегда готов помочь
            разобраться в любой теме. Задавай вопросы на естественном языке и
            получай понятные объяснения.
          </p>
          <button className="primary-button large" onClick={() => navigate("ai")}>
            ✦ Спросить у AI
          </button>
        </div>
        <div className="showcase-image blue-frame">
          <img src="/assets/images/student-science.jpg" alt="Ученик изучает физику" />
        </div>
      </section>

      <section className="section home-showcase reverse-showcase">
        <div className="showcase-image pink-frame">
          <img src="/assets/images/technology-waves.jpg" alt="Визуализация обмена знаниями" />
        </div>
        <div className="showcase-copy">
          <p className="showcase-label pink-label">Сообщество</p>
          <h2>Учись вместе с другими</h2>
          <p className="lead small">
            Присоединяйся к активному сообществу учеников со всего мира.
            Обменивайся знаниями, задавай вопросы и помогай другим в их обучении
            через наш интерактивный чат.
          </p>
          <button className="primary-button large" onClick={() => navigate("chat")}>
            👥 Присоединиться к чату
          </button>
        </div>
      </section>

      <section className="section image-story">
        <img src="/assets/images/mechanics-motion.jpg" alt="Механика и движение" />
        <div>
          <p className="eyebrow">Физика вокруг нас</p>
          <h2>От падающего яблока до света далёких звёзд</h2>
          <p className="lead small">
            Меняй массу, скорость, температуру и заряд. Здесь формулы превращаются
            в движение, свет и настоящие маленькие открытия.
          </p>
          <button className="primary-button" onClick={() => navigate("simulator")}>Попробовать симулятор</button>
        </div>
      </section>
    </>
  );
}
