import mongoose from "mongoose";

const acountSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true
    },
    fullName : {
        type: String,
        required: true
    },
    bankInfo : {
        type: String
    },
    password : {
        type: String,
        required: true
    }
    
})

const AcountModel = mongoose.model("Accounts", acountSchema);

export default AcountModel;
