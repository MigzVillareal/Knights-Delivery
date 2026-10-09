import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { 
        type: String, required: [true, 'Username is required'] },
    password: { 
        type: String, required: [true, 'Password is required'] },
    role: { 
        type: String, enum: ['user', 'courier'], default: 'user' }
}, { timestamps: true })