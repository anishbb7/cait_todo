-- ============================================================
--  Notes To-Do — MySQL Schema
--  Run this once to create the database and user.
--  Hibernate will auto-create the `todos` table on first boot
--  (spring.jpa.hibernate.ddl-auto=update).
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS notes_todo;

-- 2. Select the database
USE notes_todo;

-- 3. Todos table (Hibernate will create this automatically,
--    but included here for reference / manual migration)
CREATE TABLE IF NOT EXISTS todos (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    title       VARCHAR(200)    NOT NULL,
    note        TEXT,
    completed   TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME(6)     NOT NULL,
    updated_at  DATETIME(6)     NOT NULL,
    PRIMARY KEY (id)
);
