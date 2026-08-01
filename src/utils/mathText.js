export function normalizeMathMarkdown(value = "") {
  return String(value)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => {
      return `\n$$\n${formula.trim()}\n$$\n`;
    })
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => {
      return `$${formula.trim()}$`;
    })
    .replace(/```(?:latex|math)\s*([\s\S]*?)```/gi, (_, formula) => {
      return `\n$$\n${formula.trim()}\n$$\n`;
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}