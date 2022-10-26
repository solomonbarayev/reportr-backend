//make manager extend from employee and add the manager specific fields
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IEmployee } from './Employee';

export interface IManager extends IEmployee {
    mySubordinates: Types.ObjectId[];
    managerId: Types.ObjectId;
    reports: Types.ObjectId[];
}

export interface IManagerModel extends IManager, Document {}

const ManagerSchema = new Schema({
    mySubordinates: { type: [mongoose.Schema.Types.ObjectId], required: false, ref: 'Employee', default: [] },
    reports: { type: [mongoose.Schema.Types.ObjectId], required: false, ref: 'Report' }
});

export default mongoose.model<IManagerModel>('Manager', ManagerSchema);
