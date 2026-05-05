import { Category } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat1',
    name: 'More',
    icon: '📦',
    subcategories: [],
  },
  {
    id: 'cat2',
    name: 'Friendz',
    icon: '🍪',
    subcategories: [
      { id: 'sub1', name: 'Vanilla', icon: '🌾', products: [] },
      { id: 'sub2', name: 'Strawberry', icon: '🍓', products: [] },
      { id: 'sub3', name: 'Lemon', icon: '🍋', products: [] },
    ],
  },
  {
    id: 'cat3',
    name: 'Any Time',
    icon: '⏰',
    subcategories: [],
  },
  {
    id: 'cat4',
    name: 'Chocofer',
    icon: '🍫',
    subcategories: [],
  },
  {
    id: 'cat5',
    name: 'Aktive',
    icon: '⚡',
    subcategories: [],
  },
  {
    id: 'cat6',
    name: 'Butter Maza',
    icon: '🧈',
    subcategories: [],
  },
  {
    id: 'cat7',
    name: 'Peanut Bite',
    icon: '🥜',
    subcategories: [],
  },
  {
    id: 'cat8',
    name: 'Zeera Club',
    icon: '🌿',
    subcategories: [],
  },
  {
    id: 'cat9',
    name: 'Chip Dip',
    icon: '🍟',
    subcategories: [],
  },
  {
    id: 'cat10',
    name: 'Vittles',
    icon: '🎁',
    subcategories: [
      { id: 'sub4', name: 'Chocolate', icon: '🍫', products: [] },
      { id: 'sub5', name: 'Classic', icon: '🎨', products: [] },
    ],
  },
  {
    id: 'cat11',
    name: 'Nimko',
    icon: '🌶️',
    subcategories: [],
  },
  {
    id: 'cat12',
    name: 'Choco Love',
    icon: '❤️',
    subcategories: [],
  },
];
