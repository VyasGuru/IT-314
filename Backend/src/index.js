//write function in db folder and import here

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js"
import { seedGovernmentRecords } from "./utils/seedGovernmentRecords.js";

dotenv.config({
    path: './env'
})

connectDB().then(async () => {

    await seedGovernmentRecords();

        //now once database connected , now our application read from database
        app.listen(process.env.PORT || 8000, () => { //if port not found then connect 8000 port
            console.log(`Server is running at port : ${process.env.PORT}`);
        });

    }).catch((err) => {
        console.log("Mongodb connection failed !!!", err)
    })