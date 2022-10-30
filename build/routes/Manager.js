"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Manager_1 = __importDefault(require("../controllers/Manager"));
const { getAllManagers } = Manager_1.default;
const router = express_1.default.Router();
router.get('/all', getAllManagers);
exports.default = router;
