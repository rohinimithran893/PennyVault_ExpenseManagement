# PennyVault deployment

## Target architecture

This Blueprint uses Render's Free web-service plan. It is suitable for a hobby/test
release, not a production financial service: the API sleeps after 15 minutes of
inactivity and can take about a minute to wake. The frontend static site remains
available, but the first API request after idle can be delayed. The backend has
512 MB RAM and no persistent disk; application data must remain in Neon.

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
- RESEND_API_KEY: Resend API key for invitation email delivery over HTTPS.
- MAIL_FROM: sender identity verified in Resend (for example, a sender on your verified domain).

Flyway owns schema migrations. Hibernate validates the schema rather than
mutating it. CI has verified migrations V1–V16 and Hibernate validation against
PostgreSQL 16. The Neon database must successfully apply the same migrations.

## Local backend environment

Copy PennyVault-Backend/.env.example to a local environment configuration that
your IDE/terminal exports. Spring Boot does not automatically load a plain .env
file. Never commit real database credentials or JWT secrets.

## Email note

Render blocks outbound SMTP on ports 25, 465, and 587 on free web services.
The invitation service therefore uses Resend's HTTPS API when RESEND_API_KEY
is configured; it retains SMTP as a local-development fallback. Verify your
sender domain in Resend before using a custom MAIL_FROM address.
