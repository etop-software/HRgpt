const mongoose = require("mongoose");

const Department = require('./Department'); 
const Designation = require('./Designation'); 

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); 
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  password: {
    type: String,
    required: false, 
  },
  rfid: {
    type: String,
    required: false,
    unique: true, 
  },
  dateOfJoining: {
    type: Date,
    required: false, 
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: false,
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation", 
    required: false,
  },
  passportImage: {
    type: String, 
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the updatedAt field before saving
EmployeeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Employee model
module.exports = mongoose.model("Employee", EmployeeSchema);
