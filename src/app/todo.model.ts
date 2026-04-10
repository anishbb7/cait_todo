export interface Todo {
  id: number | string;
  title: string;
  note?: string;
  completed: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateTodoDto {
  title: string;
  note?: string;
  completed?: boolean;
}

export interface UpdateTodoDto {
  title?: string;
  note?: string;
  completed?: boolean;
}
