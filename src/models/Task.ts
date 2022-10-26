import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask {
    title: string;
    description: string;
    employeeId: Types.ObjectId;
    managerId: Types.ObjectId;
    status: string;
}

export interface ITaskModel extends ITask, Document {}

const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    status: { type: String, required: true }
});

export default mongoose.model<ITaskModel>('Task', TaskSchema);
