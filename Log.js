const fs = require('fs');
const moment = require('moment'); // convinient time formatting
const ansi = require('ansi-styles'); // text style formatting for console output

const PATH = __dirname + '/log/';
if (!fs.existsSync(PATH)) {
    fs.mkdirSync(PATH);
}

const CONSOLE_LOG = console.log;
const CONSOLE_ERR = console.error;

const GET_TIME = () => moment().format('DD/MM/YYYY HH:mm:ss');

const ERROR_LOG = fs.createWriteStream(PATH + 'error.log', {flags: 'a'});
const INFO_LOG = fs.createWriteStream(PATH + 'info.log', {flags: 'a'});

const remove_ansi = function(text) {
    Object.keys(ansi).forEach(key => {
        text = text.replace(ansi[key].open, '').replace(ansi[key].close, '');
    });
    return text;
}

const Log = {
    info: function (msg) {
        var entry = `[${GET_TIME()}] [${ansi.yellow.open}INFO${ansi.yellow.close}] ${msg}`;
        CONSOLE_LOG(entry);
        INFO_LOG.write(remove_ansi(entry) + "\n");
    },
    error: function(err) {
        var entry = `[${GET_TIME()}] [${ansi.red.open}ERROR${ansi.red.close}] ${err}`;

        // output first line of stack trace
        // to locate the file with the error

        if (typeof err.stack === 'string') {
           let s = err.stack.split('\n');
           if (s.length >= 2) {
              entry += `\n${ansi.grey.open}${s[1]}${ansi.grey.close}`;
          }
        }

        CONSOLE_ERR(entry);
        ERROR_LOG.write(remove_ansi(entry) + "\n");
    }
};

module.exports = Log;
