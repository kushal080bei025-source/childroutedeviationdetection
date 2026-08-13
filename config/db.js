const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Force Mongoose to throw an error immediately if a query runs before connecting
        mongoose.set('bufferCommands', false); 

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};


module.exports = connectDB;