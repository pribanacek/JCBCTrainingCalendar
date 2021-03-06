const moment = require('moment');

function getTimeString(cells) {
    if (cells[1]) {
        const regex = /[0-9]{1,2}( |:|\.)?[0-9]{2}/g;
        var matches = cells[1].match(regex);
        return matches ? matches[0] : null;
    }
    return null;
}

function setTime(date, timeString) {
    const regex = /[0-9]{1,2}/g;
    if (timeString) {
        var concat = timeString.match(regex).join('');
        if (concat.length == 3) {
            concat = '0' + concat;
        }
        if (concat.length == 4) {
            var hour = parseInt(concat.substring(0, 2));
            var min = parseInt(concat.substring(2, 4));
            date.hour(hour);
            date.minute(min);
        }
    }
    return date;
}

function getEnd(date, morning, weekend, name) {
    name = name.toLowerCase();
    var end = moment(date);
    if (name.includes('erg') || name.includes('circuit')) {
        end.add(1, 'hour');
    } else if (name.includes('weight') || name.replace(/ /g,'').includes('s&c')) {
        end.add(1.5, 'hour');
    } else if (name.includes('outing')) {
        if (morning && !weekend) {
            end.hour(8);
            end.minute(30);
        } else if (weekend) {
            end.add(2.5, 'hour');
        } else {
            end.add(2, 'hour');
        }
    } else if (name.includes('bumps')) {
        end.add(3, 'hour');
    } else {
        //default
        end.add(1, 'hour');
    }
    return end;
}

module.exports = function (date, cells) {
    let name = 'N/A';
    let description = '';

    if (cells.length > 0) {
        name = cells[0];
        if (cells[2]) {
            description = cells[2];
        }
    }

    let timeCell = getTimeString(cells);

    if (cells[1] && cells[1].toLowerCase().replace(/ /g, '').includes('owntime')) {
        name += ' (own time)';
    } else if (!timeCell) {
        name += ' (Time TBC)';
    }

    let start = setTime(date, timeCell);
    let end = getEnd(date, date.hour() < 10, date.day() % 6 == 0, name);

    return {
        start: start,
        end: end,
        summary: name,
        description: description,
    };
}
