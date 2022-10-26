import dotenv from 'dotenv';
dotenv.config();

const MONGO_DB = process.env.MONGO_DB || 'mongodb://localhost:27017/reportrDB';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

export const config: {
    MONGO_DB: string;
    PORT: number;
} = {
    MONGO_DB,
    PORT
};
