import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import admin from "firebase-admin";
import fetch from "node-fetch"; //for reset password and call firebase REST API
import { sendEmail } from "../utils/sendMail.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import crypto from "crypto";


const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Helper to send verification email
const sendVerificationEmailInternal = async (user) => {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Set token and expiration (24 hours)
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    // Create verification link
    // Use FRONTEND_URL if available, otherwise fallback to the provided Vercel URL
    const frontendUrl = 'https://it-314.vercel.app';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&uid=${user.firebaseUid}`;
    console.log("Verification link created:", verificationLink);

    // Send verification email
    try {
        console.log("Attempting to send email to:", user.email);
        await sendEmail(
            user.email,
            "Verify Your Email - FindMySquare",
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to FindMySquare!</h2>
                    <p>Hello ${user.name},</p>
                    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                    <div style="margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    </div>
                    <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">FindMySquare Team</p>
                </div>
            `
        );
        console.log("Email sent successfully to:", user.email);
        return verificationLink;
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return null;
    }
};

//register
const registerUser = asyncHandler(async (req, res) => {

    try {
        console.log("=== REGISTRATION REQUEST ===");
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        let { firebaseUid, email, name, role, phone } = req.body;

        if (!firebaseUid || !email || !name || !role) {
            throw new ApiError(400, "firebaseUid, email, name, and role are required");
        }

        // Validate role
        if (!['user', 'lister', 'admin'].includes(role)) {
            throw new ApiError(400, "Role must be one of: user, lister, admin");
        }

        // Phone is required for lister role
        if (role === 'lister' && (!phone || phone.trim().length === 0)) {
            throw new ApiError(400, "Phone number is required for lister account");
        }

        // Trim phone if provided
        if (phone) {
            phone = phone.trim();
            // Validate phone format if provided
            if (phone.length > 0 && !/^\d{10}$/.test(phone)) {
                throw new ApiError(400, "Phone number must be exactly 10 digits");
            }
        }

        if (email === ADMIN_EMAIL) {
            throw new ApiError(403, "Registration for the admin account is not allowed. Please login instead.");
        }

        // Check if user already exists - if so, just return it (recovery from previous failed attempt)
        let user = await User.findOne({ firebaseUid });
        if (user) {
            console.log("✓ User already exists, returning existing user:", user._id);
            console.log("=============================");
            // User already exists, just return it - they may be completing a partial registration
            return res.status(201).json(
                new ApiResponse(201, user, "User registration completed (or already existed)")
            );
        }

        const userData = {
            firebaseUid,
            email,
            name,
            role,
        };

        // Only include phone if it was provided
        if (phone && phone.length > 0) {
            userData.phone = phone;
        }

        console.log("Creating user with data:", JSON.stringify(userData, null, 2));
        user = await User.create(userData);
        console.log("✓ User created:", user._id);

        // Send verification email automatically
        const verificationLink = await sendVerificationEmailInternal(user);
        const emailMessage = verificationLink
            ? "User registered and verification email sent."
            : "User registered but failed to send verification email. Please request a new one.";

        console.log("=============================");

        res.status(201).json(
            new ApiResponse(201, user, emailMessage)
        );
    }

    catch (err) {
        console.error("✗ Registration error:", err.message);
        console.error("Full error:", err);
        console.log("=============================");
        // Preserve ApiError status codes; if it's already an ApiError rethrow it
        if (err instanceof ApiError) {
            throw err;
        }
        throw new ApiError(500, `Error while register. Error is : ${err.message}`);
    }
});

//login (email + password) 
//how to add role and phone number is remaing
const loginUser = asyncHandler(async (req, res) => {

    try {

        const { token } = req.body;

        if (!token) {
            throw new ApiError(400, "Token missing");
        }

        const decoded = await admin.auth().verifyIdToken(token);

        if (!decoded) {
            throw new ApiError(404, "User not found");
        }

        const { uid, email } = decoded;

        let user = await User.findOne({ firebaseUid: uid });

        const isAdmin = email === ADMIN_EMAIL;

        //if user is present in firebase but not in mongodb then add it
        //firebase store - uid, name, email, password
        if (!user) {
            user = await User.create(
                {
                    firebaseUid: uid,
                    email,
                    name: decoded.name || "Unnamed User",
                    role: isAdmin ? "admin" : "user",
                }
            );
        } else if (isAdmin && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }


        res.status(200).json(
            new ApiResponse(
                200,
                {
                    user,
                    token
                },
                "Login successful"
            )
        );

    }

    catch (err) {
        throw new ApiError(401, `Invalid token. Error is : ${err.message}`);
    }
});

