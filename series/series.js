async function getData() {
    try {
        const response = await fetch('../data/series.json');
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

let wached = false;

async function checkIfWatched() {
    let watchData = JSON.parse(localStorage.getItem("watchedListLibrary6"));
    if (watchData) {
        watchData.forEach((element) => {
            if (element.name === data[params.id].name) {
                wached = true;
                const buttons = document.getElementById('buttons');
                const watchedButton = buttons.querySelector('.watched');
                watchedButton.querySelector("p").textContent = "Watched";
                watchedButton.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
            }
        });
        console.log("watched b");
        const buttons = document.getElementById('buttons');
        const watchedButton = buttons.querySelector('.watched');
        watchedButton.querySelector("p").textContent = "Watched";
        watchedButton.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
        console.log (watchedButton);
    }
}

let params = getQueryParams();
if (params.id) {
    params.id = parseInt(params.id) - 1;
    console.log(params.id);
} else {
    console.log("No name provided");
    params.id = 3;
}
let data;

const template = document.querySelector('template#episode');
const option = document.querySelector('template#option');

const logo = document.getElementById('logo');
const description = document.getElementById('description');
const information = document.getElementById('information');

const background = document.getElementById('background');
const mobileBackground = document.getElementById('mobileBackground');
const tabs = document.getElementById('tabs');
const episodes = document.getElementById('episodes');
const subscription = document.getElementById('subscription');
const buy = document.getElementById('buy');
const selector = document.getElementById('season-selector');
const buttons = document.getElementById('buttons');

function setEpisodes(value) {
    for (let i = 0; i < data[params.id].seasons[value - 1].episodes.length; i++) {
        const element = data[params.id].seasons[value - 1].episodes[i];
        const episodeDiv = template.content.cloneNode(true);
        episodeDiv.querySelector('#title').textContent = element.title;
        episodeDiv.querySelector('#description').textContent = element.description;
        const url = `../assets/${data[params.id].type}/${data[params.id].name}/episodes/${wached}/${value}/${element.episode}.jpg`;
        episodeDiv.querySelector('#image').src = url;
        episodeDiv.querySelector('#duration').textContent = element.duration;
        episodeDiv.querySelector('#number').textContent = `S${value} E${element.episode}`;
        
        let extraWarns = {};
        if (element.extra) {
            if (element.extra.cliff) {
                extraWarns.cliff = element.extra.cliff;
            }
            if (element.extra.deaths) {
                extraWarns.deaths = element.extra.deaths;
            }
        }
        if (Object.keys(extraWarns).length > 0) {
            const tooltipContainer = document.createElement('div');
            tooltipContainer.classList.add('tooltip-container');
            
            if (extraWarns.cliff) {
                const img = document.createElement('img');
                img.src = `../assets/img/icons/cliff/${extraWarns.cliff.type}.png`;
                img.alt = '';
                tooltipContainer.appendChild(img);
                
                const tooltipText = document.createElement('div');
                tooltipText.classList.add('tooltip-text');
                tooltipText.textContent = extraWarns.cliff.text;
                tooltipContainer.appendChild(tooltipText);
            }
            
            if (extraWarns.deaths) {
                const warningImg = document.createElement('img');
                warningImg.src = `../assets/img/icons/death/${extraWarns.deaths.type}.png`;
                warningImg.alt = '';
                tooltipContainer.appendChild(warningImg);
                
                const warningText = document.createElement('div');
                warningText.classList.add('tooltip-text');
                warningText.textContent = extraWarns.deaths.text;
                tooltipContainer.appendChild(warningText);
            }
            
            episodeDiv.querySelector('#icons').appendChild(tooltipContainer);
        }
        episodes.appendChild(episodeDiv);
    }
}

async function setPage() {
    data = await getData();
    checkIfWatched();
    const url = data[params.id].background || `../assets/${data[params.id].type}/${data[params.id].name}/background.png`;
    document.documentElement.style.setProperty('--backgroundImage', `url(${new URL(url, window.location.href)})`);
    logo.src = data[params.id].logo || `../assets/${data[params.id].type}/${data[params.id].name}/logo.png`;
    for (let i = 0; i < data[params.id].seasons.length; i++) {
        const optionClone = option.content.cloneNode(true);
        optionClone.querySelector('option').textContent = `Season ${i + 1}`;
        optionClone.querySelector('option').value = i + 1
        selector.appendChild(optionClone);
    }
    description.textContent = data[params.id].description;

    const playButton = buttons.querySelector('.play');
    const trailerButton = buttons.querySelector('.trailer');
    const watchedButton = buttons.querySelector('.watched');
    playButton.style.borderColor = data[params.id].primaryColor;
    trailerButton.style.borderColor = data[params.id].secondaryColor;
    playButton.addEventListener('click', function() {
        window.open('#watch', '_top');
    });
    trailerButton.addEventListener('click', function() {
        window.open(data[params.id].trailer, '_blank');
    });
    watchedButton.addEventListener('click', function() {
        wached = true;
        const newData = {
            name: data[params.id].name,
            date: new Date().toISOString(),
            seasons: data[params.id].seasons.length
        };
        let watchData = localStorage.getItem("watchedListLibrary6")
        if (watchData) {
            watchData = JSON.parse(watchData);
            watchData.push(newData);
        } else {
            watchData = [newData];
        }
        localStorage.setItem("watchedListLibrary6", JSON.stringify(watchData));
        watchedButton.querySelector("p").textContent = "Watched";
        watchedButton.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
    });
    playButton.addEventListener('mouseenter', function() {
        playButton.classList.add("extended")
        trailerButton.classList.remove("extended")
        watchedButton.classList.remove("extended")
    });
    trailerButton.addEventListener('mouseenter', function() {
        playButton.classList.remove("extended")
        trailerButton.classList.add("extended")
        watchedButton.classList.remove("extended")
    });
    watchedButton.addEventListener('mouseenter', function() {
        playButton.classList.remove("extended")
        trailerButton.classList.remove("extended")
        watchedButton.classList.add("extended")
    });
    const span = document.createElement('span');
    span.classList.add('age'); span.textContent = data[params.id].age; information.appendChild(span);
    if (data[params.id].type === "series") {
        let allEpisodes = 0;
        for (let i = 0; i < data[params.id].seasons.length; i++) {
            allEpisodes += data[params.id].seasons[i].episodes.length;
        }
        information.innerHTML += " | " + data[params.id].genre + " | " + data[params.id].startYear + " · " + data[params.id].finalYear + " <br> " + data[params.id].seasons.length + " Seasons | " + allEpisodes + " Episodes";
        setEpisodes(1);
    } else {
        information.innerHTML += " | " + data[params.id].genre + " | " + data[params.id].year + " <br> " + data[params.id].duration;
        tabs.style.display = "none";
        episodes.style.display = "none";
    }
    let subscriptionAmount = 0;
    let buyAmount = 0;
    for (const watchItem of data[params.id].watch) {
        const watchButton = document.createElement('button');
        watchButton.classList.add('watch-button');
        watchButton.style.borderColor = watchItem.color;
        watchButton.addEventListener('click', function() {
            window.open(watchItem.link, '_blank');
        });
        const image = document.createElement('img');
        image.src = watchItem.image;
        watchButton.appendChild(image);
        if (watchItem.buyType === "subscription") {
            subscriptionAmount++;
            subscription.appendChild(watchButton);
        } else if (watchItem.buyType === "buy") {
            buyAmount++;
            buy.appendChild(watchButton);
        }
    }
    if (subscriptionAmount === 0) {
        subscription.style.display = "none";
    }
    if (buyAmount === 0) {
        buy.style.display = "none";
    }
}
setPage();

function resize() {
    const width = window.innerWidth;
    if (width < 799) {
        mobileBackground.id = 'background';
        background.id = '';
    } else {
        mobileBackground.id = 'mobileBackground';
        background.id = 'background';
    }
}

window.addEventListener('resize', function() {
    resize();
});
resize();

selector.addEventListener('change', function() {
    episodes.innerHTML = "";
    setEpisodes(selector.value);
});
window.scrollTo(0, 50);