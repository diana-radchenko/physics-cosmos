import { useEffect, useMemo, useRef, useState } from "react";
import {
  advanceNewtonMotion,
  collisionResult,
  coulombForce,
  gravityForce,
  heatTransferState,
  hookeMetrics,
  newtonAcceleration,
  newtonForce,
  newtonMass,
  ohmCurrent,
  pendulumAngle,
  pendulumPeriod,
  projectileMetrics,
  refractedAngle,
  waveSpeed,
} from "../physics/calculations";

const physicsTranslations = [
  ["Первая среда (из неё выходит свет)", "First medium (light exits it)"], ["Вторая среда (в неё входит свет)", "Second medium (light enters it)"],
  ["Начальная температура", "Initial temperature"], ["Коэффициент теплопередачи", "Heat-transfer coefficient"], ["Постоянное ускорение", "Gravitational acceleration"],
  ["Начальная скорость", "Initial speed"], ["Начальный угол", "Initial angle"], ["Магнитная индукция", "Magnetic flux density"],
  ["Ориентация магнита", "Magnet orientation"], ["Проводник с током", "Current-carrying wire"], ["Тип столкновения", "Collision type"],
  ["Пользовательская среда", "Custom medium"], ["Тепловое равновесие", "Thermal equilibrium"], ["Мощность теплопередачи", "Heat-transfer power"],
  ["Направление поля", "Field direction"], ["положение равновесия", "equilibrium position"], ["До столкновения", "Before collision"], ["После столкновения", "After collision"],
  ["направление условного тока", "conventional current direction"], ["ток отсутствует", "no current"],
  ["Сила на электрон — против E", "Force on an electron — opposite E"], ["Сила на «+» заряд — по E", "Force on a positive charge — along E"], ["от «+» к «−»", "from + to −"],
  ["Линии поля вне магнита направлены от N к S", "Field lines outside the magnet point from N to S"], ["Пунктир —", "Dashed line —"],
  ["Планета", "Planet"], ["Спутник", "Satellite"], ["Рассчитать", "Calculate"], ["Ускорение", "Acceleration"], ["Сила", "Force"], ["Масса", "Mass"],
  ["Угол падения", "Incidence angle"], ["Расстояние", "Distance"], ["Частота", "Frequency"], ["Длина волны", "Wavelength"], ["Амплитуда", "Amplitude"],
  ["Заряд", "Charge"], ["Длина", "Length"], ["Материал тела", "Object material"], ["Сила тока", "Current"], ["Угол", "Angle"],
  ["Жёсткость", "Spring constant"], ["Деформация", "Deformation"], ["Скорость", "Velocity"], ["Напряжение", "Voltage"], ["Сопротивление", "Resistance"],
  ["Силу", "Force"], ["Массу", "Mass"], ["Упругое", "Elastic"], ["Неупругое", "Inelastic"], ["Отключён", "Off"],
  ["Ток к наблюдателю", "Current toward viewer"], ["Ток от наблюдателя", "Current away from viewer"], ["N слева, S справа", "N left, S right"], ["S слева, N справа", "S left, N right"],
  ["Воздух", "Air"], ["Вода", "Water"], ["Лёд", "Ice"], ["Стекло", "Glass"], ["Алмаз", "Diamond"], ["Медь", "Copper"], ["Сталь", "Steel"], ["Алюминий", "Aluminium"],
  ["массы Земли", "Earth masses"], ["градусы", "degrees"], ["Мощность", "Power"],
  ["Полное внутреннее отражение", "Total internal reflection"], ["Преломлённого луча нет", "No refracted ray"], ["Связь величин", "Relationship"],
  ["Сила взаимодействия равна нулю", "Interaction force is zero"], ["Разноимённые заряды притягиваются", "Opposite charges attract"], ["Одноимённые заряды отталкиваются", "Like charges repel"],
  ["общая температура после теплообмена", "common temperature after heat exchange"], ["массы тел", "object masses"], ["их удельные теплоёмкости", "their specific heat capacities"], ["начальные температуры", "initial temperatures"],
  ["поле против часовой стрелки", "counterclockwise field"], ["поле по часовой стрелке", "clockwise field"], ["Поле магнита", "Magnet field"],
  ["Время полёта", "Flight time"], ["Максимальная высота", "Maximum height"], ["Дальность", "Range"], ["Ускорение постоянно", "Acceleration is constant"], ["Формулы", "Formulas"],
  ["Текущая деформация", "Current deformation"], ["Текущая сила", "Current force"], ["Период", "Period"], ["столкновение", "collision"],
  ["Суммарный импульс сохраняется", "Total momentum is conserved"], ["Ошибка: суммарный импульс не сохраняется", "Error: total momentum is not conserved"],
  ["Тела движутся вместе", "Objects move together"], ["После удара", "After impact"], ["При U = 0 ток отсутствует", "At U = 0 there is no current"],
  ["Полярность и направление тока обращены", "Polarity and current direction are reversed"], ["Ток направлен по принятому направлению", "Current follows the conventional direction"],
  ["мкКл", "μC"], ["кг", "kg"], ["м/с²", "m/s²"], ["м/с", "m/s"], ["Гц", "Hz"], ["Дж", "J"], ["Вт", "W"], ["Тл", "T"], ["Ом", "Ω"], [" Н", " N"], [" А", " A"], [" В", " V"], [" с", " s"], [" м", " m"],
];

