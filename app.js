import express from 'express';
import bodyParser from 'body-parser';
import dbConfig from './config.js';
import userRoute from './src/routes/userRoute.js'
import candidateRoute from './src/routes/candidateRoute.js'
import jobAdvertisementRoute from './src/routes/jobAdvertisementRoute.js'
import authRouter from './src/routes/authRouter.js'
import cors from 'cors'
import fileRoute from './src/routes/fileRoute.js'
import applicantRoute from './src/routes/applicantRoute.js'
import talentPoolRoute from './src/routes/talentPoolRoute.js'
import kanbanRoute from './src/routes/kanbanRoute.js'
import dotenv from "dotenv"

dotenv.config();
const app = express();
const port = 5000;

app.use(express.json());
dbConfig();
app.use('/uploads', express.static('uploads'))
// app.use(
//   cors({
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`); // "http://64.225.103.36
//   res.header("Access-Control-Allow-Methods", "GET, POST ,PUT,DELETE,PATCH");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
//   res.header("Access-Control-Allow-Credentials", "true");

//   next();
// });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/user", userRoute);
app.use("/candidate", candidateRoute);
app.use("/job", jobAdvertisementRoute);
app.use("/auth", authRouter)
app.use("/file", fileRoute);
app.use("/uploads",express.static("uploads"))
app.use("/applicant",applicantRoute);
app.use("/talentpool", talentPoolRoute);
app.use("/kanban",kanbanRoute)

// Sunucuyu başlatma
app.listen(port, () => {
  
});
