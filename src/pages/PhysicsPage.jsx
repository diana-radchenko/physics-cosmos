import { useState } from "react";
import { physicsTopics } from "../data/physics";
import PhysicsCanvas from "../components/PhysicsCanvas";
import { refractedAngle } from "../physics/calculations";
import { localizeTopics, text } from "../i18n.js";

const newtonQuizzes = {
  acceleration: {
    question: "Какое ускорение получит тело массой 5 кг под действием силы 10 Н?",
    answers: ["0,5 м/с²", "2 м/с²", "5 м/с²", "50 м/с²"],
    correct: 1,
  },
  mass: {
    question: "Какова масса тела, если сила равна 15 Н, а ускорение — 3 м/с²?",
    answers: ["3 кг", "5 кг", "12 кг", "45 кг"],
    correct: 1,
  },
  force: {
    question: "Какая сила нужна, чтобы сообщить телу массой 5 кг ускорение 2 м/с²?",
    answers: ["2,5 Н", "7 Н", "10 Н", "25 Н"],
    correct: 2,
  },
};

const englishNewtonQuizzes = {
  acceleration: { question: "What acceleration will a 5 kg object have under a force of 10 N?", answers: ["0.5 m/s²", "2 m/s²", "5 m/s²", "50 m/s²"], correct: 1 },
  mass: { question: "What is the mass if the force is 15 N and acceleration is 3 m/s²?", answers: ["3 kg", "5 kg", "12 kg", "45 kg"], correct: 1 },
  force: { question: "What force gives a 5 kg object an acceleration of 2 m/s²?", answers: ["2.5 N", "7 N", "10 N", "25 N"], correct: 2 },
};

const englishQuizzes = {
  gravity: ["What happens to gravity if the distance between two objects doubles?", ["It doubles", "It stays the same", "It halves", "It becomes four times weaker"]],
  waves: ["What happens to the distance between adjacent peaks when wavelength increases?", ["It increases", "It decreases", "It stays the same", "The wave stops"]],
  electric: ["What happens to the electric force if distance doubles?", ["It doubles", "It stays the same", "It halves", "It becomes four times weaker"]],
  pendulum: ["What does the period of a simple pendulum not depend on?", ["String length", "Gravity", "Bob mass", "Acceleration"]],
  heat: ["What happens when heat-transfer coefficient K increases and all other parameters stay fixed?", ["Temperatures equalize faster", "Equilibrium temperature rises", "Heat flows from cold to hot", "Only one object's temperature changes"]],
  magnetism: ["Which pole do magnetic field lines leave?", ["South pole", "North pole", "The center", "Nowhere"]],
  projectile: ["Which launch angle gives the greatest range on level ground?", ["15°", "30°", "45°", "90°"]],
  hooke: ["What happens to elastic force if extension doubles?", ["It halves", "It stays the same", "It doubles", "It quadruples"]],
  momentum: ["What determines an object's momentum?", ["Mass only", "Velocity only", "Mass and velocity", "Temperature"]],
  ohm: ["What happens to current if voltage doubles at constant resistance?", ["It halves", "It stays the same", "It doubles", "It becomes zero"]],
};

