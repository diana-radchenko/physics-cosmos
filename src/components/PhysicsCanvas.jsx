import { useEffect, useMemo, useRef, useState } from "react";
import {
  advanceNewtonMotion,
  collisionResult,
  coulombForce,
  gravityForce,
  hookeMetrics,
  newtonAcceleration,
  newtonForce,
  newtonMass,
  ohmCurrent,
  pendulumPeriod,
  projectileMetrics,
  refractedAngle,
  waveSpeed,
} from "../physics/calculations";

const HEIGHT = 300;

const opticalMedia = [
  { value: 1, label: "Воздух — n ≈ 1,00" },
  { value: 1.33, label: "Вода — n ≈ 1,33" },
  { value: 1.31, label: "Лёд — n ≈ 1,31" },
  { value: 1.5, label: "Стекло — n ≈ 1,50" },
  { value: 2.42, label: "Алмаз — n ≈ 2,42" },
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
      { key: "n1", label: "Первая среда n₁ (из неё выходит свет)", type: "select", options: opticalMedia },
      { key: "n2", label: "Вторая среда n₂ (в неё входит свет)", type: "select", options: opticalMedia },
      { key: "angle", label: "Угол падения θ₁", min: 0, max: 80, step: 1, unit: "°" },
    ],
    initial: { n1: 1, n2: 1.33, angle: 35 },
  },
  gravity: {
    controls: [
      { key: "m1", label: "Масса m₁", min: 1, max: 20, step: 1, unit: "×10²⁴ кг" },
      { key: "m2", label: "Масса m₂", min: 1, max: 20, step: 1, unit: "×10²⁴ кг" },
      { key: "distance", label: "Расстояние r", min: 2, max: 20, step: 1, unit: "×10⁷ м" },
    ],
    initial: { m1: 6, m2: 4, distance: 8 },
  },
  waves: {
    controls: [
      { key: "frequency", label: "Частота f", min: 0.5, max: 5, step: 0.1, unit: "Гц" },
      { key: "wavelength", label: "Длина волны λ", min: 0.5, max: 5, step: 0.1, unit: "м" },
    ],
    initial: { frequency: 2, wavelength: 2 },
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
      { key: "amplitude", label: "Начальный угол", min: 5, max: 40, step: 1, unit: "°" },
    ],
    initial: { length: 1.5, gravity: 9.81, amplitude: 20 },
  },
  heat: {
    controls: [
      { key: "hot", label: "Горячее тело", min: 30, max: 100, step: 1, unit: "°C" },
      { key: "cold", label: "Холодное тело", min: 0, max: 29, step: 1, unit: "°C" },
      { key: "conductivity", label: "Теплопроводность", min: 0.1, max: 1, step: 0.05 },
    ],
    initial: { hot: 80, cold: 20, conductivity: 0.35 },
  },
  magnetism: {
    controls: [
      { key: "strength", label: "Интенсивность поля", min: 0.5, max: 2, step: 0.1 },
      { key: "direction", label: "Ориентация магнита", type: "select", options: [
        { value: 1, label: "N слева, S справа" },
        { value: -1, label: "S слева, N справа" },
      ] },
    ],
    initial: { strength: 1, direction: 1 },
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
    const force = gravityForce(values.m1 * 1e24, values.m2 * 1e24, values.distance * 1e7);
    return [`F = ${formatNumber(force)} Н`, "G = 6,67430 × 10⁻¹¹ Н·м²/кг² (постоянная)"];
  }
  if (type === "waves") {
    return [`v = λf = ${formatNumber(waveSpeed(values.wavelength, values.frequency))} м/с`, `T = ${formatNumber(1 / values.frequency)} с`];
  }
  if (type === "electric") {
    const force = coulombForce(values.q1 * 1e-6, values.q2 * 1e-6, values.distance);
    const interaction = values.q1 === 0 || values.q2 === 0 ? "Взаимодействия нет" : values.q1 * values.q2 < 0 ? "Притяжение" : "Отталкивание";
    return [`F = ${formatNumber(force, 3)} Н`, interaction];
  }
  if (type === "pendulum") {
    const period = pendulumPeriod(values.length, values.gravity);
    return [`T = ${formatNumber(period, 2)} с`, "Масса груза не влияет на период"];
  }
  if (type === "heat") {
    return [`Tравн = ${formatNumber((values.hot + values.cold) / 2, 1)} °C`, "Тепло идёт от горячего тела к холодному"];
  }
  if (type === "magnetism") {
    return ["Снаружи магнита линии направлены N → S", `Относительная интенсивность: ${formatNumber(values.strength, 1)}`];
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
    context.fillText(`n₁ = ${values.n1.toFixed(2)}`, 18, 32);
    context.fillText(`n₂ = ${values.n2.toFixed(2)}`, 18, 185);
  } else if (type === "gravity") {
    const visualDistance = 90 + (values.distance - 2) * Math.min(13, (width - 250) / 18);
    const centerX = width / 2;
    const left = centerX - visualDistance / 2;
    const right = centerX + visualDistance / 2;
    const r1 = 18 + values.m1 * 1.3;
    const r2 = 18 + values.m2 * 1.3;
    context.fillStyle = "#06b6d4";
    context.beginPath();
    context.arc(left, 150, r1, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f97316";
    context.beginPath();
    context.arc(right, 150, r2, 0, Math.PI * 2);
    context.fill();
    drawArrow(context, left + r1, 115, centerX - 5, 115, "#fff");
    drawArrow(context, right - r2, 185, centerX + 5, 185, "#fff");
    context.fillStyle = "#fff";
    context.font = "14px sans-serif";
    context.textAlign = "center";
    context.fillText("m₁", left, 155);
    context.fillText("m₂", right, 155);
    context.fillText(`r = ${values.distance} × 10⁷ м`, centerX, 245);
  } else if (type === "waves") {
    const pixelsPerWave = Math.max(55, values.wavelength * 55);
    context.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const y = 150 + Math.sin((x / pixelsPerWave) * Math.PI * 2 - time * values.frequency * Math.PI * 2) * 55;
      x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
    }
    context.stroke();
  } else if (type === "electric") {
    const spread = 90 + values.distance * Math.min(28, (width - 220) / 8);
    const left = width / 2 - spread / 2;
    const right = width / 2 + spread / 2;
    const charges = [[left, values.q1, "#3b82f6"], [right, values.q2, "#ef4444"]];
    charges.forEach(([x, value, fill]) => {
      context.fillStyle = value === 0 ? "#64748b" : fill;
      context.beginPath();
      context.arc(x, 150, 30, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff";
      context.font = "24px sans-serif";
      context.textAlign = "center";
      context.fillText(chargeSign(value), x, 158);
    });
    if (values.q1 !== 0 && values.q2 !== 0) {
      const attract = values.q1 * values.q2 < 0;
      const direction = attract ? 1 : -1;
      drawArrow(context, left + 38, 110, left + 38 + direction * 55, 110, "#fff");
      drawArrow(context, right - 38, 190, right - 38 - direction * 55, 190, "#fff");
    }
    context.strokeStyle = "rgba(255,255,255,.35)";
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(left, 225);
    context.lineTo(right, 225);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#fff";
    context.font = "13px sans-serif";
    context.fillText(`r = ${values.distance.toFixed(1)} м`, width / 2, 245);
  } else if (type === "pendulum") {
    const period = pendulumPeriod(values.length, values.gravity);
    const angularFrequency = 2 * Math.PI / period;
    const angle = values.amplitude * Math.PI / 180 * Math.cos(angularFrequency * time);
    const anchorX = width / 2;
    const anchorY = 35;
    const visualLength = 80 + values.length * 52;
    const x = anchorX + Math.sin(angle) * visualLength;
    const y = anchorY + Math.cos(angle) * visualLength;
    context.beginPath();
    context.moveTo(anchorX, anchorY);
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.arc(x, y, 22, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "13px sans-serif";
    context.textAlign = "center";
    context.fillText(`L = ${values.length.toFixed(1)} м`, anchorX, 280);
  } else if (type === "heat") {
    const equilibrium = (values.hot + values.cold) / 2;
    const factor = Math.exp(-values.conductivity * time * 0.32);
    const hotNow = equilibrium + (values.hot - equilibrium) * factor;
    const coldNow = equilibrium + (values.cold - equilibrium) * factor;
    const leftX = width * 0.27;
    const rightX = width * 0.73;
    context.fillStyle = `hsl(${Math.max(0, 220 - hotNow * 2.2)} 85% 55%)`;
    context.fillRect(leftX - 70, 85, 140, 130);
    context.fillStyle = `hsl(${Math.max(0, 220 - coldNow * 2.2)} 85% 55%)`;
    context.fillRect(rightX - 70, 85, 140, 130);
    drawArrow(context, leftX + 80, 150, rightX - 80, 150, "#fff", 3);
    context.fillStyle = "#fff";
    context.font = "18px sans-serif";
    context.textAlign = "center";
    context.fillText(`${hotNow.toFixed(1)} °C`, leftX, 155);
    context.fillText(`${coldNow.toFixed(1)} °C`, rightX, 155);
    context.font = "13px sans-serif";
    context.fillText("Передача тепла", width / 2, 132);
  } else if (type === "magnetism") {
    const centerX = width / 2;
    const leftPole = values.direction === 1 ? "N" : "S";
    const rightPole = values.direction === 1 ? "S" : "N";
    context.fillStyle = values.direction === 1 ? "#ef4444" : "#3b82f6";
    context.fillRect(centerX - 100, 120, 100, 60);
    context.fillStyle = values.direction === 1 ? "#3b82f6" : "#ef4444";
    context.fillRect(centerX, 120, 100, 60);
    context.fillStyle = "#fff";
    context.font = "24px sans-serif";
    context.textAlign = "center";
    context.fillText(leftPole, centerX - 50, 158);
    context.fillText(rightPole, centerX + 50, 158);
    context.strokeStyle = color;
    context.lineWidth = 1.5 + values.strength;
    for (let offset = 35; offset <= 105; offset += 35) {
      [-1, 1].forEach((sign) => {
        const startX = values.direction === 1 ? centerX - 100 : centerX + 100;
        const endX = values.direction === 1 ? centerX + 100 : centerX - 100;
        context.beginPath();
        context.moveTo(startX, 150);
        context.bezierCurveTo(startX - values.direction * 80, 150 + sign * offset, endX + values.direction * 80, 150 + sign * offset, endX, 150);
        context.stroke();
        addArrowHead(context, endX, 150, values.direction === 1 ? 0 : Math.PI, color, 7);
      });
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
      setValues(next);
      onOpticsChange?.(next);
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
          <button className="secondary-button" onClick={() => setPaused((current) => !current)}>
            {paused ? "▶ Продолжить" : "⏸ Пауза"}
          </button>
          <button className="ghost-button" onClick={reset}>↻ Сбросить</button>
        </div>
      </div>
    </div>
  );
}
