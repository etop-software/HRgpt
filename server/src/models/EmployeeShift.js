const mongoose = require('mongoose');

const EmployeeShiftSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',  // Reference to Employee
    required: true
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',  // Reference to Shift
    required: true
  },
  assignedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  startDate: {
    type: Date,
    required: true,  // Indicates when the shift starts
  },
  endDate: {
    type: Date,
    required: true,  // Indicates when the shift ends
  },
  active: {
    type: Boolean,
    required: true,
    default: true  // Indicates if the shift is currently active
  }
});

const EmployeeShift = mongoose.model('EmployeeShift', EmployeeShiftSchema);

module.exports = EmployeeShift;
