import { useState } from "react";
import { physicsTopics } from "../data/physics";
import PhysicsCanvas from "../components/PhysicsCanvas";
import { refractedAngle } from "../physics/calculations";

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
  1: "воздуха",
  1.31: "льда",
  1.33: "воды",
  1.5: "стекла",
  2.42: "алмаза",
};

function getOpticsQuiz({ n1, n2, angle }) {
  const from = opticalMediaNames[n1];
  const to = opticalMediaNames[n2];
  const theta2 = refractedAngle(n1, n2, angle);
  const answers = [
    "Возникает полное внутреннее отражение",
    "Луч поворачивает ближе к перпендикуляру",
    "Луч отклоняется дальше от перпендикуляра",
    "Направление луча не изменяется",
  ];

  if (theta2 === null) {
    return {
      question: `Что произойдёт со светом при переходе из ${from} в ${to} под углом ${angle}°?`,
      answers,
      correct: 0,
    };
  }
  if (n2 > n1) {
    return {
      question: `Как изменится направление света при переходе из ${from} в ${to}?`,
      answers,
      correct: 1,
    };
  }
  if (n2 < n1) {
    return {
      question: `Как изменится направление света при переходе из ${from} в ${to} под углом ${angle}°?`,
      answers,
      correct: 2,
    };
  }
  return {
    question: `Как изменится направление света, если для обеих сред n₁ = n₂ = ${n1.toFixed(2)}?`,
    answers,
    correct: 3,
  };
}

function TopicCard({ topic, open, onToggle }) {
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [newtonSolveFor, setNewtonSolveFor] = useState("acceleration");
  const [opticsValues, setOpticsValues] = useState({ n1: 1, n2: 1.33, angle: 35 });
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
    <article className={open ? "topic-card open" : "topic-card"}>
      <button className="topic-summary" onClick={onToggle}>
        <span className="topic-icon" style={{ background: topic.color }}>{topic.icon}</span>
        <span><strong>{topic.title}</strong><small>{topic.summary}</small></span>
        <b>{open ? "−" : "+"}</b>
      </button>
      {open && (
        <div className="topic-content">
          <div className="theory-grid">
            <section className="glass-panel">
              <h3>📚 Теория</h3>
              {topic.theory.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section className="formula-panel">
              <span>Формула</span>
              <strong>{topic.formula}</strong>
            </section>
          </div>
          <h3>🔬 Интерактивная симуляция</h3>
          <PhysicsCanvas
            type={topic.id}
            color={topic.color}
            onNewtonSolveForChange={changeNewtonSolveFor}
            onOpticsChange={changeOpticsValues}
          />
          <section className="quiz">
            <h3>🎯 Проверь себя</h3>
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
            <button className="primary-button" disabled={answer === null} onClick={() => setChecked(true)}>Проверить ответ</button>
            {checked && <p className={answer === quiz.correct ? "result success" : "result error"}>{answer === quiz.correct ? "Правильно! Отличная работа." : "Пока нет — попробуй ещё раз."}</p>}
          </section>
        </div>
      )}
    </article>
  );
}

export default function PhysicsPage() {
  const [openTopic, setOpenTopic] = useState("newton");

  return (
    <section className="section page-section">
      <div className="section-heading">
        <p className="eyebrow">Теория + практика</p>
        <h1>Физика в симуляциях</h1>
        <p>Выбери тему, поэкспериментируй и проверь себя.</p>
      </div>
      <div className="topics-list">
        {physicsTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            open={openTopic === topic.id}
            onToggle={() => setOpenTopic(openTopic === topic.id ? "" : topic.id)}
          />
        ))}
      </div>
    </section>
  );
}
