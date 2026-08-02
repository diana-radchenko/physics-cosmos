import test from "node:test";
import assert from "node:assert/strict";
import { collisionResult } from "../src/physics/calculations.js";
import { createExperimentSetup, gravityMs2FromControl, simulatorExperiments } from "../src/data/simulatorExperiments.js";

const colors = ["a", "b", "c", "d", "e"];
const setup = (id) => createExperimentSetup(id, 800, 500, colors);

test("library contains nine scenarios including four new experiments", () => {
  assert.equal(simulatorExperiments.length, 9);
  for (const id of ["mars", "projectile", "superball", "unequal"]) assert.ok(simulatorExperiments.some((item) => item.id === id));
});

test("planetary gravity controls match physical accelerations", () => {
  assert.ok(Math.abs(gravityMs2FromControl(setup("moon").settings.gravity) - 1.62) < 1e-10);
  assert.ok(Math.abs(gravityMs2FromControl(setup("mars").settings.gravity) - 3.71) < 1e-10);
  assert.ok(Math.abs(gravityMs2FromControl(setup("projectile").settings.gravity) - 9.81) < 1e-10);
});

test("free-fall bodies begin with equal bottom height and acceleration", () => {
  const { settings, objects } = setup("fall");
  assert.equal(objects[0].y + objects[0].radius, objects[1].y + objects[1].radius);
  assert.notEqual(objects[0].mass, objects[1].mass);
  assert.equal(gravityMs2FromControl(settings.gravity), 9.81);
});

test("weightlessness has no gravity, drag, or wall energy loss", () => {
  assert.deepEqual(setup("weightless").settings, { gravity: 0, friction: 0, elasticity: 1 });
});

test("unequal-mass collision conserves momentum and kinetic energy", () => {
  const [a, b] = setup("unequal").objects;
  const result = collisionResult(a.mass, a.vx, b.mass, b.vx, "elastic");
  const beforeP = a.mass * a.vx + b.mass * b.vx;
  const afterP = a.mass * result.v1 + b.mass * result.v2;
  const beforeE = .5 * a.mass * a.vx ** 2 + .5 * b.mass * b.vx ** 2;
  const afterE = .5 * a.mass * result.v1 ** 2 + .5 * b.mass * result.v2 ** 2;
  assert.ok(Math.abs(beforeP - afterP) < 1e-9);
  assert.ok(Math.abs(beforeE - afterE) < 1e-9);
});

test("superball uses a physically valid restitution coefficient", () => {
  const e = setup("superball").settings.elasticity;
  assert.ok(e > 0.9 && e <= 1);
});
