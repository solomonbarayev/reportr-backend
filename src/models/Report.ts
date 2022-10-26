import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReport {
    text: string;
    date: string;
    employeeId: [Types.ObjectId];
    managerId: [Types.ObjectId];
}

export interface IReportModel extends IReport, Document {}

const ReportSchema = new Schema({
    text: { type: String, required: true },
    date: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' }
});

export default mongoose.model<IReportModel>('Report', ReportSchema);
