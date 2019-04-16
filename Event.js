const moment = require('moment');

function getTimeString(cells) {
    const regex = /[0-9]{1,2}( |:|\.)?[0-9]{2}/g;

    for (i in cells) {
        var cell = cells[i];
        if (cell.toLowerCase().includes('meet')) {
            var matches = cell.match(regex);
            if (!matches) {
                return null;
            }
            return matches[0];
        }
    }

    for (i in cells) {
        var cell = cells[i];
        var matches = cell.match(regex);
        if (matches && matches.length > 0) {
            return matches[0];
        }
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
    } else if (name.includes('weight')) {
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

    if (cells.length == 2) {
        name = cells[0];
    } else if (cells.length == 4) {
        name = cells[1];
        description = cells[0] + '\n' + cells[3];
    }

    let timeCell = getTimeString(cells);

    if (!timeCell) {
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
