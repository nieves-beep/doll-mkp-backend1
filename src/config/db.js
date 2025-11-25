import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectMongoDB = async () => {
    try {
        console.log("Intentando conectar a:", process.env.STRING_MONGODB);

        await mongoose.connect(process.env.STRING_MONGODB);

        console.log("🟢 Conectado correctamente a MongoDB");
    } catch (error) {
        console.error("🔴 Error al conectar con MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectMongoDB;
