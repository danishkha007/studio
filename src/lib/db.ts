'use server';
import mysql from 'mysql2/promise';

// --- IMPORTANT ---
// Database connection details are read from environment variables
// for security. Create a `.env.local` file in your project root
// and add your credentials there.
// See `.env.local.example` for a template.
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'admin',
    password: process.env.MYSQL_PASSWORD || 'admin',
    database: process.env.MYSQL_DATABASE || 'tmdb_movies_db',
    //waitForConnections: true,
    //connectionLimit: 10,
    //queueLimit: 0
};

let connection: mysql.Connection | null = null;

export async function getConnection() {
    if (connection && connection.connection.stream.readable) {
        return connection;
    }
    try {
        const newConnection = await mysql.createConnection(dbConfig);
        console.log("New DB connection established.");
        connection = newConnection;
        return connection;
    } catch(error) {
        console.error("Failed to create DB connection:", error);
        throw new Error("Could not connect to the database.");
    }
}

export async function query(sql: string, values: any[] = []) {
     const db = await getConnection();
     try {
        const [results] = await db.execute(sql, values);
        return results;
     } catch (error) {
        console.error("Database query failed:", error);
        // In a real app, you would have more robust error handling and logging
        // Forcing re-connection on next query in case connection is stale
        connection = null;
        throw new Error("Database query failed.");
     }
}
