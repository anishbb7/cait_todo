import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Todo, CreateTodoDto, UpdateTodoDto } from './todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly API_URL = 'http://localhost:3000/api/todos';

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  /** GET /api/todos — fetch all tasks */
  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  /** POST /api/todos — create a new task */
  create(dto: CreateTodoDto): Observable<Todo> {
    return this.http.post<Todo>(this.API_URL, dto, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH /api/todos/:id — update a task */
  update(id: number | string, dto: UpdateTodoDto): Observable<Todo> {
    return this.http.patch<Todo>(`${this.API_URL}/${id}`, dto, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH /api/todos/:id — push completed flag to backend */
  toggleComplete(id: number | string, completed: boolean): Observable<Todo> {
    return this.http.patch<Todo>(
      `${this.API_URL}/${id}`,
      { completed },
      { headers: this.headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /** DELETE /api/todos/:id — delete a task */
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('TodoService error:', error);
    const message = error?.error?.message || error?.message || 'An unexpected error occurred';
    return throwError(() => new Error(message));
  }
}
