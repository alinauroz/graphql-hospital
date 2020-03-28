const mongoose = require("mongoose");

const HospitalSchema = {
    name : String,
    city : String,
    capacity : Number
}

module.exports = mongoose.model("Hospital", HospitalSchema);