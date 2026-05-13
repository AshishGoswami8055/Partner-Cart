import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    lastMessage: {
      body: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: Date,
    },
    unread: {
      customer: { type: Number, default: 0 },
      vendor: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

conversationSchema.index({ customer: 1, vendor: 1 }, { unique: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);
