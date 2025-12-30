import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import axios from "axios";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ CORRECT WAY TO GET PROFILE PHOTO
        const profilePhotoFile = req.files?.find(
            file => file.fieldname === "profilePhoto" || file.fieldname === "file"
        );


        let profilePhotoUrl = "";

        if (profilePhotoFile) {
            const fileUri = getDataUri(profilePhotoFile);
            const uploadRes = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = uploadRes.secure_url;
        }

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl
            }
        });

        return res.status(201).json({
            message: "User registered successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Incorrect email or password", success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({ message: "Incorrect email or password", success: false });
        }

        if (user.role !== role) {
            return res.status(403).json({ message: "Role mismatch", success: false });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        const isProduction = process.env.NODE_ENV === "production";
        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                // LOGIC: If production, use 'none' (for Vercel connection). 
                // If local, use 'lax' (standard browser behavior).
                sameSite: isProduction ? 'none' : 'lax',
                secure: isProduction
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true,
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
    return res
        .cookie("token", "", { maxAge: 0 })
        .status(200)
        .json({ message: "Logout successful", success: true });
};

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const user = await User.findById(req.id);

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.profile.bio = bio || user.profile.bio;
        user.profile.skills = skills ? skills.split(",") : user.profile.skills;

        // ✅ CORRECT WAY TO GET RESUME
        const resumeFile = req.files?.find(
            file => file.fieldname === "resume" || file.fieldname === "file"
        );


        if (resumeFile) {
            const fileUri = getDataUri(resumeFile);
            const uploadRes = await cloudinary.uploader.upload(
                fileUri.content,
                { resource_type: "raw", folder: "resumes" }
            );

            user.profile.resume = uploadRes.secure_url;
            user.profile.resumePublicId = uploadRes.public_id;
            user.profile.resumeOriginalName = resumeFile.originalname;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};

export const downloadResume = async (req, res) => {
    try {
        const user = await User.findById(req.id);

        if (!user || !user.profile?.resume) {
            return res.status(404).json({
                message: "Resume not found",
                success: false
            });
        }

        // Fetch resume from Cloudinary as stream
        const response = await axios.get(user.profile.resume, {
            responseType: "stream"
        });

        // ✅ Force correct PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${user.profile.resumeOriginalName || "resume.pdf"}"`
        );

        // Pipe file stream to browser
        response.data.pipe(res);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to download resume",
            success: false
        });
    }
};