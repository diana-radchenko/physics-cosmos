import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { requestPhysicsAnswer } from "./server/openai.js";

function physicsAiDevServer(env) {
  return {
    name: "physics-ai-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/ai", async (request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");

        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Используйте POST-запрос." }));
          return;
        }

        let rawBody = "";
        for await (const chunk of request) rawBody += chunk;

        try {
          const body = JSON.parse(rawBody || "{}");
          const answer = await requestPhysicsAnswer({
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL || "gpt-4o-mini",
            messages: Array.isArray(body.messages) ? body.messages : [],
          });

          response.statusCode = 200;
          response.end(JSON.stringify({ answer }));
        } catch (error) {
          response.statusCode = error.status || 500;
          response.end(JSON.stringify({ error: error.message || "Не удалось получить ответ AI." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), physicsAiDevServer(env)],
    server: {
      host: "127.0.0.1",
      port: 3000,
    },
  };
});
