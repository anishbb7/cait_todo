import {
  Component, OnInit, ViewChild, ElementRef, HostListener
} from '@angular/core';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';

export type Filter    = 'all' | 'active' | 'done';
export type PanelMode = 'idle' | 'create' | 'edit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [TodoService],
  animations: [
    trigger('listItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('200ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('160ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 0, transform: 'translateX(-12px)' }))
      ])
    ]),
    trigger('panelFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('240ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('160ms ease', style({ opacity: 0, transform: 'translateX(10px)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  @ViewChild('panelTitleInput') panelTitleInput!: ElementRef<HTMLTextAreaElement>;

  todos: Todo[] = [];
  filter: Filter    = 'all';
  panelMode: PanelMode = 'idle';
  selectedId: number | string | null = null;

  // Panel form
  panelTitle = '';
  panelNote  = '';
  panelError = '';
  panelDirty = false;

  // Loading / saving states
  isLoading  = false;
  isSaving   = false;
  loadError  = '';

  // Delete confirm
  deletingId: number | string | null = null;
  deleteInProgress = false;

  // Toggle in-flight tracking (prevents double-click race)
  togglingId: number | string | null = null;

  constructor(private todoService: TodoService) {}

  // ── Init ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.loadError = '';
    this.todoService.getAll().subscribe({
      next: (todos) => {
        this.todos     = todos;
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err.message || 'Could not load tasks. Is the server running?';
        this.isLoading = false;
      }
    });
  }

  // ── Derived ────────────────────────────────────────────────────────

  get filteredTodos(): Todo[] {
    if (this.filter === 'active') return this.todos.filter(t => !t.completed);
    if (this.filter === 'done')   return this.todos.filter(t =>  t.completed);
    return this.todos;
  }

  get activeCount(): number    { return this.todos.filter(t => !t.completed).length; }
  get doneCount():   number    { return this.todos.filter(t =>  t.completed).length; }
  get panelVisible(): boolean  { return this.panelMode !== 'idle'; }

  get selectedTodo(): Todo | null {
    return this.todos.find(t => t.id === this.selectedId) ?? null;
  }

  // ── Filter ──────────────────────────────────────────────────────────

  setFilter(f: Filter): void {
    this.filter = f;
    if (this.selectedId && !this.filteredTodos.find(t => t.id === this.selectedId)) {
      this.closePanel();
    }
  }

  // ── Panel open/close ────────────────────────────────────────────────

  selectTodo(todo: Todo): void {
    if (this.deletingId === todo.id) return;
    this.selectedId  = todo.id;
    this.panelMode   = 'edit';
    this.panelTitle  = todo.title;
    this.panelNote   = todo.note ?? '';
    this.panelError  = '';
    this.panelDirty  = false;
    setTimeout(() => this.panelTitleInput?.nativeElement.focus(), 60);
  }

  openCreate(): void {
    this.selectedId  = null;
    this.panelMode   = 'create';
    this.panelTitle  = '';
    this.panelNote   = '';
    this.panelError  = '';
    this.panelDirty  = false;
    setTimeout(() => this.panelTitleInput?.nativeElement.focus(), 60);
  }

  closePanel(): void {
    if (this.isSaving) return;
    this.panelMode   = 'idle';
    this.selectedId  = null;
    this.panelDirty  = false;
    this.panelError  = '';
  }

  onPanelInput(): void {
    this.panelDirty = true;
    this.panelError = '';
  }

  // ── Save (create or update) ─────────────────────────────────────────

  savePanel(): void {
    const title = this.panelTitle.trim();
    if (!title)        { this.panelError = 'Please enter a title.'; return; }
    if (this.isSaving) return;

    this.isSaving   = true;
    this.panelError = '';

    if (this.panelMode === 'create') {
      this.todoService.create({
        title,
        note: this.panelNote.trim() || undefined
      }).subscribe({
        next: (created) => {
          this.todos.unshift(created);
          this.selectedId = created.id;
          this.panelMode  = 'edit';
          this.panelDirty = false;
          this.isSaving   = false;
        },
        error: (err) => {
          this.panelError = err.message;
          this.isSaving   = false;
        }
      });

    } else if (this.selectedId !== null) {
      this.todoService.update(this.selectedId, {
        title,
        note: this.panelNote.trim() || undefined
      }).subscribe({
        next: (updated) => {
          const idx = this.todos.findIndex(t => t.id === this.selectedId);
          if (idx > -1) this.todos[idx] = updated;
          this.panelDirty = false;
          this.isSaving   = false;
        },
        error: (err) => {
          this.panelError = err.message;
          this.isSaving   = false;
        }
      });
    }
  }

  // ── Toggle complete ─────────────────────────────────────────────────

  toggleComplete(todo: Todo, event: Event): void {
    event.stopPropagation();
    if (this.togglingId === todo.id) return; // debounce rapid clicks

    const prev         = todo.completed;
    todo.completed     = !prev;             // optimistic update
    this.togglingId    = todo.id;

    this.todoService.toggleComplete(todo.id, todo.completed).subscribe({
      next: (updated) => {
        const idx = this.todos.findIndex(t => t.id === todo.id);
        if (idx > -1) this.todos[idx] = updated;
        this.togglingId = null;
      },
      error: (err) => {
        todo.completed  = prev;             // rollback on failure
        this.togglingId = null;
        console.error('Toggle failed:', err.message);
      }
    });
  }

  // ── Delete ──────────────────────────────────────────────────────────

  confirmDelete(id: number | string, event: Event): void {
    event.stopPropagation();
    this.deletingId = id;
  }

  cancelDelete(event?: Event): void {
    event?.stopPropagation();
    this.deletingId = null;
  }

  deleteConfirmed(todo: Todo, event: Event): void {
    event.stopPropagation();
    if (this.deleteInProgress) return;
    this.deleteInProgress = true;

    this.todoService.delete(todo.id).subscribe({
      next: () => {
        this.todos = this.todos.filter(t => t.id !== todo.id);
        if (this.selectedId === todo.id) this.closePanel();
        this.deletingId       = null;
        this.deleteInProgress = false;
      },
      error: (err) => {
        this.deletingId       = null;
        this.deleteInProgress = false;
        console.error('Delete failed:', err.message);
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  formatDate(date?: string | Date): string {
    if (!date) return '';
    const d    = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000)          return 'Just now';
    if (diff < 3_600_000)       return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000)      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 7 * 86_400_000)  return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackById(_: number, todo: Todo): number | string { return todo.id; }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.deletingId)   { this.cancelDelete(); return; }
      if (this.panelVisible) { this.closePanel(); }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && this.panelVisible) {
      e.preventDefault();
      this.savePanel();
    }
  }
}
