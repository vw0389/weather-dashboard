var key = "7099cf0ea7b7028a167ac0d2266d64ca";
var cityHistory = {};
// TODO
// Fix local storage issues, it always gets a dictionary of length 1 from local storage for some reason
// style the webpage

$(".search").click(async function () {
    var city = $(".textSearch").val().trim();
    var today = new Date();
    if (city) {
        $(".textSearch").val("");
        var titleCity = toTitleCase(city);
        if (city in cityHistory) {
            display(city);
            return;
        }
        var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + key;
        var firstCall = await get(weatherUrl);
        if (firstCall === 1) {
            alert("City not found");
            return;

        } else if (firstCall === 2) {
            alert("an error occured reaching the API");
            return;
        }
        var lat = firstCall.coord.lat;
        var lon = firstCall.coord.lon;
        var oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + key + "&exclude=hourly,minutely";
        var secondCall = await get(oneCallUrl);
        
        if (secondCall === 1) {
            alert("City not found");
            return;

        } else if (secondCall === 2) {
            alert("an error occured reaching the API");
            return;
        }
        var days = [];
        for (var i = 0; i < 6; i++) {
            days.push({
                "date": today.setDate(today.getDate() + 1),
                "type": secondCall.daily[i].weather[0].main,
                "temp": secondCall.daily[i].temp.day,
                "wind": secondCall.daily[i].wind_speed,
                "humidity": secondCall.daily[i].humidity,
                "uvi": secondCall.daily[i].uvi,
            });
        }
        saveHistory(firstCall.name,days);
        loadHistory();
        display(firstCall.name);
    } else {
        alert("please enter a name of a city to get the weather of");
        return;
    }

});
async function get(url) {
    try {
        let response = await fetch(url);
        let json = await response.json();
        if (json.cod === '404') {
            return 1;
        }
        return json;

    } catch (error) {
        console.log("an error occured trying to get json");
        return 2
    }
}
// save history to localstorage
function saveHistory(cityName, days){
    cityHistory[cityName] = days;
    localStorage.setItem('weatherHistory', JSON.stringify(cityHistory));
    
}
// load history from localstorage
 function loadHistory () {
    var json_string = localStorage.getItem('weatherHistory');
    if (json_string) {
        cityHistory = JSON.parse(json_string);
    }
}
function displayHistory() {
    $(".history").empty();
    for (var Key in cityHistory) {
        var btn = $("<button></button>").text(Key);
        btn.attr("class","historyBtn");
        btn.attr("type", "button");
        $(".history").append(btn);
        $(".historyBtn").click(function () {
            console.log($(this).text());
            display($(this).text());
        })
    }
}

function display(city) {
    var days = cityHistory[city];
    var today = new Date(days[0].date);

    $(".city-stats").empty();
    $(".fiveDayForecast").empty();
    if (days[0].type === 'Rain') {
        var span = $("<i></i>").attr("class", "fas fa-cloud-rain");
    } else if (days[0].type === 'Clear') {
        var span = $("<i></i>").attr("class", "fas fa-sun");
    } else if (days[0].type === 'Clouds') {
        var span = $("<i></i>").attr("class", "fas fa-cloud");
    } else if (days[0].type === 'Snow') {
        var span = $("<i></i>").attr("class", "fas fa-snowflake");
    } else {
        var span = $("<i></i>").attr("class", "fas fa-sun");
        console.log("unkown condition, display()");
    }
    if (parseFloat(days[0].uvi) < 3.0) {
        var color = "green";
    } else if (parseFloat(days[0].uvi) < 5.0){
        var color = "yellow";
    } else {
        var color = "red"
    }
    var cityNameDate = $("<h3></h3>").text(city + " (" + today.toISOString().substring(0,10) + ") ");
    span.appendTo(cityNameDate);
    var temp = $("<p></p>").text("Temp: " + days[0].temp + " °F");
    var wind = $("<p></p>").text("Wind: " + days[0].wind + " MPH");
    var humidity = $("<p></p>").text("Humidity: " + days[0].humidity + " %");
    var uv = $("<p></p>").text("UV Index: " + days[0].uvi);
    uv.attr("style", "background-color:" + color + ";display:inline-block;border-radius:5px;");
    $(".city-stats").append(cityNameDate,temp,wind,humidity,uv);
    var fiveDayForecast = $("<h3></h3>").text("5-day forecast:")
    $(".fiveDayForecast").append(fiveDayForecast);
    for ( var i = 1; i < 6; i++) {
        if (days[i].type === 'Rain') {
            var span = $("<i></i>").attr("class", "fas fa-cloud-rain ");
        } else if (days[i].type === 'Clear') {
            var span = $("<i></i>").attr("class", "fas fa-sun");
        } else if (days[i].type === 'Clouds') {
            var span = $("<i></i>").attr("class", "fas fa-cloud");
        } else if (days[i].type === 'Snow') {
            var span = $("<i></i>").attr("class", "fas fa-snowflake");
        } else {
            var span = $("<i></i>").attr("class", "fas fa-sun");
            console.log("unkown condition, display()");
        }
        var date = new Date(days[i].date);
        var div = $("<div></div>");
        var dateEl = $("<h4></h4>").text("(" + date.toISOString().substring(0,10) + ")");
        var type = span;
        var temp = $("<p></p>").text("Temp: " + days[i].temp + " °F");
        var wind = $("<p></p>").text("Wind: " + days[i].wind + " MPH");
        var humidity = $("<p></p>").text("Humidity: " + days[i].humidity + " %");
        div.append(dateEl,type,temp,wind,humidity);
        $(".fiveDayForecast").append(div);
    }
    displayHistory();
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
loadHistory();
displayHistory();