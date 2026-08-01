import OpenAI from "openai";

import { SYSTEM_PROMPT } from "./physicsPrompt.js";


export async function requestPhysicsAnswer({
  apiKey,
  model = "gpt-4o-mini",
  messages = [],
}) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY не найден.");
  }

  const validMessages = messages
    .filter((message) => message?.text && (message.from === "ai" || message.from === "user"))
    .slice(-12)
    .map((message) => ({
      role: message.from === "ai" ? "assistant" : "user",
      content: String(message.text).trim().slice(0, 6000),
    }));

  if (!validMessages.some((message) => message.role === "user")) {
    throw new Error("Введите вопрос по физике.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...validMessages,
    ],
    temperature: 0.1,
    max_tokens: 1400,
  });

  const answer = response.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("AI не вернул ответ. Попробуйте сформулировать вопрос иначе.");
  }

  return answer;
}

