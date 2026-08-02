# Physics Cosmos
**Physics Cosmos** is a bilingual, browser-based educational platform for learning school-level physics through interactive simulations, animated visualizations, formulas, self-check questions, and AI-assisted explanations.

The project brings theory, experimentation, and guided help into one application. Students can study a physical law, change relevant parameters, observe the result on an HTML Canvas visualization, check their understanding, and ask the AI tutor a follow-up question without leaving the website.

## 🚀 Current Features

### Custom 2D Physics Sandbox

The general simulator is implemented from scratch in JavaScript with HTML Canvas 2D and does not depend on an external physics engine library.

- Add circles, squares, triangles, and stars with adjustable mass.
- Change gravity, friction, and elasticity in real time.
- Observe motion, rotation, wall impacts, friction, and object-to-object collisions.
- Pause, resume, reset, save, and share the simulator page.
- Limit scenes to a safe number of objects to prevent excessive browser workload.
- Reduce collision checks with a spatial grid and skip duplicate collision pairs.

Object collisions use an impulse-based response:

1. calculate the collision normal;
2. separate overlapping objects according to inverse mass;
3. apply a restitution impulse along the normal;
4. apply a clamped tangential friction impulse;
5. apply an approximate spin response to angular velocity.

### Nine Prepared Simulator Scenarios

The **Choose a physics scenario** carousel currently includes:

1. Open sandbox
2. Free fall
3. Elastic collision
4. Moon gravity
5. Weightlessness
6. Mars gravity
7. Projectile motion
8. Elastic-ball bouncing
9. Elastic collision between bodies of unequal mass

### Twelve Physics Topics

The theory section contains:

1. Newton’s laws
2. Gravity
3. Optics
4. Waves
5. Electric fields
6. Pendulum motion
7. Heat transfer
8. Magnetism
9. Projectile motion
10. Hooke’s law
11. Conservation of momentum
12. Ohm’s law

Each topic includes:

- a school-level explanation;
- a governing formula;
- definitions and units for the variables;
- topic-specific controls or calculated values;
- an animated HTML Canvas visualization;
- a self-check question.

The reusable calculation layer covers Newton’s second law, inverse-square gravity, electrostatic force, Snell’s law and total internal reflection, pendulum period, heat equilibrium, projectile motion, Hooke’s law, elastic and inelastic collisions, Ohm’s law, and the wave equation.

### AI Tutor

The AI tutor accepts natural-language questions about school physics and sends them to a Cloudflare Pages Function, which calls the OpenAI API.

Current AI functionality includes:

- Russian and English responses based on the selected site language;
- recent conversation history for follow-up questions;
- step-by-step worked solutions;
- formulas, numerical substitution, and units;
- instructions to check dimensions and ask for missing information;
- Markdown, tables, and LaTeX rendering with KaTeX;
- suggested starter questions;
- request and conversation-length limits;
- user-facing error handling.

The tutor is not currently connected to the live state of the simulator or to a persistent student-progress model. AI-generated content should still be reviewed when used for assessment or high-stakes learning.

### Russian and English Interface

The language switch updates:

- navigation and page content;
- theory and formulas;
- simulator controls and Canvas terminology;
- AI tutor prompts, answers, and errors;
- registration and login forms;
- Friends, Teachers, and Articles pages.

### Browser-Local Accounts and Profiles

The application includes registration and login interfaces for two profile types.

**Student profile fields:**

- full name;
- class number;
- class specialization;
- school number;
- email and password.

**Teacher profile fields:**

- full name;
- subject;
- school number;
- email and password.

Account records are stored in the current browser. Passwords are hashed with the browser Web Crypto API before storage. Active login information is stored in `sessionStorage`, so the full name is shown only after login in the current browser session.

This is a local demonstration account system, not server-side authentication.

### Friends and Teachers Workspaces

The platform provides separate **Friends** and **Teachers** sections.

Current functions include:

- search by full name;
- student search by birth date, school number, city, and class;
- teacher search by subject and school number;
- adding contacts after login;
- selecting a contact;
- writing and viewing local message history.

Contacts and conversations are stored in `localStorage`. They are not synchronized between different users or devices, and the current version does not provide WebSocket-based real-time messaging.

### Articles

The former community chat section is now an **Articles** page. It supports bilingual article content and browser-local article storage. The current implementation is a local publishing demonstration rather than a shared content-management backend.