//login using google
//how to add role and phone number is remaing
const googleLogin = asyncHandler(async (req, res) => {

    try {

        const { token } = req.body;

        if (!token) {
            throw new ApiError(400, "Token missing");
        }

        const decoded = await admin.auth().verifyIdToken(token);

        if (!decoded) {
            throw new ApiError(404, "User not found");
        }

        const { uid, email, name } = decoded;

        let user = await User.findOne({ firebaseUid: uid });

        const isAdmin = email === ADMIN_EMAIL;

        if (!user) {

            user = await User.create(
                {
                    firebaseUid: uid,
                    email,
                    name,
                    role: isAdmin ? "admin" : "user",
                }
            );
        } else if (isAdmin && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    user,
                    token
                },
                "Google login successful",
            )
        );
    }

    catch (err) {
        throw new ApiError(401, `Google token invalid. Error is : ${err.message}`);
    }

});

//logout
const logoutUser = asyncHandler(async (req, res) => {

    try {

        const uid = req.user.firebaseUid;

        if (!uid) {
            throw new ApiError(400, "User not found");
        }


        await admin.auth().revokeRefreshTokens(uid);
        res.status(200).json(
            new ApiResponse(200, null, "User logged out successfully")
        )
    }

    catch (err) {
        throw new ApiError(500, `Error while logout. Error is : ${err.message}`);
    }

});


//get profile of user
const getProfile = asyncHandler(async (req, res) => {

    try {

        const uid = req.user.firebaseUid;

        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(
            new ApiResponse(200, user, "Profile Search Successfully")
        )
    }

    catch (err) {
        throw new ApiError(500, `Error while finding profile. Error is : ${err.message}`);
    }
});


//change password -> if user know current password and user not have email with him then use this functionality
const resetPassword = asyncHandler(async (req, res) => {

    const email = req.user.email;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Both current and new password are required.");
    }

    try {

        //verify password
        const verifyResponse = await fetch(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + process.env.FIREBASE_WEB_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        email,
                        password: currentPassword,
                        returnSecureToken: true,
                    }
                ),
            }
        );

        //check
        if (!verifyResponse.ok) {
            throw new ApiError(401, "Invalid current password");
        }

        //store json format
        const verifyData = await verifyResponse.json();

        const idToken = verifyData.idToken;


        //update password
        const updateResponse = await fetch(
            "https://identitytoolkit.googleapis.com/v1/accounts:update?key=" + process.env.FIREBASE_WEB_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        idToken,
                        password: newPassword,
                        returnSecureToken: false,
                    }
                ),
            }
        );

        if (!updateResponse.ok) {
            throw new ApiError(400, "Failed to update password");
        }

        res.status(200).json(
            new ApiResponse(200, null, "Password updated successfully")
        );
    }

    catch (err) {
        throw new ApiError(500, `Error while reset Password. \n Error is : ${err.message}`);
    }

});


//forget password -> if user have gmail login , then use this functionality
const forgetPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }


    try {

        const user = await admin.auth().getUserByEmail(email);

        if (!user) {
            throw new ApiError(404, "Invalid Email. No Account Found");
        }

        const resetLink = await admin.auth().generatePasswordResetLink(email);

        if (!resetLink) {
            throw new ApiError(500, "Error in generating reset link");
        }

        // Try to send email - if email service is not configured, still return success with link
        try {
            //it's take 5-6 minute
            await sendEmail(
                email,
                "Reset your password",
                `
                    <h3>Hello ${user.displayName || "User"},</h3>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetLink}" target="_blank">Reset Password</a>
                    <br><br>
                    <p>If you did not request this, ignore this email.</p>
                `
            );
        } catch (emailError) {
            // If email fails, log but don't fail the request - user can still use the reset link
            console.error("Failed to send email (email service may not be configured):", emailError.message);
            // Continue and return the reset link anyway
        }

        res.status(200).json(
            new ApiResponse(200, { resetLink }, "Password reset link generated successfully. Check your email or use the link below.")
        );
    }

    catch (err) {
        // Handle Firebase auth errors specifically
        if (err.code === 'auth/user-not-found') {
            throw new ApiError(404, "No account found with this email address.");
        }
        throw new ApiError(500, `Error in password recovery. Error: ${err.message}`);
    }
});


