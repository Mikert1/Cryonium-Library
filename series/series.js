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

async function getData(id) {
    try {
        const response = await fetch('../data/series.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        return data[id];
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

const page = {
    landing: {
        logo: document.getElementById('logo'),
        season: document.getElementById('season'),
        buttons: {
            div: document.getElementById('buttons'),
            play: document.querySelector('.play'),
            trailer: document.querySelector('.trailer'),
            watched: document.querySelector('.watched'),
        }
    },
    main: {
        tabs: document.getElementById('tabs'),
        selector: document.getElementById('season-selector'),
        content: {
            episodes: document.getElementById('episodes'),
            info: document.getElementById('info'),
            reviews: document.getElementById('reviews'),
            cast: document.getElementById('cast')
        },
        whereToWatch: {
            buy: document.getElementById('buy'),
            subscription: document.getElementById('subscription'),
            removed: document.getElementById('removed')
        }
    },
    template: {
        episode: document.querySelector('template#episode'),
        review: document.querySelector('template#review'),
        watchWarning: document.querySelector('template#watchWarning'),
        option: document.querySelector('template#option')
    }
}

const background = document.getElementById('background');
const mobileBackground = document.getElementById('mobileBackground');

let data = {
    watched: false,
    params: getQueryParams(),
    selectedTab: ""
};
(async () => {
    if (data.params.id) {
        data.params.id = parseInt(data.params.id) - 1;
        console.log(data.params.id);
    } else {
        console.log("No name provided");
        data.params.id = 3;
    }
    data.params.season = data.params.season || 1;
    data.serie = await getData(data.params.id);
    setPage();
})()

async function checkIfWatched() {
    let watchData = JSON.parse(localStorage.getItem("watchedListLibrary6"));
    if (watchData && Object.keys(watchData).length > 0) {
        watchData.forEach((element) => {
            if (element.name === data.serie.name) {
                data.watched = true;
                const watchedButton = page.landing.buttons.div.querySelector('.watched');
                watchedButton.querySelector("p").textContent = "Watched";
                watchedButton.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
            }
        });
    }
}

function checkImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve(true);
        };
        img.onerror = () => {
            resolve(false);
        };
        img.src = url;
    });
}

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
        
        const warningText = document.createElement('div');
        warningText.classList.add('tooltip-text');
        if (extraWarns.cliff) {
            const warningImg = page.template.watchWarning.content.cloneNode(true);
            warningImg.querySelector('use').setAttribute('href', `../assets/img/icons/cliff.svg#icon`);
            warningImg.querySelector('svg').classList.add(extraWarns.cliff.type);
            tooltipContainer.appendChild(warningImg);

            cliffText = document.createElement('div');
            cliffText.innerHTML = `<h3 class="m-0">${extraWarns.cliff.type} cliffhanger:</h3> ${extraWarns.cliff.text == undefined?  "No text provided" : extraWarns.cliff.text}`;  
            warningText.appendChild(cliffText);
        }
        
        if (extraWarns.deaths) {
            const warningImg = page.template.watchWarning.content.cloneNode(true);
            warningImg.querySelector('use').setAttribute('href', `../assets/img/icons/death.svg#icon`);
            warningImg.querySelector('svg').classList.add(extraWarns.deaths.type);
            tooltipContainer.appendChild(warningImg);
        
            deathText = document.createElement('div');
            deathText.innerHTML += `<h3 class="m-0">${extraWarns.deaths.type} character(s) death:</h3>${extraWarns.deaths.text == undefined?  "No text provided" : extraWarns.deaths.text}`;
            warningText.appendChild(deathText);
        }
        tooltipContainer.appendChild(warningText);
        episodeDiv.querySelector('#icons').appendChild(tooltipContainer);
        return tooltipContainer;
    }
}

