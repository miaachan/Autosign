const schedule = require('node-schedule');
const lenovo = require('./lenovo');
const fs = require('fs');

let secret = JSON.parse(fs.readFileSync(__dirname + "/secret.json"));

const wrapper = async () => {
    for (let i = 0; i < secret.LENOVOCLUB.length; i++) {
        await lenovo.task(secret.LENOVOCLUB[i].name, secret.LENOVOCLUB[i].account, secret.LENOVOCLUB[i].password);
    }
}



const signTask = () => {
    schedule.scheduleJob('21 7 0 * * *', () => {
        wrapper();
    })
}
console.log(`*** AUTOSIGN IS NOW RUNNING ***`)
signTask(); //啓動定時任務

