import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import UserModel from "../model/user.js";
import AdminModel from "../model/admin.js";
import bcrypt from "bcrypt"; //canlıda 'bcryptjs'
import * as filterService from "../services/filterService.js";
import * as sortService from "../services/sortService.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    var user = await UserModel.findOne({ email: email });

    !user ? (user = await AdminModel.findOne({ email: email })) : (user = user);

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.json({ success: false, message: "Email veya şifre yanlış" });
      } else {
        const accessToken = jwt.sign(
          { userId: user._id },
          process.env.SECRET_KEY,
          { expiresIn: "10m" },
        );
        const refreshToken = jwt.sign(
          { userId: user._id },
          process.env.REFRESH_SECRET_KEY,
          { expiresIn: "1d" },
        );
        res.json({
          success: true,
          message: "Kullanıcı girişi başarılı",
          accessToken,
          refreshToken,
        });
      }
    } else {
      res.json({
        success: false,
        message: "E-posta veya şifre hatalı. Giriş yapılamadı.",
      });
    }
  } catch (error) {
    console.error("Giriş yapılırken bir hata oluştu:", error);
    res.json({ success: false, message: "Bir hata oluştu. Giriş yapılamadı." });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const userId = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET_KEY,
    ).userId;

    var user = await UserModel.findById(userId);
    !user ? (user = await AdminModel.findById(userId)) : (user = user);

    if (user) {
      const newAccessToken = jwt.sign(
        { userId: user._id },
        process.env.SECRET_KEY,
        { expiresIn: "10m" },
      );
      res.json({ success: true, accessToken: newAccessToken });
    } else {
      res.json({ success: false, message: "Kullanıcı bulunamadı." });
    }
  } catch (error) {
    console.error(
      "Yenileme token'ı kullanılarak erişim token'ı alınamadı",
      error,
    );
    res.json({
      success: false,
      message: "Yenileme token'ı kullanılarak erişim token'ı alınamadı.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const adminUser = await AdminModel.findOne({ email: email });
    const hrUser = await UserModel.findOne({ email: email });

    var user;
    adminUser ? (user = adminUser) : (user = hrUser);

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "40m",
    });

    const url = `${process.env.CLIENT_URL}/set-password/${token}`;
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_PASS,
      },
    });

    var mailOptions = {
      to: email,
      subject: `Merhaba ${user.fullName}`,
      html: `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HR HUB</title>
            <style>
                    body {
                        width: 800px;
                        font-family: Arial, sans-serif;
                        background-color: #F5F5F5;
                        color: #000;
                        margin: 0;
                        padding: 0;
                    }
                    header {
                        background-color: #000000;
                        color: white;
                        padding: 10px 20px;
                        text-align: left;
                    }
                    section {
                        background-color: #F5F5F5;
                        padding: 20px;
                    }
                    button {
                        background-color: #000;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                    }
                    .footer {
                        background-color: #fff;
                        color: black;
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                    }
            </style>
            </head>
            <body style="width:800px">
            <header style="padding-left: 50px;">
            <h1 style="margin-bottom: 0px;">HR HUB</h1>
            <h2 style="margin-top: 0px;">SUBDOMAIN &gt; B</h2>
             
                </header>
            <section style="padding-left: 50px;">
            <div style="padding-top: 60px; padding-bottom: 30px;" >
            <img src="https://crm-test-z2p9.onrender.com/kilit.jpeg">
            </div>
            <div style="margin-top:40px ;">
            <h2>Merhaba ${user.fullName}</h2>
            </div>
            <div style="margin-bottom: 40px;">Şifre yenileme talebini aldık. "Şifremi Güncelle" butonuna tıklayarak yeni şifreni belirleyebilirsin. </div>
            <div style="margin-bottom:7%;">
            <a href="${url}" style="display:inline-block; padding: 10px 20px; background-color: #000000; color: #ffffff; border-radius: 10px; text-decoration: none;">Şifremi Güncelle </a>
             
                    </div>
            <div style="margin-bottom: 9%;">Excepteur sint occaecat cupidatat, Non proident</div>
            </section>
            <div style="padding-left: 50px; display: block; clear: both;">
            <div style="float: left;">
                        Reprehenderit in voluptate velit esse <b>HR HUB</b>
            </div>
            <div style="float: right;">
                        Lorem and Ipsum &bull; Dolor Sit Amet
            </div>
            <div style="clear: both;"></div>
            </div>
             
            </body>
            </html>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
      } else {
      }
    });

    res.json({ success: true, message: "Email sent successfull " });
  } catch (error) {
    res.json({ success: false, message: "Email not found" });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const saltRounds = 10;

  jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
    if (error) {
      return res.json({ success: false, message: "Token can not be verified" });
    } else {
      try {
        const userId = decoded.id;
        const hash = await bcrypt.hash(password, saltRounds);

        const adminUpdate = AdminModel.findByIdAndUpdate(userId, {
          password: hash,
        });
        const userUpdate = UserModel.findByIdAndUpdate(userId, { password: hash });

        await Promise.all([adminUpdate, userUpdate]);

        res.json({ success: true, message: "User updated successfully" });
      } catch (error) {
        res.json({ success: false, message: "Error updating admin and user" });
      }
    }
  });
};

const register = async (req, res) => {
  const {
    email,
    phone,
    password,
    fullName,
    phoneCode,
    companyName,
    passwordConfirmation,
  } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    const existingAdmin = await AdminModel.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı.",
      });
    }

    if (existingAdmin) {
      return res.json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı.",
      });
    }

    if (password !== passwordConfirmation) {
      return res.json({ success: false, message: "Parolalar uyuşmuyor" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminModel({
      email: email,
      phone: phone,
      role: "admin",
      fullName: fullName,
      phoneCode: phoneCode,
      companyName: companyName,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.json({ success: true, message: "Kullanıcı başarıyla eklenmiştir." });
  } catch (err) {
    console.error("Kullanıcı eklenirken bir hata oluştu:", err);
    res.json({
      success: false,
      message: "Bir hata oluştu. Kullanıcı eklenemedi.",
    });
  }
};

const hrRegister = async (req, res) => {
  const { token, email, password, passwordConfirmation, phone, fullName } =
    req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    var user = await UserModel.findById(decodedToken.userId);
    !user
      ? (user = await AdminModel.findById(decodedToken.userId))
      : (user = user);

    const companyName = user.companyName;
    const companyId = user.companyId;
    const existingUser = await UserModel.findOne({ email });
    const existingAdmin = await AdminModel.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı.",
      });
    }

    if (existingAdmin) {
      return res.json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı.",
      });
    }

    if (password !== passwordConfirmation) {
      return res.json({ success: false, message: "Parolalar uyuşmuyor" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email: email,
      phone: phone,
      role: "user",
      fullName: fullName,
      companyId: companyId,
      companyName: companyName,
      password: hashedPassword,
    });
    await newUser.save();

    res.json({ success: true, message: "Kullanıcı başarıyla eklenmiştir." });
  } catch (err) {
    console.error("Kullanıcı eklenirken bir hata oluştu:", err);
    res.json({
      success: false,
      message: "Bir hata oluştu. Kullanıcı eklenemedi.",
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const { filteringConditions, searchText, sortConditions, pageNumber, pageSize } = req.body;

    const combinedFilter = filterService.buildFilters(filteringConditions, searchText, "fullName")

    const totalCount = await UserModel.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalCount / pageSize);

    let users;

    if (sortConditions) {

      const sortCriterias = sortService.toObjectForSort(sortConditions)

      users = await UserModel.find(combinedFilter).sort(sortCriterias).skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

    } else {
      users = await UserModel.find(combinedFilter).skip((pageNumber - 1) * pageSize)
        .limit(pageSize);
    }

    if (!users.length) {
      return res.json({ success: false, message: "Hiç kullanıcı bulunmamaktadır" });
    }

    return res.json({ success: true, users, totalPages });

  } catch (error) {
    return res.json({ success: false, message: "Kullanıcılar listelenemedi." });
  }
};

const getUserById = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    var user = await UserModel.findById(decodedToken.userId);
    !user
      ? (user = await AdminModel.findById(decodedToken.userId))
      : (user = user);

    if (user) {
      return res.json({
        success: true,
        message: "Kullanıcı listelendi",
        user,
      });
    } else {
      return res.json({
        success: false,
        message: "Böyle bir kullanıcı bulunmamaktadır ",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Bir hata oluştu. Kullanıcı görüntülenemedi",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { _id, userId, fullName, newEmail, password, phone, phoneCode } =
      req.body;

    var id = userId || _id;

    var user = await UserModel.findById(id);
    !user ? (user = await AdminModel.findById(id)) : (user = user);

    if (!user) {
      return res.json({
        success: false,
        message: "Kullanıcı güncelleme başarısız: Kullanıcı bulunamadı.",
      });
    }

    var emailCheck = await UserModel.findOne({ email: newEmail });
    !emailCheck
      ? (emailCheck = await AdminModel.findOne({ email: newEmail }))
      : (emailCheck = emailCheck);

    if (emailCheck && newEmail != user.email) {
      return res.json({
        success: false,
        message:
          "Kullanıcı güncelleme başarısız: Bu emaile sahip bir kullanıcı zaten var",
      });
    }

    user.email = newEmail || user.email;
    user.password = password ? await bcrypt.hash(password, 10) : user.password;
    user.phone = phone || user.phone;
    user.phoneCode = phoneCode || user.phoneCode;
    user.fullName = fullName || user.fullName;

    await user.save();

    res.json({ success: true, message: "Kullanıcı başarıyla güncellendi." });
  } catch (error) {
    console.error("Kullanıcı güncelleme sırasında bir hata oluştu:", error);
    res.json({ success: false, message: "Kullanıcı güncellenemedi." });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    res.json({ success: true, message: "Kullanıcı başarıyla silindi." });
  } catch (error) {
    console.error("Kullanıcı silme sırasında bir hata oluştu:", error);
    res.json({ success: false, message: "Kullanıcı silinemedi." });
  }
};

export {
  login,
  register,
  listUsers,
  hrRegister,
  updateUser,
  deleteUser,
  getUserById,
  resetPassword,
  forgotPassword,
  refreshAccessToken,
};
