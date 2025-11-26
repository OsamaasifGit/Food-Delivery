import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://usamaasif78618:M1234osama@cluster0.wcaxsz7.mongodb.net/food-del').then(()=>console.log("MongoDB Connected"));
}