function setEpisodes(value) {
    page.main.content.episodes.innerHTML = "";
    const url = data.serie.background || `../assets/${data.serie.type}/${data.serie.name}/background/${value}.png`;
    document.documentElement.style.setProperty('--backgroundImage', `url(${new URL(url, window.location.href)})`);
    for (let i = 0; i < data.serie.seasons[value - 1].episodes.length; i++) {
        const element = data.serie.seasons[value - 1].episodes[i];
        const episodeDiv = page.template.episode.content.cloneNode(true);
        episodeDiv.querySelector('#title').textContent = element.title;
        episodeDiv.querySelector('#description').textContent = element.description;
        const url = `../assets/${data.serie.type}/${data.serie.name}/episodes/${data.watched}/${value}/${element.episode}.jpg`;
        episodeDiv.querySelector('#image').src = url;
        episodeDiv.querySelector('#duration').innerHTML = `<span>${element.duration}</span> min`;
        episodeDiv.querySelector('#number').innerHTML = `E${element.episode}`;
        if (data.watched) {
            loadWarnings(element, episodeDiv);
        }
        page.main.content.episodes.appendChild(episodeDiv);
    }
}

async function setReviews(season) {
    page.main.content.reviews.innerHTML = "";
    for (let i = 0; i < data.serie.reviews.length; i++) {
        const element = data.serie.reviews[i];
        const reviewDiv = page.template.review.content.cloneNode(true);
        reviewDiv.querySelector('.pfp').src = `../assets/img/reviews/${element.id}/profile/${element.name}.png`;
        reviewDiv.querySelector('#team').textContent = element.team;
        reviewDiv.querySelector('#name').textContent = element.name;
        reviewDiv.querySelector('#date').textContent = element.date;
        reviewDiv.querySelector('#score').textContent = element.seasons[season].score;
        reviewDiv.querySelector('#quote').textContent = element.seasons[season].quote;
        const logoUrl = `../assets/img/reviews/${element.id}/logo/${element.seasons[season].logo}.svg`;
        if (await checkImage(logoUrl)) {
            reviewDiv.querySelector('.scoreLogo').setAttribute('src', logoUrl);
        } else {
            reviewDiv.querySelector('.scoreLogo').style.display = "none";
            console.log("No logo found for review " + element.id);
        }
        page.main.content.reviews.appendChild(reviewDiv);
    }
}

function setInfo() {
    page.main.content.info.querySelector('name').textContent = data.serie.name;
    page.main.content.info.querySelector('description').textContent = data.serie.description;
    page.main.content.info.querySelector('genre').textContent = data.serie.genre;
    page.main.content.info.querySelector('age').textContent = `${data.serie.age}+`;
    page.main.content.info.querySelector('years').textContent = `${data.serie.startYear} · ${data.serie.finalYear}`;
    let allEpisodes = 0;
    for (let i = 0; i < data.serie.seasons.length; i++) {
        allEpisodes += data.serie.seasons[i].episodes.length;
    }
    page.main.content.info.querySelector('seasons').textContent = `${data.serie.seasons.length} Seasons · ${allEpisodes} Episodes`;
}

