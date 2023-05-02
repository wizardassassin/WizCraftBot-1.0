/**
 * Simple Timer
 */
export class Timer {
    startTime: number;
    stopTime: number;
    static staticStartTime: number;
    static staticStopTime: number;
    constructor() {
        this.startTime = 0;
        this.stopTime = 0;
        this.start();
        this.stop();
    }
    static {
        this.staticStartTime = 0;
        this.staticStopTime = 0;
        this.staticStart();
        this.staticStop();
    }
    start() {
        this.startTime = performance.now();
    }
    static staticStart() {
        this.staticStartTime = performance.now();
    }
    stop() {
        this.stopTime = performance.now();
    }
    static staticStop() {
        this.staticStopTime = performance.now();
    }
    duration() {
        return this.stopTime - this.startTime;
    }
    static staticDuration() {
        return this.staticStopTime - this.staticStartTime;
    }
}
