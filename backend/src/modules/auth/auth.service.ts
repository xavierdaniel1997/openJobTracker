
import bcrypt from "bcrypt";
import prisma from "../../config/db"; 
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.util";

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterInput) {
    const { email, password, name } = data;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    return {
      user,
      accessToken,
      refreshToken,
      isNewUser: true,
    };
  }

  static async login(data: LoginInput) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }
  
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token: string) {
    if (!token) {
      throw new Error("Refresh token is required");
    }

    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
