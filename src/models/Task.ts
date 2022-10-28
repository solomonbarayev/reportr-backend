import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask {
    title: string;
    employeeId: Types.ObjectId;
    managerId: Types.ObjectId;
    dueDate: string;
    assignedDate: string;
}

export interface ITaskModel extends ITask, Document {}

const TaskSchema = new Schema({
    title: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    dueDate: { type: String, required: true },
    assignDate: { type: String, required: true, default: new Date().toISOString() }
});

export default mongoose.model<ITaskModel>('Task', TaskSchema);
