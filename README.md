# Bloomlist

🌱 A daily goal tracker where every task you complete grows a plant — your day, as a garden.

**[Live Demo](https://bloomlist.scottburgholzer.tech)**
**[Youtube Video Demo](https://youtu.be/9_NOVrmDQbU)**

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tests](https://img.shields.io/badge/Tests-74%20passing-green) ![AWS](https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-orange)

## Origin

Built from a single sentence with [Kiro](https://kiro.dev) Specs:

> Build a web app that turns my daily goal list into a garden that blooms as I check things off.

## What is it?

Bloomlist turns your daily to-do list into a visual garden. Add tasks, and each one becomes a seed. Check it off, and watch it bloom through four growth stages. Complete everything and get a confetti celebration. Each day starts fresh.

## Quick Start (Run locally)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment (Run on AWS)

To deploy your own instance to AWS (S3 + CloudFront), you'll need to configure your domain and AWS credentials first. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full setup guide.


## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run deploy` | Build and deploy to AWS (requires setup — see [Deployment](docs/DEPLOYMENT.md)) |

## Features

- **Daily tasks** — Create up to 20 tasks per day with validation
- **Visual garden** — Each task maps to a plant that grows when completed
- **Growth animation** — Plants animate through seed → sprout → budding → blooming
- **Celebration** — Confetti effect when all tasks are done
- **Persistence** — State saved to localStorage, survives page refresh
- **Daily reset** — Fresh garden every day at midnight
- **Responsive** — Side-by-side on desktop, stacked on mobile
- **Accessible** — 44px touch targets, ARIA labels, non-color-dependent states

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite 6 (build + dev server)
- CSS Modules (scoped styling, no runtime cost)
- localStorage (persistence, no backend)
- Vitest + React Testing Library + fast-check (property-based testing)
- AWS CDK (infrastructure as code)
- S3 + CloudFront + Route 53 + ACM (hosting)

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Component structure, data flow, and design decisions |
| [Testing](docs/TESTING.md) | Test strategy, property-based tests, and how to run them |
| [Deployment](docs/DEPLOYMENT.md) | AWS infrastructure, deploy process, and troubleshooting |

## License

See [LICENSE](LICENSE) for details.
