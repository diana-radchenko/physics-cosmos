import test from "node:test";
import assert from "node:assert/strict";
import { buildPhysicsSystemPrompt } from "../server/openai.js";

test("English site mode forces AI responses to English", () => {
  const prompt = buildPhysicsSystemPrompt("en");
  assert.match(prompt, /Always answer in English/);
  assert.match(prompt, /English headings/);
});

test("Russian remains the default AI response language", () => {
  assert.match(buildPhysicsSystemPrompt(), /Всегда отвечай на русском языке/);
});
