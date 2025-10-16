import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  canteenName: {
    type: String,
    required: true,
    default: 'Green University Canteen'
  },
  logoUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  const settings = await mongoose.model('Settings').find();
  if (settings.length > 0 && !this._id) {
    const error = new Error('Only one settings document is allowed');
    return next(error);
  }
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
