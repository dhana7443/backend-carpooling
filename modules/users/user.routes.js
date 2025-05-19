const express = require("express");
const router = express.Router();
const { authMiddleware,isAdmin } = require("../../middlewares/auth");

const {registerUser,verifyEmailOtp,resendOtp,loginUser,passwordResetOtp,verifyResetOtp,resetPassword,getProfile,updateProfile,changePassword,getAllUsers,getUserById,softDeleteUser} = require("./user.controller");
router.post("/register", registerUser);
router.post("/verify-otp",verifyEmailOtp);
router.post("/resend-otp",resendOtp);
router.post("/login", loginUser);
router.post("/forgot-password", passwordResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/profile",authMiddleware,getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.get("/all", authMiddleware, isAdmin, getAllUsers);
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.delete("/:id", authMiddleware, isAdmin, softDeleteUser);


module.exports = router;