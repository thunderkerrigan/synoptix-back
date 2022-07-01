import { connect, Connection, connection } from "mongoose";

let db: Connection;

export const loadDatabase = async (): Promise<void> => {
  if (db && db.readyState !== 0) {
    return;
  }
  connect(process.env.MONGO_DB_HOST, {
    user: process.env.MONGO_DB_USER,
    dbName: process.env.MONGO_DB_DATABASE,
    pass: process.env.MONGO_DB_PASS,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  });
  db = await connection.asPromise();
  console.log("connected to database");
};
