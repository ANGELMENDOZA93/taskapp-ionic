export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Personal', color: '#4CAF50', icon: 'person-outline' },
  { name: 'Trabajo', color: '#2196F3', icon: 'briefcase-outline' },
  { name: 'Salud', color: '#F44336', icon: 'heart-outline' },
];

export const CATEGORY_COLORS: string[] = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFC107', '#FF9800', '#FF5722', '#795548',
];

export const CATEGORY_ICONS: string[] = [
  'person-outline', 'briefcase-outline', 'heart-outline',
  'cart-outline', 'book-outline', 'school-outline',
  'home-outline', 'car-outline', 'airplane-outline',
  'fitness-outline', 'restaurant-outline', 'musical-notes-outline',
  'game-controller-outline', 'code-outline', 'star-outline',
  'flag-outline',
];
