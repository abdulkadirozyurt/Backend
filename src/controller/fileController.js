import path from "path";
import fs from "fs-extra";
import rimraf from "rimraf";
import FileModel from "../model/file.js";
import * as upload from "../middleware/upload.js";

let fileName = "";

const addFile = async (req, res) => {
  try {
    if (upload.success) {
      fileName = upload.uploadName;

      const newFile = new FileModel({
        fileName: fileName,
        size: upload.fileSize,
      });
      await newFile.save();

      res.json({
        success: true,
        message: "Dosya yükleme başarılı.",
        fileName: fileName,
      });
    } else {
      res.json({
        success: false,
        message: "Dosya formatı pdf olmalı.Dosya yükleme başarısız.",
        fileName: fileName,
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: "Dosya yükleme başarısız.",
      fileName: fileName,
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileName = req.body.fileName;

    const result = await FileModel.findOneAndDelete({ fileName });

    const filePath = path.join("uploads", `./${fileName}`);
    if (result) {
      res.json({ success: true, message: "Dosya silindi" });
      fs.unlinkSync(filePath, (err) => {
        if (err) {
        }
      });
    } else {
      res.json({
        success: false,
        message: "Adaya ait herhangi bir dosya bulunamadı.",
      });
    }
  } catch (error) {
    console.error("eror", error);
  }
};

export { addFile, deleteFile };
