import ApplicantModel from "../model/applicant.js";
import CandidateModel from "../model/candidate.js";
import jobAdvertisementModel from "../model/jobAdvertisement.js";

const addApplicant = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    const job = await jobAdvertisementModel.findById(jobId);

    if (!job) {
      return res.json({success: false,message: "The job advertisement being operated on does not exist."});
    }

    const candidate = await CandidateModel.findById(candidateId);

    if (!candidate) {
      return res.json({success: false,message: "The candidate being operated on does not exist."});
    }

    const applicantsForCandidate = await ApplicantModel.find({
      candidateId: candidateId,
    }).exec();

    let hasCandidateAppliedJob = false;

    applicantsForCandidate.forEach((applicant) => {
      if (applicant.jobId == jobId) {
        hasCandidateAppliedJob = true;
      }
    });

    if (hasCandidateAppliedJob) {
      return res.json({success: false, message: "You cannot add the same candidate to the same job listing more than once."});
    }

    const newApplicant = new ApplicantModel({
      candidateId: candidateId,
      jobId: jobId,
      status: "applied",
      applicationDate: Date.now(),
    });

    const savedApplicant = await newApplicant.save();

    let candidatesApplicants = candidate.applicants;
    candidatesApplicants.push(savedApplicant._id);

    await CandidateModel.findByIdAndUpdate(candidate._id, {
      applicants: candidatesApplicants,
    });

    let jobsApplicants = job.applicants;
    jobsApplicants.push(savedApplicant._id);

    await jobAdvertisementModel.findByIdAndUpdate(job._id, {
      applicants: jobsApplicants,
    });

    return res.json({success: true, message: "The operation was successful.", newApplicant});

  } catch (error) {
    return res.json({ success: false, message: error });
  }
};

const listApplicant = async (req, res) => {
  try {
    const {filteringConditions,searchText,sortConditions, pageNumber, pageSize}=req.body;

    let matchStages = []

    if(filteringConditions){
      matchStages = filteringConditions.map(condition => {
        const matchStage = {};
        matchStage[condition.columnName] = { $in: condition.filterFields };
        return { $match: matchStage };
      });
    }
    
    if(searchText){
      const searchTextCondition = {
        $match: {
            $or: [
                { "candidateName": { $regex: searchText, $options: "i" } }
            ]
        }
      };
      matchStages.push(searchTextCondition);
    }

    let sortStages = []

    if(sortConditions){

      const combinedSortStage = sortConditions.reduce((acc, condition) => {
        acc[condition.columnName] = condition.sortOrder;
        return acc;
      }, {});

      sortStages.push({ $sort: combinedSortStage });
    }

    const applicants = await ApplicantModel.aggregate([
      
      {
        $lookup: {
          from: "candidates", 
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate"
        }  
      },
      {
        $unwind: "$candidate"
      },
      {
        $lookup: {
          from: "jobadvertisements", 
          localField: "jobId",
          foreignField: "_id",
          as: "job"
        }  
      },
      {
        $unwind: "$job"
      },
      {
        $project: {
          _id: 1,
          jobId: 1,
          companyName: "$job.company",
          status: 1,
          positionName: "$job.positionName",
          candidateEmail: "$candidate.email",
          candidatePhone: "$candidate.phone",
          candidateName: "$candidate.fullName",
          candidateId: 1,
          candidatePhoneCode: "$candidate.phoneCode",
          applicationDate: 1,
        }  
      },
      ...matchStages,
      ...sortStages,
      { $skip: (pageNumber - 1) * pageSize }, 
      { $limit: pageSize }
    ]);

    if (!applicants.length) {
      return res.json({ success: false, message: "There are no applicants found." });
    }

    res.json({success: true,message: "The operation was successful.", applicants});

  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error });
  }
};

const getFilterOptions = async (req, res) => {
  try {
      const { columnName } = req.body;

      if (!columnName || !columnName.length) {
          return res.json({ success: false, message: "Lütfen sütun adı girin" });
      }

      const pipeline = [
          {
              $lookup: {
                  from: "candidates",
                  localField: "candidateId",
                  foreignField: "_id",
                  as: "candidate"
              }
          },
          {
              $unwind: "$candidate"
          },
          {
              $lookup: {
                  from: "jobadvertisements",
                  localField: "jobId",
                  foreignField: "_id",
                  as: "job"
              }
          },
          {
              $unwind: "$job"
          },
          {
              $project: {
                  _id: 1,
                  jobId: 1,
                  companyName: "$job.company",
                  status: 1,
                  positionName: "$job.positionName",
                  candidateEmail: "$candidate.email",
                  candidatePhone: "$candidate.phone",
                  candidateName: "$candidate.fullName",
                  candidateId: 1,
                  candidatePhoneCode: "$candidate.phoneCode",
                  applicationDate: 1,
              }
          }
      ];

      const groupStage = {
          $group: {
              _id: null
          }
      };

      columnName.forEach(column => {
          groupStage.$group[`distinct${column.charAt(0).toUpperCase() + column.slice(1)}`] = {
              $addToSet: `$${column}`
          };
      });

      pipeline.push(groupStage);

      const applicants = await ApplicantModel.aggregate(pipeline);

      const distinctValues = {};
      columnName.forEach(column => {
          distinctValues[`distinct${column.charAt(0).toUpperCase() + column.slice(1)}`] = applicants.length > 0 ? applicants[0][`distinct${column.charAt(0).toUpperCase() + column.slice(1)}`] : [];
      });

      return res.json({ success: true, distinctValues });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Bir hata oluştu" });
  }
};


