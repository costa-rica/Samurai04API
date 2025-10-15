# Database Overview

## Project Overview

Samurai04Db is a TypeScript-based Sequelize ORM database module using SQLite. It provides strongly-typed models with centralized relationship management, designed to be imported into APIs and other applications.

### Folder Structure

```
src/
├── models/
│   ├── _connection.ts          # Database connection singleton
│   ├── _index.ts                # Model registration and exports
│   ├── _associations.ts         # Centralized relationship definitions
│   ├── User.ts                  # User model
│   ├── UserData.ts              # UserData model
│   ├── Message.ts               # Message model
│   ├── Conversation.ts          # Conversation model
│   └── ContractUserConversation.ts  # ContractUserConversation model
└── index.ts                     # Main entry point (re-exports from models/_index.ts)
```

### Initialization Pattern

The project uses a centralized initialization pattern:

1. **`initModels()`**: This function must be called before using any models. It:
   - Initializes all model schemas by calling each model's `init` function
   - Applies all associations defined in `_associations.ts`
   - Returns an object containing all models and the sequelize instance

2. **`_associations.ts`**: This file contains the `applyAssociations()` function where all model relationships (hasMany, belongsTo, etc.) should be defined. This centralized approach:
   - Keeps relationship logic separate from individual models
   - Prevents circular dependency issues
   - Makes it easier to understand the entire database schema at a glance
   - Currently contains example associations (commented out) from a previous project

### Usage Example

```typescript
import { initModels, sequelize, User } from 'samurai04db';

// Initialize all models and associations
initModels();

// Sync database (creates tables)
await sequelize.sync();

// Use models
const user = await User.create({
  username: 'john',
  email: 'john@example.com',
  password: 'hashed_password'
});
```

## Tables

### Users

**Table Name:** `Users`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique identifier |
| `username` | STRING | NOT NULL | - | User's username |
| `email` | STRING | NOT NULL | - | User's email address |
| `password` | STRING | NOT NULL | - | User's hashed password |
| `isAdmin` | BOOLEAN | - | `false` | Administrator flag |
| `createdAt` | DATE | AUTO | - | Timestamp of creation |
| `updatedAt` | DATE | AUTO | - | Timestamp of last update |

### UserDatas

**Table Name:** `UserDatas`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique identifier |
| `userId` | STRING | NOT NULL | - | Reference to user |
| `pathToFile` | STRING | NOT NULL | - | File system path to stored file |
| `filename` | STRING | NOT NULL | - | Name of the file |
| `createdAt` | DATE | AUTO | - | Timestamp of creation |
| `updatedAt` | DATE | AUTO | - | Timestamp of last update |

### Messages

**Table Name:** `Messages`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique identifier |
| `conversationId` | INTEGER | NOT NULL | - | Reference to conversation |
| `content` | STRING | NOT NULL | - | Message content/text |
| `role` | ENUM | NOT NULL | - | Message sender role: `'user'` or `'samurai'` |
| `createdAt` | DATE | AUTO | - | Timestamp of creation |
| `updatedAt` | DATE | AUTO | - | Timestamp of last update |

### Conversations

**Table Name:** `Conversations`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique identifier |
| `userId` | STRING | NOT NULL | - | Reference to user who owns conversation |
| `createdAt` | DATE | AUTO | - | Timestamp of creation |
| `updatedAt` | DATE | AUTO | - | Timestamp of last update |

### ContractUserConversations

**Table Name:** `ContractUserConversations`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique identifier |
| `userId` | STRING | NOT NULL | - | Reference to user |
| `conversationId` | STRING | NOT NULL | - | Reference to conversation |
| `createdAt` | DATE | AUTO | - | Timestamp of creation |
| `updatedAt` | DATE | AUTO | - | Timestamp of last update |

## Notes

- All tables automatically include `createdAt` and `updatedAt` timestamp fields managed by Sequelize
- All primary keys (`id`) are auto-incrementing integers
- Database relationships should be defined in `src/models/_associations.ts`, not in individual model files
- The User model serves as the reference implementation for creating new models
