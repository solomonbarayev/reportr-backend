//make manager extend from employee and add the manager specific fields
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IManager {
    mySubordinates: Types.ObjectId[];
    myReports: Types.ObjectId[];
}

export interface IManagerModel extends IManager, Document {}

const ManagerSchema = new Schema({
    mySubordinates: { type: [mongoose.Schema.Types.ObjectId], required: false, ref: 'Employee', default: [] },
    myReports: { type: [mongoose.Schema.Types.ObjectId], required: false, ref: 'Report', default: [] }
});

export default mongoose.model<IManagerModel>('Manager', ManagerSchema);
