export enum UserRole {
  Student = "student",
  Faculty = "faculty",
  Others = "others",
  Kitchen = "kitchen",
  Admin = "admin",
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  studentId?: string; // Only for students
}

export enum MenuCategory {
  MainCourse = "Main Course",
  Snacks = "Snacks",
  Dessert = "Dessert",
  Drinks = "Drinks",
}

export interface MenuItem {
  id: string; // Changed from number to string to match MongoDB _id
  _id?: string; // MongoDB ObjectId
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  isSpecial?: boolean;
  stockQuantity?: number;
  discountPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed';
  timestamp: string;
  otp?: string;
}
