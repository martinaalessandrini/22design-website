import assert from "node:assert/strict";
import test from "node:test";
import { advanceOrbit, equalAngles, gapSpread } from "./orbit.ts";

const DT = 1 / 60;
const SPEED = 0.15;
const FRAMES = 60 * 40;

test("la formula vecchia (drift per cubo) accavalla dopo 40s", () => {
  let angles = equalAngles(6);
  const drifts = [0.95, 0.97, 0.99, 1.01, 1.03, 1.05];
  for (let i = 0; i < FRAMES; i += 1) {
    angles = angles.map((angle, j) => angle + SPEED * DT * drifts[j]);
  }
  assert.ok(gapSpread(angles) > 0.3);
});

test("con lo stesso delta i cubi restano equidistanti dopo 40s", () => {
  let angles = equalAngles(6);
  for (let i = 0; i < FRAMES; i += 1) {
    angles = advanceOrbit(angles, SPEED * DT);
  }
  assert.ok(gapSpread(angles) < 1e-9);
});
