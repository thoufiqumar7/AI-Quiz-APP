const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      index: true,
    },
    topic: {
      type: String,
      trim: true,
      default: 'General',
      index: true,
      maxlength: 120,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 500,
    },
    normalizedQuestion: {
      type: String,
      required: true,
      select: false,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2 && value.length <= 6;
        },
        message: 'Question must include 2 to 6 options.',
      },
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

questionSchema.pre('validate', function preValidate(next) {
  if (this.question) {
    this.normalizedQuestion = this.question.trim().toLowerCase();
  }

  if (Array.isArray(this.options)) {
    this.options = this.options.map((option) => option.trim());
  }

  if (this.answer) {
    this.answer = this.answer.trim();
  }

  if (this.topic) {
    this.topic = this.topic.trim();
  }

  next();
});

questionSchema.path('answer').validate(function answerInOptions(answer) {
  return this.options?.includes(answer);
}, 'Answer must exist in options list.');

questionSchema.index({ category: 1, difficulty: 1, normalizedQuestion: 1 }, { unique: true });
questionSchema.index({ category: 1, difficulty: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);
