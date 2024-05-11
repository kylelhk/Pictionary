class CountdownTimer {
    constructor(timeLimit, warningThreshold, alertThreshold) {
        this.TIME_LIMIT = timeLimit;
        this.WARNING_THRESHOLD = warningThreshold;
        this.ALERT_THRESHOLD = alertThreshold;
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
                threshold: WARNING_THRESHOLD
            },
            alert: {
                color: "red",
                threshold: ALERT_THRESHOLD
            }
        };
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;
        if (seconds < 10) {
            seconds = `0${seconds}`; // Add leading 0 if single digit
        }
        return `${minutes}:${seconds}`;
    }

    calculateTimeFraction() {
        const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
        return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
    }

    setCircleDashArray() {
        const circleDasharray = `${(this.calculateTimeFraction() * this.FULL_DASH_ARRAY).toFixed(0)} 283`;
        $("#base-timer-path-remaining").attr("stroke-dasharray", circleDasharray)
    }

    setRemainingPathColor(timeLeft) {
        const { alert, warning, info } = this.COLOR_CODES;
        const remainingPath = $("#base-timer-path-remaining");
        if (timeLeft <= alert.threshold) {
            remainingPath.classList.remove(warning.color);
            remainingPath.classList.add(alert.color);
        } else if (timeLeft <= warning.threshold) {
            remainingPath.classList.remove(info.color);
            remainingPath.classList.add(warning.color);
        } else {
            remainingPath.classList.add(info.color);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timePassed += 1;
            this.timeLeft = TIME_LIMIT - timePassed;
            $("#base-timer-label").text(this.formatTime(this.timeLeft));
            this.setCircleDasharray();
            this.setRemainingPathColor(this.timeLeft);
            if (this.timeLeft === 0) {
                clearInterval(this.timerInterval);
            }
        }, 1000);
    }
}