import test from "node:test";
import assert from "node:assert/strict";
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
  pendulumAngle,
  pendulumPeriod,
  projectileMetrics,
  refractedAngle,
  waveSpeed,
} from "../src/physics/calculations.js";

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not close to ${expected}`);
};

test("Newton's second law", () => {
  assert.equal(newtonAcceleration(10, 5), 2);
  assert.equal(newtonAcceleration(-12, 3), -4);
  assert.equal(newtonForce(5, 2), 10);
  assert.equal(newtonForce(3, -4), -12);
  assert.equal(newtonMass(10, 2), 5);
  assert.equal(newtonMass(-12, -4), 3);
  assert.equal(newtonMass(10, 0), null);
  assert.equal(newtonMass(-10, 2), null);
});

test("Newton motion preserves paused state and advances continuously", () => {
  const paused = advanceNewtonMotion(80, 3, 2, 0, 50, 500);
  assert.deepEqual(paused, { position: 80, velocity: 3 });

  const resumed = advanceNewtonMotion(paused.position, paused.velocity, 2, 0.5, 50, 500);
  assert.deepEqual(resumed, { position: 116, velocity: 4 });

  const atBoundary = advanceNewtonMotion(495, 10, 2, 0.5, 50, 500);
  assert.deepEqual(atBoundary, { position: 500, velocity: 0 });
});

test("gravity follows the inverse-square law", () => {
  const original = gravityForce(5e24, 6e24, 8e7);
  closeTo(gravityForce(10e24, 6e24, 8e7), original * 2, original * 1e-12);
  closeTo(gravityForce(5e24, 12e24, 8e7), original * 2, original * 1e-12);
  closeTo(gravityForce(5e24, 6e24, 16e7), original / 4, original * 1e-12);
});

test("Coulomb force follows the inverse-square law", () => {
  const original = coulombForce(2e-6, -3e-6, 2);
  closeTo(coulombForce(2e-6, -3e-6, 4), original / 4);
});

test("Snell's law and total internal reflection", () => {
  closeTo(refractedAngle(1, 1.5, 30), 19.47122063449069);
  assert.equal(refractedAngle(1.5, 1, 60), null);
});

test("pendulum period is independent of mass", () => {
  const earthPeriod = pendulumPeriod(1, 9.81);
  closeTo(earthPeriod, 2.0060666807106475);
  closeTo(pendulumPeriod(4, 9.81), earthPeriod * 2);
  closeTo(pendulumPeriod(1, 9.81 * 4), earthPeriod / 2);
  closeTo(pendulumAngle(10, 1, 9.81, 0), 10);
  closeTo(pendulumAngle(10, 1, 9.81, earthPeriod / 2), -10);
});

test("projectile metrics at 45 degrees", () => {
  const result = projectileMetrics(20, 45, 9.81);
  closeTo(result.range, 400 / 9.81);
  closeTo(result.maxHeight, 100 / 9.81);
});

test("Hooke force and oscillator period", () => {
  const result = hookeMetrics(20, 2, 0.25);
  assert.equal(result.force, -5);
  closeTo(result.period, 2 * Math.PI * Math.sqrt(0.1));
});

test("elastic collision conserves momentum", () => {
  const result = collisionResult(2, 5, 3, -2, "elastic");
  closeTo(2 * result.v1 + 3 * result.v2, result.momentum);
});

test("inelastic collision gives a shared velocity", () => {
  const result = collisionResult(2, 5, 3, -2, "inelastic");
  assert.equal(result.v1, result.v2);
  closeTo((2 + 3) * result.v1, result.momentum);
});

test("Ohm and wave equations", () => {
  assert.equal(ohmCurrent(12, 6), 2);
  assert.equal(waveSpeed(2, 3), 6);
});
