import OpenAI from "openai";

export async function requestPhysicsAnswer({
  apiKey,
  model = "gpt-4o-mini",
  messages = [],
}) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY не найден.");
  }

  const client = new OpenAI({ apiKey });

  // Преобразуем формат сообщений
  const formattedMessages = messages.map((message) => ({
    role: message.from === "ai" ? "assistant" : "user",
    content: message.text,
  }));

  const response = await client.chat.completions.create({
    model,
    messages: formattedMessages,
  });

  return response.choices[0].message.content;
}