import { text } from "../i18n.js";

const features = [
  ["⚛", "Интерактивные симуляции", "Interactive simulations", "Наблюдай физические процессы в реальном времени", "Watch physical processes in real time", "physics"],
  ["✦", "AI-помощник", "AI tutor", "Получай понятные ответы на вопросы по физике", "Get clear answers to physics questions", "ai"],
  ["🎓", "Сообщество учеников", "Student community", "Находи друзей и учись вместе", "Find friends and learn together", "friends"],
  ["👩‍🏫", "Сообщество учителей", "Teacher community", "Общайся с учителями и задавай вопросы", "Connect with teachers and ask questions", "teachers"],
];

export default function HomePage({ navigate, locale }) {
  const l = (ru, en) => text(locale, ru, en);
  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <div className="orb-logo">⚛</div>
          <p className="eyebrow">{l("Физика становится видимой", "Physics becomes visible")}</p>
          <h1>{l("Открой для себя", "Discover the")} <span>{l("мир физики", "world of physics")}</span></h1>
          <p className="lead">
            {l("Погрузись в путешествие по законам Вселенной. Интерактивные симуляции, AI-помощник и живое сообщество помогут понять, как устроен наш мир.", "Explore the laws of the universe. Interactive simulations, an AI tutor, and a learning community will help you understand how our world works.")}
          </p>
          <div className="button-row">
            <button className="primary-button large" onClick={() => navigate("physics")}>{l("Начать изучение", "Start learning")}</button>
            <button className="ghost-button large" onClick={() => navigate("about")}>{l("Узнать больше", "Learn more")}</button>
          </div>
          <div className="stats">
            {[["10+", l("Симуляций", "Simulations")], ["24/7", l("AI поддержка", "AI support")], ["∞", l("Знаний", "Knowledge")], ["100%", l("Бесплатно", "Free")]].map(([value, label]) => (
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
          <p className="eyebrow">{l("Почему ФизикаКосмос?", "Why Physics Cosmos?")}</p>
          <h2>{l("Учиться — значит экспериментировать", "Learning means experimenting")}</h2>
          <p>{l("Каждый раздел можно открыть, изменить параметры и увидеть результат.", "Open any section, change parameters, and see the result.")}</p>
        </div>
        <div className="feature-grid">
          {features.map(([icon, titleRu, titleEn, descriptionRu, descriptionEn, target]) => (
            <button className="feature-card" key={titleRu} onClick={() => navigate(target)}>
              <span className="feature-icon">{icon}</span>
              <h3>{l(titleRu, titleEn)}</h3>
              <p>{l(descriptionRu, descriptionEn)}</p>
              <b>{l("Открыть →", "Open →")}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="section home-showcase">
        <div className="showcase-copy">
          <p className="showcase-label cyan-label">{l("AI Помощник", "AI Tutor")}</p>
          <h2>{l("Персональный учитель", "Your personal tutor")}</h2>
          <p className="lead small">
            {l("Застрял на сложном вопросе? Наш AI-помощник всегда готов помочь разобраться в любой теме. Задавай вопросы на естественном языке и получай понятные объяснения.", "Stuck on a difficult question? Our AI tutor is always ready to help with any topic. Ask questions in natural language and get clear explanations.")}
          </p>
          <button className="primary-button large" onClick={() => navigate("ai")}>
            ✦ {l("Спросить у AI", "Ask AI")}
          </button>
        </div>
        <div className="showcase-image blue-frame">
          <img src="/assets/images/student-science.jpg" alt={l("Ученик изучает физику", "Student learning physics")} />
        </div>
      </section>

      <section className="section home-showcase reverse-showcase">
        <div className="showcase-image pink-frame">
          <img src="/assets/images/technology-waves.jpg" alt={l("Визуализация обмена знаниями", "Knowledge-sharing visualization")} />
        </div>
        <div className="showcase-copy">
          <p className="showcase-label pink-label">{l("Сообщество", "Community")}</p>
          <h2>{l("Учись вместе с другими", "Learn together")}</h2>
          <p className="lead small">
            {l("Присоединяйся к активному сообществу учеников со всего мира. Обменивайся знаниями, задавай вопросы и помогай другим в их обучении через наш интерактивный чат.", "Join an active community of students from around the world. Share knowledge, ask questions, and help others learn in our interactive chat.")}
          </p>
          <button className="primary-button large" onClick={() => navigate("chat")}>
            👥 {l("Присоединиться к чату", "Join the chat")}
          </button>
        </div>
      </section>

      <section className="section image-story">
        <img src="/assets/images/mechanics-motion.jpg" alt={l("Механика и движение", "Mechanics and motion")} />
        <div>
          <p className="eyebrow">{l("Физика вокруг нас", "Physics all around us")} 🚀</p>
          <h2>{l("От падающего яблока до света далёких звёзд", "From a falling apple to the light of distant stars")}</h2>
          <p className="lead small">
            {l("Меняй массу, скорость, температуру и заряд. Здесь формулы превращаются в движение, свет и настоящие маленькие открытия.", "Change mass, speed, temperature, and charge. Here, formulas become motion, light, and genuine little discoveries.")}
          </p>
          <button className="primary-button" onClick={() => navigate("simulator")}>{l("Попробовать симулятор", "Try the simulator")}</button>
        </div>
      </section>
    </>
  );
}
