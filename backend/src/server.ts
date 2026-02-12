import "dotenv/config";
import express from "express";
import {Application, Request, Response} from "express";
import apiRoutes from "./routes/api.routes";
import { connectDB } from "./config/db";
import cors from "cors";



const app: Application = express();

const PORT : Number = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const allowedOrigin = process.env.CLIENT_ORIGIN;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        
        // Check against allowed origin (from env)
        if (allowedOrigin && origin === allowedOrigin) {
            return callback(null, true);
        }
        
        // Allow chrome extensions
        if (origin.startsWith('chrome-extension://')) {
            return callback(null, true);
        }
        
        // In dev, maybe allow localhost:3000 explicitly if env is missing
        if (origin.includes('localhost')) {
             return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));



app.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Welcome to the Open Job Tracker API!"});
});

app.use("/api", apiRoutes);



const startServer = async () => {
  await connectDB(); 

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer()
