export class CountdownTimer {
    constructor(timeLimit, warningThreshold, alertThreshold, onTimerEnd) {
        this.TIME_LIMIT = timeLimit;
        this.WARNING_THRESHOLD = warningThreshold; // threshold when the timer colour changes to orange
        this.ALERT_THRESHOLD = alertThreshold; // threshold when the timer colour changes to red
        this.onTimerEnd = onTimerEnd; // call back function
        this.FULL_DASH_ARRAY = 283;
        this.timePassed = 0;
        this.timeLeft = this.TIME_LIMIT;
        this.timerInterval = null;
        this.COLOR_CODES = {
            info: {
                color: "green"
            },
            warning: {
                color: "orange",
                threshold: this.WARNING_THRESHOLD
            },
            alert: {
                color: "red",
                threshold: this.ALERT_THRESHOLD
            }
        };
    }

    // Returns the time in mm:ss format
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;
        if (seconds < 10) {
            seconds = `0${seconds}`; // Add leading 0 if single digit
        }
        return `${minutes}:${seconds}`;
    }

    // Calculates the fraction of time remaining
    calculateTimeFraction() {
        const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
        return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
    }

    // Updates the dasharray value as time passes, starting with 283
    setCircleDasharray() {
        const circleDasharray = `${(this.calculateTimeFraction() * this.FULL_DASH_ARRAY).toFixed(0)} 283`;
        $("#base-timer-path-remaining").attr("stroke-dasharray", circleDasharray)
    }

    // Change the colour of the remaining path based on the warning and alert thresholds
    setRemainingPathColor(timeLeft) {
        const { alert, warning, info } = this.COLOR_CODES;
        const remainingPath = $("#base-timer-path-remaining");
        remainingPath.removeClass(`${info.color} ${warning.color} ${alert.color}`);
        if (timeLeft <= alert.threshold) {
            remainingPath.addClass(alert.color);
        } else if (timeLeft <= warning.threshold) {
            remainingPath.addClass(warning.color);
        } else {
            remainingPath.addClass(info.color);
        }
    }

    // Starts the timer
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timePassed += 1;
            this.timeLeft = this.TIME_LIMIT - this.timePassed;
            $("#base-timer-label").text(this.formatTime(this.timeLeft));
            this.setCircleDasharray();
            this.setRemainingPathColor(this.timeLeft);
            if (this.timeLeft === 0) {
                clearInterval(this.timerInterval);
                if (this.onTimerEnd) {
                    this.onTimerEnd();
                }
            }
        }, 1000);
    }
}