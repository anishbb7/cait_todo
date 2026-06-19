package com.todo.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateTodoDto {

    /** Null means "do not change this field". */

    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    private String title;

    @Size(max = 2000, message = "Note must not exceed 2000 characters")
    private String note;

    private Boolean completed;
}
