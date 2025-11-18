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
            enum: ['visitor', 'buyer', 'renter', 'lister', 'admin'], //role only one of this
            required: true
        },

        phone: {
            type: String,
            required: function () {      //if user is lister then phone number is required
                return this.role === "lister";
            }, 

            //validate format of phone numbers that correct or not
            validate: {
                validator: function (num) {
                    if(!num || /^\d{10}$/.test(num)) return 1;
                    return 0;
                },

                message: (props) => `${props.value} is not a valid phone number!`, // props.value is number that user enter 
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
    },

    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);