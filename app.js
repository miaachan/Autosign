const schedule = require('node-schedule');
const lenovo = require('./lenovo');

const signTask = () => {
    schedule.scheduleJob('21 0 7 * * *', () => {
        lenovo.task();
    })
}
signTask(); //啓動定時任務
