
//COUNTDOWN TIMER
//edit ".25" below to change time in terms of day
var deadline = new Date(Date.now() + 37.52 *24*3600*1000);

var x = setInterval(function() {

var now = Date.now();
var t = deadline - now;
var days = Math.floor(t / (1000 * 60 * 60 * 24));
var hours = Math.floor((t%(1000 * 60 * 60 * 24))/(1000 * 60 * 60));
var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
var seconds = Math.floor((t % (1000 * 60)) / 1000);
document.getElementById("day").innerHTML =days ;
document.getElementById("hour").innerHTML =hours;
document.getElementById("minute").innerHTML = minutes;
document.getElementById("second").innerHTML =seconds;
if (t < 0) {
        clearInterval(x);
        document.getElementById("day").innerHTML ='0';
        document.getElementById("hour").innerHTML ='0';
        document.getElementById("minute").innerHTML ='0' ;
        document.getElementById("second").innerHTML = '0'; }
}, 1000);

//COUNTDOWN BAR

function progress(timeleft, timetotal, $element) {
  var progressBarWidth = timeleft * $element.width() / timetotal;
  $element.find('div').animate({ width: progressBarWidth }, timeleft == timetotal ? 0 : 1000, 'linear');
  if(timeleft > 0) {
      setTimeout(function() {
          progress(timeleft - 1, timetotal, $element);
      }, 1000);
  }
};
//adjust these numbers to match time set
//must be in seconds
progress(980000, 3241873 , $('#countdown-progressBar'));


  