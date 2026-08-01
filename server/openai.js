import OpenAI from "openai";

import { SYSTEM_PROMPT } from "./physicsPrompt.js";

const PHYSICS_REFUSAL =
  "Я помогаю только со школьной физикой. Задайте вопрос по физике.";

const LANGUAGE_INSTRUCTIONS = {
  ru: "Всегда отвечай на русском языке, независимо от языка отдельных сообщений в истории диалога.",
  en: "Always answer in English, regardless of the language used in individual messages in the conversation history. Use English headings, explanations, clarification questions, units, and error text.",
};

export function buildPhysicsSystemPrompt(locale = "ru") {
  const responseLocale = locale === "en" ? "en" : "ru";
  return `${SYSTEM_PROMPT}\n\n=== RESPONSE LANGUAGE ===\n${LANGUAGE_INSTRUCTIONS[responseLocale]}`;
}

function shouldExcludeAssistantMessage(message) {
  if (message.from !== "ai") {
    return false;
  }

  const text = String(message.text || "").trim();

  const isGreeting =
    text.includes("Привет!") &&
    (text.includes("AI-помощник") || text.includes("AI tutor"));

  const isTemplateRefusal =
    text === PHYSICS_REFUSAL;

  const isErrorMessage =
    message.error === true;

  return isGreeting || isTemplateRefusal || isErrorMessage;
}

export async function requestPhysicsAnswer({
  apiKey,
  model = "gpt-4o-mini",
  messages = [],
  locale = "ru",
}) {
  const responseLocale = locale === "en" ? "en" : "ru";
  if (!apiKey) {
    throw new Error(responseLocale === "en" ? "OPENAI_API_KEY was not found." : "OPENAI_API_KEY не найден.");
  }

  const validMessages = messages
    .filter((message) => {
      if (!message?.text) {
        return false;
      }

      if (message.from !== "ai" && message.from !== "user") {
        return false;
      }

      return !shouldExcludeAssistantMessage(message);
    })
    .slice(-12)
    .map((message) => ({
      role: message.from === "ai" ? "assistant" : "user",
      content: String(message.text).trim().slice(0, 6000),
    }));

  const hasUserMessage = validMessages.some(
    (message) => message.role === "user"
  );

  if (!hasUserMessage) {
    throw new Error(responseLocale === "en" ? "Enter a physics question." : "Введите вопрос по физике.");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: buildPhysicsSystemPrompt(responseLocale),
      },
      ...validMessages,
    ],
    temperature: 0.1,
    max_tokens: 1800,
  });

  const answer =
    response.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error(
      responseLocale === "en"
        ? "The AI returned no answer. Try rephrasing your question."
        : "AI не вернул ответ. Попробуйте сформулировать вопрос иначе."
    );
  }

  return answer;
}