function translatePhysicsText(locale, value) {
  if (locale !== "en") return value;
  const units = { "Н": "N", "кг": "kg", "м/с²": "m/s²", "м/с": "m/s", "м": "m", "с": "s", "Гц": "Hz", "Тл": "T", "А": "A", "В": "V", "Ом": "Ω" };
  if (units[value]) return units[value];
  return physicsTranslations.reduce((result, [ru, en]) => result.split(ru).join(en), String(value)).replace(/,/g, ".");
}

const HEIGHT = 300;
const EARTH_MASS_KG = 5.972e24;

const opticalMedia = [
  { value: "air", n: 1, name: "Воздух", label: "Воздух — n = 1,00" },
  { value: "water", n: 1.333, name: "Вода", label: "Вода — n = 1,333" },
  { value: "ice", n: 1.31, name: "Лёд", label: "Лёд — n = 1,31" },
  { value: "glass", n: 1.57, name: "Стекло", label: "Стекло — n = 1,57" },
  { value: "diamond", n: 2.417, name: "Алмаз", label: "Алмаз — n = 2,417" },
];

const thermalMaterials = [
  { value: "copper", c: 385, label: "Медь — c = 385 Дж/(кг·°C)" },
  { value: "steel", c: 500, label: "Сталь — c = 500 Дж/(кг·°C)" },
  { value: "glass", c: 840, label: "Стекло — c = 840 Дж/(кг·°C)" },
  { value: "aluminium", c: 900, label: "Алюминий — c = 900 Дж/(кг·°C)" },
  { value: "water", c: 4200, label: "Вода — c = 4200 Дж/(кг·°C)" },
];

