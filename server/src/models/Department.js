const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: [true, "Department Name is required"],
    trim: true,
  },
  departmentHead: {
    type: String,
    required: [true, "Department Head is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address",
    ],
  },
});

module.exports = mongoose.model("Department", DepartmentSchema);