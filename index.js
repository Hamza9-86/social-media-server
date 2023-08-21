const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./dbConnect");
const authRouter = require("./routers/authRouter");
const postRouter = require("./routers/postRouter");
const userRouter = require("./routers/userRouter");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config("./.env");
const cloudinary = require("cloudinary").v2;

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//middlewares
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(morgan("common"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "https://social-media-client-4sgi.onrender.com",
    optionsSuccessStatus: 200,
  })
);

app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/user", userRouter);
app.get("/", (req, res) => {
  res.status(200).send();
});

const PORT = process.env.PORT || 4001;
dbconnect();
app.listen(PORT, () => {
  console.log("listening on port", PORT);
});