const simulationConfig = {
  newton: {
    controls: [
      { key: "solveFor", label: "Рассчитать", type: "select", options: [
        { value: "acceleration", label: "Ускорение a" },
        { value: "force", label: "Силу F" },
        { value: "mass", label: "Массу m" },
      ] },
      { key: "force", label: "Сила F", min: -30, max: 30, step: 1, unit: "Н" },
      { key: "mass", label: "Масса m", min: 1, max: 20, step: 1, unit: "кг" },
      { key: "acceleration", label: "Ускорение a", min: -15, max: 15, step: 0.1, unit: "м/с²" },
    ],
    initial: { solveFor: "acceleration", force: 10, mass: 5, acceleration: 2 },
  },
  optics: {
    controls: [
      { key: "medium1", label: "Первая среда (из неё выходит свет)", type: "select", options: opticalMedia },
      { key: "medium2", label: "Вторая среда (в неё входит свет)", type: "select", options: opticalMedia },
      { key: "angle", label: "Угол падения θ₁", min: 0, max: 80, step: 1, unit: "°" },
    ],
    initial: { medium1: "air", n1: 1, medium2: "water", n2: 1.333, angle: 35 },
  },
  gravity: {
    controls: [
      { key: "m1", label: "Масса m₁", min: 0.5, max: 5, step: 0.1, unit: "массы Земли" },
      { key: "m2", label: "Масса m₂", min: 0.5, max: 5, step: 0.1, unit: "массы Земли" },
      { key: "distance", label: "Расстояние r", min: 2, max: 20, step: 1, unit: "×10⁷ м" },
    ],
    initial: { m1: 1, m2: 0.7, distance: 8 },
  },
  waves: {
    controls: [
      { key: "frequency", label: "Частота f", min: 0.5, max: 5, step: 0.1, unit: "Гц" },
      { key: "wavelength", label: "Длина волны λ", min: 0.5, max: 5, step: 0.1, unit: "м" },
      { key: "amplitude", label: "Амплитуда A", min: 0.2, max: 1.5, step: 0.1, unit: "м" },
    ],
    initial: { frequency: 2, wavelength: 2, amplitude: 1 },
  },
  electric: {
    controls: [
      { key: "q1", label: "Заряд q₁", min: -5, max: 5, step: 1, unit: "мкКл" },
      { key: "q2", label: "Заряд q₂", min: -5, max: 5, step: 1, unit: "мкКл" },
      { key: "distance", label: "Расстояние r", min: 1, max: 8, step: 0.5, unit: "м" },
    ],
    initial: { q1: 2, q2: -3, distance: 4 },
  },
  pendulum: {
    controls: [
      { key: "length", label: "Длина L", min: 0.4, max: 3, step: 0.1, unit: "м" },
      { key: "gravity", label: "Постоянное ускорение g", min: 1.62, max: 15, step: 0.01, unit: "м/с²" },
      { key: "initialAngle", label: "Начальный угол θ₀", min: 1, max: 15, step: 1, unit: "°" },
    ],
    initial: { length: 1.5, gravity: 9.81, initialAngle: 10 },
  },
  heat: {
    controls: [
      { key: "temperature1", label: "Начальная температура T₁", min: 0, max: 100, step: 1, unit: "°C" },
      { key: "temperature2", label: "Начальная температура T₂", min: 0, max: 100, step: 1, unit: "°C" },
      { key: "mass1", label: "Масса m₁", min: 0.5, max: 5, step: 0.5, unit: "кг" },
      { key: "mass2", label: "Масса m₂", min: 0.5, max: 5, step: 0.5, unit: "кг" },
      { key: "material1", label: "Материал тела 1", type: "select", options: thermalMaterials },
      { key: "material2", label: "Материал тела 2", type: "select", options: thermalMaterials },
      { key: "conductance", label: "Коэффициент теплопередачи K", min: 50, max: 500, step: 25, unit: "Вт/°C" },
    ],
    initial: {
      temperature1: 80,
      temperature2: 20,
      mass1: 1,
      mass2: 1,
      material1: "aluminium",
      material2: "water",
      specificHeat1: 900,
      specificHeat2: 4200,
      conductance: 250,
    },
  },
  magnetism: {
    controls: [
      { key: "strength", label: "Магнитная индукция B", min: 0.2, max: 2, step: 0.1, unit: "Тл" },
      { key: "direction", label: "Ориентация магнита", type: "select", options: [
        { value: 1, label: "N слева, S справа" },
        { value: -1, label: "S слева, N справа" },
      ] },
      { key: "conductor", label: "Проводник с током", type: "select", options: [
        { value: "none", label: "Отключён" },
        { value: "out", label: "Ток к наблюдателю (•)" },
        { value: "in", label: "Ток от наблюдателя (×)" },
      ] },
      { key: "current", label: "Сила тока I", min: 1, max: 10, step: 1, unit: "А" },
    ],
    initial: { strength: 1, direction: 1, conductor: "out", current: 5 },
  },
  projectile: {
    controls: [
      { key: "velocity", label: "Начальная скорость v₀", min: 8, max: 40, step: 1, unit: "м/с" },
      { key: "angle", label: "Угол α", min: 5, max: 85, step: 1, unit: "°" },
      { key: "gravity", label: "Постоянное ускорение g", min: 1.62, max: 15, step: 0.01, unit: "м/с²" },
    ],
    initial: { velocity: 20, angle: 45, gravity: 9.81 },
  },
  hooke: {
    controls: [
      { key: "stiffness", label: "Жёсткость k", min: 5, max: 50, step: 1, unit: "Н/м" },
      { key: "mass", label: "Масса m", min: 0.5, max: 5, step: 0.1, unit: "кг" },
      { key: "extension", label: "Деформация x", min: 0.05, max: 0.6, step: 0.05, unit: "м" },
    ],
    initial: { stiffness: 20, mass: 2, extension: 0.25 },
  },
  momentum: {
    controls: [
      { key: "m1", label: "Масса m₁", min: 1, max: 8, step: 1, unit: "кг" },
      { key: "v1", label: "Скорость v₁", min: -8, max: 8, step: 0.5, unit: "м/с" },
      { key: "m2", label: "Масса m₂", min: 1, max: 8, step: 1, unit: "кг" },
      { key: "v2", label: "Скорость v₂", min: -8, max: 8, step: 0.5, unit: "м/с" },
      { key: "collision", label: "Тип столкновения", type: "select", options: [
        { value: "elastic", label: "Упругое" },
        { value: "inelastic", label: "Неупругое" },
      ] },
    ],
    initial: { m1: 2, v1: 5, m2: 3, v2: -2, collision: "elastic" },
  },
  ohm: {
    controls: [
      { key: "voltage", label: "Напряжение U", min: -24, max: 24, step: 1, unit: "В" },
      { key: "resistance", label: "Сопротивление R", min: 1, max: 30, step: 1, unit: "Ом" },
    ],
    initial: { voltage: 12, resistance: 6 },
  },
};

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e5 || (Math.abs(value) > 0 && Math.abs(value) < 0.01)) {
    const [mantissa, exponent] = value.toExponential(2).split("e");
    return `${mantissa} × 10^${Number(exponent)}`;
  }
  return Number(value.toFixed(digits)).toString();
}

