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
      { key: "gravity", label: "Ускорение g", min: 1.62, max: 15, step: 0.01, unit: "м/с²" },
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
      { key: "gravity", label: "Ускорение g", min: 1.62, max: 15, step: 0.01, unit: "м/с²" },
    ],
    initial: { velocity: 25, angle: 45, gravity: 9.81 },
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
      { key: "v1", label: "Скорость v₁", min: 1, max: 8, step: 0.5, unit: "м/с" },
      { key: "m2", label: "Масса m₂", min: 1, max: 8, step: 1, unit: "кг" },
      { key: "v2", label: "Скорость v₂", min: -8, max: -1, step: 0.5, unit: "м/с" },
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

function getResults(type, values) {
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
    const state = heatTransferState({ ...values, time: 0 });
    return [
      `Tравн = (m₁c₁T₁ + m₂c₂T₂) / (m₁c₁ + m₂c₂) = ${formatNumber(state.equilibrium, 1)} °C`,
      "Tравн — общая температура после теплообмена",
      "m₁, m₂ — массы тел",
      "c₁, c₂ — их удельные теплоёмкости",
      "T₁, T₂ — начальные температуры",
    ];
  }
  if (type === "magnetism") {
    const conductorResult = values.conductor === "out"
      ? "Ток к наблюдателю (•): поле против часовой стрелки"
      : values.conductor === "in"
        ? "Ток от наблюдателя (×): поле по часовой стрелке"
        : "Проводник с током отключён";
    return [
      `Поле магнита: N → S · B = ${formatNumber(values.strength, 1)} Тл`,
      conductorResult,
    ];
  }
  if (type === "projectile") {
    const metrics = projectileMetrics(values.velocity, values.angle, values.gravity);
    return [`Время: ${formatNumber(metrics.flightTime)} с · Высота: ${formatNumber(metrics.maxHeight)} м`, `Дальность: ${formatNumber(metrics.range)} м`];
  }
  if (type === "hooke") {
    const metrics = hookeMetrics(values.stiffness, values.mass, values.extension);
    return [`F = −kx = ${formatNumber(metrics.force)} Н`, `T = ${formatNumber(metrics.period)} с`];
  }
  if (type === "momentum") {
    const result = collisionResult(values.m1, values.v1, values.m2, values.v2, values.collision);
    if (values.collision === "inelastic") {
      return [`pдо = pпосле = ${formatNumber(result.momentum)} кг·м/с`, `Общая скорость: ${formatNumber(result.v1)} м/с`];
    }
    return [`pдо = pпосле = ${formatNumber(result.momentum)} кг·м/с`, `После удара: v₁ = ${formatNumber(result.v1)}, v₂ = ${formatNumber(result.v2)} м/с`];
  }
  if (type === "ohm") {
    const current = ohmCurrent(values.voltage, values.resistance);
    const direction = values.voltage === 0
      ? "При U = 0 ток отсутствует"
      : values.voltage < 0
        ? "Полярность и направление тока обратные"
        : "Условный ток направлен от «+» к «−»";
    return [`I = U / R = ${formatNumber(current)} А`, direction];
  }
  return [];
}

