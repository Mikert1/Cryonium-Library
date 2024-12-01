async function getData() {
    try {
        const response = await fetch('../data/games.json');
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

const logo = document.getElementById('logo');
const information = document.getElementById('information');
const description = document.getElementById('description');
const avalible = document.getElementById('avalible');
const template = document.querySelector('template');

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
    params.id = 1;
}

async function setGameInfo() {
    const data = await getData();
    const url = data[params.id].background || `../assets/${data[params.id].type}/${data[params.id].name}/background.png`;
    document.documentElement.style.setProperty('--backgroundImage', `url(${new URL(url, window.location.href)})`);
    logo.src = data[params.id].logo || `../assets/${data[params.id].type}/${data[params.id].name}/logo.png`;
    const span = document.createElement('span');
    span.classList.add('age'); span.textContent = data[params.id].age; information.appendChild(span);
    information.innerHTML += " | " + data[params.id].genre + " | " + data[params.id].year + " <br> ";
    description.innerHTML += data[params.id].description;
    data[params.id].avaliability.platforms.forEach((element) => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('p').textContent = element;
        clone.querySelector('img').src = `../assets/${data[params.id].type}/${data[params.id].name}/cases/${element}.png`;
        avalible.appendChild(clone);
    });
}

setGameInfo()