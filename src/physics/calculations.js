export const GRAVITATIONAL_CONSTANT = 6.67e-11;
export const COULOMB_CONSTANT = 8.9875e9;

export function newtonAcceleration(force, mass) {
  if (mass <= 0) throw new RangeError("Mass must be positive.");
  return force / mass;
}

export function newtonForce(mass, acceleration) {
  if (mass <= 0) throw new RangeError("Mass must be positive.");
  return mass * acceleration;
}

export function newtonMass(force, acceleration) {
  if (acceleration === 0) return null;
  const mass = force / acceleration;
  return mass > 0 ? mass : null;
}

export function advanceNewtonMotion(position, velocity, acceleration, deltaTime, minPosition, maxPosition, scale = 18) {
  if (deltaTime <= 0) return { position, velocity };
  const nextVelocity = velocity + acceleration * deltaTime;
  const nextPosition = position + nextVelocity * deltaTime * scale;
  if (nextPosition < minPosition || nextPosition > maxPosition) {
    return {
      position: Math.max(minPosition, Math.min(maxPosition, nextPosition)),
      velocity: 0,
    };
  }
  return { position: nextPosition, velocity: nextVelocity };
}

export function gravityForce(m1, m2, distance) {
  if (m1 < 0 || m2 < 0 || distance <= 0) throw new RangeError("Masses must be non-negative and distance positive.");
  return GRAVITATIONAL_CONSTANT * m1 * m2 / (distance ** 2);
}

export function coulombForce(q1, q2, distance) {
  if (distance <= 0) throw new RangeError("Distance must be positive.");
  return COULOMB_CONSTANT * Math.abs(q1 * q2) / (distance ** 2);
}

export function refractedAngle(n1, n2, incidentAngleDegrees) {
  if (n1 <= 0 || n2 <= 0) throw new RangeError("Refractive indices must be positive.");
  const incident = incidentAngleDegrees * Math.PI / 180;
  const sine = n1 * Math.sin(incident) / n2;
  if (Math.abs(sine) > 1) return null;
  return Math.asin(sine) * 180 / Math.PI;
}

export function pendulumPeriod(length, gravity) {
  if (length <= 0 || gravity <= 0) throw new RangeError("Length and gravity must be positive.");
  return 2 * Math.PI * Math.sqrt(length / gravity);
}

export function pendulumAngle(initialAngleDegrees, length, gravity, time) {
  const period = pendulumPeriod(length, gravity);
  return initialAngleDegrees * Math.cos(2 * Math.PI * time / period);
}

export function heatTransferState({
  temperature1,
  temperature2,
  mass1,
  mass2,
  specificHeat1,
  specificHeat2,
  conductance,
  time,
}) {
  if (mass1 <= 0 || mass2 <= 0) throw new RangeError("Masses must be positive.");
  if (specificHeat1 <= 0 || specificHeat2 <= 0) throw new RangeError("Specific heat capacities must be positive.");
  if (conductance <= 0) throw new RangeError("Thermal conductance must be positive.");
  if (time < 0) throw new RangeError("Time must be non-negative.");

  const thermalCapacity1 = mass1 * specificHeat1;
  const thermalCapacity2 = mass2 * specificHeat2;
  const totalThermalCapacity = thermalCapacity1 + thermalCapacity2;
  const equilibrium = (
    thermalCapacity1 * temperature1 + thermalCapacity2 * temperature2
  ) / totalThermalCapacity;
  const decayRate = conductance * (1 / thermalCapacity1 + 1 / thermalCapacity2);
  const temperatureDifference = (
    temperature1 - temperature2
  ) * Math.exp(-decayRate * time);
  const equilibriumReached = Math.abs(temperatureDifference) < 0.05;

  if (equilibriumReached) {
    return {
      temperature1: equilibrium,
      temperature2: equilibrium,
      equilibrium,
      heatFlowPower: 0,
      direction: 0,
      equilibriumReached: true,
    };
  }

  const currentTemperature1 = equilibrium
    + thermalCapacity2 / totalThermalCapacity * temperatureDifference;
  const currentTemperature2 = equilibrium
    - thermalCapacity1 / totalThermalCapacity * temperatureDifference;

  return {
    temperature1: currentTemperature1,
    temperature2: currentTemperature2,
    equilibrium,
    heatFlowPower: Math.abs(conductance * (currentTemperature1 - currentTemperature2)),
    direction: Math.sign(currentTemperature1 - currentTemperature2),
    equilibriumReached: false,
  };
}

export function projectileMetrics(velocity, angleDegrees, gravity) {
  if (velocity < 0 || gravity <= 0) throw new RangeError("Velocity must be non-negative and gravity positive.");
  const angle = angleDegrees * Math.PI / 180;
  return {
    flightTime: 2 * velocity * Math.sin(angle) / gravity,
    range: velocity ** 2 * Math.sin(2 * angle) / gravity,
    maxHeight: (velocity * Math.sin(angle)) ** 2 / (2 * gravity),
  };
}

export function hookeMetrics(stiffness, mass, extension) {
  if (stiffness <= 0 || mass <= 0) throw new RangeError("Stiffness and mass must be positive.");
  return {
    force: -stiffness * extension,
    period: 2 * Math.PI * Math.sqrt(mass / stiffness),
    angularFrequency: Math.sqrt(stiffness / mass),
  };
}

export function collisionResult(m1, v1, m2, v2, type = "elastic") {
  if (m1 <= 0 || m2 <= 0) throw new RangeError("Masses must be positive.");
  const momentum = m1 * v1 + m2 * v2;
  if (type === "inelastic") {
    const commonVelocity = momentum / (m1 + m2);
    return { momentum, v1: commonVelocity, v2: commonVelocity };
  }
  return {
    momentum,
    v1: ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2),
    v2: (2 * m1 * v1 + (m2 - m1) * v2) / (m1 + m2),
  };
}

export function ohmCurrent(voltage, resistance) {
  if (resistance <= 0) throw new RangeError("Resistance must be positive.");
  return voltage / resistance;
}

export function waveSpeed(wavelength, frequency) {
  if (wavelength < 0 || frequency < 0) throw new RangeError("Wavelength and frequency must be non-negative.");
  return wavelength * frequency;
}
