import { useEffect, useRef, useState } from "react";

const shapeStyles = {
  circle: { label: "Круг", symbol: "●" },
  square: { label: "Квадрат", symbol: "■" },
  triangle: { label: "Треугольник", symbol: "▲" },
  star: { label: "Звезда", symbol: "★" },
};

const colors = ["#22d3ee", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];
const MAX_OBJECTS = 40;
const COLLISION_CELL_SIZE = 110;

const experiments = [
  {
    id: "sandbox",
    icon: "🧪",
    title: "Песочница",
    description: "Добавляй собственные объекты и вручную настраивай физику.",
    law: "Свободный эксперимент",
  },
  {
    id: "fall",
    icon: "🍎",
    title: "Свободное падение",
    description: "Тела разной массы падают с одинаковым ускорением.",
    law: "a = g",
  },
  {
    id: "collision",
    icon: "💥",
    title: "Столкновение",
    description: "Два тела обмениваются импульсом при почти упругом ударе.",
    law: "m₁v₁ + m₂v₂ = const",
  },
  {
    id: "moon",
    icon: "🌙",
    title: "Лунная гравитация",
    description: "Слабая гравитация создаёт высокие и долгие прыжки.",
    law: "gₗ ≈ 1,62 м/с²",
  },
  {
    id: "weightless",
    icon: "🛰️",
    title: "Невесомость",
    description: "Без гравитации тела равномерно движутся и сталкиваются.",
    law: "F = 0 → v = const",
  },
];

function makeObject({ shape, mass, radius, x, y, vx = 0, vy = 0, color, angularVelocity = 0 }) {
  return {
    id: crypto.randomUUID(),
    shape,
    mass,
    radius,
    x,
    y,
    vx,
    vy,
    angle: 0,
    angularVelocity,
    color,
  };
}

function drawStar(context, radius) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const distance = point % 2 === 0 ? radius : radius * 0.45;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    point === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
  }
  context.closePath();
}

function drawObject(context, object) {
  context.save();
  context.translate(object.x, object.y);
  context.rotate(object.angle);
  context.fillStyle = object.color;
  context.strokeStyle = "rgba(255,255,255,.55)";
  context.lineWidth = 2;
  context.shadowColor = object.color;
  context.shadowBlur = 14;

  if (object.shape === "circle") {
    context.beginPath();
    context.arc(0, 0, object.radius, 0, Math.PI * 2);
  } else if (object.shape === "square") {
    context.beginPath();
    context.rect(-object.radius, -object.radius, object.radius * 2, object.radius * 2);
  } else if (object.shape === "triangle") {
    context.beginPath();
    context.moveTo(0, -object.radius);
    context.lineTo(object.radius, object.radius);
    context.lineTo(-object.radius, object.radius);
    context.closePath();
  } else {
    drawStar(context, object.radius * 1.2);
  }

  context.fill();
  context.stroke();
  context.restore();
}

function resolveObjectCollision(first, second, elasticity, friction) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const minDistance = first.radius + second.radius;
  const distanceSquared = dx * dx + dy * dy;

  if (distanceSquared === 0 || distanceSquared >= minDistance * minDistance) return;

  const distance = Math.sqrt(distanceSquared);
  const normalX = dx / distance;
  const normalY = dy / distance;
  const overlap = minDistance - distance;
  const firstInverseMass = 1 / first.mass;
  const secondInverseMass = 1 / second.mass;
  const inverseMassSum = firstInverseMass + secondInverseMass;

  first.x -= normalX * overlap * (firstInverseMass / inverseMassSum);
  first.y -= normalY * overlap * (firstInverseMass / inverseMassSum);
  second.x += normalX * overlap * (secondInverseMass / inverseMassSum);
  second.y += normalY * overlap * (secondInverseMass / inverseMassSum);

  const relativeVelocityX = second.vx - first.vx;
  const relativeVelocityY = second.vy - first.vy;
  const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

  if (velocityAlongNormal > 0) return;

  const impulse = (-(1 + elasticity) * velocityAlongNormal) / inverseMassSum;
  const impulseX = impulse * normalX;
  const impulseY = impulse * normalY;

  first.vx -= impulseX * firstInverseMass;
  first.vy -= impulseY * firstInverseMass;
  second.vx += impulseX * secondInverseMass;
  second.vy += impulseY * secondInverseMass;

  const tangentXRaw = relativeVelocityX - velocityAlongNormal * normalX;
  const tangentYRaw = relativeVelocityY - velocityAlongNormal * normalY;
  const tangentLength = Math.hypot(tangentXRaw, tangentYRaw);

  if (tangentLength > 0.001) {
    const tangentX = tangentXRaw / tangentLength;
    const tangentY = tangentYRaw / tangentLength;
    const tangentVelocity = relativeVelocityX * tangentX + relativeVelocityY * tangentY;
    const frictionImpulse = Math.max(-impulse * friction, Math.min(impulse * friction, -tangentVelocity / inverseMassSum));

    first.vx -= frictionImpulse * tangentX * firstInverseMass;
    first.vy -= frictionImpulse * tangentY * firstInverseMass;
    second.vx += frictionImpulse * tangentX * secondInverseMass;
    second.vy += frictionImpulse * tangentY * secondInverseMass;
  }

  const spin = (relativeVelocityX * normalY - relativeVelocityY * normalX) * 0.003;
  first.angularVelocity -= spin;
  second.angularVelocity += spin;
}

