// Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
    },
    attendanceState: {
        type: String,
        required: true,
    },
    terminalId: {
        type: String,
        required: true,
    },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