const englishSymbols = {
  newton: [["resultant force acting on the object", "N"], ["object mass", "kg"], ["object acceleration", "m/s²"]],
  optics: [["refractive index of the first medium", "dimensionless"], ["refractive index of the second medium", "dimensionless"], ["angle of incidence measured from the normal", "degrees (°)"], ["angle of refraction measured from the normal", "degrees (°)"], ["sine of the corresponding angle", ""]],
  gravity: [["gravitational force between the objects", "N"], ["gravitational constant, about 6.67 × 10⁻¹¹", "N·m²/kg²"], ["masses of the interacting objects", "kg"], ["distance between their centers of mass", "m"]],
  waves: [["wave speed", "m/s"], ["wavelength", "m"], ["oscillation frequency", "Hz"]],
  electric: [["magnitude of electrostatic force", "N"], ["Coulomb constant, about 9 × 10⁹", "N·m²/C²"], ["electric charges", "C"], ["distance between charges", "m"]],
  pendulum: [["period of one complete oscillation", "s"], ["pi, approximately 3.14", ""], ["pendulum length", "m"], ["gravitational acceleration", "m/s²"]],
  heat: [["heat gained or released", "J"], ["specific heat capacity", "J/(kg·°C)"], ["object mass", "kg"], ["temperature change", "°C or K"]],
  magnetism: [["magnetic component of the Lorentz force", "N"], ["particle charge", "C"], ["charged-particle speed", "m/s"], ["magnetic flux density", "T"], ["angle between velocity and the magnetic field", "degrees (°)"], ["sine of angle θ", ""]],
  projectile: [["horizontal coordinate", "m"], ["vertical coordinate", "m"], ["initial speed", "m/s"], ["launch angle", "degrees (°)"], ["time after launch", "s"], ["gravitational acceleration", "m/s²"], ["cosine of the launch angle", ""], ["sine of the launch angle", ""]],
  hooke: [["spring force", "N"], ["spring constant", "N/m"], ["extension or compression from equilibrium", "m"], ["force points opposite to deformation", ""]],
  momentum: [["masses of the two objects", "kg"], ["velocities before collision, including direction", "m/s"], ["object momentum", "kg·m/s"], ["velocities after collision, including direction", "m/s"]],
  ohm: [["electric current", "A"], ["voltage", "V"], ["electrical resistance", "Ω"]],
};

const opticalMediaNames = {
  air: { from: "воздуха", to: "воздух" },
  water: { from: "воды", to: "воду" },
  ice: { from: "льда", to: "лёд" },
  glass: { from: "стекла", to: "стекло" },
  diamond: { from: "алмаза", to: "алмаз" },
};

function getOpticsQuiz({ medium1, medium2, n1, n2, angle }, locale) {
  if (locale === "en") {
    const theta2 = refractedAngle(n1, n2, angle);
    const answers = ["Total internal reflection occurs", "The ray bends closer to the normal to the boundary between the two media", "The ray bends farther away from the normal to the boundary between the two media", "The ray does not change direction"];
    const correct = theta2 === null ? 0 : n2 > n1 ? 1 : n2 < n1 ? 2 : 3;
    return { question: `How does light change direction when it crosses the selected boundary at an incidence angle of ${angle}°?`, answers, correct };
  }
  const from = opticalMediaNames[medium1]?.from ?? "первой среды";
  const to = opticalMediaNames[medium2]?.to ?? "вторую среду";
  const theta2 = refractedAngle(n1, n2, angle);
  const answers = [
    "Возникает полное внутреннее отражение",
    "Луч поворачивается ближе к перпендикуляру к границе раздела двух сред",
    "Луч отклоняется дальше от перпендикуляра к границе раздела двух сред",
    "Направление луча не изменяется",
  ];

  if (theta2 === null) {
    return {
      question: `Как изменится направление света при переходе из ${from} в ${to} при угле падения ${angle}°?`,
      answers,
      correct: 0,
    };
  }
  if (n2 > n1) {
    return {
      question: `Как изменится направление света при переходе из ${from} в ${to} при угле падения ${angle}°?`,
      answers,
      correct: 1,
    };
  }
  if (n2 < n1) {
    return {
      question: `Как изменится направление света при переходе из ${from} в ${to} при угле падения ${angle}°?`,
      answers,
      correct: 2,
    };
  }
  return {
    question: "Как изменится направление света, если у выбранных сред одинаковые показатели преломления?",
    answers,
    correct: 3,
  };
}

