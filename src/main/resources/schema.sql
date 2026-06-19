-- ============================================================
--  Notes To-Do — MySQL Schema
--  Run this once to create the database and user.
--  Hibernate will auto-create the `todos` table on first boot
--  (spring.jpa.hibernate.ddl-auto=update).
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS notes_todo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. (Optional) Create a dedicated application user
--    Replace 'your_password' with a strong password,
--    then mirror it in application.properties.
CREATE USER IF NOT EXISTS 'notes_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON notes_todo.* TO 'notes_user'@'localhost';
FLUSH PRIVILEGES;

-- 3. Select the database
USE notes_todo;

-- 4. Todos table (Hibernate will create this automatically,
--    but included here for reference / manual migration)
CREATE TABLE IF NOT EXISTS todos (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    title       VARCHAR(200)    NOT NULL,
    note        TEXT,
    completed   TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME(6)     NOT NULL,
    updated_at  DATETIME(6)     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
