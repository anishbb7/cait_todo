# Notes To-Do — Spring Boot Backend

REST API for the Angular Notes To-Do app. Built with Spring Boot 3, Spring Data JPA, and MySQL.

---

## Tech Stack

| Layer        | Technology                      |
|--------------|---------------------------------|
| Framework    | Spring Boot 3.2                 |
| Language     | Java 21                         |
| Persistence  | Spring Data JPA + Hibernate     |
| Database     | MySQL 8+                        |
| Validation   | Jakarta Bean Validation         |
| Boilerplate  | Lombok                          |

---

## Prerequisites

- Java 21+ (`java -version`)
- Maven 3.9+ (`mvn -version`)
- MySQL 8+ running locally

---

## Setup

### 1. Create the database

```sql
-- In MySQL client:
CREATE DATABASE notes_todo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the included script:

```bash
mysql -u root -p < src/main/resources/schema.sql
```

### 2. Configure credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/notes_todo?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Run the API

```bash
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

Hibernate auto-creates the `todos` table on first boot.

---

## API Reference

Base URL: `http://localhost:8080/api/todos`

### Get all todos
```
GET /api/todos
```
Response `200 OK`:
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "note": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
]
```

### Get one todo
```
GET /api/todos/{id}
```

### Create a todo
```
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "note": "Milk, eggs, bread"
}
```
Response `201 Created`

### Update a todo (partial)
```
PATCH /api/todos/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "note": "Updated note",
  "completed": true
}
```
All fields optional — only send what you want to change.

### Delete a todo
```
DELETE /api/todos/{id}
```
Response `204 No Content`

---

## Error Responses

All errors return a consistent JSON shape:

```json
{
  "status": 404,
  "message": "Todo not found with id: 99",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

Validation errors also include a field-level `errors` map:

```json
{
  "status": 400,
  "message": "Title must not be blank",
  "timestamp": "...",
  "errors": {
    "title": "Title must not be blank"
  }
}
```

---

## CORS

The API allows requests from `http://localhost:4200` (Angular dev server) by default.

To change or add origins, add to `application.properties`:

```properties
app.cors.allowed-origins=http://localhost:4200,https://your-production-domain.com
```

---

## Connecting the Angular Frontend

In the Angular app, open `src/app/todo.service.ts` and confirm:

```ts
private readonly API_URL = 'http://localhost:8080/api/todos';
```

Then uncomment the `TodoService` calls in `app.component.ts` to replace the mock data.

---

## Project Structure

```
src/main/java/com/notes/todo/
├── TodoApplication.java          ← Entry point
├── config/
│   └── CorsConfig.java           ← CORS filter
├── controller/
│   └── TodoController.java       ← REST endpoints
├── dto/
│   ├── CreateTodoDto.java        ← POST request body
│   ├── UpdateTodoDto.java        ← PATCH request body
│   └── TodoResponse.java         ← JSON response shape
├── entity/
│   └── Todo.java                 ← JPA entity / DB table
├── exception/
│   ├── TodoNotFoundException.java
│   └── GlobalExceptionHandler.java
├── repository/
│   └── TodoRepository.java       ← Spring Data interface
└── service/
    └── TodoService.java          ← Business logic
```
