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

const opticalMediaNames = {
  air: { from: "воздуха", to: "воздух" },
  water: { from: "воды", to: "воду" },
  ice: { from: "льда", to: "лёд" },
  glass: { from: "стекла", to: "стекло" },
  diamond: { from: "алмаза", to: "алмаз" },
};

function getOpticsQuiz({ medium1, medium2, n1, n2, angle }) {
  const from = opticalMediaNames[medium1]?.from ?? "первой среды";
  const to = opticalMediaNames[medium2]?.to ?? "вторую среду";
  const theta2 = refractedAngle(n1, n2, angle);
  const answers = [
    "Возникает полное внутреннее отражение",
    "Луч поворачивает ближе к перпендикуляру",
    "Луч отклоняется дальше от перпендикуляра",
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
  const quiz = topic.id === "newton"
    ? newtonQuizzes[newtonSolveFor]
    : topic.id === "optics"
      ? getOpticsQuiz(opticsValues)
      : topic;

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
              <strong>{topic.formula}</strong>
              <div className="formula-symbols">
                <h4>{l("Обозначения", "Symbols")}</h4>
                <dl>
                  {topic.symbols.map(({ symbol, meaning, unit }) => (
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
