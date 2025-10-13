import request from 'supertest';
import app from '../server.js'; // Assuming your express app is exported from server.js
import mongoose from 'mongoose';

let token;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/canteen_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Register an admin user
  const resRegister = await request(app)
    .post('/api/users/register')
    .send({
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      name: 'Admin User'
    });
  token = resRegister.body.token;
});

afterAll(async () => {
  // Clean up database and close connection
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('User API', () => {
  test('Get users with admin token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Delete user', async () => {
    // Create a user to delete
    const resCreate = await request(app)
      .post('/api/users/register')
      .send({
        email: 'user@test.com',
        password: 'password123',
        role: 'kitchen',
        name: 'Kitchen User'
      });
    const userId = resCreate.body.user.id;

    const resDelete = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body.message).toBe('User deleted');
  });
});

describe('Menu API', () => {
  let menuItemId;

  test('Create menu item', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Item',
        description: 'Test Description',
        price: 100,
        category: 'Main Course',
        imageUrl: 'https://picsum.photos/400/300',
        stockQuantity: 10,
        discountPercent: 5
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Item');
    menuItemId = res.body._id;
  });

  test('Update menu item', async () => {
    const res = await request(app)
      .put(`/api/menu/${menuItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        price: 120
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(120);
  });

  test('Delete menu item', async () => {
    const res = await request(app)
      .delete(`/api/menu/${menuItemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Menu item deleted');
  });
});
