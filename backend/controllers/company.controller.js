import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// ================= CREATE COMPANY =================
export const companyName = async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required",
                success: false,
            });
        }

        const existingCompany = await Company.findOne({ name: companyName });
        if (existingCompany) {
            return res.status(400).json({
                message: "Company already exists",
                success: false,
            });
        }

        const company = await Company.create({
            name: companyName,
            userId: req.id,
        });

        return res.status(201).json({
            message: "Company created successfully",
            company,
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};

// ================= GET COMPANIES =================
export const getCompany = async (req, res) => {
    try {
        const companies = await Company.find({ userId: req.id });

        return res.status(200).json({
            companies,
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};

// ================= GET COMPANY BY ID =================
export const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false,
            });
        }

        return res.status(200).json({
            company,
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};

// ================= UPDATE COMPANY =================
export const updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const { name, description, website, location } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false,
            });
        }

        // Update text fields
        company.name = name || company.name;
        company.description = description || company.description;
        company.website = website || company.website;
        company.location = location || company.location;

        // ✅ CORRECT WAY TO GET LOGO FILE
        const logoFile = req.files?.find(
            file =>
                file.fieldname === "logo" ||
                file.fieldname === "file"
        );

        if (logoFile) {
            const fileUri = getDataUri(logoFile);

            const uploadRes = await cloudinary.uploader.upload(
                fileUri.content,
                {
                    folder: "company_logos",
                }
            );

            company.logo = uploadRes.secure_url;
            company.logoPublicId = uploadRes.public_id;
        }

        await company.save();

        return res.status(200).json({
            message: "Company updated successfully",
            company,
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};
