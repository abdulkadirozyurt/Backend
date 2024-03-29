import mongoose from "mongoose";
const {Schema} = mongoose;

// Candidate şeması oluştur
const fileSchema = new mongoose.Schema({
    fileName: {type:String},
    size:{type: Number}
});

fileSchema.pre('save', async function(next){
    try{
        next()
    }catch(error){
        next(error);
    }
})

// Candidate modelini oluştur
const FileModel = mongoose.model('File', fileSchema);

export default FileModel;