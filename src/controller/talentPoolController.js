import CandidateModel from "../model/candidate.js";
import TalentPoolModel from "../model/talentPool.js";
import * as filterService from  "../services/filterService.js";
import * as sortService from "../services/sortService.js";

const createTalentPool = async (req, res) => {
  const { poolName, candidates } = req.body;

  try {    
    const newTalentPool = new TalentPoolModel({
      poolName: poolName,
      candidates: candidates
    });
    
    await newTalentPool.save();

    res.json({ success: true, message: "The talent pool has been successfully added." });

  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};

const getTalentPools = async (req, res) => {
  try {
    const {filteringConditions,searchText,sortConditions, pageNumber, pageSize}=req.body;
console.log(filteringConditions,searchText,sortConditions, pageNumber, pageSize)
    const combinedFilter = filterService.buildFilters(filteringConditions,searchText,"poolName")

    const totalCount = await TalentPoolModel.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalCount / pageSize);
  
    let talentPools;

    if(sortConditions){

      const sortCriterias = sortService.toObjectForSort(sortConditions)

      talentPools = await TalentPoolModel.find(combinedFilter).sort(sortCriterias).skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    }else{
      talentPools = await TalentPoolModel.find(combinedFilter).skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    }
    
    if(!talentPools.length){
      return res.json({success:false, message:"There are no pools found."});
    }

    let arrTalentPool = [];

    for (const pool of talentPools) {
      const candidates = await CandidateModel.find({ _id: { $in: pool.candidates } });

      if (!candidates) {
        return res.json({success:false, message:"Candidate not found for talent pool"})
      }

      let talentPool = {
        poolId: pool._id,
        poolName: pool.poolName,
        candidates: [],
        createdDate: pool.createdDate,
      };

      for (const candidate of candidates) {
        
        const objCandidate = {
          candidateId: candidate._id,
          candidateName: candidate.fullName,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          candidatePhoneCode: candidate.phoneCode
        };

        talentPool.candidates.push(objCandidate)
        talentPool.poolName=pool.poolName;
        talentPool.createdDate=pool.createdDate;
      }
      arrTalentPool.push(talentPool)
    }

    res.json({success: true, message: "Talent pools successfully listed.", arrTalentPool,totalPages});
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};

const getTalentPoolById = async (req, res) => {
    const { poolId } = req.body;
    try {  
      const pool = await TalentPoolModel.findById(poolId);
    
      if(!pool){
        return res.json({success:false, message:"There are no pool found."});
      } 
      
      let arrTalentPool = [];

      const candidates = await CandidateModel.find({ _id: { $in: pool.candidates } });

      if (!candidates) {
        return res.json({success:false, message:"Candidate not found for talent pool"})
      }

      let talentPool = {
        poolId: pool._id,
        poolName: pool.poolName,
        candidates: [],
        createdDate: pool.createdDate,
      };

      for (const candidate of candidates) {
        
        const objCandidate = {
          candidateId: candidate._id,
          candidateName: candidate.fullName,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          candidatePhoneCode: candidate.phoneCode
        };

        talentPool.candidates.push(objCandidate)
        talentPool.poolName=pool.poolName;
        talentPool.createdDate=pool.createdDate;
      }
      arrTalentPool.push(talentPool)

      res.json({success: true, message: "Talent pool successfully listed.", arrTalentPool});
    } catch (error) {
      return res.json({ success: false, message: "Something went wrong. Pool could not be displayed."});
    }
};

const deleteTalentPool = async (req, res) => {
    const { poolId } = req.body;
    try {
      const deletedPool = await TalentPoolModel.findByIdAndDelete(poolId);
  
      if (!deletedPool) {
        return res.json({ success: false, message: "Pool not found." });
      }
  
      res.json({ success: true, message: "The talent pool has been successfully deleted." });
    } catch (error) {
      console.error("An error occurred while deleting the pool:", error);
      res.json({ success: false, message: "The pool could not be deleted." });
    }
};

const updateTalentPool = async (req, res) => {
    try {
      const { poolId, poolName } = req.body;
  
      const pool = await TalentPoolModel.findById(poolId);
  
      if (!pool) {
        return res.json({ success: false, message: "Repository update failed: Repository not found."});
      }
  
      const poolNameCheck = await TalentPoolModel.findOne({ poolName: poolName });
  
      if (poolNameCheck && poolName != pool.poolName) {
        return res.json({ success: false, message: "Repository update failed: This repository name already exists." })
      }

      pool.poolName = poolName || pool.poolName;
      
      await pool.save();
  
      res.json({ success: true, message: "The talent pool has been successfully updated.", pool });
    } catch (error) {
      console.error("An error occurred while updating the pool:", error);
      res.json({ success: false, message: "The pool could not be updated." });
    }
};

const addCandidateToPool = async (req, res) => {
  try {
    const { poolId, candidateId } = req.body;

    const pool = await TalentPoolModel.findById(poolId);
    
    if (!pool) {
      return res.json({ success: false, message: "Pool not found."});
    }

    const isCandidateExist = pool.candidates.includes(candidateId);

    if (isCandidateExist) {
      return res.json({ success: false, message: "Candidate already exists in the pool."});
    }

    pool.candidates.push(candidateId);
    
    await pool.save();

    res.json({ success: true, message: "The candidate has been successfully added to the pool.", pool });
  } catch (error) {
    console.error("An error occurred while adding the candidate to the pool:", error);
    res.json({ success: false, message: "The candidate could not be added to the pool." });
  }
}

const deleteCandidateFromPool = async (req, res) => {
  const { poolId, candidateId } = req.body;
  try {
    const pool = await TalentPoolModel.findById(poolId);

    if (!pool) {
      return res.json({ success: false, message: 'Pool not found.' });
    }

    const candidateIndex = pool.candidates.findIndex(id => id.toString() === candidateId);

    if (candidateIndex === -1) {
      return res.status(404).json({ success: false, message: 'Candidate not found in the pool' });
    }

    pool.candidates.splice(candidateIndex, 1);
    await pool.save();
    
    res.json({ success: true, message: 'Candidate removed from pool successfully.', pool });
  } catch (error) {
    console.error("An error occurred while being removed the candidate to the pool:", error);
    res.status(500).json({ success: false, message: "The candidate could not be removed to the pool." });
  }
};

export {createTalentPool, getTalentPools, getTalentPoolById, deleteTalentPool, updateTalentPool, addCandidateToPool, deleteCandidateFromPool}