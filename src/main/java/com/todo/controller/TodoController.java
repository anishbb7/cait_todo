package com.todo.controller;

import com.todo.dto.CreateTodoDto;
import com.todo.dto.TodoResponse;
import com.todo.dto.UpdateTodoDto;
import com.todo.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService service;

    /**
     * GET /api/todos
     * Returns all todos ordered by createdAt desc.
     */
    @GetMapping
    public ResponseEntity<List<TodoResponse>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /**
     * GET /api/todos/{id}
     * Returns a single todo or 404.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    /**
     * POST /api/todos
     * Body: { "title": "...", "note": "..." }
     * Returns 201 Created with the new todo.
     */
    @PostMapping
    public ResponseEntity<TodoResponse> create(@Valid @RequestBody CreateTodoDto dto) {
        TodoResponse created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PATCH /api/todos/{id}
     * Partial update — only send the fields you want to change.
     * Body: { "title"?: "...", "note"?: "...", "completed"?: true/false }
     */
    @PatchMapping("/{id}")
    public ResponseEntity<TodoResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTodoDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    /**
     * DELETE /api/todos/{id}
     * Returns 204 No Content on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
