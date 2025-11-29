import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firebaseUid :{
            type: String,
            required: true,
            unique: true,
            index: true, //for fast searching
        },

        email: {
            type: String,
            required: true,
            trim: true, //remove front and back blank space

            //check email valid or not
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // email addresss in valid then print errors message

            index: true //for fast searching
        },

        name: {
            type: String,
            required: true,
            trim: true, //remove front and back blank space
        },

        role: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true,
            default: null,
            
            //validate format of phone numbers that correct or not
            validate: {
                validator: function (num) {
                    // Skip validation if phone is not provided (null, undefined, or empty string)
                    if (!num || num.trim().length === 0) return true;
                    // If phone is provided, it must be exactly 10 digits
                    return /^\d{10}$/.test(num.trim());
                },

                message: (props) => `${props.value} is not a valid phone number! Please provide exactly 10 digits.`, 
            },
        },

        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'not_submitted'],
            default: 'not_submitted',
        },

        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },

        isSuspended: {
            type: Boolean,
            default: false,
        },

        isBanned: {
            type: Boolean,
            default: false,
        },

        photo: {
            type: String,
            default: null,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerificationToken: {
            type: String,
            default: null,
        },

        emailVerificationExpires: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);