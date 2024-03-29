import mongoose from "mongoose";
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
    candidateId: {type:Schema.Types.ObjectId},
    jobId : {type:Schema.Types.ObjectId}, 
    status: {type: String},
    applicationDate : {type:Date}
});

applicantSchema.pre('save', async function(next){
    try{
        next()
    }catch(error){
        next(error);
    }
})

const ApplicantModel = mongoose.model('Applicant', applicantSchema);

export default ApplicantModel;