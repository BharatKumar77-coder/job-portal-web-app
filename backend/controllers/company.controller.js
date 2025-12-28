import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";


// For create company or register company
export const companyName = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required",
                success: false,
            });
        }

        //check if company already exists
        let company = await Company.findOne({ name: companyName, });
        if (company) {
            return res.status(400).json({
                message: "Company already exists",
                success: false,
            });
        }
        //create company
        company = await Company.create({
            name: companyName,
            userId: req.id
        });
        return res.status(201).json({
            message: "Company created successfully",
            company,
            success: true,
        });

    } catch (error) {
        console.log(error);
    }
};

// For get company details
export const getCompany = async (req, res) => {
    try {
        const userId = req.id;  // logged-in user id
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "No companies found for this user",
                success: false,
            });
        }
        return res.status(200).json({
            companies,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
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
        console.log(error);
    }
};

// Update company details
export const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name, description, website, location } = req.body;

    const updateData = { name, description, website, location };

    // Handle logo ONLY if file exists
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(
        fileUri.content,
        {
          folder: "company_logos",
        }
      );
      updateData.logo = cloudResponse.secure_url;
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

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

// Delete company
// export const deleteCompany = async (req, res) => {
//     try {
//         const companyId = req.params.id;
//         const company = await Company.findById(companyId);
//         if (!company) {
//             return res.status(404).json({
//                 message: "Company not found",
//                 success: false,
//             });
//         }
//         await company.remove();
//         return res.status(200).json({
//             message: "Company deleted successfully",
//             success: true,
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };