import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { normalizeMathMarkdown } from "../utils/mathText.js";

const suggestions = [
  "Объясни закон сохранения энергии",
  "Как рассчитать траекторию броска?",
  "Что показывает закон Ома?",
  "Как работает закон Гука?",
];

export default function AiPage() {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: `# 👋 Привет!

Я AI-помощник по **школьной физике**.

Я умею:

- объяснять темы простым языком;
- решать задачи пошагово;
- показывать формулы;
- проверять единицы измерения;
- выполнять вычисления;
- объяснять каждый шаг решения.

Напишите свой вопрос 👇`,
    },
  ]);

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось получить ответ AI.");
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
            "Не удалось получить ответ AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section page-section narrow-page">

      <div className="section-heading">
        <p className="eyebrow">Персональный учитель</p>

        <h1>Спроси у AI</h1>

        <p>
          Пошаговые решения по школьной физике
          с проверкой единиц измерения,
          подстановкой чисел
          и корректным отображением формул.
        </p>
      </div>

      <div className="chat-window ai-window">

        <div className="chat-title">
          <span>✦</span>

          <div>
            <strong>AI Помощник</strong>
            <small>Школьная физика</small>
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
              Думаю над решением...
            </div>
          )}

        </div>

        <div className="suggestion-row">
          {suggestions.map((item) => (
            <button
              key={item}
              disabled={loading}
              onClick={() => ask(item)}
            >
              {item}
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
            placeholder="Введите задачу по физике..."
          />

          <button
            className="primary-button"
            disabled={
              loading || !value.trim()
            }
          >
            {loading
              ? "Думаю..."
              : "Отправить"}
          </button>
        </form>

      </div>
    </section>
  );
}