import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// Register User
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }
  // Check if user already exists
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exist with this email",
      });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    // Create JWT token and set it in a cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Send registration email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Registration Successful",
      text: `Hello ${name},\n\nYour registration was successful! Welcome to our platform.\n\nBest regards,\nThe Team`,
    };
    // Send the email
    await transporter.sendMail(mailOptions);
    return res.json({
      message: "Registration Successfully",
      success: true,
      user: {
        name,
        email,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Wrong Email or Password!",
    });
  }
  // Check if user exists and password matches
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid Email !",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.json({
        success: false,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      message: "Successfully LoggedIn",
      success: true,
      user: {
        email,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
// Logout User
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
// Send OTP for verification
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Account",
      // text: `Hello ${user.name},\n\nYour verification OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{email}}",user.email).replace("{{otp}}",otp).replace("{{name}}",user.name).replace("{{otp_expiry_time}}",user.verifyOtpExpiredAt)
    };

    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong while sending OTP",
    });
  }
};
// Verify Email
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.verifyOtpExpiredAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiredAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Account Verified Successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong while verifying account",
    });
  }
};

//user is already logged in or not
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "User is authenticated",
    })

  } catch (error) {
    return res.json({
      success: false,
      message: "Error while checking authentication",
    });
  }
}
//send password reset otp
export const sendPasswordRestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({
      success: false,
      message: "Email is required"
    })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 10 * 60 * 1000;//10 minutes
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Otp",
      // text: `Hello ${user.name},\n\nYour password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{email}}",user.email).replace("{{otp}}",otp).replace("{{name}}",user.name).replace("{{otp_expiry_time}}",user.resetOtpExpiredAt)

    }
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "OTP sent successfully",
    })

  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong while sending password reset OTP"
    })
  }
}

//Reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Please Provide All The Details"
    })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      })
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP Please Try Again"
      })
    }
    if (user.resetOtpExpiredAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired Please Try Again"
      })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Password Reset Successfully,Please Login Again"
    })


  } catch (error) {
    console.log("Error in Reset Password Controller:", error);
    return res.json({
      success: false,
      message: "Something went wrong while resetting password"
    })
  }
}


