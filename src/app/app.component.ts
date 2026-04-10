import {
  Component, OnInit, ViewChild, ElementRef, HostListener
} from '@angular/core';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { Todo } from './todo.model';

// ── Mock placeholder data ──────────────────────────────────────────────
// TODO: Replace with TodoService.getAll() when the API is ready
const MOCK_TODOS: Todo[] = [
  {
    id: 1,
    title: 'Finalise Approach',
    note: 'Make decision on architecture as well',
    completed: false,
    createdAt: "2026-04-08T10:00:00Z",
    updatedAt: "2026-04-09T10:00:00Z",
  },
  {
    id: 2,
    title: 'Register for training',
    note: '',
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 5,
    title: 'Give demo',
    note: 'Present the design',
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 7,
    title: 'Set up meet',
    note: 'Discussion on security',
    completed: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
  },
];

let nextId = 100;

export type Filter    = 'all' | 'active' | 'done';
export type PanelMode = 'idle' | 'create' | 'edit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  filter: Filter = 'all';
  panelMode: PanelMode = 'idle';
  selectedId: number | string | null = null;

  panelTitle = '';
  panelNote  = '';
  panelError = '';
  panelDirty = false;

  deletingId: number | string | null = null;

  ngOnInit(): void {
    // TODO: GET Request for all tasks
    this.todos = [...MOCK_TODOS];
  }

  // ── Derived ────────────────────────────────────────────────────────

  get filteredTodos(): Todo[] {
    if (this.filter === 'active') return this.todos.filter(t => !t.completed);
    if (this.filter === 'done')   return this.todos.filter(t =>  t.completed);
    return this.todos;
  }

  get activeCount(): number { return this.todos.filter(t => !t.completed).length; }
  get doneCount():   number { return this.todos.filter(t =>  t.completed).length; }
  get panelVisible(): boolean { return this.panelMode !== 'idle'; }

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

  // ── Select / Panel ──────────────────────────────────────────────────

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
    this.panelMode  = 'idle';
    this.selectedId = null;
    this.panelDirty = false;
  }

  onPanelInput(): void {
    this.panelDirty = true;
    this.panelError = '';
  }

  // ── Save ────────────────────────────────────────────────────────────

  savePanel(): void {
    const title = this.panelTitle.trim();
    if (!title) { this.panelError = 'Please enter a title.'; return; }

    if (this.panelMode === 'create') {
      const created: Todo = {
        id: nextId++,
        title,
        note: this.panelNote.trim() || undefined,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // TODO: POST Request to save a new task
      this.todos.unshift(created);
      this.selectedId = created.id;
      this.panelMode  = 'edit';
      this.panelDirty = false;

    } else if (this.selectedId !== null) {
      const idx = this.todos.findIndex(t => t.id === this.selectedId);
      if (idx > -1) {
        // TODO: PUT request to update an existing task
        this.todos[idx] = {
          ...this.todos[idx],
          title,
          note: this.panelNote.trim() || undefined,
          updatedAt: new Date(),
        };
      }
      this.panelDirty = false;
    }
  }

  // ── Toggle ──────────────────────────────────────────────────────────

  toggleComplete(todo: Todo, event: Event): void {
    event.stopPropagation();
    // TODO: this.todoService.toggleComplete(todo.id, !todo.completed).subscribe(...);
    todo.completed  = !todo.completed;
    todo.updatedAt  = new Date();
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
    // TODO: DELETE request to delete a task
    this.todos = this.todos.filter(t => t.id !== todo.id);
    if (this.selectedId === todo.id) this.closePanel();
    this.deletingId = null;
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  formatDate(date?: string | Date): string {
    if (!date) return '';
    const d    = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000)         return 'Just now';
    if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000)     return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackById(_: number, todo: Todo): number | string { return todo.id; }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.deletingId) { this.cancelDelete(); return; }
      if (this.panelVisible) this.closePanel();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && this.panelVisible) {
      e.preventDefault();
      this.savePanel();
    }
  }
}
