document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'ebd31fd43f8126607c7b551301dc4fd1';
    const cityInput = document.getElementById('city-input');
    const todayTab = document.getElementById('today-tab');
    const fiveDayTab = document.getElementById('five-day-tab');
    const todaySection = document.getElementById('today');
    const fiveDaySection = document.getElementById('five-day');
    const errorMessage = document.getElementById('error-message');

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            }, () => {
                fetchWeatherByCity('Kyiv');
            });
        } else {
            fetchWeatherByCity('Kyiv');
        }
    }

    function fetchWeatherByCoords(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
            .then(response => response.json())
            .then(data => displayCurrentWeather(data))
            .catch(error => showError(error));
    }

    function fetchWeatherByCity(city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => displayCurrentWeather(data))
            .catch(error => showError(error));
    }

    function displayCurrentWeather(data) {
        errorMessage.textContent = '';
        const currentWeather = document.getElementById('current-weather');
        currentWeather.innerHTML = `
            <h2>${data.name}</h2>
            <p>${new Date().toLocaleDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
            <p>${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp} °C (feels like ${data.main.feels_like} °C)</p>
            <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
            <p>Day length: ${((data.sys.sunset - data.sys.sunrise) / 3600).toFixed(2)} hours</p>
        `;
        fetchHourlyForecast(data.coord.lat, data.coord.lon);
        fetchNearbyCities(data.coord.lat, data.coord.lon);
    }

    function showError(error) {
        errorMessage.textContent = error.message;
    }

    function fetchHourlyForecast(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
            .then(response => response.json())
            .then(data => displayHourlyForecast(data.list))
            .catch(error => showError(error));
    }

    function displayHourlyForecast(hourlyData) {
        const hourlyForecast = document.getElementById('hourly-forecast');
        hourlyForecast.innerHTML = '<h3>Hourly Forecast</h3>';
        hourlyData.slice(0, 5).forEach(hour => {
            hourlyForecast.innerHTML += `
                <div>
                    <p>${new Date(hour.dt * 1000).toLocaleTimeString()}</p>
                    <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
                    <p>${hour.weather[0].description}</p>
                    <p>Temperature: ${hour.main.temp} °C (feels like ${hour.main.feels_like} °C)</p>
                    <p>Wind: ${hour.wind.speed} m/s, ${hour.wind.deg}°</p>
                </div>
            `;
        });
    }

    function fetchNearbyCities(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&appid=${API_KEY}&units=metric`)
            .then(response => response.json())
            .then(data => displayNearbyCities(data.list))
            .catch(error => showError(error));
    }

    function displayNearbyCities(cities) {
        const nearbyCities = document.getElementById('nearby-cities');
        nearbyCities.innerHTML = '<h3>Nearby Cities</h3>';
        cities.forEach(city => {
            nearbyCities.innerHTML += `
                <div>
                    <p>${city.name}</p>
                    <img src="http://openweathermap.org/img/wn/${city.weather[0].icon}.png" alt="${city.weather[0].description}">
                    <p>${city.main.temp} °C</p>
                </div>
            `;
        });
    }

    function fetchFiveDayForecast(city) {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
            .then(response => response.json())
            .then(data => displayFiveDayForecast(data.list))
            .catch(error => showError(error));
    }

    function displayFiveDayForecast(fiveDayData) {
        const fiveDayForecast = document.getElementById('five-day-forecast');
        fiveDayForecast.innerHTML = '<h3>5-day Forecast</h3>';
        const dailyData = fiveDayData.filter((reading) => reading.dt_txt.includes("12:00:00"));
        dailyData.forEach(day => {
            fiveDayForecast.innerHTML += `
                <div class="day" data-date="${day.dt}">
                    <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                    <p>Temperature: ${day.main.temp} °C</p>
                    <p>${day.weather[0].description}</p>
                </div>
            `;
        });

        document.querySelectorAll('.day').forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                const selectedDate = e.currentTarget.dataset.date;
                const selectedDayData = fiveDayData.filter(reading => new Date(reading.dt * 1000).toLocaleDateString() === new Date(selectedDate * 1000).toLocaleDateString());
                displayDailyDetails(selectedDayData);
            });
        });
    }

    function displayDailyDetails(dailyData) {
        const dailyDetails = document.getElementById('daily-details');
        dailyDetails.innerHTML = '<h3>Daily Details</h3>';
        dailyData.forEach(hour => {
            dailyDetails.innerHTML += `
                <div>
                    <p>${new Date(hour.dt * 1000).toLocaleTimeString()}</p>
                    <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
                    <p>${hour.weather[0].description}</p>
                    <p>Temperature: ${hour.main.temp} °C (feels like ${hour.main.feels_like} °C)</p>
                    <p>Wind: ${hour.wind.speed} m/s, ${hour.wind.deg}°</p>
                </div>
            `;
        });
    }

    todayTab.addEventListener('click', () => {
        todaySection.classList.add('active');
        fiveDaySection.classList.remove('active');
    });

    fiveDayTab.addEventListener('click', () => {
        fiveDaySection.classList.add('active');
        todaySection.classList.remove('active');
        fetchFiveDayForecast(cityInput.value);
    });

    cityInput.addEventListener('change', () => {
        fetchWeatherByCity(cityInput.value);
    });

    getLocation();
});
