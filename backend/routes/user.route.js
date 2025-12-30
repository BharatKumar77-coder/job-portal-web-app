import express from "express";
import {
    register,
    login,
    logout,
    updateProfile,
    downloadResume
} from "../controllers/user.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Register
router.route("/register").post(upload.any(), register);

// Login
router.route("/login").post(login);

// Update profile (resume re-upload FIXED here)
router.route("/updateProfile").post(
    isAuthenticated,
    upload.any(),
    updateProfile
);

router.route("/resume/download").get(isAuthenticated, downloadResume);

// Logout
router.route("/logout").get(logout);

export default router;

