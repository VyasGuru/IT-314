import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import admin from "firebase-admin";
import fetch from "node-fetch"; //for reset password and call firebase REST API

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

        const uid = req.user?.uid;

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

        const uid = req.user.uid;

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


//change password
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


export{
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    getProfile,
    resetPassword,
};