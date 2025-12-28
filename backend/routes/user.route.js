import express from "express";
import { register, login, logout, updateProfile, viewResume } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";



const router = express.Router();

router.route("/register").post(singleUpload,register); 
router.route("/login").post(login); 
router.route("/updateProfile").post(isAuthenticated,singleUpload, updateProfile); 
router.route("/logout").get(logout); 
router.route("/resume").get(viewResume);

export default router;