# Meal Plan Server

## Requirements
- Node.js version - 22.14 (see package.json)
- npm version - compatible with Node 22
- Docker and Docker Compose

## Setup and Installation

### Basic Setup
1. Install dependencies:
   ```
   npm i
   ```
2. Add OpenAI API key to `.env` file
   ```
   OPENAI_API_KEY=your-api-key
   ```
   You can get it from https://platform.openai.com/account/api-keys

### Database Setup with Docker
1. Start the PostgreSQL database:
   ```
   docker compose up -d
   ```
   This will run PostgreSQL in a Docker container accessible at `localhost:5432`

2. Check if the container is running:
   ```
   docker ps
   ```
   You should see `meal-plan-postgres` in the list of running containers

3. To view database logs:
   ```
   docker logs meal-plan-postgres
   ```

4. To connect to the database directly (optional):
   ```
   docker exec -it meal-plan-postgres psql -U postgres -d meal_plan
   ```

### Running the Application
1. Start the development server:
   ```
   npm run start:dev
   ```
   The server will be available at http://localhost:3001/api


## Notes
- The database is configured in the `.env` file

## Conventional Commits

In our project, we use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This helps standardize commit history and simplifies the release process.

### Examples

- `feat(core): add new feature`
- `fix(api): fix bug in data fetching method`

### Commit Types

- `feat`: Adding a new feature
- `fix`: Fixing a bug
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools


