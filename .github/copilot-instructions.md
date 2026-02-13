# NestJS Backend Project with CQRS

## Project Overview
Full-stack project with NestJS backend using CQRS architecture, Swagger, i18n, PostgreSQL, and Sequelize.

## Project Structure
```
├── backend/          # NestJS Backend Application
│   ├── src/
│   │   ├── apps/     # Feature modules (cliente, etc.)
│   │   ├── common/   # Shared code
│   │   └── i18n/     # Translations
│   └── ...
├── frontend/         # Frontend Application (to be added)
└── .github/          # GitHub configuration
```

## Technology Stack
- NestJS framework
- CQRS (Command Query Responsibility Segregation) pattern
- PostgreSQL database (port 5432, database: crm)
- Sequelize ORM
- Swagger API documentation
- i18n internationalization
- pnpm package manager

## Important Notes
- **All backend work happens in `backend/` directory**
- All feature modules should be created inside `backend/src/apps/` directory
- Database password is set to `Davi_123`
- The example module is "cliente" (clients)
- Frontend will be added in a separate `frontend/` directory

## Backend Development
Working directory: `backend/`
- Run development server: `cd backend && pnpm start:dev`
- Build project: `cd backend && pnpm build`
- Access Swagger docs: http://localhost:3000/api/docs

## Database Setup
Ensure PostgreSQL is running with:
- Host: localhost
- Port: 5432
- Database: crm
- Password: Davi_123
- Configure credentials in `backend/.env` file


## Project Structure
The project follows a modular architecture with CQRS pattern implementation.

### Key Directories
- `src/common/` - Shared code, base classes and interfaces
- `src/i18n/` - Translation files (pt/en)
- `src/users/` - Example CQRS module with commands, queries, DTOs, and models
- `.github/` - GitHub configuration and Copilot instructions

## Development
- Run development server: `pnpm start:dev`
- Build project: `pnpm build`
- Access Swagger docs: http://localhost:3000/api/docs

## Database Setup
Ensure PostgreSQL is running with:
- Host: localhost
- Port: 5432
- Database: crm
- Configure credentials in `.env` file
