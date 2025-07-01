// employeeData.js

let lastCreatedEmployee = null; // Variable to hold last created employee data

let LastUpdatedDevice = null;

module.exports = {
    setLastCreatedEmployee: (employee) => {
        lastCreatedEmployee = employee; // Store the employee data
    },
    getLastCreatedEmployee: () => {
        return lastCreatedEmployee; // Retrieve the stored employee data
    },
    setLastUpdatedDevice:(Device)=>
    {
        LastUpdatedDevice=Device;
    },
    getLastUpdatedDevice:() =>{
        return LastUpdatedDevice;
    }
};
