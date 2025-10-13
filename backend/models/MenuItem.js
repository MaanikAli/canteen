import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Main Course', 'Snacks', 'Dessert', 'Drinks'],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
