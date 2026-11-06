# PennyVault deployment

## Target architecture

- React frontend: Render Static Site.
- Spring Boot API: Render Docker Web Service.
- PostgreSQL: Neon (external managed database).
- Render deploys are manual (autoDeployTrigger: off), so a Git push does not automatically publish a release.

## Frontend

Create React App reads REACT_APP_API_BASE_URL at build time. For local development,
copy PennyVault-Frontend/.env.example to PennyVault-Frontend/.env. In Render, set
REACT_APP_API_BASE_URL to https://YOUR-BACKEND.onrender.com/api before deploying
(or update the setting and trigger a new frontend build).

## Backend

The Render Docker service uses PennyVault-Backend/Dockerfile. Render supplies PORT;
Spring Boot binds to it through server.port=${PORT:8080}.

Configure these variables in Render:

- SPRING_DATASOURCE_URL: Neon JDBC URL, e.g. jdbc:postgresql://HOST/DB?sslmode=require.
- SPRING_DATASOURCE_USERNAME: Neon role.
- SPRING_DATASOURCE_PASSWORD: Neon role password.
- JWT_SECRET: a new random value (the Render Blueprint generates one).
- CORS_ALLOWED_ORIGINS: exact frontend origin, e.g. https://YOUR-FRONTEND.onrender.com.
- APP_FRONTEND_URL: same frontend origin, without a trailing slash.
- SMTP variables only if a supported HTTPS mail provider or SMTP relay is configured.

Flyway owns schema migrations. Hibernate validates the schema rather than
mutating it. The production database must successfully apply migrations V1–V16.

## Local backend environment

Copy PennyVault-Backend/.env.example to a local environment configuration that
your IDE/terminal exports. Spring Boot does not automatically load a plain .env
file. Never commit real database credentials or JWT secrets.

## Email note

Render blocks outbound SMTP on common SMTP ports. Gmail SMTP should not be
assumed to work from Render. Use an HTTPS email API for production invitations.
