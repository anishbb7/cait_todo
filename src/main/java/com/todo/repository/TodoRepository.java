package com.todo.repository;

import com.notes.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    /** Returns all todos ordered by creation date descending (newest first). */
    List<Todo> findAllByOrderByCreatedAtDesc();
}
