import { Request, Response } from "express";
import { IUser } from "../types/user";
import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../utils/cloudinary";
import jwt from "jsonwebtoken";



const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body as IUser;

        const avatar = req.file?.path;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.', data: null, success: false });
        }
        const existedUser = await prisma.user.findUnique({ where: { email } });
        if (existedUser) {
            return res.status(409).json({ message: 'User with this email already exists.', data: null });
        }

        let cloudinaryUrl = "";

        if (avatar) {
            cloudinaryUrl = await uploadOnCloudinary(avatar) || "";
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                avatar: cloudinaryUrl
            }
        });

        if (!user) {
            return res.status(500).json({ message: 'Error creating user.', data: null, success: false });
        }

        return res.status(201).json({ message: 'User registered successfully.', data: user, success: true });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error.', data: null, success: false });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required", data: null, success: false });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found", data: null, success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password", data: null, success: false });
        }

        const token = jwt.sign(
            { userId: Number(user.id), email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN as string }
        );

        return res.status(200).json({
            message: "Login successful",
            data: { token },
            success: true
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false
        });
    }
};
const logout = async(req:Request,res:Response)=>{
    try {
        return res.status(200).json(
            {
                message:"Logout successful",
                success:true,
                data:null
            });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null,
            success: false
        });
    }
}

export { registerUser, loginUser, logout };
