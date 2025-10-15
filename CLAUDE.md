# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript Express.js API starter project with Sequelize ORM integration. This is a template repository used as a starting point for Express.js API projects.

## Development Commands

```bash
# Development (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production (requires build first)
npm start
```

## Architecture

### Entry Points

- **src/app.ts**: Application configuration and initialization

  - Configures Express middleware (CORS, cookie-parser, morgan)
  - Imports and initializes database models via `samurai04db` package
  - Runs startup functions (`verifyCheckDirectoryExists`, `onStartUpCreateEnvUsers`)
  - Registers routes
  - Exports app instance for use by server.ts

- **src/server.ts**: Server startup and global error handling
  - Imports configured app from app.ts
  - Overrides console.log/console.error to prefix with APP_NAME from env
  - Sets up global error handlers (uncaughtException, unhandledRejection)
  - Starts Express server on PORT from env (default: 3000)
  - **Note**: Use this as the entry point when running with custom console logging and error handling

### Database Integration

This project uses a local package `samurai04db` (file:../Samurai04Db) which provides:

- Sequelize models (e.g., `User` model)
- Database initialization via `initModels()` and `sequelize` instance
- The package is installed from a sibling directory, not npm

Database initialization happens in `app.ts` during the `initializeApp()` async function:

1. Models are initialized via `initModels()`
2. Database is synced with `sequelize.sync()`
3. Startup functions run after DB is ready

### Startup Functions (src/modules/onStartUp.ts)

- **verifyCheckDirectoryExists()**: Creates required directories from env variables (PATH_DATABASE, PATH_PROJECT_RESOURCES)
- **onStartUpCreateEnvUsers()**: Creates admin users from ADMIN_EMAIL env variable (JSON array format)
  - Default password: "test" (should be changed)
  - Skips existing users

### Routes

Routes are registered in `app.ts`:

- `/` - Index router (src/routes/index.ts)
- `/users` - Users router (src/routes/users.ts)

Routes use Express Router pattern and export default router instances.

### Static Files

The index route serves an HTML template from `src/templates/index.html`. After build, this resolves to `dist/templates/index.html` at runtime.

## Environment Variables

Required/expected variables:

- `PORT`: Server port (default: 3000)
- `APP_NAME`: Application name for console logging (default: "ExpressAPI02")
- `ADMIN_EMAIL`: JSON array of admin email addresses (e.g., `["admin@example.com"]`)
- `PATH_DATABASE`: Database file/directory path
- `PATH_PROJECT_RESOURCES`: Project resources directory path

## TypeScript Configuration

- Module system: CommonJS
- Output directory: `./dist`
- Source directory: `./src`
- ES Module interop enabled

## Dependencies of Note

- **express**: v5.x (note: v5 has breaking changes from v4)
- **bcrypt**: Password hashing for user creation
- **dotenv**: Environment variable management (must be loaded first in app.ts)
- **samurai04db**: Local Sequelize package from sibling directory
- **morgan**: HTTP request logger
- **cors**: CORS middleware with credentials support
- **cookie-parser**: Cookie parsing middleware

## Key Patterns

1. **Initialization Order**: dotenv.config() must run before any imports that use env variables
2. **Error Handling**: Global error handlers in server.ts catch uncaught exceptions/rejections
3. **Database First**: App waits for DB sync before starting server
4. **Route Registration**: Routes registered before server starts listening in app.ts
5. **Path Resolution**: Use `path.resolve(__dirname, ...)` for file paths due to CommonJS output
