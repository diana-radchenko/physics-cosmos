Physics Cosmos
An interactive web platform for learning physics through real-time simulations, animated visualizations, and an AI tutor — all running in the browser.

Physics Cosmos turns abstract laws (gravity, collisions, optics, electric fields) into things students can see and manipulate directly, instead of memorizing formulas from a textbook. It was built as an independent software-engineering project, from concept to a deployed web application.

What it does
Interactive physics simulator — a custom 2D physics engine on HTML <canvas> where users place objects (circles, squares, triangles, stars) and tune gravity, friction, and elasticity in real time. The engine implements impulse-based object-to-object collision resolution (normal restitution + tangential friction + spin transfer), wall collisions, and fixed-substep integration for stability.

Ready-made experiments — pre-configured scenarios that load a concept instantly: free fall (equal acceleration), elastic collisions (momentum exchange), Moon gravity, weightlessness, and an open sandbox.

Theory + animated visualizations — 12 physics topics (Newton's laws, gravity, optics, waves, electricity, magnetism, pendulum, heat transfer, projectile motion, Hooke's law, momentum conservation, Ohm's law), each with a live canvas animation, the governing formula, a short explanation, and a self-check quiz.

AI physics tutor — a chat interface that calls an OpenAI model through a serverless backend, renders Markdown responses, keeps conversation history, and offers suggested questions.

Collaborative features — community and friends chat pages for shared learning.

Responsive design — one interface that adapts to desktop, tablet, and mobile, with a lightweight hash-based router and local-storage login.

Tech stack
Layer	Technology
Frontend	React 19, Vite 7, JavaScript (JSX)
Styling	CSS (custom, responsive)
Markdown rendering	react-markdown + remark-gfm
AI backend	Cloudflare Pages Functions (serverless) + OpenAI API
Rendering	HTML Canvas 2D (requestAnimationFrame)
Version control	Git + GitHub
Project structure
text
physics-cosmos/
├── src/
│   ├── components/      # Header, AuthModal, Starfield, PhysicsCanvas
│   ├── pages/           # Home, Physics, Simulator, Ai, Community, Friends, About
│   ├── data/            # physics.js — topics, formulas, quizzes, nav config
│   ├── App.jsx          # routing + app shell
│   └── styles.css
├── functions/api/ai.js  # serverless endpoint for the AI tutor
├── server/openai.js     # OpenAI request helper
└── index.html
Getting started
Prerequisites: Node.js 18+ and npm.

bash
# 1. Install dependencies
npm install

# 2. Add your OpenAI API key
cp .env.example .env.local
#   then open .env.local and paste your key after OPENAI_API_KEY=

# 3. Run the dev server
npm run dev
The app runs at http://127.0.0.1:3000.

To build for production:

bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
Note on the API key: never commit .env.local to Git. On Cloudflare Pages, set OPENAI_API_KEY and OPENAI_MODEL as environment variables in the dashboard instead.

Deployment
The app is deployed with Cloudflare Pages, which serves the static React build and the serverless AI function from the same origin.

bash
npm run deploy   # builds and deploys to Cloudflare Pages via Wrangler
What I learned
This project took me through the full software development lifecycle — requirements, architecture, implementation, debugging, and deployment. I gained hands-on experience with component-based React architecture, building a physics engine from scratch on Canvas, integrating a third-party AI API behind a serverless backend, and shipping a real, publicly accessible web app rather than a local prototype.

Author
Diana Radchenko

Independent student project · 2026

License
This project is shared for educational and portfolio purposes. Contact the author before reusing the code
