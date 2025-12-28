import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import axios from 'axios';


//For register new user
export const register = async (req, res) => {
    try {
        // get all data from body(user input)
        const { fullname, email, phoneNumber, password, role } = req.body;
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        // check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exists",
                success: false,
            });
        }

        // convert password to hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

// For login user
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        // check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(404).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        // check role
        if (user.role !== role) {
            return res.status(403).json({
                message: "Account doesn't exists with this role",
                success: false,
            });
        }

        // generate JWT token
        const tokenData = {
            userId: user._id,
        }

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true,
        });
    } catch (error) {
        console.log(error);

    }
};


// For logout user
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logout successful",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

// update user profile data 
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const userId = req.id; // from auth middleware
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // ✅ Update text fields safely
        user.profile.bio = bio || user.profile.bio;
        user.profile.skills = skills ? skills.split(",") : user.profile.skills;
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        // ✅ Upload resume ONLY if file exists
        if (req.file) {
            const fileUri = getDataUri(req.file);

            // remove extension & sanitize name
            const originalName = req.file.originalname
                .replace(/\.[^/.]+$/, "")
                .replace(/\s+/g, "_");

            const cloudResponse = await cloudinary.uploader.upload(
                fileUri.content,
                {
                    resource_type: "image", // ✅ PDFs open publicly
                    folder: "resumes",
                    format: "pdf",  
                    public_id: `${Date.now()}-${originalName}`,
                }
            );

            user.profile.resumePublicId = cloudResponse.public_id;
            user.profile.resumeOriginalName = req.file.originalname;
            user.profile.resume = cloudResponse.secure_url; // ⭐ IMPORTANT
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};

export const viewResume = async (req, res) => {
  try {
    const userId = req.id; // ✅ from auth middleware

    const user = await User.findById(userId);

    if (!user || !user.profile.resume) {
      return res.status(404).send("Resume not found");
    }

    return res.redirect(user.profile.resume);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
};