function TopicCard({ topic, open, onToggle, locale }) {
  const l = (ru, en) => text(locale, ru, en);
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [newtonSolveFor, setNewtonSolveFor] = useState("acceleration");
  const [opticsValues, setOpticsValues] = useState({
    medium1: "air",
    n1: 1,
    medium2: "water",
    n2: 1.33,
    angle: 35,
  });
  let quiz = topic.id === "newton"
    ? (locale === "en" ? englishNewtonQuizzes : newtonQuizzes)[newtonSolveFor]
    : topic.id === "optics"
      ? getOpticsQuiz(opticsValues, locale)
      : topic;
  if (locale === "en" && englishQuizzes[topic.id]) quiz = { ...quiz, question: englishQuizzes[topic.id][0], answers: englishQuizzes[topic.id][1] };
  const symbols = locale === "en" && englishSymbols[topic.id]
    ? topic.symbols.map((item, index) => ({ ...item, meaning: englishSymbols[topic.id][index][0], unit: englishSymbols[topic.id][index][1] }))
    : topic.symbols;

  const changeNewtonSolveFor = (solveFor) => {
    setNewtonSolveFor(solveFor);
    setAnswer(null);
    setChecked(false);
  };

  const changeOpticsValues = (values) => {
    setOpticsValues(values);
    setAnswer(null);
    setChecked(false);
  };

  return (
    <article className={`${open ? "topic-card open" : "topic-card"} topic-${topic.id}`}>
      <button className="topic-summary" onClick={onToggle}>
        <span className="topic-icon" style={{ background: topic.color }}>{topic.icon}</span>
        <span><strong>{topic.title}</strong><small>{topic.summary}</small></span>
        <b>{open ? "−" : "+"}</b>
      </button>
      {open && (
        <div className="topic-content">
          <div className="theory-grid">
            <section className="glass-panel">
              <h3>📚 {l("Теория", "Theory")}</h3>
              {topic.theory.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section className="formula-panel">
              <span>{l("Формула", "Formula")}</span>
              {topic.id === "pendulum" ? (
                <strong className="math-formula">T = 2π × <span className="square-root"><span>L / g</span></span></strong>
              ) : (
                <strong className={topic.id === "projectile" ? "multiline-formula" : ""}>{topic.formula}</strong>
              )}
              <div className="formula-symbols">
                <h4>{l("Обозначения", "Symbols")}</h4>
                <dl>
                  {symbols.map(({ symbol, meaning, unit }) => (
                    <div className="formula-symbol" key={symbol}>
                      <dt>{symbol}</dt>
                      <dd>
                        {meaning}
                        {unit && <span className="formula-unit">, {unit}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          </div>
          <h3>🔬 {l("Интерактивная симуляция", "Interactive simulation")}</h3>
          <PhysicsCanvas
            type={topic.id}
            color={topic.color}
            onNewtonSolveForChange={changeNewtonSolveFor}
            onOpticsChange={changeOpticsValues}
            locale={locale}
          />
          <section className="quiz">
            <h3>🎯 {l("Проверь себя", "Test yourself")}</h3>
            <p>{quiz.question}</p>
            <div className="quiz-options">
              {quiz.answers.map((item, index) => (
                <button
                  key={item}
                  className={[
                    answer === index ? "selected" : "",
                    checked && index === quiz.correct ? "correct" : "",
                    checked && answer === index && index !== quiz.correct ? "wrong" : "",
                  ].join(" ")}
                  onClick={() => {
                    setAnswer(index);
                    setChecked(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <button className="primary-button" disabled={answer === null} onClick={() => setChecked(true)}>{l("Проверить ответ", "Check answer")}</button>
            {checked && <p className={answer === quiz.correct ? "result success" : "result error"}>{answer === quiz.correct ? l("Правильно! Отличная работа.", "Correct! Great job.") : l("Пока нет — попробуй ещё раз.", "Not yet — try again.")}</p>}
          </section>
        </div>
      )}
    </article>
  );
}

export default function PhysicsPage({ locale }) {
  const [openTopic, setOpenTopic] = useState("newton");

  return (
    <section className="section page-section">
      <div className="section-heading">
        <p className="eyebrow">{text(locale, "Теория + практика", "Theory + practice")}</p>
        <h1>{text(locale, "Физика в симуляциях", "Physics through simulations")}</h1>
        <p>{text(locale, "Выбери тему, поэкспериментируй и проверь себя.", "Choose a topic, experiment, and test yourself.")}</p>
      </div>
      <div className="topics-list">
        {localizeTopics(physicsTopics, locale).map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            open={openTopic === topic.id}
            onToggle={() => setOpenTopic(openTopic === topic.id ? "" : topic.id)}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

