const param = {
    url: 'https://api.openweathermap.org/data/2.5/forecast?',
    appid: '9a375fe9fdb62365ee106f61e6a14239',
    urlGeo: 'http://api.openweathermap.org/geo/1.0/direct?',
    imgUrl: 'https://openweathermap.org/img/wn/'
}

const searchBox = document.querySelector('[data-search-box]');

searchBox.addEventListener('change', (() => {
    getGeocode(searchBox.value)
}))

navigator.geolocation.getCurrentPosition(positionSuccess, positionError);

function positionSuccess({ coords }) {
    getWeather(coords.latitude, coords.longitude);
}

function positionError() {
    return getGeocode('Kyiv'); //default location is Kyiv
}

async function getWeather(lat, lon) {
    let request = await fetch(`${param.url}lat=${lat}&lon=${lon}&appid=${param.appid}&units=metric`);
    const result = await request.json();
    searchBox.value = result.city.name
    document.querySelector('[data-location]').textContent = `${result.city.name}, ${result.city.country}`;
    showWeather(structureData(result));
}

async function getGeocode(name) {
    let request = await fetch(`${param.urlGeo}q=${name}&limit=1&appid=${param.appid}`);
    const result = await request.json();
    document.querySelector('[data-selected-location]').textContent = `${result[0]['local_names']['uk']}, ${result[0]['local_names']['en']}, ${result[0]['country']}`;
    return (getWeather(result[0].lat, result[0].lon));
}

function structureData(data) {
    const forecast = [];
    const allForecast = data.list.filter(item => {
        if (item['dt_txt'].includes('12:00') || item['dt_txt'].includes('3:00')) {
            return item;
        }
    })


    for (let i = 0; i < allForecast.length; i++) {
        if (allForecast[i]['dt_txt'].includes('3:00')) {
            forecast.push({
                day: null,
                night: allForecast[i],
            })
        }
        else {
            const lastDayIndex = forecast.length - 1;
            if (lastDayIndex >= 0) {
                forecast[lastDayIndex].day = allForecast[i]
            }
        }
    }
    return forecast;
}

const container = document.querySelector('[data-day-section]');
const dayCardTemplate = document.getElementById('day-card-template');


function showWeather(data) {
    showCurrentWeather(data[0]);
    container.innerHTML = '';
    data.forEach((day) => {
        showDailyWeather(day);
    })
}

function showCurrentWeather(data) {
    document.querySelector('[data-current-day-temp]').textContent = getTemp(Math.round(data.day.main.temp));
    document.querySelector('[data-current-night-desc-temp]').textContent = `${data.night.weather[0].main} ${getTemp(Math.round(data.night.main.temp))}`;
    document.querySelector('[data-current-desc]').textContent = data.day.weather[0].main;
    document.querySelector('[data-current-day-icon]').src = getIcon(data.day.weather[0].icon);
    document.querySelector('[data-current-night-icon]').src = getIcon(data.night.weather[0].icon);
}

function showDailyWeather(data) {
    const newCard = dayCardTemplate.content.cloneNode(true);
    newCard.querySelector('[data-day-of-week]').textContent = getDay(data.day['dt_txt']);
    newCard.querySelector('[data-day-icon]').src = getIcon(data.day.weather[0].icon);
    newCard.querySelector('[data-night-icon]').src = getIcon(data.night.weather[0].icon);
    newCard.querySelector('[data-day-desc]').textContent = data.day.weather[0].main;
    newCard.querySelector('[data-day-temp]').textContent = getTemp(Math.round(data.day.main.temp));
    newCard.querySelector('[data-night-temp]').textContent = getTemp(Math.round(data.night.main.temp));

    container.appendChild(newCard);
};

function getIcon(codeImg) {
    return `${param.imgUrl}${codeImg}@2x.png`
}

function getTemp(temp) {
    return temp > 0 ? `+${temp}` : temp;
}

function getDay(data) {
    let date = new Date(data);
    let dayOfWeek = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
    return dayOfWeek;
}

const citiesList = document.querySelectorAll('[data-city-name]');

searchBox.addEventListener('focus', (() => {
    citiesList.forEach(city => {
        city.classList.remove('hidden');
    })
}))

const cities = document.querySelector('[data-cities]');

searchBox.addEventListener('input', (() => {
    let inputValue = searchBox.value.toLowerCase();
    citiesList.forEach(city => {
        city.classList.add('hidden');
        if ((city.textContent.toLowerCase()).includes(inputValue)) {
            city.classList.remove('hidden');
        }
    })
}))

citiesList.forEach(city => {
    city.addEventListener('click', (() => {
        getGeocode(city.textContent);
        citiesList.forEach(city => {
            city.classList.add('hidden')
        })
    }))
})