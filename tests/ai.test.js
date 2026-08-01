import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMathMarkdown } from "../src/utils/mathText.js";
import { SYSTEM_PROMPT } from "../server/physicsPrompt.js";

test("normalizes common LaTeX delimiters for KaTeX", () => {
  assert.equal(normalizeMathMarkdown("Формула \\(F=ma\\)."), "Формула $F=ma$.");
  assert.equal(
    normalizeMathMarkdown("Получаем:\n\\[ v = 10\\,\\text{м/с} \\]"),
    "Получаем:\n\n$$v = 10\\,\\text{м/с}$$\n",
  );
});

test("does not modify fenced code blocks", () => {
  const source = "```text\\n\\\\(F=ma\\\\)\\n```";
  assert.equal(normalizeMathMarkdown(source), source);
});

test("physics prompt requires missing-data clarification and checks", () => {
  assert.match(SYSTEM_PROMPT, /данных не хватает/i);
  assert.match(SYSTEM_PROMPT, /проверь размерность/i);
  assert.match(SYSTEM_PROMPT, /подставь числа вместе с единицами/i);
  assert.match(SYSTEM_PROMPT, /только на вопросы по школьной физике/i);
});
