const mongoose = require("mongoose");

const PatientSchema = {
    name : String,
    age : Number,
    status : String,
    hospital : String,
    admissionDate : Number,
}

module.exports = mongoose.model("Patient", PatientSchema)