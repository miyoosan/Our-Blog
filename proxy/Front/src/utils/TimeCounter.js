// const TimeCounter = {
//   this.hour: 0,
//   this.minute: 0,
//   this.second: 0
// }

// var this.hour, this.minute, this.second;//時 分 秒

var int;

class TimeCounter {
  constructor() {
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.millisecond = 0;
    this.times = '00:00:00';
  }
  //重置
  Reset = () => {
    window.clearInterval(int);
    this.millisecond = this.hour = this.minute = this.second = 0;
    this.times = '00:00:00';
    document.getElementById('times').innerHTML = this.times;
  }

  //開始
  Start = () => {
    const self = this;
    int = setInterval(self.Timer, 50);
  }

  //計時
  Timer = () => {
    this.millisecond = this.millisecond + 50;
    if (this.millisecond >= 1000) {
      this.millisecond = 0;
      this.second = this.second + 1;
    }
    if (this.second >= 60) {
      this.second = 0;
      this.minute = this.minute + 1;
    }

    if (this.minute >= 60) {
      this.minute = 0;
      this.hour = this.hour + 1;
    }
    let hour = this.hour;
    let minute = this.minute;
    let second = this.second;
    if (this.hour < 10) {
      hour = `0${this.hour}`
    }
    if (this.minute < 10) {
      minute = `0${this.minute}`
    }
    if (this.second < 10) {
      second = `0${this.second}`
    }
    this.times = hour + ':' + minute + ':' + second;
    document.getElementById('times').innerHTML = this.times;
  }

  // 暂停
  Stop = () => {
    window.clearInterval(int);
  }
}



// TimeCounter.Reset = Reset;
// TimeCounter.Start = Start;
// TimeCounter.Stop = Stop;
// TimeCounter.Timer = Timer;

export default TimeCounter;
