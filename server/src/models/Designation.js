const mongoose = require("mongoose");

const DesignationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Designation Title is required"],
    trim: true,
  },
});

module.exports = mongoose.model("Designation", DesignationSchema);
