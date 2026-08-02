export const text = (locale, ru, en) => locale === "en" ? en : ru;

export const navLabels = {
  en: { home: "Home", physics: "Physics", simulator: "Simulator", ai: "AI", chat: "Articles", friends: "Friends", teachers: "Teachers", about: "About" },
};

export const englishTopics = {
  newton: { title: "Newton's laws", summary: "Force, mass, and acceleration determine motion.", theory: "Newton's first law states that an object remains at rest or moves uniformly unless an external force changes its motion.\n\nThe second law connects force, mass, and acceleration. The third law says that interacting bodies exert equal and opposite forces on each other." },
  optics: { title: "Optics", summary: "Light reflects, refracts, and splits into a spectrum.", theory: "Refraction changes the direction of light when it passes from one medium into another. The refractive indices and angles are connected by Snell's law.\n\nWhen light enters a denser medium, it bends toward the normal; when it leaves, it bends away from the normal." },
  gravity: { title: "Gravity", summary: "All objects with mass attract one another.", theory: "Gravity keeps planets in orbit and holds us on Earth's surface. Near Earth, free-fall acceleration is approximately 9.8 m/s².\n\nIgnoring air resistance, objects of different masses fall with the same acceleration." },
  waves: { title: "Waves", summary: "Oscillations transfer energy through space.", theory: "Sound, light, and water waves are examples of wave motion. Wavelength is the distance between neighboring peaks, while frequency is the number of oscillations per second.\n\nMechanical waves require a medium; electromagnetic waves can travel through a vacuum." },
  electric: { title: "Electric field", summary: "Charges create electric fields and interact.", theory: "An electric field is a region where a charged particle experiences force. Field lines point from positive to negative charges.\n\nCoulomb's law shows that electrostatic force depends on the charges and decreases with the square of the distance." },
  pendulum: { title: "Pendulum", summary: "Its period depends on length and gravity.", theory: "For small oscillations, a pendulum's period depends on its length and gravitational acceleration, but not on the mass of the bob.\n\nKinetic and potential energy continuously transform into each other during motion." },
  heat: { title: "Heat transfer", summary: "Heat moves by conduction, convection, and radiation.", theory: "The amount of heat depends on mass, specific heat capacity, and temperature change.\n\nConduction transfers heat through contact, convection through fluid motion, and radiation through electromagnetic waves." },
  magnetism: { title: "Magnetism", summary: "Moving charges create magnetic fields.", theory: "Magnetic fields act on moving charged particles. Magnetic induction is measured in teslas.\n\nThe right-hand rule determines field direction around a current-carrying wire." },
  projectile: { title: "Projectile motion", summary: "Horizontal motion combines with free fall.", theory: "An object launched at an angle follows a parabolic path. Its horizontal velocity remains constant while gravity changes its vertical velocity." },
  hooke: { title: "Hooke's law", summary: "Elastic force is proportional to deformation.", theory: "For small deformations, a spring tends to return to equilibrium. The greater the extension or compression, the greater the restoring force." },
  momentum: { title: "Conservation of momentum", summary: "Total momentum is conserved in a closed system.", theory: "Momentum equals mass multiplied by velocity. During a collision, bodies exchange momentum, but the total momentum of a closed system remains constant." },
  ohm: { title: "Ohm's law", summary: "Current depends on voltage and resistance.", theory: "Electric current is directly proportional to voltage and inversely proportional to resistance. Doubling voltage at constant resistance doubles the current." },
};

export function localizeTopics(topics, locale) {
  if (locale !== "en") return topics;
  return topics.map((topic) => ({ ...topic, ...englishTopics[topic.id] }));
}
