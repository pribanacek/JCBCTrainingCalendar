class GoogleSheet {
    constructor(spreadsheet) {
        this.spreadsheet = spreadsheet;
    }

    authenticate(creds) {
        return new Promise((resolve, reject) => {
            this.spreadsheet.useServiceAccountAuth(creds, () => {
                resolve();
            });
        });
    }

    getSheets() {
        return new Promise((resolve, reject) => {
            this.spreadsheet.getInfo((err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info.worksheets);
                }
            });
        });
    }

}

module.exports = GoogleSheet;
