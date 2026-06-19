package com.todo.service;

import com.todo.dto.CreateTodoDto;
import com.todo.dto.TodoResponse;
import com.todo.dto.UpdateTodoDto;
import com.todo.entity.Todo;
import com.todo.exception.TodoNotFoundException;
import com.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository repo;

    // ── Get all ───────────────────────────────────────────────────────────

    public List<TodoResponse> findAll() {
        return repo.findAllByOrderByCreatedAtDesc()
                   .stream()
                   .map(TodoResponse::new)
                   .toList();
    }

    // ── Get one ───────────────────────────────────────────────────────────

    public TodoResponse findById(Long id) {
        return new TodoResponse(fetchOrThrow(id));
    }

    // ── Create ────────────────────────────────────────────────────────────

    @Transactional
    public TodoResponse create(CreateTodoDto dto) {
        Todo todo = new Todo(dto.getTitle(), dto.getNote());
        return new TodoResponse(repo.save(todo));
    }

    // ── Update (partial PATCH) ────────────────────────────────────────────

    @Transactional
    public TodoResponse update(Long id, UpdateTodoDto dto) {
        Todo todo = fetchOrThrow(id);

        if (dto.getTitle()     != null) todo.setTitle(dto.getTitle());
        if (dto.getNote()      != null) todo.setNote(dto.getNote());
        if (dto.getCompleted() != null) todo.setCompleted(dto.getCompleted());

        return new TodoResponse(repo.save(todo));
    }

    // ── Delete ────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new TodoNotFoundException(id);
        repo.deleteById(id);
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private Todo fetchOrThrow(Long id) {
        return repo.findById(id)
                   .orElseThrow(() -> new TodoNotFoundException(id));
    }
}
