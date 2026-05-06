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

export type View = 'dashboard' | 'categories' | 'sales' | 'inventory' | 'orders';

export type ModalType = 'addCategory' | 'addSubcategory' | 'addProduct' | 'sellProduct' | 'addStock' | null;

export type OrderItem = {
  productId: string;
  productName: string;
  unitPrice: number;   // selling price per unit
  costPrice: number;   // purchase price per unit
  quantity: number;
  subtotal: number;    // unitPrice * quantity
  profit: number;      // (unitPrice - costPrice) * quantity
};

export type ShopOrder = {
  id: string;
  shopName: string;
  items: OrderItem[];
  totalPrice: number;
  totalProfit: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isArchived: boolean;
};
