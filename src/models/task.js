const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      // Type is an object and use it on mongoose
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
