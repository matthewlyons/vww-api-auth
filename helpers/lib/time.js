module.exports = {
  timeUntilMidnight() {
    let midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    let now = new Date();
    let exp = Math.floor((midnight - now) / 1000);
    return [exp, midnight.getTime()];
  }
};
