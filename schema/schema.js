const graphql = require("graphql");

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLObject,
    GraphQLNonNull
} = graphql;

const Patient = require("../models/patient.mongo");
const Hospital = require("../models/hospital.mongo");

//some function

const findCapacity = async (hospitalId) => {    
    let capacity = await Hospital.findById(hospitalId).select({"capacity" : 1});
    capacity = capacity['capacity']
    return capacity;
}

const PatientType = new GraphQLObjectType({
    name : "Patient",
    fields : () => ({
        name : {type : GraphQLString},
        age : {type : GraphQLInt},
        status : {type : GraphQLString},
        hospital : {
            type : HospitalType,
            args : {id : {type : GraphQLID}},
            resolve : (parent) => {
                return Hospital.findById(parent.hospital);
            }
        }
    })
})

const HospitalType = new GraphQLObjectType({
    name : "Hospital",
    fields : () => ({
        id : {type : GraphQLID},
        name : {type : GraphQLString},
        city : {type : GraphQLString},
        capacity : {type : GraphQLInt},
        patient : {
            type : new GraphQLList(PatientType),
            args : {hospital : {type : GraphQLString}},
            resolve : (parent) => {
                return Patient.find({hospital : parent.id})
            }
        },
        statistics : {
            type : StattType,
            resolve : (parent) => {
                let statistics = new Object();
                statistics['total'] = Patient.count({hospital : parent.id});
                statistics['recovered'] = Patient.count({status : "recovered", hospital : parent.id});
                statistics['dead'] = Patient.count({status : "dead", hospital : parent.id});
                statistics['underTreatment'] = Patient.count({status : "underTreatment", hospital : parent.id});
                statistics['critical'] = Patient.count({status : "critical", hospital : parent.id});
                statistics['capacity'] = findCapacity(parent.id);
                
                return statistics;
            }
        }
    })
});

const StattType = new GraphQLObjectType({
    name : "Statistics",
    fields : () => ({
        recovered : {type : GraphQLFloat},
        underTreatment : {type : GraphQLFloat},
        dead : {type : GraphQLFloat},
        critical : {type : GraphQLFloat},
        total : {type : GraphQLInt},
        capacity : {type : GraphQLInt}
    })
})


const RootQuery2 = new GraphQLObjectType({
    name : "RootQuery",
    fields : {
        "patient" : {
            type : PatientType,
            args : {id : {type : GraphQLString}},
            resovle : (parent, args) => {
                console.log("Im gere")
                return {"msf" : "hello world"}
                return Patient.find({});
            }
        },
        "hospital" : {
            type : HospitalType,
            args : {id : {type : GraphQLID}},
            resovle : (parent, args) => {
                return Hospital.findById(args.id);
            }
        }
    }    
})

const RootQuery = new GraphQLObjectType ({
    name : "RootQuery",
    fields : {
        "patient" : {
            type : PatientType,
            args : {id : {type : GraphQLID}},
            resolve : (parent, args) => {
                return Patient.findById(args.id);
            }
        },
        "hospital" : {
            type : HospitalType,
            args : {id : {type : GraphQLID}},
            resolve : (parent, args) => {
                return Hospital.findById(args.id);
            }
        },
        "patients" : {
            type : new GraphQLList(PatientType),
            resolve : () => {
                return Patient.find({}, null, {sort : {_id : -1}});
            }
        },
        "hospitals" : {
            type : new GraphQLList(HospitalType),
            resolve : () => {
                return Hospital.find({});
            }
        },
        "statistics" : {
            type : StattType,
            args : {hospitalId : {type : GraphQLID}},
            resolve : (parent, args) => {
                let statistics = new Object();
                statistics['total'] = Patient.count({hospital : args.hospitalId});
                statistics['recovered'] = Patient.count({status : "recovered", hospital: args.hospitalId});
                statistics['dead'] = Patient.count({status : "dead", hospital : args.hospitalId});
                statistics['underTreatment'] = Patient.count({status : "underTreatment", hospital : args.hospitalId});
                statistics['critical'] = Patient.count({status : "critical", hospital : args.hospitalId});
                statistics['capacity'] = findCapacity(args.hospitalId);
                
                return statistics;
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name : "Mutation",
    fields : {
        addPatient : {
            type : PatientType,
            args : {
                name : {type : GraphQLString},
                age : {type : GraphQLInt},
                status : {type : GraphQLString},
                hospital : {type : GraphQLString},
            },
            resolve (parent, args) {
                let patient = new Patient({
                    name : args.name,
                    age : args.age,
                    status : args.status,
                    hospital : args.hospital,
                    admissionDate : Date.now()
                })
                return patient.save();
            }
        },
        addHospital : {
            type : HospitalType,
            args : {
                name : {type : GraphQLString},
                city : {type : GraphQLString},
                capacity : {type : GraphQLInt}
            },
            resolve : (parent, args) => {
                let hospital = new Hospital({
                    name : args.name,
                    city : args.city,
                    capacity : args.capacity
                })
                return hospital.save();
            }
        }
    }
});

module.exports = new GraphQLSchema ({
    query : RootQuery,
    mutation : Mutation
});