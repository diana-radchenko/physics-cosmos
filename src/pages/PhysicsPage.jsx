import { useState } from "react";
import { physicsTopics } from "../data/physics";
import PhysicsCanvas from "../components/PhysicsCanvas";

function TopicCard({ topic, open, onToggle }) {
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);

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
          <PhysicsCanvas type={topic.id} color={topic.color} />
          <section className="quiz">
            <h3>🎯 Проверь себя</h3>
            <p>{topic.question}</p>
            <div className="quiz-options">
              {topic.answers.map((item, index) => (
                <button
                  key={item}
                  className={[
                    answer === index ? "selected" : "",
                    checked && index === topic.correct ? "correct" : "",
                    checked && answer === index && index !== topic.correct ? "wrong" : "",
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
            {checked && <p className={answer === topic.correct ? "result success" : "result error"}>{answer === topic.correct ? "Правильно! Отличная работа." : "Пока нет — попробуй ещё раз."}</p>}
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
