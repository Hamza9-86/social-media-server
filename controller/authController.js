const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      // return res.status(400).send("All fields are required ");
      return res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send(error(409, "User is already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // return res.status(201).json({
    //     user,
    // });
    return res.send(success(201 , "user created successfully"));


  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(400, "All fields are required"));
    }

    const user = await User.findOne({ email }).select("+password");//sends password also in the user object
    if (!user) {
      return res.send(error(409, "User not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.send(error(403, "Incorrect password"));
    }

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,//cookie me bhejte refresh token and direct response me access token
      secure: true,
    });

    return res.send(success(201, { accessToken }));
  } catch (error) {
    return res.send(error(500, e.message));
  }
};

//this api will check refreshToken validity and generate new access token
const refreshAccessTokenController = async (req, res) => {
  // const {refreshToken} = req.body;
  const cookies = req.cookies;//cookie parser chahiye hoga iske liye
  if (!cookies.jwt) {//refresh token ka naam jwt
    console.log(req.cookies);
    return res.send(error(401, "Refresh token in cookie is required"));
  }
  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(//verify krna refresh token ko
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    return res.send(error(401, "Invalid refresh token or access key"));
  }
};

//internal functions
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });
    // console.log(token);
    return token;
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    // console.log(token);
    return token;
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "Logged out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
};