async function setPage() {
    const season = data.params.season;
    page.main.whereToWatch.buy.innerHTML = "<h2>Buy on:</h2>";
    subscription.innerHTML = "<h2>Subscription:</h2>";
    removed.innerHTML = "<h2>Used to be on:</h2>";
    page.main.selector.innerHTML = "";
    checkIfWatched();
    for (let i = 0; i < data.serie.seasons.length; i++) {
        const optionClone = page.template.option.content.cloneNode(true);
        optionClone.querySelector('option').textContent = `Season ${i + 1}`;
        optionClone.querySelector('option').value = i + 1
        page.main.selector.appendChild(optionClone);
    }
    page.main.selector.value = season || 1;
    const logoUrl = `../assets/${data.serie.type}/${data.serie.name}/logo/${page.main.selector.value}.png`;
    if (await checkImage(logoUrl)) {
        page.landing.logo.src = logoUrl;
    } else {
        page.landing.logo.src = data.serie.logo || `../assets/${data.serie.type}/${data.serie.name}/logo/default.png`;
    }
    const seasonUrl = `../assets/${data.serie.type}/${data.serie.name}/logo/season/${season}.png`;
    if (await checkImage(seasonUrl)) {
        page.landing.season.src = seasonUrl;
    }
    page.landing.buttons.play.addEventListener('click', function() {
        window.open('#watch', '_top');
    });
    page.landing.buttons.trailer.addEventListener('click', function() {
        window.open(data.serie.trailer, '_blank');
    });
    page.landing.buttons.watched.addEventListener('click', function() {
        if (data.watched) {
            data.watched = false;
            let watchData = JSON.parse(localStorage.getItem("watchedListLibrary6"));
            watchData = watchData.filter((element) => element.name !== data.serie.name);
            localStorage.setItem("watchedListLibrary6", JSON.stringify(watchData));
            page.landing.buttons.watched.querySelector("p").textContent = "Add to Watched";
            page.landing.buttons.watched.querySelector('use').setAttribute('href', "../assets/img/icons/plus.svg#plus-icon");
        } else {
            data.watched = true;
            const newData = {
                name: data.serie.name,
                date: new Date().toISOString(),
                seasons: data.serie.seasons.length
            };
            let watchData = localStorage.getItem("watchedListLibrary6")
            if (watchData) {
                watchData = JSON.parse(watchData);
                watchData.push(newData);
            } else {
                watchData = [newData];
            }
            localStorage.setItem("watchedListLibrary6", JSON.stringify(watchData));
            page.landing.buttons.watched.querySelector("p").textContent = "Watched";
            page.landing.buttons.watched.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
        }
        setEpisodes(season);
    });
    const buttonActions = ['play', 'trailer', 'watched'];
    document.getElementById("buttons").addEventListener('mouseleave', () => {
        page.landing.buttons.play.classList.add("extended");
        page.landing.buttons.trailer.classList.remove("extended");
        page.landing.buttons.watched.classList.remove("extended");
    });
    buttonActions.forEach(action => {
        page.landing.buttons[action].addEventListener('mouseenter', () => {
            buttonActions.forEach(btn => page.landing.buttons[btn].classList.toggle("extended", btn === action));
        });
    });
    setEpisodes(season);
    setReviews(season);
    setInfo();
    loadContent(data.selectedTab || "Episodes");
    for (const watchItem of data.serie.watch) {
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
            page.main.whereToWatch.removed.appendChild(watchButton);
            page.main.whereToWatch.removed.style.display = "block";
        } else {
            if (watchItem.buyType === "subscription") {
                page.main.whereToWatch.subscription.appendChild(watchButton);
                page.main.whereToWatch.subscription.style.display = "block";
            } else if (watchItem.buyType === "buy") {
                page.main.whereToWatch.buy.appendChild(watchButton);
                page.main.whereToWatch.buy.style.display = "block";
            }
        }
    }
}

function loadContent(tab) {
    const sections = { Episodes: page.main.content.episodes, Info: page.main.content.info, Reviews: page.main.content.reviews, Cast: page.main.content.cast };
    Object.values(sections).forEach(section => section.style.display = "none");
    if (sections[tab]) sections[tab].style.display = "flex";
}

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

page.main.selector.addEventListener('change', function() {
    const value = page.main.selector.value;
    const url = new URL(window.location);
    url.searchParams.set('season', value);
    window.history.pushState({}, '', url);
    data.params.season = value;
    setPage();
});

page.main.tabs.addEventListener('click', function(event) {
    if (event.target.tagName === 'P') {
        data.selectedTab = event.target.innerHTML;
        for (const tab of page.main.tabs.children) {
            tab.classList.remove('active');
        }
        event.target.classList.add('active');
    }
    loadContent(data.selectedTab);
});

window.scrollTo(0, 50);