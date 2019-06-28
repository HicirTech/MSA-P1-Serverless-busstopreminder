let sender = require('./MessageSender.js');
let weatherLoader = require('./WeatherLoader.js');
let atLoader = require('./ATLoader.js');

//function entry 
module.exports = async function (context, myTimer) {
    //Default code
    var timeStamp = new Date().toISOString();
    if (myTimer.IsPastDue) {
        context.log('JavaScript is running late!');
    }
    // context.log(process.env['twilioAuthToken']);

    //My code start here

    var twilioAccountSid = process.env['twilioAccountSid'];
    var twilioAuthToken = process.env['twilioAuthToken'];
    context.log(process.env['twilioAccountSid']);
    weatherLoader.getWeatherResult().then(
        function (weatherResult) {
            let resultString = weatherStringMakeUp(weatherResult)

            atLoader.getTimeTable().then(
                function (busResult) {
                    resultString += busStringMakeUp(busResult);
                    console.info(resultString);
                    console.log('[DEBUG LABLE: RESULE STRING ' + resultString + ']');
                    sender.sendBody(twilioAccountSid,twilioAuthToken,resultString);
                });
        }
    );
};

//helpers
function weatherStringMakeUp(result) {
    var list = result.list[0].main;
    let temp = weatherLoader.kelvinToCelsius(list.temp).toFixed(2);
    let lowTemp = weatherLoader.kelvinToCelsius(list.temp_min).toFixed(2);
    let highTemp = weatherLoader.kelvinToCelsius(list.temp_max).toFixed(2);
    let resultString = 'Hey good morning, current temperature is ' + temp + '°C' +
        // ', today\'s highest temperature is ' + highTemp + '°C' +
        // ', and lowest temperature is ' + lowTemp + '°C' +
        '. Today\'s Weather is: ' + result.list[0].weather[0].description + '. ';
    return resultString;
}
function busStringMakeUp(result) {
    var targetBus = atLoader.targetBus;
    var targetStop = atLoader.stopCode;
    var targetBusTime = atLoader.getNextBus(result);
    let resultString = 'Your bus ' + targetBus + ' will arrive at stop ' + targetStop + ' at ' + targetBusTime;
    return resultString + 'Have a good day';
}
weatherLoader.getWeatherResult().then(
    function (weatherResult) {
        let resultString = weatherStringMakeUp(weatherResult)

        atLoader.getTimeTable().then(
            function (busResult) {
                resultString += busStringMakeUp(busResult);
                console.info(resultString);
                console.log('[DEBUG LABLE: RESULE STRING ' + resultString + ']');
                sender.sendBody(resultString);
            });
    }
);