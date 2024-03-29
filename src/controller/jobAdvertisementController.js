import cron from "node-cron";
import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/user.js";
import AdminModel from "../model/admin.js";
import jobAdvertisementModel from "../model/jobAdvertisement.js";
import * as filterService from  "../services/filterService.js";
import * as sortService from "../services/sortService.js";

const app = express();

const addJobAdvertisement = async (req, res) => {
  try {
    const {
      quota,
      token,
      status,
      company,
      location,
      workType,
      postedAt,
      positionName,
      jobDescription,
      qualifications,
      employmentType,
      applicationDeadline,
    } = req.body;

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    var ik = await UserModel.findById(decodedToken.userId);
    !ik ? (ik = await AdminModel.findById(decodedToken.userId)) : (ik = ik);

    const newJobAdvertisement = new jobAdvertisementModel({
      quota: quota,
      status: status,
      company: company,
      location: location,
      workType: workType,
      postedAt: postedAt,
      contactEmail: ik.email,
      contactPhone: ik.phone,
      positionName: positionName,
      jobDescription: jobDescription,
      qualifications: qualifications,
      employmentType: employmentType,
      applicationDeadline: applicationDeadline,
    });
    await newJobAdvertisement.save();

    res.json({ success: true, message: "İş ilanı başarıyla eklenmiştir." });
  } catch (error) {
    res.json({success: false,message: "Bir hata oluştu. İş ilanı eklenemedi."});
  }
};

const listJobAdvertisement = async (req, res) => {
  try {
    const {filteringConditions,searchText,sortConditions, pageNumber, pageSize}=req.body;
    const combinedFilter = filterService.buildFilters(filteringConditions,searchText,"positionName")

    const totalCount = await jobAdvertisementModel.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalCount / pageSize);

    let jobAdvertisements

    if(sortConditions){

      const sortCriterias = sortService.toObjectForSort(sortConditions)

      jobAdvertisements = await jobAdvertisementModel.find(combinedFilter).sort(sortCriterias).skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    }else{
      jobAdvertisements = await jobAdvertisementModel.find(combinedFilter).skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    }
    console.log("bb", jobAdvertisements)
    if (!jobAdvertisements.length) { 
      return res.json({success: false,message: "Hiç iş ilanı bulunmamaktadır"});
    }

    return res.json({success: true,message: "İş ilanı listelendi",jobAdvertisements, totalPages, totalCount});

  } catch (error) {
    console.log(error)
    return res.json({success: false,message: "Bir hata oluştu. İş ilanı listelenemedi"});
  }
};

const getFilterOptions = async (req,res) =>{
  try{
    const {columnName} = req.body;

    if(!columnName.length || columnName==null){
      return res.json({success: false,message: "Lütfen sütun adı girin"});
    }

    const filterOptions = await filterService.findDistinctFieldValues("jobadvertisements",columnName)
    console.log(filterOptions)
    return res.json({success: true,filterOptions});
    
  }catch(error){
    return res.json({success: false,message: error});
  }
  
}

const getJobAdvertisementById = async (req, res) => {
  try {
    const { jobId } = req.body;

    const jobAdvertisement = await jobAdvertisementModel.findById(jobId);

    if (jobAdvertisement) {
      return res.json({success: true, message: "İş ilanı görüntülendi",jobAdvertisement,});
    } else {
      return res.json({success: false, message: "Böyle bir iş ilanı bulunmamaktadır "});
    }
  } catch (error) {
    return res.json({success: false,message: "Bir hata oluştu. İş ilanı görüntülenemedi"});
  }
};

const deleteJobAdvertisement = async (req, res) => {
  try {
    const { id: jobId } = req.body;
    const result = await jobAdvertisementModel.deleteOne({ _id: jobId });
    if (result.deletedCount === 1) {
      return res.json({success: true,message: "İş ilanı başarıyla silinmiştir."});
    } else {
      return res.json({ success: false, message: "İş ilanı bulunamadı." });
    }
  } catch (error) {
    return res.json({success: false,message: "Bir hata oluştu. İş ilanı silinemedi" });
  }
};

const updateJobAdvertisement = async (req, res) => {
  try {
    const {
      jobId,
      quota,
      status,
      company,
      location,
      workType,
      postedAt,
      positionName,
      jobDescription,
      qualifications,
      employmentType,
      applicationDeadline,
      acceptedApplicationsCount,
    } = req.body;
    const jobAdvertisement = await jobAdvertisementModel.findById(jobId);

    if (!jobAdvertisement) {
      return res.json({ success: false, message: "İş ilanı bulunamadı" });
    }

    const updatedJobAdvertisement =
      await jobAdvertisementModel.findByIdAndUpdate(
        jobAdvertisement._id,
        {
          quota,
          status,
          company,
          location,
          workType,
          postedAt,
          positionName,
          jobDescription,
          qualifications,
          employmentType,
          applicationDeadline,
          acceptedApplicationsCount,
        },
        { new: true },
      );

      return res.json({success: true,message: "İş ilanı başarıyla güncellendi",updatedJobAdvertisement});
  } catch (error) {
    return res.json({success: false,message: "Bir hata oluştu. İş ilanı güncellenemedi" });
  }
};

const updateJobAdvertisementStatusInDb = async () => {
  try {
    const dateOfNow = new Date();
    const jobAdvertisements = await jobAdvertisementModel.find(); // Tüm iş ilanlarını al

    for (const jobAdvertisement of jobAdvertisements) { // Tüm iş ilanlarını döngüye al
      if (
          jobAdvertisement.applicationDeadline < dateOfNow ||
          jobAdvertisement.quota <= jobAdvertisement.acceptedApplicationsCount // quota, acceptedApplicationsCount'tan az veya eşitse
      ) {
        await jobAdvertisementModel.findByIdAndUpdate( // İlgili iş ilanının durumunu güncelle
            jobAdvertisement._id,
            { $set: { status: false } }
        );
      }

      if (jobAdvertisement.quota > jobAdvertisement.acceptedApplicationsCount) {
        await jobAdvertisementModel.findByIdAndUpdate(jobAdvertisement._id, {
          $set: { status: true },
        });
      }
    }
  } catch (err) {
    console.error("İş ilanı durumu güncellenirken hata oluştu:", err);
  }
};

const formatDate = (deadline) => {
  const formattedDate = new Date(deadline).toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formattedDate;
};
const runScheduledJob = () => {
  updateJobAdvertisementStatusInDb();
  //
};

cron.schedule("* * * * * *", runScheduledJob);

export {
  addJobAdvertisement,
  listJobAdvertisement,
  getJobAdvertisementById,
  deleteJobAdvertisement,
  updateJobAdvertisement,
  getFilterOptions
};
