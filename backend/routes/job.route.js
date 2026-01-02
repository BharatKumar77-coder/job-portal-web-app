import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getAdminJobs
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

//PUBLIC ROUTES
router.get("/get", getAllJobs);
router.get("/get/:id", getJobById);

//PROTECTED ROUTES
router.post("/post", isAuthenticated, createJob);
router.get("/getadminjobs", isAuthenticated, getAdminJobs);

export default router;
