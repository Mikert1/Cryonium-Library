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
    params.id = 3;
}

async function setGameInfo() {
    data = await getData();
    const url = data[params.id].background || `../assets/${data[params.id].type}/${data[params.id].name}/background.png`;
    document.documentElement.style.setProperty('--backgroundImage', `url(${new URL(url, window.location.href)})`);
    logo.src = data[params.id].logo || `../assets/${data[params.id].type}/${data[params.id].name}/logo.png`;
}

setGameInfo()