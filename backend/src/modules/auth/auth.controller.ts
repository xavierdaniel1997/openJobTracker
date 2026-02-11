import { Request, Response } from "express";
// import { AuthService } from "./auth.service";



export const registerController = async (req: Request, res: Response): Promise<any> => {
    try {
        console.log("Client Data:", req.body);
        // const user = await authService.register(req.body);
        return res.status(201).json({ message: "User registered successfully!", user: {name: "Joel", email: "[EMAIL_ADDRESS]"} });
    } catch (error: any) {
        console.error("Registration Error:", error);
        return res.status(400).json({ message: "Failed to register", error: error.message });
    }
}  