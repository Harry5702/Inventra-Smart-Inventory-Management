export type Product = {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
};


export type Subcategory = {
  id: string;
  name: string;
  icon?: string;
  products: Product[];
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
  subcategories: Subcategory[];
};

export type View = 'dashboard' | 'categories' | 'sales' | 'inventory';

export type ModalType = 'addCategory' | 'addSubcategory' | 'addProduct' | 'sellProduct' | 'addStock' | null;
