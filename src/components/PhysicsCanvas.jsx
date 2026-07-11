import { useEffect, useRef, useState } from "react";

export default function PhysicsCanvas({ type, color }) {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frame;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = 280 * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const drawGrid = (width) => {
      context.strokeStyle = "rgba(255,255,255,.06)";
      context.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, 280);
        context.stroke();
      }
    };

    const render = () => {
      const width = canvas.clientWidth;
      context.clearRect(0, 0, width, 280);
      context.fillStyle = "#080d24";
      context.fillRect(0, 0, width, 280);
      drawGrid(width);
      if (!paused) time += 0.025 * speed;

      context.shadowBlur = 22;
      context.shadowColor = color;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = 3;

      if (type === "waves") {
        context.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y = 140 + Math.sin(x / 35 - time * 5) * 55;
          x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.stroke();
      } else if (type === "pendulum") {
        const angle = Math.sin(time * 2) * 0.8;
        const x = width / 2 + Math.sin(angle) * 110;
        const y = 40 + Math.cos(angle) * 160;
        context.beginPath();
        context.moveTo(width / 2, 40);
        context.lineTo(x, y);
        context.stroke();
        context.beginPath();
        context.arc(x, y, 22, 0, Math.PI * 2);
        context.fill();
      } else if (type === "gravity") {
        const centerX = width / 2;
        const centerY = 140;
        context.beginPath();
        context.arc(centerX, centerY, 38, 0, Math.PI * 2);
        context.fill();
        const orbitX = centerX + Math.cos(time * 2) * 130;
        const orbitY = centerY + Math.sin(time * 2) * 70;
        context.strokeStyle = "rgba(255,255,255,.28)";
        context.beginPath();
        context.ellipse(centerX, centerY, 130, 70, 0, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = "#f8fafc";
        context.beginPath();
        context.arc(orbitX, orbitY, 10, 0, Math.PI * 2);
        context.fill();
      } else if (type === "optics") {
        const prismX = width / 2;
        context.beginPath();
        context.moveTo(prismX, 55);
        context.lineTo(prismX - 75, 220);
        context.lineTo(prismX + 75, 220);
        context.closePath();
        context.stroke();
        context.strokeStyle = "#ffffff";
        context.beginPath();
        context.moveTo(20, 135);
        context.lineTo(prismX - 35, 135);
        context.stroke();
        ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"].forEach((rainbow, index) => {
          context.strokeStyle = rainbow;
          context.beginPath();
          context.moveTo(prismX + 25, 140);
          context.lineTo(width - 20, 85 + index * 27);
          context.stroke();
        });
      } else if (type === "electric" || type === "magnetism") {
        const left = width * 0.32;
        const right = width * 0.68;
        [left, right].forEach((x, index) => {
          context.fillStyle = index ? "#ef4444" : "#3b82f6";
          context.beginPath();
          context.arc(x, 140, 28, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#fff";
          context.font = "24px sans-serif";
          context.textAlign = "center";
          context.fillText(index ? "+" : "−", x, 148);
        });
        context.strokeStyle = color;
        for (let y = 80; y <= 200; y += 30) {
          context.beginPath();
          context.moveTo(left + 30, 140);
          context.quadraticCurveTo(width / 2, y, right - 30, 140);
          context.stroke();
        }
      } else if (type === "projectile") {
        const phase = (time * 0.45) % 1;
        const startX = 45;
        const endX = width - 45;
        const groundY = 230;
        const x = startX + (endX - startX) * phase;
        const y = groundY - 185 * 4 * phase * (1 - phase);

        context.strokeStyle = "rgba(255,255,255,.3)";
        context.setLineDash([7, 7]);
        context.beginPath();
        for (let step = 0; step <= 50; step += 1) {
          const progress = step / 50;
          const pathX = startX + (endX - startX) * progress;
          const pathY = groundY - 185 * 4 * progress * (1 - progress);
          step === 0 ? context.moveTo(pathX, pathY) : context.lineTo(pathX, pathY);
        }
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, 14, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#f8fafc";
        context.beginPath();
        context.moveTo(20, groundY + 15);
        context.lineTo(width - 20, groundY + 15);
        context.stroke();
      } else if (type === "hooke") {
        const anchorX = 55;
        const blockX = width / 2 + Math.sin(time * 2.2) * Math.min(150, width * 0.24);
        const centerY = 140;
        const coils = 15;

        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(anchorX, centerY);
        for (let coil = 1; coil <= coils; coil += 1) {
          const coilX = anchorX + ((blockX - anchorX - 30) * coil) / coils;
          const coilY = centerY + (coil % 2 === 0 ? -18 : 18);
          context.lineTo(coilX, coilY);
        }
        context.lineTo(blockX - 30, centerY);
        context.stroke();
        context.fillStyle = color;
        context.fillRect(blockX - 30, centerY - 30, 60, 60);
        context.fillStyle = "#f8fafc";
        context.font = "14px sans-serif";
        context.textAlign = "center";
        context.fillText("F = −kx", blockX, centerY + 5);
      } else if (type === "momentum") {
        const phase = (time * 0.55) % 2;
        const middle = width / 2;
        const travel = Math.max(70, middle - 90);
        const distance = phase < 1 ? phase * travel : (2 - phase) * travel;
        const firstX = 55 + distance;
        const secondX = width - 65 - distance;

        context.fillStyle = "#3b82f6";
        context.beginPath();
        context.arc(firstX, 140, 24, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ec4899";
        context.beginPath();
        context.arc(secondX, 140, 34, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#fff";
        context.font = "13px sans-serif";
        context.textAlign = "center";
        context.fillText("m₁", firstX, 145);
        context.fillText("m₂", secondX, 145);
        context.strokeStyle = "rgba(255,255,255,.35)";
        context.beginPath();
        context.moveTo(25, 177);
        context.lineTo(width - 25, 177);
        context.stroke();
      } else if (type === "ohm") {
        const left = 85;
        const right = width - 85;
        const top = 75;
        const bottom = 210;
        const voltage = 5 + speed * 5;
        const resistance = 10;
        const current = voltage / resistance;

        context.strokeStyle = color;
        context.strokeRect(left, top, right - left, bottom - top);
        context.fillStyle = "#080d24";
        context.fillRect(width / 2 - 55, top - 13, 110, 26);
        context.strokeStyle = "#ef4444";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(width / 2 - 45, top);
        for (let segment = 0; segment < 9; segment += 1) {
          context.lineTo(width / 2 - 40 + segment * 10, top + (segment % 2 ? 10 : -10));
        }
        context.lineTo(width / 2 + 45, top);
        context.stroke();
        context.strokeStyle = "#f8fafc";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(left - 12, 125);
        context.lineTo(left + 12, 125);
        context.moveTo(left - 20, 145);
        context.lineTo(left + 20, 145);
        context.stroke();
        context.fillStyle = "#f8fafc";
        context.font = "15px sans-serif";
        context.textAlign = "center";
        context.fillText(`U = ${voltage.toFixed(1)} В`, width / 2, bottom + 28);
        context.fillText(`I = ${current.toFixed(2)} А`, width / 2, 145);
      } else if (type === "heat") {
        for (let index = 0; index < 55; index += 1) {
          const x = (index * 73 + time * (25 + (index % 5) * 7)) % width;
          const y = 45 + ((index * 47 + Math.sin(time + index) * 20) % 190);
          context.fillStyle = `hsl(${20 + (index % 4) * 10} 90% 60%)`;
          context.beginPath();
          context.arc(x, y, 4 + (index % 3), 0, Math.PI * 2);
          context.fill();
        }
      } else {
        const x = 55 + ((time * 100) % Math.max(100, width - 110));
        context.fillRect(x, 118, 55, 55);
        context.strokeStyle = "#f8fafc";
        context.beginPath();
        context.moveTo(x + 27, 110);
        context.lineTo(x + 85, 110);
        context.stroke();
      }

      context.shadowBlur = 0;
      frame = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [type, color, speed, paused]);

  const controlLabel = {
    projectile: "Начальная скорость",
    hooke: "Частота колебаний",
    momentum: "Скорость тел",
    ohm: "Напряжение",
  }[type] || "Скорость";

  return (
    <div className="physics-canvas">
      <canvas ref={canvasRef} />
      <div className="canvas-controls">
        <label>
          {controlLabel}: {speed.toFixed(1)}×
          <input type="range" min="0.2" max="2.5" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
        </label>
        <button className="secondary-button" onClick={() => setPaused(!paused)}>{paused ? "▶ Продолжить" : "⏸ Пауза"}</button>
      </div>
    </div>
  );
}
