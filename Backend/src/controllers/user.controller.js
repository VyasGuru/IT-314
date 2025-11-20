import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import admin from "firebase-admin";
import fetch from "node-fetch"; //for reset password and call firebase REST API
import { sendEmail } from "../utils/sendMail.js";

//register
const registerUser = asyncHandler(async (req, res) => {

    try{
        const {firebaseUid, email, name, role, phone} = req.body;

        if(!firebaseUid || !email || !name || !role || (role === 'lister' && !phone)){ // if user is lister then phone number is required
            throw new ApiError(400, "All fields required");
        }

        const existing = await User.findOne({firebaseUid});
        if(existing){
            throw new ApiError(400, "User already exists");
        }

        const user = await User.create(
            {
                firebaseUid,
                email,
                name,
                role,
                phone
            }
        );


        res.status(201).json(
            new ApiResponse(201, user, "User registered")
        );
    }

    catch(err){
        throw new ApiError(500, `Error while register. Error is : ${err.message}`);
    }
});


//login (email + password) 
//how to add role and phone number is remaing
const loginUser = asyncHandler(async (req, res) => {

    try {

        const { token } = req.body;

        if(!token){
            throw new ApiError(400, "Token missing");
        }

        const decoded = await admin.auth().verifyIdToken(token);

        if(!decoded){
            throw new ApiError(404, "User not found");
        }

        const {uid, email} = decoded;

        let user = await User.findOne({firebaseUid: uid});

        //if user is present in firebase but not in mongodb then add it
        //firebase store - uid, name, email, password
        if(!user){
            user = await User.create(
                {
                    firebaseUid: uid,
                    email,
                    name: decoded.name || "Unnamed User",
                    role: "visitor",
                }
            );
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

    catch(err){
        throw new ApiError(401, `Invalid token. Error is : ${err.message}`);
    }
});

//login using google
//how to add role and phone number is remaing
const googleLogin = asyncHandler(async (req, res) => {

    try {

        const { token } = req.body;

        if(!token){
            throw new ApiError(400, "Token missing");
        }

        const decoded = await admin.auth().verifyIdToken(token);

        if(!decoded){
            throw new ApiError(404, "User not found");
        }

        const {uid, email, name} = decoded;

        let user = await User.findOne({firebaseUid: uid});

        if(!user){

            user = await User.create(
                {
                    firebaseUid: uid,
                    email,
                    name,
                    role: "visitor",
                }
            );
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
        throw new ApiError(401, `Google token invalid. Error is : ${err.message}`)
    }

});

//logout
const logoutUser = asyncHandler(async (req, res) => {

    try {

        const uid = req.user.firebaseUid;

        if(!uid){
            throw new ApiError(400, "User not found");
        }


        await admin.auth().revokeRefreshTokens(uid);
        res.status(200).json(
            new ApiResponse(200, null, "User logged out successfully")
        )
    }

    catch(err){
        throw new ApiError(500, `Error while logout. Error is : ${err.message}`);
    }

});


//get profile of user
const getProfile = asyncHandler(async (req, res) => {

    try {

        const uid = req.user.firebaseUid;

        const user = await User.findOne({firebaseUid: uid});

        if(!user){
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(
            new ApiResponse(200, user, "Profile Search Successfully")
        )
    }

    catch(err){
        throw new ApiError(500, `Error while finding profile. Error is : ${err.message}`);
    }
});


//change password -> if user know current password and user not have email with him then use this functionality
const resetPassword = asyncHandler(async (req, res) => {

    const email = req.user.email;

    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword){
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
        if(!verifyResponse.ok){
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

        if(!updateResponse.ok){
            throw new ApiError(400, "Failed to update password");
        }

        res.status(200).json(
            new ApiResponse(200, null, "Password updated successfully")
        );
    } 
    
    catch (err) {
        throw new ApiError(500, `Error while reset Password. \n Error is : ${err.message}`)   
    }

});


//forget password -> if user have gmail login , then use this functionality
const forgetPassword = asyncHandler(async (req, res) => {

    const {email} = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }


    try {
        
        const user = await admin.auth().getUserByEmail(email);

        if(!user){
            throw new ApiError(404, "Invalid Email. No Account Found");
        }

        const resetLink = await admin.auth().generatePasswordResetLink(email);

        if(!resetLink){
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
            new ApiResponse(200, {resetLink} , "Password reset link generated successfully. Please check your email for the reset link.")
        );
    } 
    
    catch (err) {
        // Handle Firebase auth errors specifically
        if (err.code === 'auth/user-not-found') {
            throw new ApiError(404, "No account found with this email address.");
        }
        throw new ApiError(500, `Error in password recovery. Error: ${err.message}`)
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

        if (name) {
            user.name = name;
        }

        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.status(200).json(
            new ApiResponse(200, user, "User details updated successfully")
        );
    } catch (err) {
        throw new ApiError(500, `Error while updating user details. Error is : ${err.message}`);
    }
});


export{
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    getProfile,
    resetPassword,
    forgetPassword,
    updateUserDetails,
};