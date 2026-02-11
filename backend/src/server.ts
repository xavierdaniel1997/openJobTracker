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


const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({
    origin: allowedOrigin,
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
