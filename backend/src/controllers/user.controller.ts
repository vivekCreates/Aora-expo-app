import { Request, Response } from "express";
import { IUser } from "../types/user";
import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../utils/cloudinary";
import jwt from "jsonwebtoken";

const registerUser = async (req:Request, res:Response) => {
    try {
        const { username, email, password } = req.body as IUser;

        const avatar = req.file?.path;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.',data:null,success:false });
        }
        const existedUser = await prisma.user.findUnique({ where: { email } });
        if (existedUser) {
            return res.status(409).json({ message: 'User with this email already exists.',data:null });
        }

        let cloudinaryUrl = "";

        if(avatar){
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

        if(!user){
            return res.status(500).json({ message: 'Error creating user.',data:null,success:false });
        }
        
        return res.status(201).json({ message: 'User registered successfully.', data:user,success:true });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error.',data:null,success:false });
    }
};


