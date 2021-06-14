export class Logger {
    static log(value: string) {
        console.log(`[${new Date(Date.now()).toLocaleTimeString()}][EzMongoDB] ${value}`);
    }

    static error(value: string) {
        console.error(`[${new Date(Date.now()).toLocaleTimeString()}][EzMongoDB] ${value}`);
    }
}
