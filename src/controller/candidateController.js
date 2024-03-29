import CandidateModel from '../model/candidate.js'
import ApplicantModel from '../model/applicant.js'
import jobAdvertisementModel from '../model/jobAdvertisement.js';
import * as filterService from  "../services/filterService.js";
import * as sortService from "../services/sortService.js";

const addCandidate = async (req, res) => {
  try {
    const {fullName,email,phone,phoneCode,socials,location,workType,workModel,technicalSkills,salaryExpectation,languageSkills,militaryServiceStatus,job,gender,cvName} = req.body
    const candidate =  await CandidateModel.findOne({email})

    if(candidate){
        return res.json({success:false, message:"bu emaile kayıtlı bir aday zaten ekli"})
    }

    const newCandidate = new CandidateModel({
        job:job,
        email:email,
        phone:phone,
        cvName:cvName,
        gender:gender,
        socials:socials,
        fullName:fullName,
        location:location,
        workType:workType,
        phoneCode:phoneCode,
        workModel:workModel,
        createDate:Date.now(),
        languageSkills:languageSkills,
        technicalSkills:technicalSkills,
        salaryExpectation:salaryExpectation,
        militaryServiceStatus:militaryServiceStatus,
    });
    // candidate MongoDB'ye kaydet
    await newCandidate.save();
    res.json({ success:true, message:"Aday başarıyla eklenmiştir." });    
    
  } catch (error) {
    res.json({ success:false, message: "Bir hata oluştu. Aday eklenemedi." });
  }
};

const listCandidate = async (req, res) => {
    try {
        const {filteringConditions,searchText,sortConditions, pageNumber, pageSize}=req.body;

        const combinedFilter = filterService.buildFilters(filteringConditions,searchText,"fullName")

        const totalCount = await CandidateModel.countDocuments(combinedFilter);
        const totalPages = Math.ceil(totalCount / pageSize);

        let candidates;

        if(sortConditions){

          const sortCriterias = sortService.toObjectForSort(sortConditions)
    
          candidates = await CandidateModel.find(combinedFilter).sort(sortCriterias).skip((pageNumber - 1) * pageSize)
          .limit(pageSize);
    
        }else{
          candidates = await CandidateModel.find(combinedFilter).skip((pageNumber - 1) * pageSize)
          .limit(pageSize);
        }

        if(!candidates.length){
            return res.json({ success:false, message:"Hiç aday bulunmamaktadır"});
        }

        return res.json({ success:true, message:"Adaylar listelendi",candidates,totalPages});

    } catch (error) {
        return res.json({ success:false, message: "Bir hata oluştu. Adaylar listelenemedi" });

    }
};

const getFilterOptions = async (req,res) =>{
  try{
    const {columnName} = req.body;

    if(!columnName.length || columnName==null){
      return res.json({success: false,message: "Lütfen sütun adı girin"});
    }

    const filterOptions = await filterService.findDistinctFieldValues("candidates",columnName)
    return res.json({success: true,filterOptions});
    
  }catch(error){
    return res.json({success: false,message: error});
  }
  
}

const getCandidateById = async (req, res) => {
  try {
    const id = req.body._id;
    const candidate = await CandidateModel.findById(id);

    if (candidate) {
      return res.json({
        success: true,
        message: "Aday görüntülendi",
        candidate,
      });
    } else {
      return res.json({
        success: false,
        message: "Böyle bir aday bulunmamaktadır ",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Bir hata oluştu. Aday görüntülenemedi",
    });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const _id = req.body.id;
    const result = await CandidateModel.findByIdAndDelete(_id);

    if (result) {
      const applicants = await ApplicantModel.find({ candidateId: _id });

      for (const element of applicants) {
        await ApplicantModel.findByIdAndDelete(element._id);
        const job = await jobAdvertisementModel.findById(element.jobId);
        let jobsApplicants = job.applicants.filter(
          (applicant) => applicant != element._id,
        );
        await jobAdvertisementModel.findByIdAndUpdate(job._id, {
          applicants: jobsApplicants,
        });
      }
      return res.json({
        success: true,
        message: "aday başarıyla silinmiştir.",
      });
    } else {
      return res.json({ success: false, message: "Aday bulunamadı." });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Bir hata oluştu. Aday silinemedi",
    });
  }
};  

const updateCandidate = async (req, res) => {
    try {
        const {_id,fullName,email,phone,phoneCode,socials,location,workType,workModel,technicalSkills,salaryExpectation,languageSkills,militaryServiceStatus,job,gender,cvName} = req.body;
        const candidate =  await CandidateModel.findById(_id)

        if (!candidate) {
            return res.json({ success: false, message: "Aday bulunamadı" });
        }

        const updatedCandidate = await CandidateModel.findByIdAndUpdate(candidate._id, {
            job,
            email,
            phone,
            cvName,
            gender,
            socials,
            fullName,
            location,
            workType,
            phoneCode,
            workModel,
            languageSkills,
            technicalSkills,
            salaryExpectation,
            militaryServiceStatus,
        }, { new: true });

        return res.json({ success: true, message: "Aday başarıyla güncellendi", updatedCandidate });
   
    } catch (error) {
        return res.json({ success:false, message: "Bir hata oluştu. Aday güncellenemedi" });
    }
};  
export { addCandidate, listCandidate, deleteCandidate, getCandidateById, updateCandidate,getFilterOptions }