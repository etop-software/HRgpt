const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  leaveName: {
    type: String,
    required: true,
    trim: true,
  },

  leaveCode: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Leave", LeaveSchema);
