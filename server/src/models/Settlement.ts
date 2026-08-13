import mongoose, { Document, Schema, Types } from 'mongoose';

export type SettlementStatus = 'completed' | 'pending';

export interface ISettlement extends Document {
  groupId: Types.ObjectId;
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amount: number; // Stored in paise (integer)
  status: SettlementStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Settlement amount must be positive'],
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

SettlementSchema.index({ groupId: 1, createdAt: -1 });

export const Settlement = mongoose.model<ISettlement>('Settlement', SettlementSchema);
