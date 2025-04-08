const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  markdownContent: {
    type: String,
    required: false,
    default: ''
  },
  conversionMethod: {
    type: String,
    required: true
  },
  processingTime: {
    type: Number,
    required: true
  },
  originalUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
