export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  status: 'all' | 'pending' | 'completed';
  categoryId?: string;
  searchTerm?: string;
}
