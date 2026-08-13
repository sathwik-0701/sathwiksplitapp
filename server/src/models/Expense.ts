import mongoose, { Document, Schema, Types } from 'mongoose';

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface IParticipant {
  user: Types.ObjectId;
  amountOwed: number; // Stored in paise (integer)
  shareValue?: number; // Optional metadata for percentage/shares
}

export interface IExpense extends Document {
  groupId: Types.ObjectId;
  description: string;
  amount: number; // Stored in paise (integer: e.g. 10050 paise = ₹100.50)
  paidBy: Types.ObjectId;
  participants: IParticipant[];
  splitType: SplitType;
  date: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountOwed: {
      type: Number,
      required: true,
      min: 0,
    },
    shareValue: {
      type: Number,
      default: undefined,
    },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Expense description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount in paise is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: {
      type: [ParticipantSchema],
      required: true,
      validate: {
        validator: function (v: IParticipant[]) {
          return v.length > 0;
        },
        message: 'At least one participant is required',
      },
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage', 'shares'],
      default: 'equal',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.index({ groupId: 1, createdAt: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
