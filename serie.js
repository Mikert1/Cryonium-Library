async function getData() {
    try {
        const response = await fetch('series.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

function getQueryParams() {
    let params = {};
    let queryString = window.location.search.slice(1);
    let queryArray = queryString.split('&');
    queryArray.forEach(function(param) {
        let [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}


let params = getQueryParams();
if (params.id) {
    params.id = parseInt(params.id) - 1;
    console.log(params.id);
} else {
    console.log("No name provided");
}

const template = document.querySelector('template');

const logo = document.getElementById('logo');
const description = document.getElementById('description');
const information = document.getElementById('information');

const background = document.getElementById('background');
const episodes = document.getElementById('episodes');
const selector = document.getElementById('season-selector');

getData()
    .then(data => {
        // background.style.backgroundImage = `url(${data[params.id].backgroundd})`;
        const backgroundImageUrl = data[params.id].background;
        const fullUrl = new URL(backgroundImageUrl, window.location.href).href;
        background.style.backgroundImage = `url(${fullUrl})`;
        for (let i = 0; i < data[params.id].seasons.length; i++) {
            const option = document.createElement('option');
            option.value = i + 1;
            option.textContent = `Season ${i + 1}`;
            selector.appendChild(option);
        }
        logo.src = data[params.id].logo;
        description.textContent = data[params.id].description;
        const span = document.createElement('span');
        span.classList.add('age'); span.textContent = data[params.id].age; information.appendChild(span);
        let allEpisodes = 0;
        for (let i = 0; i < data[params.id].seasons.length; i++) {
            allEpisodes += data[params.id].seasons[i].episodes.length;
        }
        information.innerHTML += " | " + data[params.id].genre + " | " + data[params.id].startYear + " · " + data[params.id].finalYear + " <br> " + data[params.id].seasons.length + " Seasons | " + allEpisodes + " Episodes";
        for (let i = 0; i < data[params.id].seasons[0].episodes.length; i++) {
            const element = data[params.id].seasons[0].episodes[i];
            const episodeDiv = template.content.cloneNode(true);
            episodeDiv.querySelector('#title').textContent = element.title;
            episodeDiv.querySelector('#description').textContent = element.description;
            episodeDiv.querySelector('#image').src = element.image;
            episodeDiv.querySelector('#duration').textContent = element.duration;
            episodeDiv.querySelector('#number').textContent = element.number;
            episodes.appendChild(episodeDiv);
        }
    });

selector.addEventListener('change', function() {
    episodes.innerHTML = "";
    getData()
        .then(data => {
            for (let i = 0; i < data[params.id].seasons[selector.value - 1].episodes.length; i++) {
                const element = data[params.id].seasons[selector.value - 1].episodes[i];
                const episodeDiv = template.content.cloneNode(true);
                episodeDiv.querySelector('#title').textContent = element.title;
                episodeDiv.querySelector('#description').textContent = element.description;
                episodeDiv.querySelector('#image').src = element.image;
                episodeDiv.querySelector('#duration').textContent = element.duration;
                episodeDiv.querySelector('#number').textContent = element.number;
                episodes.appendChild(episodeDiv);
            }
        });
    }
);