function resolveAllCollisions(objects, elasticity, friction) {
  const grid = new Map();

  objects.forEach((object, index) => {
    const minCellX = Math.floor((object.x - object.radius) / COLLISION_CELL_SIZE);
    const maxCellX = Math.floor((object.x + object.radius) / COLLISION_CELL_SIZE);
    const minCellY = Math.floor((object.y - object.radius) / COLLISION_CELL_SIZE);
    const maxCellY = Math.floor((object.y + object.radius) / COLLISION_CELL_SIZE);

    for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
        const key = `${cellX}:${cellY}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(index);
      }
    }
  });

  const checkedPairs = new Set();
  grid.forEach((indices) => {
    for (let firstIndex = 0; firstIndex < indices.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < indices.length; secondIndex += 1) {
        const a = indices[firstIndex];
        const b = indices[secondIndex];
        const pairKey = a < b ? `${a}:${b}` : `${b}:${a}`;
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);
        resolveObjectCollision(objects[a], objects[b], elasticity, friction);
      }
    }
  });
}

export default function SimulatorPage() {
  const canvasRef = useRef(null);
  const objectsRef = useRef([]);
  const physicsRef = useRef({ gravity: 1.7, friction: 0.35, elasticity: 0.65 });
  const pausedRef = useRef(false);
  const [shape, setShape] = useState("circle");
  const [mass, setMass] = useState(5);
  const [gravity, setGravity] = useState(1.7);
  const [friction, setFriction] = useState(0.35);
  const [elasticity, setElasticity] = useState(0.65);
  const [paused, setPaused] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [message, setMessage] = useState("");
  const [activeExperiment, setActiveExperiment] = useState("sandbox");

  useEffect(() => {
    physicsRef.current = { gravity, friction, elasticity };
  }, [gravity, friction, elasticity]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frame;
    let lastTime = performance.now();
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = Math.max(300, canvas.clientWidth);
      height = Math.max(360, canvas.clientHeight);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      objectsRef.current.forEach((object) => {
        object.x = Math.min(width - object.radius, Math.max(object.radius, object.x));
        object.y = Math.min(height - object.radius, Math.max(object.radius, object.y));
      });
    };

    const updatePhysics = (deltaTime) => {
      const { gravity: gravityValue, friction: frictionValue, elasticity: elasticityValue } = physicsRef.current;
      const objects = objectsRef.current;
      const acceleration = gravityValue * 620;
      const floorFriction = Math.max(0, 1 - frictionValue * deltaTime * 9);

      objects.forEach((object) => {
        object.vy += acceleration * deltaTime;
        object.vx *= Math.pow(0.999, deltaTime * 60);
        object.vy *= Math.pow(0.9995, deltaTime * 60);
        object.x += object.vx * deltaTime;
        object.y += object.vy * deltaTime;
        object.angle += object.angularVelocity * deltaTime;

        if (object.x - object.radius < 0) {
          object.x = object.radius;
          object.vx = Math.abs(object.vx) * elasticityValue;
          object.vy *= floorFriction;
        } else if (object.x + object.radius > width) {
          object.x = width - object.radius;
          object.vx = -Math.abs(object.vx) * elasticityValue;
          object.vy *= floorFriction;
        }

        if (object.y - object.radius < 0) {
          object.y = object.radius;
          object.vy = Math.abs(object.vy) * elasticityValue;
        } else if (object.y + object.radius > height) {
          object.y = height - object.radius;
          object.vy = -Math.abs(object.vy) * elasticityValue;
          object.vx *= floorFriction;
          object.angularVelocity *= floorFriction;
          if (Math.abs(object.vy) < 8) object.vy = 0;
          if (Math.abs(object.vx) < 0.8) object.vx = 0;
        }
      });

      resolveAllCollisions(objects, elasticityValue, frictionValue);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#080d24";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "rgba(255,255,255,.055)";
      context.lineWidth = 1;

      for (let x = 0; x < width; x += 36) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += 36) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      objectsRef.current.forEach((object) => drawObject(context, object));
    };

    const animate = (time) => {
      const deltaTime = Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;

      if (!pausedRef.current) {
        const substeps = objectsRef.current.length > 24 ? 1 : 2;
        for (let step = 0; step < substeps; step += 1) {
          updatePhysics(deltaTime / substeps);
        }
      }

      draw();
      frame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, []);

  const addObject = (event) => {
    if (objectsRef.current.length >= MAX_OBJECTS) {
      setMessage(`Достигнут безопасный предел: ${MAX_OBJECTS} объектов`);
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const objectMass = Number(mass);
    const radius = 18 + Math.sqrt(objectMass) * 3.5;

    objectsRef.current.push({
      id: crypto.randomUUID(),
      shape,
      mass: objectMass,
      radius,
      x: Math.max(radius, Math.min(rect.width - radius, event.clientX - rect.left)),
      y: Math.max(radius, Math.min(rect.height - radius, event.clientY - rect.top)),
      vx: (Math.random() - 0.5) * 120,
      vy: -30 - Math.random() * 50,
      angle: Math.random() * Math.PI,
      angularVelocity: (Math.random() - 0.5) * 2,
      color: colors[objectsRef.current.length % colors.length],
    });

    setActiveExperiment("sandbox");
    setObjectCount(objectsRef.current.length);
    setMessage("");
  };

  const loadExperiment = (experimentId) => {
    const canvas = canvasRef.current;
    const width = Math.max(320, canvas.clientWidth);
    const height = Math.max(360, canvas.clientHeight);
    let settings = { gravity: 1.7, friction: 0.35, elasticity: 0.65 };
    let objects = [];

    if (experimentId === "fall") {
      settings = { gravity: 1.7, friction: 0.08, elasticity: 0.35 };
      objects = [
        makeObject({ shape: "circle", mass: 2, radius: 25, x: width * 0.36, y: 70, color: colors[0] }),
        makeObject({ shape: "circle", mass: 16, radius: 43, x: width * 0.64, y: 52, color: colors[2] }),
      ];
    } else if (experimentId === "collision") {
      settings = { gravity: 0, friction: 0.02, elasticity: 0.98 };
      objects = [
        makeObject({ shape: "circle", mass: 5, radius: 32, x: width * 0.25, y: height * 0.5, vx: 230, color: colors[0] }),
        makeObject({ shape: "circle", mass: 5, radius: 32, x: width * 0.75, y: height * 0.5, vx: -230, color: colors[2] }),
      ];
    } else if (experimentId === "moon") {
      settings = { gravity: 0.28, friction: 0.08, elasticity: 0.78 };
      objects = [
        makeObject({ shape: "circle", mass: 5, radius: 28, x: width * 0.18, y: height - 48, vx: 185, vy: -330, color: colors[0] }),
        makeObject({ shape: "star", mass: 4, radius: 25, x: width * 0.5, y: height - 45, vx: 80, vy: -390, color: colors[4], angularVelocity: 1.4 }),
        makeObject({ shape: "square", mass: 7, radius: 30, x: width * 0.78, y: height - 50, vx: -145, vy: -310, color: colors[1], angularVelocity: -0.9 }),
      ];
    } else if (experimentId === "weightless") {
      settings = { gravity: 0, friction: 0, elasticity: 1 };
      objects = [
        makeObject({ shape: "circle", mass: 4, radius: 26, x: width * 0.2, y: height * 0.25, vx: 125, vy: 70, color: colors[0] }),
        makeObject({ shape: "square", mass: 6, radius: 29, x: width * 0.72, y: height * 0.3, vx: -105, vy: 95, color: colors[1], angularVelocity: 0.8 }),
        makeObject({ shape: "triangle", mass: 5, radius: 28, x: width * 0.36, y: height * 0.72, vx: 90, vy: -115, color: colors[3], angularVelocity: -0.7 }),
        makeObject({ shape: "star", mass: 3, radius: 24, x: width * 0.78, y: height * 0.72, vx: -135, vy: -80, color: colors[4], angularVelocity: 1.2 }),
      ];
    }

    setGravity(settings.gravity);
    setFriction(settings.friction);
    setElasticity(settings.elasticity);
    physicsRef.current = settings;
    objectsRef.current = objects;
    pausedRef.current = false;
    setPaused(false);
    setObjectCount(objects.length);
    setActiveExperiment(experimentId);
    setMessage(experimentId === "sandbox" ? "Песочница готова" : `Запущен опыт «${experiments.find((item) => item.id === experimentId).title}»`);
  };

  const clearObjects = () => {
    objectsRef.current = [];
    setObjectCount(0);
    setMessage("Поле очищено");
  };

  const save = () => {
    localStorage.setItem(
      "physics-simulation",
      JSON.stringify({
        objects: objectsRef.current,
        settings: { gravity, friction, elasticity, mass },
      }),
    );
    setMessage("Симуляция сохранена!");
  };

  const share = async () => {
    await navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/simulator`);
    setMessage("Ссылка скопирована!");
  };

  return (
    <section className="section page-section simulator-page">
      <div className="section-heading">
        <p className="eyebrow">Твоя лаборатория</p>
        <h1>Создай свою симуляцию</h1>
        <p>Добавляй объекты и наблюдай, как на них действуют гравитация, трение и упругость.</p>
      </div>

      <section className="experiment-library glass-panel">
        <div className="experiment-library-heading">
          <div>
            <p className="eyebrow">Готовые опыты</p>
            <h2>Выбери физический сценарий</h2>
          </div>
          <p>{experiments.find((item) => item.id === activeExperiment).description}</p>
        </div>
        <div className="experiment-buttons">
          {experiments.map((experiment) => (
            <button
              key={experiment.id}
              className={activeExperiment === experiment.id ? "active" : ""}
              onClick={() => loadExperiment(experiment.id)}
            >
              <span>{experiment.icon}</span>
              <strong>{experiment.title}</strong>
              <small>{experiment.law}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="simulator-workspace">
        <div className="simulation-panel glass-panel">
          <div className="simulation-panel-header">
            <div>
              <h2>Область симуляции</h2>
              <small>{experiments.find((item) => item.id === activeExperiment).title} · Объектов: {objectCount}/{MAX_OBJECTS}</small>
            </div>
            <div className="simulation-actions">
              <button className={paused ? "play-control paused" : "play-control"} onClick={() => setPaused(!paused)} title={paused ? "Продолжить" : "Пауза"}>
                {paused ? "▶" : "Ⅱ"}
              </button>
              <button className="delete-control" onClick={clearObjects} title="Удалить все объекты">⌫</button>
            </div>
          </div>
          <div className="simulation-stage">
            <canvas ref={canvasRef} onClick={addObject} aria-label="Интерактивная область физической симуляции" />
            {objectCount === 0 && <p className="stage-hint">💡 Кликай на холст, чтобы добавить объекты</p>}
          </div>
        </div>

        <aside className="simulator-sidebar">
          <section className="tool-panel glass-panel">
            <h2>Объекты</h2>
            <h3>Тип объекта</h3>
            <div className="shape-buttons">
              {Object.entries(shapeStyles).map(([id, item]) => (
                <button key={id} className={shape === id ? "selected" : ""} onClick={() => setShape(id)}>
                  <span>{item.symbol}</span>{item.label}
                </button>
              ))}
            </div>
            <label>
              Масса: {mass} кг
              <input type="range" min="1" max="20" step="1" value={mass} onChange={(event) => setMass(Number(event.target.value))} />
            </label>
          </section>

          <section className="physics-settings glass-panel">
            <h2>Физика</h2>
            <label>
              Гравитация: {gravity.toFixed(1)}
              <input type="range" min="0" max="2.5" step="0.1" value={gravity} onChange={(event) => setGravity(Number(event.target.value))} />
            </label>
            <label>
              Трение: {friction.toFixed(2)}
              <input type="range" min="0" max="1" step="0.01" value={friction} onChange={(event) => setFriction(Number(event.target.value))} />
            </label>
            <label>
              Упругость: {elasticity.toFixed(2)}
              <input type="range" min="0" max="1" step="0.01" value={elasticity} onChange={(event) => setElasticity(Number(event.target.value))} />
            </label>
          </section>
        </aside>
      </div>

      <div className="button-row compact simulator-footer">
        <button className="primary-button" onClick={save}>Сохранить</button>
        <button className="ghost-button" onClick={share}>Поделиться</button>
        <span className="status-message">{message}</span>
      </div>
    </section>
  );
}
