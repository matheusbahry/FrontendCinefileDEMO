-- Optional baseline migration for Cinefile (disable Flyway by default)
-- To use Flyway, set FLYWAY_ENABLED=true and adjust to your needs.
-- Hibernate is configured to update schema automatically; prefer Flyway for production.

-- Example DDL (commented out to avoid conflicts with Hibernate auto DDL):
-- create table if not exists users(
--   id bigserial primary key,
--   username varchar(50) not null unique,
--   email varchar(120) unique,
--   password_hash varchar(255) not null,
--   avatar_url varchar(300),
--   role varchar(20) not null,
--   created_at timestamp not null
-- );

