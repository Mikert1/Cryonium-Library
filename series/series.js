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

let watched = false;

async function checkIfWatched() {
    let watchData = JSON.parse(localStorage.getItem("watchedListLibrary6"));
    if (watchData && Object.keys(watchData).length > 0) {
        watchData.forEach((element) => {
            if (element.name === data[params.id].name) {
                watched = true;
                const buttons = document.getElementById('buttons');
                const watchedButton = buttons.querySelector('.watched');
                watchedButton.querySelector("p").textContent = "Watched";
                watchedButton.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
            }
        });
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
const watchWarning = document.querySelector('template#watchWarning');
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
const removed = document.getElementById('removed');
const selector = document.getElementById('season-selector');
const buttons = document.getElementById('buttons');

function loadWarnings(element, episodeDiv) {
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
            const warningImg = watchWarning.content.cloneNode(true);
            warningImg.querySelector('use').setAttribute('href', `../assets/img/icons/cliff.svg#icon`);
            warningImg.querySelector('svg').classList.add(extraWarns.cliff.type);
            tooltipContainer.appendChild(warningImg);
        
            const warningText = document.createElement('div');
            warningText.classList.add('tooltip-text');
            warningText.textContent = extraWarns.cliff.text;
            tooltipContainer.appendChild(warningText);
        }
        
        if (extraWarns.deaths) {
            const warningImg = watchWarning.content.cloneNode(true);
            warningImg.querySelector('use').setAttribute('href', `../assets/img/icons/death.svg#icon`);
            warningImg.querySelector('svg').classList.add(extraWarns.deaths.type);
            tooltipContainer.appendChild(warningImg);
        
            const warningText = document.createElement('div');
            warningText.classList.add('tooltip-text');
            warningText.textContent = extraWarns.deaths.text;
            tooltipContainer.appendChild(warningText);
        }
        episodeDiv.querySelector('#icons').appendChild(tooltipContainer);
        return tooltipContainer;
    }
}

function setEpisodes(value) {
    episodes.innerHTML = "";
    const url = data[params.id].background || `../assets/${data[params.id].type}/${data[params.id].name}/background/${value}.png`;
    document.documentElement.style.setProperty('--backgroundImage', `url(${new URL(url, window.location.href)})`);
    for (let i = 0; i < data[params.id].seasons[value - 1].episodes.length; i++) {
        const element = data[params.id].seasons[value - 1].episodes[i];
        const episodeDiv = template.content.cloneNode(true);
        episodeDiv.querySelector('#title').textContent = element.title;
        episodeDiv.querySelector('#description').textContent = element.description;
        const url = `../assets/${data[params.id].type}/${data[params.id].name}/episodes/${watched}/${value}/${element.episode}.jpg`;
        episodeDiv.querySelector('#image').src = url;
        episodeDiv.querySelector('#duration').innerHTML = `<span>${element.duration}</span> min`;
        episodeDiv.querySelector('#number').innerHTML = `E${element.episode}`;
        if (watched) {
            loadWarnings(element, episodeDiv);
        }
        episodes.appendChild(episodeDiv);
    }
}


async function setPage() {
    data = await getData();
    checkIfWatched();
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
        if (watched) {
            watched = false;
            let watchData = JSON.parse(localStorage.getItem("watchedListLibrary6"));
            watchData = watchData.filter((element) => element.name !== data[params.id].name);
            localStorage.setItem("watchedListLibrary6", JSON.stringify(watchData));
            watchedButton.querySelector("p").textContent = "Add to Watched";
            watchedButton.querySelector('use').setAttribute('href', "../assets/img/icons/plus.svg#plus-icon");
        } else {
            watched = true;
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
        }
        setEpisodes(selector.value);
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
        information.innerHTML += " | " + data[params.id].genre + " | " + data[params.id].startYear + " · " + data[params.id].finalYear + " | " + data[params.id].seasons.length + " Seasons | " + allEpisodes + " Episodes";
        setEpisodes(1);
    } else {
        information.innerHTML += " | " + data[params.id].genre + " | " + data[params.id].year + " <br> " + data[params.id].duration;
        tabs.style.display = "none";
        episodes.style.display = "none";
    }
    for (const watchItem of data[params.id].watch) {
        const watchButton = document.createElement('button');
        watchButton.classList.add('watch-button');
        watchButton.style.borderColor = watchItem.color;
        watchButton.addEventListener('click', function() {
            window.open(watchItem.link, '_blank');
        });
        const image = document.createElement('img');
        image.src = `../assets/img/watch/${watchItem.name}.png`;
        watchButton.appendChild(image);
        if (watchItem.removed) {
            watchButton.classList.add('removed-watch');
            removed.appendChild(watchButton);
            removed.style.display = "block";
        } else {
            if (watchItem.buyType === "subscription") {
                subscription.appendChild(watchButton);
                subscription.style.display = "block";
            } else if (watchItem.buyType === "buy") {
                buy.appendChild(watchButton);
                buy.style.display = "block";
            }
        }
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
    setEpisodes(selector.value);
});
window.scrollTo(0, 50);