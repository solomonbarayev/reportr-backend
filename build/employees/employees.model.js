"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const validator = require('validator');
const employeeSchema = new mongoose_1.Schema({
    picture: { type: String, required: true, default: 'https://pictures.s3.yandex.net/resources/avatar_1604080799.jpg' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    position: { type: String, required: true },
    managerId: { type: mongoose_1.default.Schema.Types.ObjectId, required: false, ref: 'Employee', default: null },
    myTasks: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false, ref: 'Task', default: [] },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => validator.isEmail(v),
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
const employeeModel = mongoose_1.default.model('Employee', employeeSchema);
exports.default = employeeModel;
