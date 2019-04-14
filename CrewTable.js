const moment = require('moment');
const makeEvent = require('./Event');

class CrewTable {
    constructor(title, cells) {
        this.title = title;
        this.cells = cells;
        this.date = moment().set({hour:0,minute:0,second:0,millisecond:0});

        var weekBeginning = cells[1][1];
        var day = weekBeginning.match(/[0-9]+/);
        var month = weekBeginning.match(/[a-zA-Z]+/);
        if (day) {
            this.date.date(day[0]);
        }
        if (month) {
            this.date.month(month[0]);
        }
    }

    getEventCells(row, col) {
        var eventCells = [];
        for (let i = 0; i < 4; i++) {
            var cell = this.cells[row + i][col];
            if (!cell || cell.toLowerCase().includes('off')) {
                break;
            } else {
                eventCells.push(cell);
            }
        }
        return eventCells;
    }

    getEvents() {
        var events = [];

        var dates = this.cells[1];
        var amIndex = this.cells.findIndex(row => row[0].toLowerCase() == 'am');
        var pmIndex = this.cells.findIndex(row => row[0].toLowerCase() == 'pm');

        for (let i = 1; i < dates.length; i++) {
            var date = moment().set({hour:0,minute:0,second:0,millisecond:0});
            date.date(dates[i].match(/[0-9]+/)[0]);
            date.month(dates[i].match(/[a-zA-Z]+/)[0]);

            var amTime = moment(date).hour(6).minute(30);
            var pmTime = moment(date).hour(date.day() % 6 == 0 ? 14 : 18).minute(0);

            var amCells = this.getEventCells(amIndex, i);
            if (amCells.length > 0) {
                events.push(makeEvent(amTime, amCells));
            }
            var pmCells = this.getEventCells(pmIndex, i);
            if (pmCells.length > 0) {
                events.push(makeEvent(pmTime, pmCells));
            }
        }
        return events;
    }

    static findCells(title, sheet) {
        return new Promise((resolve, reject) => {
            sheet.getCells({
                'min-row': 25,
                'max-row': 64,
                'min-col': 2,
                'max-col': 16,
                'return-empty': true
            }, (error, cells) => {
                if (error) {
                    reject(error);
                } else {
                    const WIDTH = 8;
                    const HEIGHT = 12;
                    var titleCell = cells.findIndex(cell => cell._value.includes(title));
                    if (titleCell < 0) {
                        return reject(new Error("No subtable found"));
                    }

                    var startRow = cells[titleCell].row;
                    var endRow = startRow + HEIGHT;
                    var startCol = cells[titleCell].col;
                    var endCol = startCol + WIDTH;

                    var subtable = cells.filter(cell =>
                        cell.row >= startRow && cell.row < endRow &&
                        cell.col >= startCol && cell.col < endCol
                    );

                    var arr = [];
                    for (var i = 0; i < HEIGHT; i++) {
                        arr.push([]);
                        for (var j = 0; j < WIDTH; j++) {
                            var cell = subtable[i * WIDTH + j];
                            arr[i].push(cell._value);
                        }
                    }
                    resolve(new CrewTable(title, arr));
                }
            });
        });
    }
}

module.exports = CrewTable;
