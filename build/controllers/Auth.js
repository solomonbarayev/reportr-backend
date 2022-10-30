"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config/config");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee_1 = __importDefault(require("../models/Employee"));
const login = (req, res, next) => {
    const { email, password } = req.body;
    return Employee_1.default.findOne({ email })
        .select('+password')
        .then((user) => {
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        return bcrypt.compare(password, user.password).then((match) => {
            if (!match) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const token = jwt.sign({ _id: user._id }, config_1.config.jwtSecret, { expiresIn: '7d' });
            // make object from user with everything except password
            const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
            // return token and user without password
            return res.status(200).json({ token, user: userWithoutPassword });
        });
    })
        .catch((err) => {
        return res.status(500).json({ error: 'Something went wrong.' });
    });
};
exports.default = login;
