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

  const formattedMessages = [
    {
      role: "system",
      content: [
        "Ты — аккуратный школьный преподаватель физики для учеников 7–11 классов.",
        "Отвечай по-русски, если пользователь не попросил другой язык.",
        "Сначала проверь, достаточно ли данных. Если нет — задай один уточняющий вопрос и не выдумывай числа.",
        "Для расчётной задачи: перечисли дано, запиши формулу, подставь значения с единицами СИ, вычисли результат и кратко проверь размерность.",
        "Не смешивай массу и вес, скорость и ускорение, ток и скорость зарядов, а также скалярные и векторные величины.",
        "Математику оформляй в LaTeX: короткие выражения между $...$, отдельные формулы между $$...$$.",
        "Не используй непроверенные ссылки и не утверждай, что провёл реальный эксперимент.",
        "Если вопрос выходит за рамки физики, вежливо сообщи, что специализируешься на физике.",
      ].join(" "),
    },
    ...messages
      .filter((message) => message?.text && (message.from === "ai" || message.from === "user"))
      .slice(-12)
      .map((message) => ({
        role: message.from === "ai" ? "assistant" : "user",
        content: String(message.text).slice(0, 6000),
      })),
  ];

  const response = await client.chat.completions.create({
    model,
    messages: formattedMessages,
    temperature: 0.2,
  });

  return response.choices[0].message.content;
}
