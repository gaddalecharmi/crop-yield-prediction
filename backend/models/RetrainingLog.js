const mongoose = require('mongoose');

const retrainingLogSchema = new mongoose.Schema({
  retrain_date: {
    type: Date,
    default: Date.now
  },
  model_version: {
    type: String,
    required: true
  },
  dataset_size: {
    type: Number,
    required: true
  },
  metrics: {
    mse: {
      type: Number,
      required: true
    },
    rmse: {
      type: Number,
      required: true
    },
    r2_score: {
      type: Number,
      required: true
    },
    train_score: {
      type: Number,
      required: true
    },
    test_score: {
      type: Number,
      required: true
    }
  },
  training_duration_seconds: {
    type: Number,
    required: true
  },
  data_summary: {
    total_records: Number,
    new_predictions_count: Number,
    date_range: {
      start: Date,
      end: Date
    }
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'in_progress'],
    default: 'success'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
retrainingLogSchema.index({ retrain_date: -1 });
retrainingLogSchema.index({ status: 1 });

module.exports = mongoose.model('RetrainingLog', retrainingLogSchema);
