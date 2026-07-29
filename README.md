# Physics Cosmos

**Physics Cosmos** is an interactive web platform designed for learning physics through real-time simulations, animated visualizations, and an AI tutor — built and deployed as an independent project.

I built Physics Cosmos because most physics resources split theory, simulation, and help across separate tools. This platform puts them in one place: students can see a law, manipulate it, and ask questions about it without ever leaving the page.

## 🚀 Features

* **Custom 2D Physics Engine:** A from-scratch simulation on HTML Canvas. Objects interact through impulse-based collision resolution (restitution, tangential friction, and spin transfer), with wall collisions and fixed-substep integration for numerical stability. Gravity, friction, and elasticity are adjustable in real time.
* **Preset Experiments:** Free fall, elastic collision, Moon gravity, weightlessness, and an open sandbox, each demonstrating a specific law.
* **Theory + Live Visualizations:** 12 topics (Newton's laws, gravity, optics, waves, electricity, magnetism, pendulum, heat transfer, projectile motion, Hooke's law, momentum conservation, Ohm's law), each with topic-specific controls, calculated results, an animated canvas, its formula, and a self-check quiz.
* **AI Tutor:** A chat interface backed by an OpenAI model through a serverless endpoint, with Markdown and LaTeX rendering, conversation history, and suggested prompts.
* **Collaborative Learning:** Community and friends chat pages for peer-to-peer discussion.
* **Responsive, Single-Codebase UI:** Adapts seamlessly to desktop, tablet, and mobile, utilizing a lightweight hash router and local-storage authentication.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, JavaScript (JSX) |
| **Styling** | Custom responsive CSS |
| **Markdown + Math** | `react-markdown`, `remark-gfm`, `remark-math`, KaTeX |
| **AI Backend** | Cloudflare Pages Functions (serverless) + OpenAI API |
| **Graphics** | HTML Canvas 2D (`requestAnimationFrame`) |
| **Version Control** | Git + GitHub |

## 📁 Project Structure

```text
physics-cosmos/
├── src/
│   ├── components/      # Header, AuthModal, Starfield, PhysicsCanvas
│   ├── pages/           # Home, Physics, Simulator, Ai, Community, Friends, About
│   ├── data/            # physics.js — topics, formulas, quizzes, nav
│   ├── physics/         # Pure, tested physics calculations
│   ├── App.jsx          # Routing + app shell
│   └── styles.css
├── functions/api/ai.js  # Serverless AI endpoint
├── server/openai.js     # OpenAI request helper
└── index.html
```

## ✅ Verification

Run `npm test` to verify the core equations, then `npm run build` to create the
production bundle. The automated tests cover Newton's second law, inverse-square
gravity and Coulomb forces, Snell's law and total internal reflection, pendulum
period, projectile motion, Hooke's law, elastic and inelastic collisions, Ohm's
law, and the wave equation.

> **Deployment:** Hosted on **Cloudflare Pages**, serving the static React build and the serverless functions from a single origin.

## 📐 Engineering Takeaways

This project covered the full development cycle — architecture, implementation, debugging, and deployment. 
* **Browser Physics:** The core challenge was building a stable physics engine in the browser. Collision response must feel correct at 60 FPS across many objects, which required precise impulse math and robust fixed-substep integration.
* **Backend Security:** Implemented a secure, zero-client-credential architecture by routing third-party OpenAI API requests through a serverless backend instead of exposing credentials to the client.

## 👤 Author

* **Diana Radchenko**
* Independent Project · 2026
