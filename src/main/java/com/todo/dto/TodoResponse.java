package com.todo.dto;

import com.todo.entity.Todo;
import lombok.Getter;

import java.time.Instant;

/**
 * Outbound JSON representation of a Todo.
 * Decouples the API contract from the JPA entity.
 */
@Getter
public class TodoResponse {

    private final Long    id;
    private final String  title;
    private final String  note;
    private final boolean completed;
    private final Instant createdAt;
    private final Instant updatedAt;

    public TodoResponse(Todo todo) {
        this.id        = todo.getId();
        this.title     = todo.getTitle();
        this.note      = todo.getNote();
        this.completed = todo.isCompleted();
        this.createdAt = todo.getCreatedAt();
        this.updatedAt = todo.getUpdatedAt();
    }
}
