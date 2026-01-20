import {Application} from "../models/application.model.js";
import {Job} from "../models/job.model.js";
import axios from "axios";
import { User } from "../models/user.model.js";


export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if(!jobId){
            return res.status(400).json({ message: "Job ID is required", success: false });
        };

        // Check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job", success: false });
        }

        //check if job exists
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({ message: "Job not found", success: false });
        }

        // Create a new application
        const application = await Application.create({
            job: jobId,
            applicant: userId,
        });

        // Add application to job's applications array
        job.applications.push(application._id);
        await job.save();

        return res.status(201).json({
            message: "Application submitted successfully",
            application,
            success: true
        });

    } catch (error) {
        console.log();
        
    }
};

//get applied jobs for a user
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const applications = await Application.find({ applicant: userId }).populate({
            path:'job',
            options:{ sort: { createdAt: -1 } },
            populate:{
                path:'company',
                options:{ sort: { createdAt: -1 } },
            }
        });
        if(!applications){
            return res.status(404).json({ 
            message: "No applied jobs found", 
            success: false });
        }
        
        return res.status(200).json({
            applications,
            success: true
        });
    } catch (error) {
        console.log();
    }
};


//get applications for a job (admin check how many applications received for a job)
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:'applications',
            options:{ sort: { createdAt: -1 } },
            populate:{
                path:'applicant',
                options:{ sort: { createdAt: -1 } },
            }
        });
        if(!job){
            return res.status(404).json({ 
            message: "Job not found", 
            success: false });
        };
        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.log();
    }
};

//update application status (admin can update status of application)
export const updateStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;

        if(!status){
            return res.status(400).json({ 
                message: "Status is required", 
                success: false });
        };

        //find application by application id
        const application = await Application.findOne({ _id: applicationId });
        if(!application){
            return res.status(404).json({ 
            message: "Application not found", 
            success: false });
        };

        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Application status updated successfully",
            application,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};

// downloadApplicantResume
export const downloadApplicantResume = async (req, res) => {
    try {
        const { applicantId } = req.params;

        const user = await User.findById(applicantId);

        if (!user || !user.profile?.resume) {
            return res.status(404).send("Resume not found");
        }

        const response = await axios.get(user.profile.resume, {
            responseType: "stream",
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${user.profile.resumeOriginalName || "resume.pdf"}"`
        );

        response.data.pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).send("Download failed");
    }
};