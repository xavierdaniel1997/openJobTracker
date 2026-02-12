import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middleware/auth.middleware";



export const registerController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log("Client Data:", req.body); 
    const result = await AuthService.register(req.body);

    return res.status(201).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};
  
export const loginController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await AuthService.login(req.body);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Login failed",
    });
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.body;
    const result = await AuthService.refreshToken(token);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(403).json({
      message: error.message || "Token refresh failed",
    });
  }
};

export const getCurrentUserController = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await AuthService.getCurrentUser(req.userId);

    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(404).json({
      message: error.message || "User not found",
    });
  }
};