function chargeSign(value) {
  if (value > 0) return "+";
  if (value < 0) return "−";
  return "0";
}

function opticalMediumName(mediumKey, n) {
  const selected = opticalMedia.find((medium) => medium.value === mediumKey);
  if (selected && Math.abs(selected.n - n) < 0.001) return selected.name;
  return "Пользовательская среда";
}

function synchronizeNewton(values, solveFor = values.solveFor) {
  const next = { ...values, solveFor };
  if (solveFor === "force") {
    return { ...next, force: newtonForce(next.mass ?? 1, next.acceleration) };
  }
  if (solveFor === "mass") {
    return { ...next, mass: newtonMass(next.force, next.acceleration) };
  }
  return { ...next, acceleration: newtonAcceleration(next.force, next.mass ?? 1) };
}

function addArrowHead(context, x, y, angle, color, size = 8) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
  context.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
  context.closePath();
  context.fill();
}

function drawArrow(context, fromX, fromY, toX, toY, color, width = 2) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();
  addArrowHead(context, toX, toY, Math.atan2(toY - fromY, toX - fromX), color);
}

function cubicPoint(start, control1, control2, end, progress) {
  const remainder = 1 - progress;
  return {
    x: remainder ** 3 * start.x
      + 3 * remainder ** 2 * progress * control1.x
      + 3 * remainder * progress ** 2 * control2.x
      + progress ** 3 * end.x,
    y: remainder ** 3 * start.y
      + 3 * remainder ** 2 * progress * control1.y
      + 3 * remainder * progress ** 2 * control2.y
      + progress ** 3 * end.y,
  };
}

function cubicTangent(start, control1, control2, end, progress) {
  const remainder = 1 - progress;
  return {
    x: 3 * remainder ** 2 * (control1.x - start.x)
      + 6 * remainder * progress * (control2.x - control1.x)
      + 3 * progress ** 2 * (end.x - control2.x),
    y: 3 * remainder ** 2 * (control1.y - start.y)
      + 6 * remainder * progress * (control2.y - control1.y)
      + 3 * progress ** 2 * (end.y - control2.y),
  };
}

function drawMagneticFieldLine(context, points, color, lineWidth, pulseProgress) {
  const [start, control1, control2, end] = points;
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y);
  context.stroke();

  const arrowProgress = 0.55;
  const arrowPoint = cubicPoint(start, control1, control2, end, arrowProgress);
  const arrowTangent = cubicTangent(start, control1, control2, end, arrowProgress);
  addArrowHead(
    context,
    arrowPoint.x,
    arrowPoint.y,
    Math.atan2(arrowTangent.y, arrowTangent.x),
    color,
    7,
  );

  const pulse = cubicPoint(start, control1, control2, end, pulseProgress);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(pulse.x, pulse.y, 2.5 + lineWidth * 0.45, 0, Math.PI * 2);
  context.fill();
}

