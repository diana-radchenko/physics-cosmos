export const EARTH_GRAVITY_CONTROL = 1.7;
export const gravityControlFromMs2 = (gravity) => gravity / 9.81 * EARTH_GRAVITY_CONTROL;
export const gravityMs2FromControl = (control) => control / EARTH_GRAVITY_CONTROL * 9.81;

export const simulatorExperiments = [
  { id: "sandbox", icon: "🧪", title: "Песочница", titleEn: "Sandbox", description: "Добавляй собственные объекты и вручную настраивай физику.", descriptionEn: "Add your own objects and adjust the physics manually.", law: "Свободный эксперимент", lawEn: "Free experiment" },
  { id: "fall", icon: "🍎", title: "Свободное падение", titleEn: "Free fall", description: "Тела разной массы падают с одинаковым ускорением.", descriptionEn: "Objects of different masses fall with the same acceleration.", law: "a = g" },
  { id: "collision", icon: "💥", title: "Столкновение", titleEn: "Collision", description: "Два одинаковых тела обмениваются импульсом при почти упругом ударе.", descriptionEn: "Two identical objects exchange momentum in a nearly elastic collision.", law: "p = const" },
  { id: "moon", icon: "🌙", title: "Лунная гравитация", titleEn: "Lunar gravity", description: "Слабая гравитация создаёт высокие и долгие прыжки.", descriptionEn: "Weak gravity produces high, long-lasting jumps.", law: "g ≈ 1,62 м/с²", lawEn: "g ≈ 1.62 m/s²" },
  { id: "weightless", icon: "🛰️", title: "Невесомость", titleEn: "Weightlessness", description: "Без внешних сил тела движутся равномерно и сталкиваются.", descriptionEn: "Without external forces, objects move uniformly and collide.", law: "F = 0 → v = const" },
  { id: "mars", icon: "🔴", title: "Гравитация Марса", titleEn: "Martian gravity", description: "Сравни движение при марсианском ускорении свободного падения.", descriptionEn: "Observe motion under Martian gravitational acceleration.", law: "g ≈ 3,71 м/с²", lawEn: "g ≈ 3.71 m/s²" },
  { id: "projectile", icon: "🏀", title: "Бросок под углом", titleEn: "Projectile motion", description: "Горизонтальная скорость постоянна, а вертикальную изменяет гравитация.", descriptionEn: "Horizontal velocity stays constant while gravity changes vertical velocity.", law: "x = v₀ cos α · t" },
  { id: "superball", icon: "🔵", title: "Упругий мяч", titleEn: "Elastic ball", description: "При большом коэффициенте восстановления мяч сохраняет большую часть энергии.", descriptionEn: "With a high restitution coefficient, the ball retains most of its energy.", law: "vпосле ≈ −e·vдо", lawEn: "vafter ≈ −e·vbefore" },
  { id: "unequal", icon: "⚖️", title: "Разные массы", titleEn: "Unequal masses", description: "Лёгкое тело сталкивается с тяжёлым, а общий импульс сохраняется.", descriptionEn: "A light object collides with a heavy one while total momentum is conserved.", law: "m₁v₁ + m₂v₂ = const" },
];

export function createExperimentSetup(id, width, height, colors) {
  const object = (shape, mass, radius, x, y, vx = 0, vy = 0, color = colors[0], angularVelocity = 0) => ({ shape, mass, radius, x, y, vx, vy, color, angularVelocity });
  if (id === "fall") return { settings: { gravity: EARTH_GRAVITY_CONTROL, friction: 0.08, elasticity: 0.35 }, objects: [object("circle", 2, 25, width * .36, 70), object("circle", 16, 43, width * .64, 52, 0, 0, colors[2])] };
  if (id === "collision") return { settings: { gravity: 0, friction: 0, elasticity: 1 }, objects: [object("circle", 5, 32, width * .25, height * .5, 230), object("circle", 5, 32, width * .75, height * .5, -230, 0, colors[2])] };
  if (id === "moon") return { settings: { gravity: gravityControlFromMs2(1.62), friction: .08, elasticity: .78 }, objects: [object("circle", 5, 28, width * .18, height - 48, 185, -330), object("star", 4, 25, width * .5, height - 45, 80, -390, colors[4], 1.4), object("square", 7, 30, width * .78, height - 50, -145, -310, colors[1], -.9)] };
  if (id === "weightless") return { settings: { gravity: 0, friction: 0, elasticity: 1 }, objects: [object("circle", 4, 26, width * .2, height * .25, 125, 70), object("square", 6, 29, width * .72, height * .3, -105, 95, colors[1], .8), object("triangle", 5, 28, width * .36, height * .72, 90, -115, colors[3], -.7), object("star", 3, 24, width * .78, height * .72, -135, -80, colors[4], 1.2)] };
  if (id === "mars") return { settings: { gravity: gravityControlFromMs2(3.71), friction: .08, elasticity: .72 }, objects: [object("circle", 5, 28, width * .25, height - 50, 150, -330), object("star", 5, 27, width * .65, height - 50, -90, -330, colors[4], 1)] };
  if (id === "projectile") return { settings: { gravity: EARTH_GRAVITY_CONTROL, friction: 0, elasticity: .25 }, objects: [object("circle", 3, 24, 45, height - 45, 260, -360)] };
  if (id === "superball") return { settings: { gravity: EARTH_GRAVITY_CONTROL, friction: .01, elasticity: .94 }, objects: [object("circle", 4, 29, width * .5, 55, 70, 0, colors[0])] };
  if (id === "unequal") return { settings: { gravity: 0, friction: 0, elasticity: 1 }, objects: [object("circle", 2, 24, width * .2, height * .5, 280), object("circle", 8, 42, width * .65, height * .5, -40, 0, colors[2])] };
  return { settings: { gravity: EARTH_GRAVITY_CONTROL, friction: .35, elasticity: .65 }, objects: [] };
}
