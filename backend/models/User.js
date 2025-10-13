import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'kitchen', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
