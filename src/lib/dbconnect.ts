import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to database.");
        return;        
    }

    try {

        const MONGODB_URL = process.env.MONGODB_URL as string;


        const db = await mongoose.connect(MONGODB_URL || '', {});

        connection.isConnected = db.connections[0].readyState;

        console.log('Db Connected Successfully');        
        
    } catch (error) {
        console.log('Database connection failed', error);
        process.exit(1);
        
    }
}

export default dbConnect; 