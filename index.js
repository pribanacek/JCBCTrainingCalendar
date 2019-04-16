const ical = require('ical-generator');
const express = require('express');
const app = express();

const moment = require('moment');
moment.tz.setDefault("Europe/London");

const GoogleSpreadsheet = require('google-spreadsheet');
const GoogleSheet = require('./GoogleSheet');
const CrewTable = require('./CrewTable');

const crews = ['M1', 'M2'];
const calendars = {};

const id = '17HtR4I_Z7GBSpHn9kMZe0ScimIGn2sJ9t53uO_ds8Lc';
const doc = new GoogleSheet(new GoogleSpreadsheet(id));

var creds = require('./credentials.json');

function parseSheetDate(title) {
    const regex = /[0-9]{1,2}(?:st|nd|rd|th) [a-zA-Z]+/;
    var date = moment().set({hour:0,minute:0,second:0,millisecond:0});
    var dateString = title.match(regex)[0].replace(/(st|nd|rd|th)/, '');
    date.date(dateString.split(' ')[0]);
    date.month(dateString.split(' ')[1]);
    return date;
}

function useSheet(date, now) {
    return Math.abs(date.diff(now, 'days')) <= 7;
}


['M1', 'M2'].forEach(name => {
    calendars[name] = ical({
        domain: '77.78.99.41',
        name: name + ' Training',
        timezone: 'Europe/London',
        ttl: 30 * 60
    });
});

async function loadCrewEvents(crewName) {
    await doc.authenticate(creds);
    var allSheets = await doc.getSheets();
    var now = moment();
    var sheets = allSheets.filter(sheet => !!sheet.title.match(/[0-9](?:st|nd|rd|th)/));
    sheets = sheets.filter(sheet => useSheet(parseSheetDate(sheet.title), now));
    var events = [];
    for (i in sheets) {
        var crewTable = await CrewTable.findCells(crewName, sheets[i]);
        events.push.apply(events, crewTable.getEvents());
    }
    return events;
}

function refreshCalendars() {
    Object.keys(calendars).forEach(key => {
        loadCrewEvents(key).then(events => {
            calendars[key].clear();
            calendars[key].events(events);
            console.log(`[${moment()}] Successfully loaded ${key} schedule.`);
            // console.log(events);
        }).catch(error => {
            console.error(`[${moment()}] Unexpected error occurred`);
            console.error(error);
        });
    });
}

refreshCalendars();

// refresh every 30 mins
setInterval(refreshCalendars, 30 * 60 * 1000);

app.get('/schedule/:type', function (req, res, next) {
    if (req.params.type.endsWith('.ical')) {
        let crew = req.params.type.replace('.ical', '');
        if (calendars[crew]) {
            return calendars[crew].serve(res);
        }
    }
    next();
});

app.use(function(req, res, next) {
    res.sendStatus(404);
});

app.use(function(error, req, res, next) {
    console.error(`[${moment()}] Unexpected error occurred`);
    console.error(error);
    res.sendStatus(500);
});

app.listen(3000, '0.0.0.0', function() {
    console.log('Server running at http://127.0.0.1:3000/');
});
