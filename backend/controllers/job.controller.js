import {Job} from "../models/job.model.js";

// For create job {recruiter}
export const createJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, position, experience, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !position || !companyId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        //create job
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary:Number( salary),
            experienceLevel:experience,
            location,
            jobType,
            position,
            company: companyId,
            createdBy: userId
        });
        return res.status(201).json({
            message: "Job created successfully", 
            job,
            success: true 
        });

    } catch (error) {
        console.error("Error creating job:", error);
        
    }
};

// For get all jobs {applicant}
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                {title: { $regex: keyword, $options: "i" }},
                {description: {$regex: keyword, $options: "i"}}
            ]
        };
        const jobs = await Job.find(query).populate({path:"company"}).sort({createdAt: -1});
        if(!jobs){
            return res.status(404).json({ message: "No jobs found", success: false });
        };
        return res.status(200).json({ jobs, success: true });
        
    } catch (error) {
        console.log(error);
    }
};

// For get job by id {applicant}
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if(!job){
            return res.status(404).json({ message: "Job not found", success: false });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
};

// get jobs by recruiter id {recruiter}
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ createdBy: adminId }).populate({
            path:'company',
            createdAt:-1
        })
        if(!jobs){
            return res.status(404).json({ message: "No jobs found", success: false });
        };
        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.log(error);
        
    }
}