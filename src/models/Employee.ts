import mongoose, { Document, Schema, Types } from 'mongoose';
const validator = require('validator');

export interface IEmployee {
    picture: string;
    name: string;
    position: string;
    managerId?: Types.ObjectId;
    myTasks: [Types.ObjectId];
    password: string;
    email: string;
}

export interface IEmployeeModel extends IEmployee, Document {}

const EmployeeSchema = new Schema({
    picture: { type: String, required: true, default: 'https://pictures.s3.yandex.net/resources/avatar_1604080799.jpg' },
    name: { type: String, required: true, default: 'New Employee' },
    position: { type: String, required: true, default: 'New position' },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Employee', default: null },
    myTasks: { type: [mongoose.Schema.Types.ObjectId], required: false, ref: 'Task', default: [] },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v: string) => validator.isEmail(v),
            message: 'Valid email is required'
        }
    },
    password: {
        type: String,
        required: true,
        select: false
    }
});

export default mongoose.model<IEmployeeModel>('Employee', EmployeeSchema);
