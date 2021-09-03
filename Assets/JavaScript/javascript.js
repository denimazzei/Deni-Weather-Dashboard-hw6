//Delcare variable for city search and api call//
var city="";
var searchCity = $("#city-search");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWindSpeed = $("#wind-speed");
var currentUvIndex = $("#uv-index");

var sCity = [];

function find(c) {
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

//API Key//

var APIKey = "a0aca8a89948154a4182dcecc780b513";

//Display current and future weather based on city input//

function displayWeather(event) {
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

//Create call to build URL to retreive data from server//

function currentWeather(city) {
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        console.log(response);

        var weatherIcon = response.weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/wn/" +weatherIcon+"@2x.png";
        var date = new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name + "("+date+")" + "<img src="+iconUrl+">");
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
        $(currentHumidity).html(response.main.humidity+"%");
        var ws = response.wind.speed;
        var windsmph = (ws*2.237).toFixed(1);
        $(currentWindSpeed).html(windsmph+"MPH");
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if(sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }else{
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }
    });
}

//Return UVIndex response//
function UVIndex(ln,lt) {
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat="+lt+"&lon="+ln;
    $.ajax({
        url:uvqURL,
        method:"GET",
    }).then(function(response){
        $(currentUvIndex).html(response.value);
    });   
}

//5 Day forecast Display//
function forecast(cityid) {
    var dayover = false;
    var queryforecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" +cityid+"&appid="+APIKey;
    $.ajax({
        url: queryforecastURL,
        method:"GET",
    }).then(function(response){
        for (i=0;i<5;i++){
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/" +iconcode+ ".png";
            var tempK = response.list[((i+1)*8)-1].main.temp;
            var tempF = (((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity = response.list[((i+1)*8)-1].main.humidity;

            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconUrl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
    });
}

//Add the city search to search history//
function addToList(c) {
    var listEl = $("<li>" +c.toUpperCase()+"</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}

//Display search again when past search is clicked on//
function invokePastSearch(event) {
    var liEl = event.target;
    if(event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }
}

function loadLastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for (i=0; i<sCity.length; i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }
}

//Clear search history when clicked//
function clearHistory(event) {
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();
}

//Event click handlers//

$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadLastCity);
$("#clear-history").on("click",clearHistory);