function drawGrid(context, width) {
  context.strokeStyle = "rgba(255,255,255,.055)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 30) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, HEIGHT);
    context.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 30) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function getResults(type, values, time = 0) {
  if (type === "newton") {
    if (values.solveFor === "mass" && values.mass === null) {
      return ["m не определена: F и a должны иметь одинаковый знак, a ≠ 0", "Связь величин: F = m · a"];
    }
    return ["Связь величин: F = m · a"];
  }
  if (type === "optics") {
    const theta2 = refractedAngle(values.n1, values.n2, values.angle);
    if (theta2 === null) return ["Полное внутреннее отражение", "Преломлённого луча нет"];
    return [`θ₂ = ${formatNumber(theta2, 1)}°`, `n₁ sin θ₁ = n₂ sin θ₂`];
  }
  if (type === "gravity") {
    const force = gravityForce(values.m1 * EARTH_MASS_KG, values.m2 * EARTH_MASS_KG, values.distance * 1e7);
    return [
      `F = ${formatNumber(force)} Н`,
      "2r → F/4 · r/2 → 4F · G — постоянная",
    ];
  }
  if (type === "waves") {
    return [
      `v = λf = ${formatNumber(waveSpeed(values.wavelength, values.frequency))} м/с`,
      `T = ${formatNumber(1 / values.frequency)} с · A = ${formatNumber(values.amplitude, 1)} м`,
    ];
  }
  if (type === "electric") {
    const force = coulombForce(values.q1 * 1e-6, values.q2 * 1e-6, values.distance);
    const interaction = values.q1 === 0 || values.q2 === 0
      ? "Сила взаимодействия равна нулю"
      : values.q1 * values.q2 < 0
        ? "Разноимённые заряды притягиваются"
        : "Одноимённые заряды отталкиваются";
    return [
      `F = k × (q₁ × q₂) / r²; |F| = ${formatNumber(force, 3)} Н`,
      interaction,
    ];
  }
  if (type === "pendulum") {
    const period = pendulumPeriod(values.length, values.gravity);
    return [
      `T ≈ 2π × √(L / g) = ${formatNumber(period, 2)} с`,
      `L = ${formatNumber(values.length, 1)} м · g = ${formatNumber(values.gravity, 2)} м/с² · θ₀ = ${values.initialAngle}°`,
    ];
  }
  if (type === "heat") {
    const sta…5693 tokens truncated…on * Math.PI / 2;
        addArrowHead(context, arrowX, arrowY, tangentAngle, currentColor, 6);

        const movingAngle = rotationDirection * time * (0.7 + values.current * 0.08)
          + index * Math.PI * 0.75;
        context.fillStyle = "#fff";
        context.beginPath();
        context.arc(
          wireX + Math.cos(movingAngle) * radius,
          wireY + Math.sin(movingAngle) * radius,
          2.5,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      context.fillStyle = "#0f172a";
      context.beginPath();
      context.arc(wireX, wireY, 13, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#fff";
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = "#fff";
      context.font = "bold 20px sans-serif";
      context.textAlign = "center";
      context.fillText(counterClockwise ? "•" : "×", wireX, wireY + 7);
      context.font = "11px sans-serif";
      context.fillText(`I = ${values.current} А`, wireX, 119);
    }
  } else if (type === "projectile") {
    const alpha = values.angle * Math.PI / 180;
    const { flightTime, range, maxHeight } = projectileMetrics(values.velocity, values.angle, values.gravity);
    const groundY = 255;
    const scaleX = Math.max(1, (width - 90) / Math.max(range, 1));
    const scaleY = Math.min(4, 175 / Math.max(maxHeight, 1));
    const phaseTime = Math.min(Math.max(time, 0), flightTime);
    const point = (t) => ({
      x: 45 + values.velocity * Math.cos(alpha) * t * scaleX,
      y: groundY - (values.velocity * Math.sin(alpha) * t - values.gravity * t * t / 2) * scaleY,
    });
    context.strokeStyle = "rgba(255,255,255,.45)";
    context.setLineDash([7, 7]);
    context.beginPath();
    for (let step = 0; step <= 80; step += 1) {
      const p = point(flightTime * step / 80);
      step === 0 ? context.moveTo(p.x, p.y) : context.lineTo(p.x, p.y);
    }
    context.stroke();
    context.setLineDash([]);
    const current = point(phaseTime);
    context.fillStyle = color;
    context.beginPath();
    context.arc(current.x, current.y, 12, 0, Math.PI * 2);
    context.fill();

    const currentX = values.velocity * Math.cos(alpha) * phaseTime;
    const currentY = Math.max(
      0,
      values.velocity * Math.sin(alpha) * phaseTime - values.gravity * phaseTime * phaseTime / 2,
    );
    context.fillStyle = "#fff";
    context.font = "13px sans-serif";
    context.textAlign = "left";
    context.fillText(
      `t = ${formatNumber(phaseTime)} с · x = ${formatNumber(currentX)} м · y = ${formatNumber(currentY)} м`,
      24,
      28,
    );

    context.strokeStyle = "#fff";
    context.beginPath();
    context.moveTo(20, groundY + 1);
    context.lineTo(width - 20, groundY + 1);
    context.stroke();
  } else if (type === "hooke") {
    const { angularFrequency: omega } = hookeMetrics(values.stiffness, values.mass, values.extension);
    const displacement = values.extension * Math.cos(omega * time);
    const anchorX = 55;
    const equilibriumX = width / 2;
    const blockX = equilibriumX + displacement * Math.min(260, width * 0.32);
    const centerY = 150;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(anchorX, centerY);
    for (let coil = 1; coil <= 16; coil += 1) {
      context.lineTo(anchorX + ((blockX - anchorX - 30) * coil) / 16, centerY + (coil % 2 ? 17 : -17));
    }
    context.lineTo(blockX - 30, centerY);
    context.stroke();
    context.fillStyle = color;
    context.fillRect(blockX - 30, centerY - 30, 60, 60);
    context.strokeStyle = "rgba(255,255,255,.5)";
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(equilibriumX, 70);
    context.lineTo(equilibriumX, 235);
    context.stroke();
    context.setLineDash([]);

    const force = -values.stiffness * displacement;
    const arrowScale = Math.min(90, Math.abs(force) * 4);
    if (Math.abs(force) > 0.01) {
      const direction = Math.sign(force);
      drawArrow(
        context,
        blockX,
        centerY - 48,
        blockX + direction * arrowScale,
        centerY - 48,
        "#ffffff",
        2.5,
      );
    }

    context.fillStyle = "#ffffff";
    context.font = "13px sans-serif";
    context.textAlign = "left";
    context.fillText(`x(t) = ${formatNumber(displacement, 3)} м`, 20, 28);
    context.fillText(`F(t) = ${formatNumber(force, 2)} Н`, 20, 48);
    context.fillText("Пунктир — положение равновесия", 20, 275);
  } else if (type === "momentum") {
    const elastic = values.collision === "elastic";
    const collision = collisionResult(values.m1, values.v1, values.m2, values.v2, values.collision);
    const out1 = collision.v1;
    const out2 = collision.v2;
    const scale = Math.min(24, width / 30);
    const start1 = width * 0.25;
    const start2 = width * 0.75;
    const radius1 = 18 + values.m1 * 2;
    const radius2 = 18 + values.m2 * 2;
    const relativeSpeed = values.v1 - values.v2;
    const canCollide = relativeSpeed > 0;
    const collisionTime = canCollide
      ? Math.max(0.35, (start2 - start1 - radius1 - radius2) / (relativeSpeed * scale))
      : Number.POSITIVE_INFINITY;
    const animationDuration = canCollide ? collisionTime + 3 : 3;
    const animationTime = canCollide ? Math.min(time, animationDuration) : time;
    const beforeCollision = animationTime <= collisionTime;

    let firstX;
    let secondX;
    if (beforeCollision) {
      firstX = start1 + values.v1 * animationTime * scale;
      secondX = start2 + values.v2 * animationTime * scale;
    } else {
      const contact1 = start1 + values.v1 * collisionTime * scale;
      const contact2 = start2 + values.v2 * collisionTime * scale;
      const elapsedAfter = animationTime - collisionTime;
      if (elastic) {
        firstX = contact1 + out1 * elapsedAfter * scale;
        secondX = contact2 + out2 * elapsedAfter * scale;
      } else {
        const joinedX = (contact1 + contact2) / 2;
        firstX = joinedX + out1 * elapsedAfter * scale - radius2 * 0.45;
        secondX = joinedX + out1 * elapsedAfter * scale + radius1 * 0.45;
      }
    }

    firstX = Math.max(35, Math.min(width - 35, firstX));
    secondX = Math.max(35, Math.min(width - 35, secondX));

    context.strokeStyle = "rgba(255,255,255,.25)";
    context.beginPath();
    context.moveTo(20, 205);
    context.lineTo(width - 20, 205);
    context.stroke();

    context.fillStyle = "#3b82f6";
    context.beginPath();
    context.arc(firstX, 155, radius1, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ec4899";
    context.beginPath();
    context.arc(secondX, 155, radius2, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#fff";
    context.font = "13px sans-serif";
    context.textAlign = "center";
    context.fillText("m₁", firstX, 160);
    context.fillText("m₂", secondX, 160);

    const currentV1 = beforeCollision ? values.v1 : out1;
    const currentV2 = beforeCollision ? values.v2 : out2;
    if (Math.abs(currentV1) > 0.01) {
      drawArrow(context, firstX, 110, firstX + Math.sign(currentV1) * Math.min(70, Math.abs(currentV1) * 10), 110, "#93c5fd", 2);
    }
    if (Math.abs(currentV2) > 0.01) {
      drawArrow(context, secondX, 110, secondX + Math.sign(currentV2) * Math.min(70, Math.abs(currentV2) * 10), 110, "#f9a8d4", 2);
    }

    context.textAlign = "left";
    context.fillText(beforeCollision ? "До столкновения" : "После столкновения", 20, 28);
    context.fillText(
      canCollide
        ? (elastic ? "Упругое: тела разлетаются отдельно" : "Неупругое: тела движутся вместе")
        : "При выбранных скоростях тела не сближаются",
      20,
      50,
    );
    } else if (type === "ohm") {
    const current = ohmCurrent(values.voltage, values.resistance);
    const left = 85;
    const right = width - 85;
    const top = 72;
    const bottom = 220;
    context.strokeStyle = color;
    context.strokeRect(left, top, right - left, bottom - top);
    // Резистор в верхней части цепи.
    context.fillStyle = "#080d24";
    context.fillRect(width / 2 - 58, top - 15, 116, 30);
    context.strokeStyle = "#ef4444";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(width / 2 - 48, top);
    for (let segment = 0; segment < 10; segment += 1) {
      context.lineTo(width / 2 - 43 + segment * 10, top + (segment % 2 ? 10 : -10));
    }
    context.stroke();

    // Источник напряжения: длинная и короткая пластины.
    const sourceX = left;
    const sourceY = (top + bottom) / 2;
    context.fillStyle = "#080d24";
    context.fillRect(sourceX - 18, sourceY - 34, 36, 68);
    context.strokeStyle = "#facc15";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(sourceX - 10, sourceY - 16);
    context.lineTo(sourceX + 10, sourceY - 16);
    context.moveTo(sourceX - 6, sourceY + 13);
    context.lineTo(sourceX + 6, sourceY + 13);
    context.stroke();
    context.fillStyle = "#facc15";
    context.font = "bold 14px sans-serif";
    context.textAlign = "center";
    context.fillText("+", sourceX + 24, sourceY - 12);
    context.fillText("−", sourceX + 24, sourceY + 18);
    const particleCount = 16;
    const perimeter = 2 * ((right - left) + (bottom - top));
    const direction = current >= 0 ? 1 : -1;
    const speed = current === 0 ? 0 : Math.min(90, 18 + Math.abs(current) * 18);
    for (let index = 0; index < particleCount; index += 1) {
      let distance = (index / particleCount * perimeter + direction * time * speed) % perimeter;
      if (distance < 0) distance += perimeter;
      let x;
      let y;
      if (distance < right - left) {
        x = left + distance;
        y = top;
      } else if (distance < right - left + bottom - top) {
        x = right;
        y = top + distance - (right - left);
      } else if (distance < 2 * (right - left) + bottom - top) {
        x = right - (distance - (right - left + bottom - top));
        y = bottom;
      } else {
        x = left;
        y = bottom - (distance - (2 * (right - left) + bottom - top));
      }
      context.fillStyle = "#f8fafc";
      context.beginPath();
      context.arc(x, y, 3.5, 0, Math.PI * 2);
      context.fill();
    }
    // Направление условного тока совпадает со знаком I.
    context.fillStyle = "#fff";
    context.font = "15px sans-serif";
    context.textAlign = "center";
    context.fillText(`U = ${values.voltage} В`, width / 2, 270);
    context.fillText(`R = ${values.resistance} Ом`, width / 2, 155);
    context.fillText(`I = ${formatNumber(current)} А`, width / 2, 42);

    const arrowY = bottom + 24;
    const arrowStart = width / 2 - 55 * direction;
    const arrowEnd = width / 2 + 55 * direction;
    if (Math.abs(current) > 1e-9) {
      drawArrow(context, arrowStart, arrowY, arrowEnd, arrowY, "#22c55e", 3);
      context.fillStyle = "#22c55e";
      context.fillText("направление условного тока", width / 2, arrowY + 22);
    } else {
      context.fillStyle = "#94a3b8";
      context.fillText("ток отсутствует", width / 2, arrowY + 8);
    }
  }
  context.shadowBlur = 0;
}

export default function PhysicsCanvas({ type, color, onNewtonSolveForChange, onOpticsChange, locale = "ru" }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(false);
  const timeRef = useRef(0);
  const previousFrameRef = useRef(null);
  const newtonMotionRef = useRef({ position: 50, velocity: 0 });
  const config = simulationConfig[type] || simulationConfig.newton;
  const [values, setValues] = useState(config.initial);
  const [paused, setPaused] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const lastDisplayTimeRef = useRef(0);

  useEffect(() => {
    const nextConfig = simulationConfig[type] || simulationConfig.newton;
    setValues(nextConfig.initial);
    timeRef.current = 0;
    newtonMotionRef.current = { position: 50, velocity: 0 };
    previousFrameRef.current = null;
    pausedRef.current = false;
    setPaused(false);
    setDisplayTime(0);
    lastDisplayTimeRef.current = 0;
  }, [type]);

  useEffect(() => {
    pausedRef.current = paused;
    previousFrameRef.current = null;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const originalFillText = context.fillText.bind(context);
    context.fillText = (value, ...args) => originalFillText(translatePhysicsText(locale, value), ...args);
    let frame;
    let width = canvas.clientWidth;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = Math.max(300, canvas.clientWidth);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(HEIGHT * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = (timestamp) => {
      const previous = previousFrameRef.current ?? timestamp;
      const delta = Math.min((timestamp - previous) / 1000, 0.05);
      previousFrameRef.current = timestamp;
      if (!pausedRef.current) {
        timeRef.current += delta;

        if (type === "projectile") {
          const { flightTime } = projectileMetrics(values.velocity, values.angle, values.gravity);
          if (timeRef.current >= flightTime) {
            timeRef.current = flightTime;
            pausedRef.current = true;
            setPaused(true);
          }
        }

        if (type === "newton" && values.mass !== null) {
          const motion = newtonMotionRef.current;
          const massWidth = 48 + values.mass * 2.4;
          const minPosition = 50;
          const maxPosition = Math.max(minPosition, width - massWidth - 50);
          newtonMotionRef.current = advanceNewtonMotion(
            motion.position,
            motion.velocity,
            values.acceleration,
            delta,
            minPosition,
            maxPosition,
          );
        }
      }
      drawSimulation(context, width, type, color, values, timeRef.current, newtonMotionRef.current);
      if (type === "hooke" && Math.abs(timeRef.current - lastDisplayTimeRef.current) >= 0.08) {
        lastDisplayTimeRef.current = timeRef.current;
        setDisplayTime(timeRef.current);
      }
      frame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [type, color, values, locale]);

  const results = useMemo(
    () => getResults(type, values, type === "hooke" ? displayTime : 0),
    [type, values, displayTime],
  );

  const reset = () => {
    setValues({ ...config.initial });
    if (type === "newton") onNewtonSolveForChange?.(config.initial.solveFor);
    if (type === "optics") onOpticsChange?.(config.initial);
    timeRef.current = 0;
    newtonMotionRef.current = { position: 50, velocity: 0 };
    setPaused(false);
    setDisplayTime(0);
    lastDisplayTimeRef.current = 0;
  };

  const updateControl = (control, value) => {
    if (type === "newton" && control.key === "solveFor") {
      onNewtonSolveForChange?.(value);
    }
    if (type === "optics") {
      const next = { ...values, [control.key]: value };
      if (control.key === "medium1") {
        next.n1 = opticalMedia.find((medium) => medium.value === value)?.n ?? next.n1;
      }
      if (control.key === "medium2") {
        next.n2 = opticalMedia.find((medium) => medium.value === value)?.n ?? next.n2;
      }
      setValues(next);
      onOpticsChange?.(next);
      timeRef.current = 0;
      return;
    }
    if (type === "heat" && (control.key === "material1" || control.key === "material2")) {
      const selected = thermalMaterials.find((material) => material.value === value);
      const next = {
        ...values,
        [control.key]: value,
        [control.key === "material1" ? "specificHeat1" : "specificHeat2"]: selected?.c,
      };
      setValues(next);
      timeRef.current = 0;
      return;
    }
    setValues((current) => {
      const next = { ...current, [control.key]: value };
      if (type !== "newton") return next;
      return synchronizeNewton(next, control.key === "solveFor" ? value : next.solveFor);
    });
    if (type !== "newton") {
      timeRef.current = 0;
      if (type === "hooke") {
        setDisplayTime(0);
        lastDisplayTimeRef.current = 0;
      }
      if (type === "projectile") {
        pausedRef.current = false;
        setPaused(false);
      }
    }
  };

  return (
    <div className="physics-canvas">
      <canvas ref={canvasRef} aria-label={locale === "en" ? `Interactive simulation: ${type}` : `Интерактивная симуляция: ${type}`} />
      <div className="simulation-readout" aria-live="polite">
        {results.map((result) => <span key={result}>{translatePhysicsText(locale, result)}</span>)}
      </div>
      <div className={type === "newton" ? "canvas-controls newton-controls" : "canvas-controls"}>
        <div className="canvas-control-grid">
          {config.controls.map((control) => (
            <label key={control.key}>
              <span>
                {translatePhysicsText(locale, control.label)}
                {control.type !== "select" && <b>{values[control.key]}{control.unit ? ` ${translatePhysicsText(locale, control.unit)}` : ""}</b>}
              </span>
              {control.type === "select" ? (
                <select
                  value={values[control.key]}
                  onChange={(event) => {
                    const option = control.options.find((item) => String(item.value) === event.target.value);
                    updateControl(control, option?.value ?? event.target.value);
                  }}
                >
                  {control.options.map((option) => <option key={String(option.value)} value={option.value}>{translatePhysicsText(locale, option.label)}</option>)}
                </select>
              ) : (
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={values[control.key] ?? control.min}
                  disabled={type === "newton" && values.solveFor === control.key}
                  onChange={(event) => {
                    updateControl(control, Number(event.target.value));
                  }}
                />
              )}
            </label>
          ))}
        </div>
        <div className="canvas-actions">
          {type === "gravity" && (
            <>
              <button
                className="ghost-button"
                disabled={values.distance <= config.controls[2].min}
                onClick={() => updateControl(config.controls[2], Math.max(config.controls[2].min, values.distance / 2))}
              >
                r / 2 → 4F
              </button>
              <button
                className="ghost-button"
                disabled={values.distance >= config.controls[2].max}
                onClick={() => updateControl(config.controls[2], Math.min(config.controls[2].max, values.distance * 2))}
              >
                2r → F / 4
              </button>
            </>
          )}
          <button className="secondary-button" onClick={() => setPaused((current) => !current)}>
            {paused ? (locale === "en" ? "▶ Resume" : "▶ Продолжить") : (locale === "en" ? "⏸ Pause" : "⏸ Пауза")}
          </button>
          <button className="ghost-button" onClick={reset}>↻ {locale === "en" ? "Reset" : "Сбросить"}</button>
        </div>
      </div>
    </div>
  );
}
