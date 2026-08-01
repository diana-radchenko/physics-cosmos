import { requestPhysicsAnswer } from "../../server/openai.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length > 30) {
      return json({ error: "Слишком длинная история диалога." }, 400);
    }

    const answer = await requestPhysicsAnswer({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
    });

    return json({ answer });
  } catch (error) {
    console.error(error);

    return json(
      {
        error: error.message || "Не удалось получить ответ AI.",
      },
      error.status || 500
    );
  }
}

export function onRequest() {
  return json(
    {
      error: "Используйте POST-запрос.",
    },
    405
  );
}