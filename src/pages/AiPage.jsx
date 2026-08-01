import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { normalizeMathMarkdown } from "../utils/mathText.js";
import { text } from "../i18n.js";

const suggestions = [
  ["Объясни закон сохранения энергии", "Explain the law of conservation of energy"],
  ["Как рассчитать траекторию броска?", "How do I calculate a projectile's trajectory?"],
  ["Что показывает закон Ома?", "What does Ohm's law describe?"],
  ["Как работает закон Гука?", "How does Hooke's law work?"],
];

function greeting(locale) {
  return locale === "en" ? `# 👋 Hello!

I am your AI tutor for **school physics**.

I can:

- explain topics in simple language;
- solve problems step by step;
- show formulas;
- check units;
- perform calculations;
- explain every step of a solution.

Type your question below 👇` : `# 👋 Привет!

Я AI-помощник по **школьной физике**.

Я умею:

- объяснять темы простым языком;
- решать задачи пошагово;
- показывать формулы;
- проверять единицы измерения;
- выполнять вычисления;
- объяснять каждый шаг решения.

Напишите свой вопрос 👇`;
}

export default function AiPage({ locale }) {
  const l = (ru, en) => text(locale, ru, en);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: greeting(locale),
    },
  ]);

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages((current) => current.length === 1 && current[0].from === "ai"
      ? [{ ...current[0], text: greeting(locale) }]
      : current);
  }, [locale]);

  const ask = async (question = value) => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || loading) return;

    const nextMessages = [
      ...messages,
      {
        from: "user",
        text: cleanQuestion,
      },
    ];

    setMessages(nextMessages);
    setValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || l("Не удалось получить ответ AI.", "Could not get an AI response."));
      }

      setMessages((current) => [
        ...current,
        {
          from: "ai",
          text: normalizeMathMarkdown(data.answer),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          from: "ai",
          error: true,
          text:
            error.message ||
            l("Не удалось получить ответ AI.", "Could not get an AI response."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section page-section narrow-page">

      <div className="section-heading">
        <p className="eyebrow">{l("Персональный учитель", "Personal tutor")}</p>

        <h1>{l("Спроси у AI", "Ask AI")}</h1>

        <p>
          {l("Пошаговые решения по школьной физике с проверкой единиц измерения, подстановкой чисел и корректным отображением формул.", "Step-by-step school physics solutions with unit checks, numerical substitution, and correctly rendered formulas.")}
        </p>
      </div>

      <div className="chat-window ai-window">

        <div className="chat-title">
          <span>✦</span>

          <div>
            <strong>{l("AI Помощник", "AI Tutor")}</strong>
            <small>{l("Школьная физика", "School physics")}</small>
          </div>
        </div>

        <div className="messages">

          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.from} ${
                message.error ? "message-error" : ""
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                  remarkMath,
                ]}
                rehypePlugins={[
                  rehypeKatex,
                ]}
                components={{
                  code({
                    inline,
                    className,
                    children,
                    ...props
                  }) {
                    return inline ? (
                      <code
                        className={className}
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <pre>
                        <code
                          className={className}
                          {...props}
                        >
                          {children}
                        </code>
                      </pre>
                    );
                  },

                  table({ children }) {
                    return (
                      <div className="markdown-table">
                        <table>{children}</table>
                      </div>
                    );
                  },
                }}
              >
                {normalizeMathMarkdown(message.text)}
              </ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="message ai thinking-message">
              <span />
              <span />
              <span />
              {l("Думаю над решением...", "Working on the solution...")}
            </div>
          )}

        </div>

        <div className="suggestion-row">
          {suggestions.map(([ru, en]) => (
            <button
              key={ru}
              disabled={loading}
              onClick={() => ask(l(ru, en))}
            >
              {l(ru, en)}
            </button>
          ))}
        </div>

        <form
          className="chat-input"
          onSubmit={(event) => {
            event.preventDefault();
            ask();
          }}
        >
          <input
            value={value}
            disabled={loading}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder={l("Введите задачу по физике...", "Enter a physics problem...")}
          />

          <button
            className="primary-button"
            disabled={
              loading || !value.trim()
            }
          >
            {loading
              ? l("Думаю...", "Thinking...")
              : l("Отправить", "Send")}
          </button>
        </form>

      </div>
    </section>
  );
}