### Responsive Interface

A single React codebase and custom responsive CSS support desktop and smaller-screen layouts. Responsive rules cover navigation, theory panels, simulator controls, account forms, contact workspaces, articles, and the Canvas area.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, JavaScript, JSX |
| **Build Tool** | Vite 7 |
| **Styling** | Custom responsive CSS |
| **Graphics** | HTML Canvas 2D, `requestAnimationFrame` |
| **Physics Models** | Custom JavaScript calculations and impulse-based collision handling |
| **Markdown** | `react-markdown`, `remark-gfm` |
| **Mathematics** | `remark-math`, `rehype-katex`, KaTeX |
| **AI Backend** | Cloudflare Pages Functions + OpenAI API |
| **Testing** | Node.js built-in test runner |
| **Hosting** | Cloudflare Pages |
| **Deployment Tool** | Wrangler |
| **Version Control** | Git + GitHub |

## 🏗️ Technical Architecture

### Browser

The browser runs:

- the React interface;
- the general 2D simulator;
- topic-specific Canvas visualizations;
- physics calculations;
- self-check interactions;
- local account, contact, chat, and article storage;
- Markdown and mathematical rendering.

### AI Request Path

```text
User browser
    → React AI Tutor
    → POST /api/ai
    → Cloudflare Pages Function
    → OpenAI API
    → formatted response returned to the browser
```

The AI request includes recent messages and the selected locale. The Pages Function validates the request and keeps the API credential on the server side.

### Storage Model

The current version uses browser storage for demonstration data:

- `localStorage` for registered accounts, contacts, conversations, articles, and preferences;
- `sessionStorage` for the active login session.

The project does not currently include:

- a shared user database;
- server-side message history;
- WebSocket communication;
- real-time multi-user chat;
- persistent student-progress tracking;
- WebAssembly or Web Workers;
- direct transfer of live simulator state to the AI tutor.

## 📁 Project Structure

```text
physics-cosmos/
├── functions/
│   └── api/
│       └── ai.js                    # Cloudflare Pages Function
├── server/
│   ├── openai.js                    # OpenAI request and locale handling
│   └── physicsPrompt.js             # School-physics system instructions
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx            # Registration and login
│   │   ├── Header.jsx               # Navigation and language switch
│   │   ├── PhysicsCanvas.jsx        # Topic-specific visualizations
│   │   └── Starfield.jsx            # Background effects
│   ├── data/
│   │   ├── physics.js               # Topics, formulas, symbols, quizzes
│   │   └── simulatorExperiments.js  # Nine prepared simulator scenarios
│   ├── pages/
│   │   ├── AiPage.jsx               # AI tutor
│   │   ├── CommunityPage.jsx        # Articles
│   │   ├── ContactsPage.jsx         # Friends and teachers workspaces
│   │   ├── HomePage.jsx
│   │   ├── PhysicsPage.jsx          # Theory and topic simulations
│   │   └── SimulatorPage.jsx        # General 2D sandbox
│   ├── physics/
│   │   └── calculations.js          # Tested physics functions
│   ├── utils/
│   │   ├── accountStore.js          # Browser-local accounts
│   │   └── mathText.js              # Math-markup normalization
│   ├── App.jsx                      # Routing, locale, and session state
│   ├── i18n.js                      # English localization
│   └── styles.css
├── tests/
│   ├── ai-locale.test.js
│   ├── ai.test.js
│   ├── physics.test.js
│   └── simulator-scenarios.test.js
├── index.html
├── package.json
└── vite.config.js
```
## 📐 Engineering Notes

### Browser Physics

The simulator demonstrates practical browser-physics concerns:

- collision detection and impulse response;
- inverse-mass overlap correction;
- restitution and tangential friction;
- approximate spin transfer;
- frame-delta limits;
- adaptive substep count;
- spatial partitioning;
- safe object-count limits;
- physical regression tests.

### AI Integration and Credential Protection

The OpenAI request is routed through a Cloudflare Pages Function so that the API key remains in the server-side environment instead of being exposed to the browser.

### Current Scope

Physics Cosmos is a working educational web application and an extensible project foundation. Some community and account features intentionally remain browser-local and would require a database, server-side authorization, and real-time communication infrastructure before they could support shared production use.

## 👤 Author

- **Diana Radchenko**
- Independent Project · 2026
