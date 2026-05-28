import { Schema, model, Document, Types } from 'mongoose'

export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'completed'

export interface ITask extends Document {
  _id: Types.ObjectId
  title: string
  description: string
  priority: Priority
  dueDate: string
  status: TaskStatus
  order: number
  userId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: String,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    order: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

taskSchema.index({ userId: 1, order: 1 })

taskSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id?.toString()
    ret.userId = ret.userId?.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

const Task = model<ITask>('Task', taskSchema)
export default Task
