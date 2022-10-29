import mongoose, { Document, Schema, Types } from 'mongoose';
import Employee from '../controllers/Employee';
const validator = require('validator');
const bcrypt = require('bcryptjs');

export interface IEmployee {
    picture: string;
    firstName: string;
    lastName: string;
    position: string;
    managerId?: Types.ObjectId;
    myTasks: [Types.ObjectId];
    password: string;
    email: string;
    // mySubordinates: [Types.ObjectId];
    isManager: boolean;
    // myReports: [Types.ObjectId];
}

export interface IEmployeeModel extends IEmployee, Document {}

const EmployeeSchema = new Schema<IEmployee, IEmployeeModel>({
    picture: { type: String, required: true, default: 'https://pictures.s3.yandex.net/resources/avatar_1604080799.jpg' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
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
    },
    isManager: { type: Boolean, required: true, default: false }
});

export default mongoose.model<IEmployeeModel>('Employee', EmployeeSchema);
