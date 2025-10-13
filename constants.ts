
import { MenuItem, MenuCategory, User, UserRole } from './types';

// Menu items are now loaded from the database via API

export const CANTEEN_CONTEXT = `You are a friendly and helpful AI assistant for the Green University Canteen. Your knowledge base includes the menu, prices, ingredients, special offers, and opening hours. The canteen is open from 8 AM to 8 PM, Monday to Friday. Menu items are loaded dynamically from the database. Today's specials vary and are marked as special items. Always be polite and encourage students to eat healthily. Keep your answers concise and friendly, in the context of a Bangladeshi university canteen.`;

export const ADMIN_USER: User = {
    id: 1,
    email: 'admin@guc.edu',
    password: 'admin',
    role: UserRole.Admin,
    name: 'Admin User',
};

// Some initial users for demo
export const INITIAL_USERS: User[] = [
    ADMIN_USER,
    {
        id: 2,
        email: 'kitchen@guc.edu',
        password: 'kitchen',
        role: UserRole.Kitchen,
        name: 'Kitchen Staff 1',
    },
    {
        id: 3,
        email: 'student@guc.edu',
        password: 'student',
        role: UserRole.Student,
        name: 'Test Student',
        studentId: '201-15-12345'
    }
];
