
import path from "path"
import multer from "multer"
import fs from 'fs';

let uploadName='';
let fileSize=null;
let success=null;

const uploadFolder = 'uploads/';
let ext;

var storage =multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,uploadFolder)
    },
    filename:async function(req,file,cb){
        ext = path.extname(file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        uploadName=uniqueSuffix+ext;
        cb(null,uploadName)
    }
})

var upload=multer({
    storage:storage,
    fileFilter:async function(req,file,calback){
        const ext = path.extname(file.originalname);
        if(ext===".pdf"){
            // Klasörü kontrol et
            if (!fs.existsSync(uploadFolder)) {
                // Klasör yoksa oluştur
                fs.mkdirSync(uploadFolder);
            }
            success=true;
            calback(null,true)
            
         }else{
            success=false;
             calback(null,false)
             
         }   

    },

})

export  {upload,uploadName,fileSize,success};