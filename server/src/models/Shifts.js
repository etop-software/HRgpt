const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    shiftCode: {
        type: String,
        required: true,
        trim:true
    },
    shiftName: {
        type: String,
        required: true,
        trim:true
    },
    inTime: {
        type: String,  
        required: true
    },
    outTime: {
        type: String, 
        required: true
    },
    graceTime: {
        type: Number, 
        default: null
    },
    nextday: {
        type: Boolean,
        required: false
    },
    breakTime: {
        type: Number,  
        default: null
    },
    deductBreak: {
        type: Boolean,
        required: false
    },
    otStartsAfter: {
        type: Number,  
        default: null
    },
    minOtTime: {
        type: Number,  
        default: null
    },
    halfdayInTime: {
        type: String,  
        default: null
    },
    halfdayOutTime: {
        type: String,  // Same as above
        default: null
    },
    halfdayGraceTime: {
        type: Number,  // Optional integer value in minutes
        default: null
    },
    halfdayBreakTime: {
        type: Number,  // Optional integer value in minutes
        default: null
    },
    halfdayOtStartsAfter: {
        type: Number,  // Optional integer value in minutes
        default: null
    },
    halfdayMinTimeForOt: {
        type: Number,  // Optional integer value in minutes
        default: null
    },
    selectedWeekOff: {
        type: [String],  // Array of strings
        required: false
    },
    selectedHalfday: {
        type: [String],  // Array of strings
        required: false
    },
    isActive: {
        type: Boolean,
        required: false
    },
    createdOn: {
        type: Date,  // DateOnly in C# mapped to Date in MongoDB
        required: false,
        default: Date.now
    }
    // employeeShifts: [{
    //     type: mongoose.Schema.Types.ObjectId,  // Refers to EmployeeShift collection
    //     ref: 'EmployeeShift'
    // }]
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
