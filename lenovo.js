const rp = require('request-promise-native').defaults({ jar: true });
const fs = require('fs');

var stream = fs.createWriteStream("log.txt", { flags: 'a' });

let logger = (msg) => {
    let nowTime = new Date().toString();
    let dum = nowTime.toString().search(/ \(.*/);
    let logstr = `[${nowTime.substr(0, dum)}]: ${msg}`;
    console.log(logstr);
    stream.write(logstr + '\n');
}

const lenovoTask = () => {
    const url_login = "https://reg.lenovo.com.cn/auth/v2/doLogin";
    const url_signlist = "https://mclub.lenovo.com.cn/signlist";
    const url_signadd = "https://mclub.lenovo.com.cn/signadd";
    const url_jointask = "https://mclub.lenovo.com.cn/signchallengetask";


    let config = JSON.parse(fs.readFileSync("config.json"));
    let secret = JSON.parse(fs.readFileSync("secret.json"));

    let buff = new Buffer.from(secret.LENOVOCLUB[0].password);
    let base64pw = buff.toString('base64');
    let data_login = {
        'account': secret.LENOVOCLUB[0].account,
        'password': base64pw,
        'ps': '1',
        'ticket': '5e9b6d3d-4500-47fc-b32b-f2b4a1230fd3',
        'codeid': '',
        'code': '',
        'slide': 'v2',
        'st': '1584880930109'
    };


    let token, continue_day;
    logger("開始簽到任務");
    rp.post({ url: url_login, headers: config.headers.login, formData: data_login })
        .then(res => JSON.parse(res))
        .then(res => {
            // return Promise.reject(res);
            // 獲取簽到頁面
            return (res['ret'] === '0')
                ? rp.get({ url: url_signlist, headers: config.headers.signlist, gzip: true })
                : Promise.reject(`登入失敗`);
        })
        .then(res => {
            logger(`帳號: ${secret.LENOVOCLUB[0].account} 登入成功`);

            // fs.writeFile('output.txt', res, () => console.log("Signlist output to output.txt"));

            token = res.match(/CONFIG\.token = "\w{40}/)[0].substr(-40);
            continue_day = res.match(/><b>.{1,8}/)[0].substr(-8);

            return rp.post({
                url: url_jointask, headers: config.headers.sign, gzip: true,
                form: {
                    '_token': token,
                    'task_id': '3'
                }
            })
        })
        .then((res) => {
            res = JSON.parse(res);
            if (res['code'])
                logger(`帳號: ${secret.LENOVOCLUB[0].account} 參加10日連續簽到任務`);

            return rp.post({
                url: url_signadd, headers: config.headers.sign, gzip: true,
                form: {
                    '_token': token
                }
            });
        })
        .then(res => {
            res = JSON.parse(res);
            if (res['add_yb_tip'])
                logger(`帳號: ${secret.LENOVOCLUB[0].account} 簽到成功, 本次獲得${res['add_yb_tip']}, 已持續簽到${continue_day} 天`);
            else
                logger(`帳號: ${secret.LENOVOCLUB[0].account} 已簽到, 已持續簽到${continue_day} 天`);

        })

        .catch(err => logger(err))
        .finally(() => stream.end());
}

module.exports = {
    task: lenovoTask
}