# Node.js TypeScript CI/CD Pipeline Demo

<div align="center">

[![CI/CD Pipeline](https://github.com/mohin-sheikh/nodejs-ci-cd-demo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/mohin-sheikh/nodejs-ci-cd-demo/actions/workflows/ci-cd.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/mohinsheikh/node-ts-cicd-demo)](https://hub.docker.com/r/mohinsheikh/node-ts-cicd-demo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.5.4-blue.svg)](https://www.typescriptlang.org/)

**A production-ready Node.js TypeScript application with a complete CI/CD pipeline including testing, linting, security scanning, and Docker deployment.**

[Features](#features) • 
[Quick Start](#quick-start) • 
[Architecture](#architecture) • 
[CI/CD Pipeline](#cicd-pipeline) • 
[Docker](#docker) • 
[Contributing](#contributing)

</div>

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Features

- **TypeScript** - Type-safe JavaScript for better development experience
- **Express.js** - Fast, unopinionated web framework for Node.js
- **Jest Testing** - Complete testing setup with coverage reports
- **ESLint + Prettier** - Code quality and formatting tools
- **Git Hooks** - Pre-commit hooks using Husky and lint-staged
- **GitHub Actions** - Automated CI/CD pipeline
- **Docker** - Multi-stage builds for production-ready images
- **Security Scanning** - npm audit for vulnerability detection
- **Health Checks** - Built-in health check endpoint for monitoring
- **Production Ready** - Following industry best practices

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Runtime** | Node.js | 18.x |
| **Language** | TypeScript | 5.5.4 |
| **Framework** | Express | 4.21.2 |
| **Testing** | Jest | 29.7.0 |
| **Linting** | ESLint | 8.57.1 |
| **Formatting** | Prettier | 3.5.3 |
| **Container** | Docker | 28.0+ |
| **CI/CD** | GitHub Actions | - |
| **Registry** | Docker Hub | - |

---

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- Docker (optional, for containerization)

### Clone and Run

```bash
# Clone the repository
git clone https://github.com/mohin-sheikh/nodejs-ci-cd-demo.git
cd nodejs-ci-cd-demo

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Your application will be running at `http://localhost:3000`

---

## Project Structure

```
nodejs-ci-cd-demo/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions CI/CD pipeline
│
├── src/
│   ├── __tests__/
│   │   ├── app.test.ts               # Application tests
│   │   ├── error-handling.test.ts    # Error handling tests
│   │   ├── logger.test.ts            # Logger tests
│   │   └── server.test.ts            # Server tests
│   ├── app.ts                        # Main Express application
│   ├── logger.ts                     # Logger utility
│   └── server.ts                     # Server entry point
│
├── .dockerignore                     # Docker ignore rules
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore rules
├── .prettierignore                   # Prettier ignore rules
├── .prettierrc                       # Prettier configuration
├── Dockerfile                        # Docker multi-stage build
├── jest.config.js                    # Jest configuration
├── package.json                      # Project dependencies
├── package-lock.json                 # Locked dependencies
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

---

## Installation

### Local Development

```bash
# Install all dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Build for production
npm run build
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

---

## API Endpoints

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-24T12:00:00.000Z",
  "environment": "production"
}
```

### Welcome Message
```http
GET /
```
**Response:**
```json
{
  "message": "Welcome to Node.js TypeScript CI/CD Demo API"
}
```

### Get Users
```http
GET /api/users?limit={number}
```
**Response:**
```json
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ]
}
```

---

## Testing

This project uses Jest for testing with comprehensive coverage thresholds.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Coverage Thresholds

| Metric | Threshold |
|--------|-----------|
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

### Test Structure

- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **Error Handling** - Error scenarios and middleware

---

## Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript rules to maintain code quality

- TypeScript-specific linting
- Unused variable detection
- Consistent error handling
- No console statements (warnings)

### Prettier Configuration

Prettier ensures consistent code formatting

- 2 spaces indentation
- Single quotes
- Semicolons
- 100 character line width
- ES5 trailing commas

### Git Hooks

Pre-commit hooks using Husky and lint-staged

- Automatically fix ESLint issues
- Format code with Prettier
- Run tests before commit

---

## CI/CD Pipeline

The GitHub Actions pipeline runs on every push and pull request to `main` and `develop` branches.

### Pipeline Stages

```yaml
1. Build and Test
   ├── Checkout code
   ├── Setup Node.js
   ├── Install dependencies
   ├── Check formatting
   ├── Lint code
   ├── Build project
   └── Run tests with coverage

2. Security Scan
   ├── Run npm audit
   └── Security vulnerability check

3. Docker Build (main branch only)
   ├── Set up Docker Buildx
   ├── Login to Docker Hub
   ├── Build Docker image
   └── Push to Docker Hub

4. Deploy (main branch only)
   └── Ready for deployment
```

### Branch Strategy

- **main** - Production branch - triggers full pipeline with Docker deployment
- **develop** - Development branch - triggers build and test only
- **pull requests** - Triggers build and test for validation

---

## Docker

### Docker Configuration

Multi-stage build for optimized production images

```dockerfile
Stage 1 - Builder
├── Install dependencies
├── Compile TypeScript
└── Prepare build artifacts

Stage 2 - Production
├── Install production dependencies
├── Copy compiled code
├── Create non-root user
└── Configure health checks
```

### Docker Commands

```bash
# Build the image
docker build -t node-ts-cicd-demo .

# Run the container
docker run -p 3000:3000 node-ts-cicd-demo

# Run in detached mode
docker run -d -p 3000:3000 --name my-app node-ts-cicd-demo

# View logs
docker logs my-app

# Stop container
docker stop my-app

# Remove container
docker rm my-app

# Pull from Docker Hub
docker pull mohinsheikh/node-ts-cicd-demo:latest
```

### Docker Image Tags

- `latest` - Most recent production build
- `{commit-sha}` - Specific commit version

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production/test) | development |

---

## Deployment

### Deploy with Docker

```bash
# Pull the latest image
docker pull mohinsheikh/node-ts-cicd-demo:latest

# Run the container
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  --name node-app \
  mohinsheikh/node-ts-cicd-demo:latest
```

### Deploy to Cloud Platforms

The Docker image can be deployed to any cloud platform:

- **AWS ECS/EKS**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Heroku Container Registry**

---

## Troubleshooting

### Common Issues and Solutions

#### ESLint Configuration Error

**Problem** - "ESLint couldn't find a configuration file"
**Solution** - Ensure `.eslintrc.json` exists in the root directory and is properly formatted.

#### TypeScript Version Warning

**Problem** - TypeScript version not officially supported
**Solution** Downgrade to TypeScript 5.5.4
```bash
npm install --save-dev typescript@5.5.4
```

#### Jest Export Error

**Problem**: "export default" syntax error in jest.config.js
**Solution**: Use CommonJS format in jest.config.js
```javascript
module.exports = { ... }
```

#### Docker Build Fails

**Problem**: "husky not found" during Docker build
**Solution**: Add `--ignore-scripts` flag
```dockerfile
RUN npm ci --omit=dev --ignore-scripts
```

#### Docker Hub Authentication Failed

**Problem**: Unable to push Docker image
**Solution**: Use personal access token instead of password with read/write permissions.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Ensure all tests pass before submitting PR
- Update documentation as needed
- Keep commits small and focused

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Mohin Sheikh**

- GitHub - [@mohin-sheikh](https://github.com/mohin-sheikh)
- Project Repository - [nodejs-ci-cd-demo](https://github.com/mohin-sheikh/nodejs-ci-cd-demo)
- Docker Hub - [mohinsheikh](https://hub.docker.com/u/mohinsheikh)

---

## Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Jest](https://jestjs.io/) - Testing framework
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation
- [Docker](https://www.docker.com/) - Containerization

---

## Roadmap

- [ ] Add database integration (PostgreSQL)
- [ ] Implement authentication (JWT)
- [ ] Add API documentation (Swagger)
- [ ] End-to-end testing with Cypress
- [ ] Performance monitoring with Prometheus
- [ ] Kubernetes deployment manifests
- [ ] Automated dependency updates (Dependabot)

---

<div align="center">

**Built with ❤️ using Node.js, TypeScript, and GitHub Actions**

⭐ Star this repository if you found it helpful!

[Report Bug](https://github.com/mohin-sheikh/nodejs-ci-cd-demo/issues) · [Request Feature](https://github.com/mohin-sheikh/nodejs-ci-cd-demo/issues)

</div>