const updateUserDetails = asyncHandler(async (req, res) => {
    try {
        const { name, phone } = req.body;
        const uid = req.user.firebaseUid;

        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Handle photo upload if provided
        let photoUrl = null;
        if (req.file) {
            const localFilePath = req.file.path;

            // Upload to Cloudinary
            const uploadResponse = await uploadOnCloudinary(localFilePath);

            // Delete local file after upload
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }

            if (!uploadResponse || !uploadResponse.url) {
                throw new ApiError(500, "Failed to upload photo to Cloudinary");
            }

            photoUrl = uploadResponse.url;

            // Delete old photo from Cloudinary if it exists
            if (user.photo) {
                await deleteFromCloudinary(user.photo);
            }

            user.photo = photoUrl;
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update phone if provided
        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.status(200).json(
            new ApiResponse(200, user, "User details updated successfully")
        );
    } catch (err) {
        // Clean up uploaded file if error occurred
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new ApiError(500, `Error while updating user details. Error is : ${err.message}`);
    }
});


// Reset email verification (for testing/debugging)
const resetEmailVerification = asyncHandler(async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        throw new ApiError(400, "UID is required");
    }

    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.emailVerified = false;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    res.status(200).json(
        new ApiResponse(200, { user }, "Email verification reset successfully")
    );
});

const sendEmailVerification = asyncHandler(async (req, res) => {
    const uid = req.user.firebaseUid;
    console.log("sendEmailVerification: Starting for uid:", uid);

    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Allow resending even if already verified (for cases where user wants to re-verify)
    // Only show a warning if already verified
    const isAlreadyVerified = user.emailVerified;

    const verificationLink = await sendVerificationEmailInternal(user);

    res.status(200).json(
        new ApiResponse(200, { verificationLink }, isAlreadyVerified ? "Verification email sent again. You are already verified but can re-verify if needed." : "Verification email sent successfully. Check your inbox or use the link above.")
    );
});

// Verify email with token
const verifyEmail = asyncHandler(async (req, res) => {
    const { token, uid } = req.body;

    if (!token || !uid) {
        throw new ApiError(400, "Token and UID are required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        firebaseUid: uid,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        // Check if the user exists but the token is wrong/expired
        const existingUser = await User.findOne({ firebaseUid: uid });
        if (existingUser && existingUser.emailVerified) {
            return res
                .status(200)
                .json(new ApiResponse(200, { user: existingUser }, "Email already verified."));
        }
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, { user }, "Email verified successfully"));
});

//get all users
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({}).select("-__v -password"); // Exclude sensitive fields

        res.status(200).json(
            new ApiResponse(200, users, "Users retrieved successfully")
        );
    } catch (err) {
        throw new ApiError(500, `Error while fetching users. Error is : ${err.message}`);
    }
});

//get user by uid
const getUserByUid = asyncHandler(async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ firebaseUid: uid }).select("-__v -password"); // Exclude sensitive fields

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(
            new ApiResponse(200, user, "User retrieved successfully")
        );
    } catch (err) {
        throw new ApiError(500, `Error while fetching user. Error is : ${err.message}`);
    }
});

//update user by uid
const updateUserByUid = asyncHandler(async (req, res) => {
    try {
        const { uid } = req.params;
        const { name, email, role, phone } = req.body;

        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Update fields
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }
        if (role) {
            user.role = role;
        }
        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.status(200).json(
            new ApiResponse(200, user, "User updated successfully")
        );
    } catch (err) {
        throw new ApiError(500, `Error while updating user. Error is : ${err.message}`);
    }
});

//delete user by uid
const deleteUserByUid = asyncHandler(async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        await user.remove();

        res.status(200).json(
            new ApiResponse(200, null, "User deleted successfully")
        );
    } catch (err) {
        throw new ApiError(500, `Error while deleting user. Error is : ${err.message}`);
    }
});

export {
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    getProfile,
    resetPassword,
    forgetPassword,
    updateUserDetails,
    sendEmailVerification,
    verifyEmail,
    getAllUsers,
    getUserByUid,
    updateUserByUid,
    deleteUserByUid,
    resetEmailVerification,
};