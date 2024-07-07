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
const main = document.getElementById('mainImage');

getData()
    .then(data => {
        for (let i = 0; i < data[params.id].seasons[0].episodes.length; i++) {
            const element = data[params.id].seasons[0].episodes[i];
            const episodeDiv = template.content.cloneNode(true);
            episodeDiv.querySelector('#title').textContent = element.title;
            episodeDiv.querySelector('#description').textContent = element.description;
            episodeDiv.querySelector('#image').src = element.image;
            main.appendChild(episodeDiv);
        }
    });