function drawSimulation(context, width, type, color, values, time, newtonMotion) {
  context.clearRect(0, 0, width, HEIGHT);
  context.fillStyle = "#080d24";
  context.fillRect(0, 0, width, HEIGHT);
  drawGrid(context, width);
  context.shadowBlur = 18;
  context.shadowColor = color;
  context.lineWidth = 3;
  context.strokeStyle = color;
  context.fillStyle = color;

  if (type === "newton") {
    const displayMass = values.mass ?? 1;
    const massWidth = 48 + displayMass * 2.4;
    const x = newtonMotion?.position ?? 50;
    context.fillRect(x, 175, massWidth, 55);
    context.fillStyle = "#fff";
    context.font = "14px sans-serif";
    context.textAlign = "center";
    context.fillText(`${formatNumber(values.mass)} кг`, x + massWidth / 2, 208);
    const arrowLength = Math.min(120, Math.abs(values.force) * 4);
    if (values.force !== 0) {
      const start = values.force > 0 ? x + massWidth : x;
      drawArrow(context, start, 160, start + Math.sign(values.force) * arrowLength, 160, "#f8fafc", 3);
      context.fillText(`F = ${values.force} Н`, start + Math.sign(values.force) * arrowLength / 2, 143);
    }
    context.strokeStyle = "rgba(255,255,255,.45)";
    context.beginPath();
    context.moveTo(25, 232);
    context.lineTo(width - 25, 232);
    context.stroke();
    context.fillStyle = "#fff";
    context.textAlign = "left";
    context.fillText(`a = ${formatNumber(values.acceleration)} м/с²`, 25, 265);
    context.textAlign = "right";
    context.fillText(`v = ${formatNumber(newtonMotion?.velocity ?? 0)} м/с`, width - 25, 265);
  } else if (type === "optics") {
    const boundaryY = 155;
    const centerX = width / 2;
    const theta1 = values.angle * Math.PI / 180;
    const sinTheta2 = values.n1 * Math.sin(theta1) / values.n2;
    context.fillStyle = "rgba(59,130,246,.12)";
    context.fillRect(0, boundaryY, width, HEIGHT - boundaryY);
    context.strokeStyle = "rgba(255,255,255,.45)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, boundaryY);
    context.lineTo(width, boundaryY);
    context.stroke();
    context.setLineDash([6, 6]);
    context.beginPath();
    context.moveTo(centerX, 30);
    context.lineTo(centerX, 275);
    context.stroke();
    context.setLineDash([]);
    const rayLength = 125;
    const startX = centerX - Math.sin(theta1) * rayLength;
    const startY = boundaryY - Math.cos(theta1) * rayLength;
    drawArrow(context, startX, startY, centerX, boundaryY, "#ffffff", 3);
    const reflectX = centerX + Math.sin(theta1) * rayLength;
    const reflectY = boundaryY - Math.cos(theta1) * rayLength;
    drawArrow(context, centerX, boundaryY, reflectX, reflectY, "rgba(255,255,255,.5)", 2);
    if (Math.abs(sinTheta2) <= 1) {
      const theta2 = Math.asin(sinTheta2);
      drawArrow(context, centerX, boundaryY, centerX + Math.sin(theta2) * rayLength, boundaryY + Math.cos(theta2) * rayLength, color, 3);
    }
    context.fillStyle = "#fff";
    context.font = "14px sans-serif";
    context.textAlign = "left";
    context.fillText(opticalMediumName(values.medium1, values.n1), 18, 32);
    context.fillText(opticalMediumName(values.medium2, values.n2), 18, 185);
  } else if (type === "gravity") {
    const centerX = width / 2;
    const centerY = 145;
    const orbitRadius = 62 + (values.distance - 2) / 18 * Math.min(115, width / 4);
    const relativeSpeed = Math.sqrt(values.m1) / Math.pow(values.distance / 8, 1.5);
    const orbitAngle = time * 0.55 * relativeSpeed;
    const satelliteX = centerX + Math.cos(orbitAngle) * orbitRadius;
    const satelliteY = centerY + Math.sin(orbitAngle) * orbitRadius * 0.38;
    const planetRadius = 34;
    const satelliteRadius = 13;
    const force = gravityForce(
      values.m1 * EARTH_MASS_KG,
      values.m2 * EARTH_MASS_KG,
      values.distance * 1e7,
    );
    const referenceForce = gravityForce(EARTH_MASS_KG, EARTH_MASS_KG, 8e7);
    const forceArrowLength = 24 + 82 * Math.min(1, Math.sqrt(force / referenceForce) / 2);
    const directionX = centerX - satelliteX;
    const directionY = centerY - satelliteY;
    const directionLength = Math.hypot(directionX, directionY) || 1;
    const arrowStartX = satelliteX + directionX / directionLength * (satelliteRadius + 4);
    const arrowStartY = satelliteY + directionY / directionLength * (satelliteRadius + 4);
    const arrowEndX = arrowStartX + directionX / directionLength * forceArrowLength;
    const arrowEndY = arrowStartY + directionY / directionLength * forceArrowLength;

    context.strokeStyle = "rgba(255,255,255,.25)";
    context.lineWidth = 1.5;
    context.setLineDash([6, 6]);
    context.beginPath();
    context.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.38, 0, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);

    const glow = context.createRadialGradient(centerX - 10, centerY - 12, 2, centerX, centerY, planetRadius);
    glow.addColorStop(0, "#67e8f9");
    glow.addColorStop(1, "#0891b2");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#06b6d4";
    context.beginPath();
    context.arc(satelliteX, satelliteY, satelliteRadius, 0, Math.PI * 2);
    context.fill();

    drawArrow(context, arrowStartX, arrowStartY, arrowEndX, arrowEndY, "#f8fafc", 3);
    context.fillStyle = "#fff";
    context.font = "14px sans-serif";
    context.textAlign = "center";
    context.fillText("Планета m₁", centerX, centerY + 5);
    context.fillText("Спутник m₂", satelliteX, satelliteY - 21);
    context.fillText("F", (arrowStartX + arrowEndX) / 2, (arrowStartY + arrowEndY) / 2 - 8);
    context.fillText(`r = ${values.distance} × 10⁷ м`, centerX, 267);
  } else if (type === "waves") {
    const centerY = 150;
    const pixelsPerWave = 35 + values.wavelength * 45;
    const amplitudePixels = values.amplitude * 50;

    context.shadowBlur = 0;
    context.strokeStyle = "rgba(255,255,255,.25)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, centerY);
    context.lineTo(width, centerY);
    context.stroke();

    context.shadowBlur = 18;
    context.shadowColor = color;
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const y = centerY + Math.sin((x / pixelsPerWave) * Math.PI * 2 - time * values.frequency * Math.PI * 2) * amplitudePixels;
      x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
    }
    context.stroke();

    context.shadowBlur = 0;
    context.fillStyle = "#fff";
    context.font = "14px sans-serif";
    context.textAlign = "left";
    context.fillText(
      `f = ${formatNumber(values.frequency, 1)} Гц · λ = ${formatNumber(values.wavelength, 1)} м · A = ${formatNumber(values.amplitude, 1)} м`,
      18,
      28,
    );
  } else if (type === "electric") {
    const maximumSpread = Math.max(100, Math.min(320, width - 150));
    const spread = 100 + (values.distance - 1) / 7 * (maximumSpread - 100);
    const left = width / 2 - spread / 2;
    const right = width / 2 + spread / 2;
    const centerY = 142;
    const force = coulombForce(values.q1 * 1e-6, values.q2 * 1e-6, values.distance);
    const maximumForce = coulombForce(5e-6, 5e-6, 1);
    const forceArrowLength = force === 0
      ? 0
      : 26 + 62 * Math.min(1, Math.sqrt(force / maximumForce));

    const drawFieldAroundCharge = (x, value, radius) => {
      if (value === 0) return;
      const lineCount = 4 + Math.abs(value);
      const fieldLength = 25 + Math.abs(value) * 2;
      for (let index = 0; index < lineCount; index += 1) {
        const angle = index / lineCount * Math.PI * 2;
        const innerX = x + Math.cos(angle) * (radius + 5);
        const innerY = centerY + Math.sin(angle) * (radius + 5);
        const outerX = x + Math.cos(angle) * (radius + fieldLength);
        const outerY = centerY + Math.sin(angle) * (radius + fieldLength);
        if (value > 0) {
          drawArrow(context, innerX, innerY, outerX, outerY, "rgba(244,114,182,.72)", 1.5);
        } else {
          drawArrow(context, outerX, outerY, innerX, innerY, "rgba(56,189,248,.72)", 1.5);
        }
      }
    };

    const radius1 = 23 + Math.abs(values.q1) * 1.8;
    const radius2 = 23 + Math.abs(values.q2) * 1.8;
    drawFieldAroundCharge(left, values.q1, radius1);
    drawFieldAroundCharge(right, values.q2, radius2);

    if (forceArrowLength > 0) {
      const attract = values.q1 * values.q2 < 0;
      const leftDirection = attract ? 1 : -1;
      const rightDirection = -leftDirection;
      const leftForceEnd = Math.max(15, Math.min(width - 15, left + leftDirection * forceArrowLength));
      const rightForceEnd = Math.max(15, Math.min(width - 15, right + rightDirection * forceArrowLength));
      drawArrow(context, left, 67, leftForceEnd, 67, "#fff", 3);
      drawArrow(context, right, 67, rightForceEnd, 67, "#fff", 3);
      context.fillStyle = "#fff";
      context.font = "bold 13px sans-serif";
      context.textAlign = "center";
      context.fillText("F", (left + leftForceEnd) / 2, 55);
      context.fillText("F", (right + rightForceEnd) / 2, 55);
    }

    [[left, values.q1, radius1], [right, values.q2, radius2]].forEach(([x, value, radius]) => {
      context.fillStyle = value > 0 ? "#ec4899" : value < 0 ? "#0284c7" : "#64748b";
      context.beginPath();
      context.arc(x, centerY, radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff";
      context.font = "bold 24px sans-serif";
      context.textAlign = "center";
      context.fillText(chargeSign(value), x, centerY + 8);
    });

    context.fillStyle = "#fff";
    context.font = "13px sans-serif";
    context.textAlign = "center";
    context.fillText(`q₁ = ${values.q1} мкКл`, left, 196);
    context.fillText(`q₂ = ${values.q2} мкКл`, right, 196);

    context.strokeStyle = "rgba(255,255,255,.4)";
    context.lineWidth = 1.5;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(left, 216);
    context.lineTo(right, 216);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#fff";
    context.fillText(`r = ${formatNumber(values.distance, 1)} м`, width / 2, 238);
    context.font = "12px sans-serif";
    context.fillStyle = "rgba(255,255,255,.78)";
    context.fillText("Направление поля E: от «+» к «−»", width / 2, 262);
    context.fillText("Сила на «+» заряд — по E", width / 2, 279);
    context.fillText("Сила на электрон — против E", width / 2, 295);
  } else if (type === "pendulum") {
    const period = pendulumPeriod(values.length, values.gravity);
    const angleDegrees = pendulumAngle(
      values.initialAngle,
      values.length,
      values.gravity,
      time,
    );
    const angle = angleDegrees * Math.PI / 180;
    const anchorX = width / 2;
    const anchorY = 35;
    const visualLength = 80 + values.length * 52;
    const x = anchorX + Math.sin(angle) * visualLength;
    const y = anchorY + Math.cos(angle) * visualLength;

    context.shadowBlur = 0;
    context.strokeStyle = "rgba(255,255,255,.3)";
    context.lineWidth = 1.5;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(anchorX, anchorY);
    context.lineTo(anchorX, anchorY + visualLength);
    context.stroke();
    context.setLineDash([]);

    context.shadowBlur = 18;
    context.shadowColor = color;
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(anchorX, anchorY);
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.arc(x, y, 22, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "13px sans-serif";
    context.textAlign = "left";
    context.fillText(`L = ${formatNumber(values.length, 1)} м`, 18, 24);
    context.fillText(`θ₀ = ${values.initialAngle}°`, 18, 286);
    context.textAlign = "right";
    context.fillText(`g = ${formatNumber(values.gravity, 2)} м/с²`, width - 18, 24);
    context.fillText(`T ≈ ${formatNumber(period, 2)} с`, width - 18, 286);
  } else if (type === "heat") {
    const state = heatTransferState({ ...values, time });
    const leftX = width * 0.25;
    const rightX = width * 0.75;
    const bodyWidth = Math.min(165, Math.max(95, width * 0.24));
    const bodyHeight = 132;
    const bodyTop = 92;
    const temperatureColor = (temperature) => {
      const normalized = Math.max(0, Math.min(100, temperature));
      return `hsl(${220 - normalized * 2.2} 85% 55%)`;
    };
    const drawBody = (x, label, temperature, mass, specificHeat) => {
      context.fillStyle = temperatureColor(temperature);
      context.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
      context.fillStyle = "#fff";
      context.textAlign = "center";
      context.font = "bold 13px sans-serif";
      context.fillText(label, x, bodyTop + 24);
      context.font = "bold 20px sans-serif";
      context.fillText(`${formatNumber(temperature, 1)} °C`, x, bodyTop + 58);
      context.font = "12px sans-serif";
      context.fillText(`m = ${formatNumber(mass, 1)} кг`, x, bodyTop + 88);
      context.fillText(`c = ${specificHeat}`, x, bodyTop + 108);
      context.font = "10px sans-serif";
      context.fillText("Дж/(кг·°C)", x, bodyTop + 124);
    };

    context.shadowBlur = 0;
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.font = "bold 13px sans-serif";
    if (state.equilibriumReached) {
      context.fillText("Тепловое равновесие: T₁ = T₂", width / 2, 38);
    } else {
      const fromX = state.direction > 0 ? leftX + bodyWidth / 2 + 10 : rightX - bodyWidth / 2 - 10;
      const toX = state.direction > 0 ? rightX - bodyWidth / 2 - 10 : leftX + bodyWidth / 2 + 10;
      context.fillText(
        state.direction > 0 ? "Тепло: тело 1 → тело 2" : "Тепло: тело 2 → тело 1",
        width / 2,
        38,
      );
      drawArrow(context, fromX, 68, toX, 68, "#fff", 3);
    }

    drawBody(leftX, "Тело 1", state.temperature1, values.mass1, values.specificHeat1);
    drawBody(rightX, "Тело 2", state.temperature2, values.mass2, values.specificHeat2);
    context.fillStyle = "rgba(255,255,255,.85)";
    context.font = width < 560 ? "11px sans-serif" : "12px sans-serif";
    if (width < 560) {
      context.textAlign = "center";
      context.fillText(`t = ${formatNumber(time, 1)} с · K = ${values.conductance} Вт/°C`, width / 2, 253);
      context.fillText(`Мощность теплопередачи: ${formatNumber(state.heatFlowPower / 1000, 2)} кВт`, width / 2, 272);
    } else {
      context.textAlign = "left";
      context.fillText(`t = ${formatNumber(time, 1)} с`, 18, 270);
      context.textAlign = "center";
      context.fillText(`K = ${values.conductance} Вт/°C`, width / 2, 270);
      context.textAlign = "right";
      context.fillText(`Мощность: ${formatNumber(state.heatFlowPower / 1000, 2)} кВт`, width - 18, 270);
    }
    context.textAlign = "center";
    context.fillText(`Tравн = ${formatNumber(state.equilibrium, 1)} °C`, width / 2, 291);
  } else if (type === "magnetism") {
    const magnetHalfWidth = Math.min(90, width * 0.2);
    const maximumFieldSpread = Math.min(88, width * 0.18);
    const centerX = width / 2;
    const centerY = 162;
    const magnetHeight = 56;
    const poleFlow = values.direction;
    const northX = centerX - poleFlow * magnetHalfWidth;
    const southX = centerX + poleFlow * magnetHalfWidth;
    const lineCount = 2 + Math.round(values.strength * 1.5);
    const fieldOpacity = 0.42 + values.strength * 0.22;
    const fieldColor = `rgba(168, 85, 247, ${Math.min(0.95, fieldOpacity)})`;
    const fieldWidth = 1.1 + values.strength * 0.75;

    context.shadowBlur = 0;
    for (let index = 0; index < lineCount; index += 1) {
      const offset = 34 + index * (62 / Math.max(1, lineCount - 1));
      [-1, 1].forEach((verticalDirection, sideIndex) => {
        const start = { x: northX, y: centerY };
        const end = { x: southX, y: centerY };
        const spread = Math.min(maximumFieldSpread, 44 + offset * 0.48);
        const control1 = {
          x: northX - poleFlow * spread,
          y: centerY + verticalDirection * offset,
        };
        const control2 = {
          x: southX + poleFlow * spread,
          y: centerY + verticalDirection * offset,
        };
        const pulseProgress = (time * (0.08 + values.strength * 0.04)
          + (index * 2 + sideIndex) / (lineCount * 2)) % 1;
        drawMagneticFieldLine(
          context,
          [start, control1, control2, end],
          fieldColor,
          fieldWidth,
          pulseProgress,
        );
      });
    }

    const leftPole = poleFlow === 1 ? "N" : "S";
    const rightPole = poleFlow === 1 ? "S" : "N";
    context.shadowBlur = 15;
    context.shadowColor = color;
    context.fillStyle = poleFlow === 1 ? "#ef4444" : "#3b82f6";
    context.fillRect(centerX - magnetHalfWidth, centerY - magnetHeight / 2, magnetHalfWidth, magnetHeight);
    context.fillStyle = poleFlow === 1 ? "#3b82f6" : "#ef4444";
    context.fillRect(centerX, centerY - magnetHeight / 2, magnetHalfWidth, magnetHeight);
    context.shadowBlur = 0;
    context.strokeStyle = "rgba(255,255,255,.75)";
    context.lineWidth = 1.5;
    context.strokeRect(centerX - magnetHalfWidth, centerY - magnetHeight / 2, magnetHalfWidth * 2, magnetHeight);
    context.fillStyle = "#fff";
    context.font = "bold 22px sans-serif";
    context.textAlign = "center";
    context.fillText(leftPole, centerX - magnetHalfWidth / 2, centerY + 8);
    context.fillText(rightPole, centerX + magnetHalfWidth / 2, centerY + 8);
    context.font = "12px sans-serif";
    context.fillText("Линии поля вне магнита направлены от N к S", width / 2, 286);

    if (values.conductor !== "none") {
      const wireX = Math.max(68, width - 76);
      const wireY = 57;
      const counterClockwise = values.conductor === "out";
      const rotationDirection = counterClockwise ? -1 : 1;
      const currentScale = 0.75 + values.current / 20;
      const currentColor = "#22d3ee";
      const circleCount = 2 + Math.round(values.current / 4);

      context.strokeStyle = currentColor;
      context.lineWidth = 1.2 + values.current / 12;
      for (let index = 0; index < circleCount; index += 1) {
        const radius = (14 + index * 10) * currentScale;
        context.beginPath();
        context.arc(wireX, wireY, radius, 0, Math.PI * 2);
        context.stroke();

        const arrowAngle = -Math.PI / 2;
        const arrowX = wireX + Math.cos(arrowAngle) * radius;
        const arrowY = wireY + Math.sin(arrowAngle) * radius;
        const tangentAngle = arrowAngle + rotationDirection * Math.PI / 2;
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
    const phaseTime = flightTime === 0 ? 0 : time % flightTime;
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
  } else if (type === "momentum") {
    const elastic = values.collision === "elastic";
    const collision = collisionResult(values.m1, values.v1, values.m2, values.v2, values.collision);
    const out1 = collision.v1;
    const out2 = collision.v2;
    const scale = Math.min(30, width / 25);
    const start1 = width * 0.25;
    const start2 = width * 0.75;
    const radius1 = 18 + values.m1 * 2;
    const radius2 = 18 + values.m2 * 2;
    const closingSpeed = Math.max(0.1, (values.v1 - values.v2) * scale);
    const collisionTime = Math.max(0.35, (start2 - start1 - radius1 - radius2) / closingSpeed);
    const cycleDuration = collisionTime + 2.8;
    const cycle = time % cycleDuration;
    const before = Math.min(cycle, collisionTime);
    const after = Math.max(0, cycle - collisionTime);
    let firstX = start1 + values.v1 * before * scale;
    let secondX = start2 + values.v2 * before * scale;
    if (after > 0) {
      const collisionX = (firstX + secondX) / 2;
      firstX = collisionX + out1 * after * scale;
      secondX = elastic ? collisionX + out2 * after * scale : firstX;
    }
    firstX = Math.max(35, Math.min(width - 35, firstX));
    secondX = Math.max(35, Math.min(width - 35, secondX));
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
  } else if (type === "ohm") {
    const current = ohmCurrent(values.voltage, values.resistance);
    const left = 85;
    const right = width - 85;
    const top = 72;
    const bottom = 220;
    context.strokeStyle = color;
    context.strokeRect(left, top, right - left, bottom - top);
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
    context.fillStyle = "#fff";
    context.font = "15px sans-serif";
    context.textAlign = "center";
    context.fillText(`U = ${values.voltage} В`, width / 2, 270);
    context.fillText(`R = ${values.resistance} Ом`, width / 2, 155);
  }
  context.shadowBlur = 0;
}

export default function PhysicsCanvas({ type, color, onNewtonSolveForChange, onOpticsChange }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(false);
  const timeRef = useRef(0);
  const previousFrameRef = useRef(null);
  const newtonMotionRef = useRef({ position: 50, velocity: 0 });
  const config = simulationConfig[type] || simulationConfig.newton;
  const [values, setValues] = useState(config.initial);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const nextConfig = simulationConfig[type] || simulationConfig.newton;
    setValues(nextConfig.initial);
    timeRef.current = 0;
    newtonMotionRef.current = { position: 50, velocity: 0 };
    previousFrameRef.current = null;
    pausedRef.current = false;
    setPaused(false);
  }, [type]);

  useEffect(() => {
    pausedRef.current = paused;
    previousFrameRef.current = null;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
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
  }, [type, color, values]);

  const results = useMemo(() => getResults(type, values), [type, values]);

  const reset = () => {
    setValues({ ...config.initial });
    if (type === "newton") onNewtonSolveForChange?.(config.initial.solveFor);
    if (type === "optics") onOpticsChange?.(config.initial);
    timeRef.current = 0;
    newtonMotionRef.current = { position: 50, velocity: 0 };
    setPaused(false);
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
    if (type !== "newton") timeRef.current = 0;
  };

  return (
    <div className="physics-canvas">
      <canvas ref={canvasRef} aria-label={`Интерактивная симуляция: ${type}`} />
      <div className="simulation-readout" aria-live="polite">
        {results.map((result) => <span key={result}>{result}</span>)}
      </div>
      <div className={type === "newton" ? "canvas-controls newton-controls" : "canvas-controls"}>
        <div className="canvas-control-grid">
          {config.controls.map((control) => (
            <label key={control.key}>
              <span>
                {control.label}
                {control.type !== "select" && <b>{values[control.key]}{control.unit ? ` ${control.unit}` : ""}</b>}
              </span>
              {control.type === "select" ? (
                <select
                  value={values[control.key]}
                  onChange={(event) => {
                    const option = control.options.find((item) => String(item.value) === event.target.value);
                    updateControl(control, option?.value ?? event.target.value);
                  }}
                >
                  {control.options.map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
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
            {paused ? "▶ Продолжить" : "⏸ Пауза"}
          </button>
          <button className="ghost-button" onClick={reset}>↻ Сбросить</button>
        </div>
      </div>
    </div>
  );
}