const getApplicantById = async (req, res) => {
  try {
    const { _id } = req.body;

    const applicant = await ApplicantModel.findById(_id);

    if (!applicant) {
      res.json({ success: false, message: "Application was not found" });
      return;
    }

    const candidate = await CandidateModel.findById(applicant.candidateId);
    const job = await jobAdvertisementModel.findById(applicant.jobId);

    const applicantData = {
      _id: applicant._id,
      jobId: applicant.jobId,
      candidateId: applicant.candidateId,
      companyName: job.company,
      status: applicant.status,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
    };
  
    res.json({success: true, message: "The operation was successful.", applicantData});
        
  } catch (error) {
    res.json({ success: false, message: error });
    return;
  }
};

const deleteApplicant = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    const applicants = await ApplicantModel.find({
      candidateId: candidateId,
    }).exec();

    let applicantId;

    applicants.forEach((element) => {
      if (element.jobId == jobId) {
        applicantId = element._id;
      }
    });

    if (!applicantId) {
      res.json({ success: false, message: "Application was not found" });
      return;
    }

    await ApplicantModel.findByIdAndDelete(applicantId);

    const job = await jobAdvertisementModel.findById(jobId);
    const candidate = await CandidateModel.findById(candidateId);

    let candidatesApplicants = candidate.applicants.filter(
      (applicant) => applicant != applicantId,
    );

    await CandidateModel.findByIdAndUpdate(candidate._id, {
      applicants: candidatesApplicants,
    });

    let jobsApplicants = job.applicants.filter(
      (applicant) => applicant != applicantId,
    );

    await jobAdvertisementModel.findByIdAndUpdate(job._id, {
      applicants: jobsApplicants,
    });

    return res.json({success: true,message: "The operation was successful."});

  } catch (error) {

    return res.json({ success: false, message: error });
  }
};

const updateApplicant = async (req, res) => {
  try {
    const { _id, newStatus } = req.body;

    const applicant = await ApplicantModel.findById(_id);

    if (!applicant) {
      return res.json({ success: false, message: "Application was not found" });
    }

    const job = await jobAdvertisementModel.findById(applicant.jobId)

    if (applicant.status.toLocaleLowerCase() == "accepted" && newStatus.toLocaleLowerCase() != "accepted") {
      const acceptedApplicationsCount = job.acceptedApplicationsCount - 1
      await jobAdvertisementModel.findByIdAndUpdate(job._id, { acceptedApplicationsCount: acceptedApplicationsCount })
    }

    if (newStatus == "accepted" && applicant.status.toLocaleLowerCase() != "accepted") {

      if (job.quota <= job.acceptedApplicationsCount) {
        return res.json({ success: false, message: "Quota is full for position" });
      }

      const acceptedApplicationsCount = job.acceptedApplicationsCount + 1
      await jobAdvertisementModel.findByIdAndUpdate(job._id, { acceptedApplicationsCount: acceptedApplicationsCount })
    }

    await ApplicantModel.findByIdAndUpdate(_id, { status: newStatus });

    return res.json({ success: true, message: "The operation was successful." });

  } catch (error) {
    return res.json({ success: false, message: error });
  }
};

const getApplicantsByJobId = async (req, res) => {
  try {
    const { jobId } = req.body;

    const applicants = await ApplicantModel.find({ jobId: jobId });

    if (!applicants) {
      res.json({ success: false, message: "Application was not found" });
      return;
    }

    let applicants1 = [];

    const candidatesForTheJob = applicants.map(
      (applicant) => applicant.candidateId,
    );

    for (const applicant of applicants) {

      const candidate = await CandidateModel.findById(applicant.candidateId);
      const job = await jobAdvertisementModel.findById(applicant.jobId);

      const applicantData = {
        _id: applicant._id,
        jobId: applicant.jobId,
        candidateId: applicant.candidateId,
        companyName: job.company,
        status: applicant.status,
        candidateName: candidate.fullName,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone,
      };

      applicants1.push(applicantData);
    }

    if (!candidatesForTheJob) {
      return res.json({success: false,message: "The position does not have any candidates."});
    }

    return res.json({success: true, message: "The operation was successful.", applicants1, candidatesForTheJob});
  } catch (error) {
    return res.json({ success: false, message: error });
  }
};

export {addApplicant,listApplicant,deleteApplicant,updateApplicant,getApplicantById,getApplicantsByJobId,getFilterOptions};
