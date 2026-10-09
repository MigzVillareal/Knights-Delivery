import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(corse({
    origin: "http://localhost:3000",
    methods: "GET, POST, PATCH, PUT, DELETE",
    credentials: true,
}));

