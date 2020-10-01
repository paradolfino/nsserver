export default class Utils {
    //there should be a client level and server level utilities class
    constructor() {
    }

    static GetNewGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static GetNewPassword() {
        let out = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return Utils.FakeEncrypt(out);
    }

    static GetRandomNumber(maxRange, flatten = true) {
        return flatten == true ? Math.floor(Math.random() * maxRange) : Math.random() * maxRange;
    }

    static FakeEncrypt(data)
    {
        return Buffer.from(data).toString('base64');
    }

    static FakeDecrypt(data)
    {
        return Buffer.from(data, 'base64').toString();
    }
}