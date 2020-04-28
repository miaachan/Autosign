const schedule = require('node-schedule');
const lenovo = require('./lenovo');







const signTask = () => {
    schedule.scheduleJob('20 * * * * *', () => {
        this.logger("開始簽到");

    })
}
signTask(); //啓動定時任務

lenovo.task();