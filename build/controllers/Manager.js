"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Manager_1 = __importDefault(require("../models/Manager"));
const getAllManagers = (req, res, next) => {
    Manager_1.default.find()
        .then((managers) => {
        return res.status(200).json(managers);
    })
        .catch((err) => {
        return next(err);
    });
};
exports.default = { getAllManagers };
