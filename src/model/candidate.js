import mongoose from "mongoose";
const {Schema} = mongoose;

// Candidate şeması oluştur
const candidateSchema = new mongoose.Schema({
    fullName: {type:String},
    email: {type:String},
    phone: {type:String},
    phoneCode:{type:String},
    socials:{type:String},
    location: {type:String},
    workType:[{type:String}],
    workModel:{type:String},
    technicalSkills: [{type:String}],
    salaryExpectation: {type:Number},
    languageSkills: [{type:String}],
    militaryServiceStatus: {type:String},
    createDate:{type:Date},
    job:{type:String},
    gender:{type:String},
    cvName:{type:String},
    applicants:[{type:String}]
});

candidateSchema.pre('save', async function(next){
    try{
        next()
    }catch(error){
        next(error);
    }
})

// Candidate modelini oluştur
const CandidateModel = mongoose.model('Candidate', candidateSchema);

export default CandidateModel;