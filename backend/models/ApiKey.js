const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  service: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['openai', 'google', 'azure', 'other']
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 필드 자동 갱신
ApiKeySchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
