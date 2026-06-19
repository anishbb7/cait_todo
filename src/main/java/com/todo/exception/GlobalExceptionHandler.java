package com.todo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 Not Found ─────────────────────────────────────────────────────

    @ExceptionHandler(TodoNotFoundException.class)
    public ResponseEntity<ErrorBody> handleNotFound(TodoNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorBody(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    // ── 400 Validation ────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() == null ? "Invalid value" : fe.getDefaultMessage(),
                        (a, b) -> a   // keep first message if field appears twice
                ));

        String message = fieldErrors.values().stream().findFirst().orElse("Validation failed");
        ErrorBody body = new ErrorBody(HttpStatus.BAD_REQUEST.value(), message);
        body.setErrors(fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    // ── 500 Catch-all ─────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleGeneric(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorBody(500, "An unexpected error occurred"));
    }

    // ── Error body shape ──────────────────────────────────────────────────

    public static class ErrorBody {
        public final int    status;
        public final String message;
        public final Instant timestamp = Instant.now();
        public Map<String, String> errors;

        public ErrorBody(int status, String message) {
            this.status  = status;
            this.message = message;
        }

        public void setErrors(Map<String, String> errors) {
            this.errors = errors;
        }
    }
}
