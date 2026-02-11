
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
    async register(data: any) {
        const {email, password, name} = data;

        // check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            throw new Error("User already exists");
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        const {password: _, ...userWithoutPassword} = user;


        return userWithoutPassword;
    }
}
