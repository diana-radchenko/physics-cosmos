import { requestArticleFormatting, requestPhysicsAnswer } from "../../server/openai.js";

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
    const locale = body.locale === "en" ? "en" : "ru";

    if (body.mode === "article-format") {
      const answer = await requestArticleFormatting({
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL || "gpt-4o-mini",
        text: body.text,
        locale,
      });
      return json({ answer });
    }

    if (messages.length > 30) {
      return json({ error: locale === "en" ? "The conversation history is too long." : "Слишком длинная история диалога." }, 400);
    }

    const answer = await requestPhysicsAnswer({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      locale,
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

