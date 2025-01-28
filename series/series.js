import { basic } from "../objects/basic.js";

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
        seasonSelectCards: document.getElementById('seasonSelectCards'),
        buttons: {
            div: document.getElementById('buttons'),
            seasons: document.querySelector('.seasons'),
            info: document.querySelector('.info'),
        }
    },
    main: {
        addTo: document.getElementById('addTo'),
        tabs: document.getElementById('tabs'),
        content: {
            episodes: document.getElementById('episodes'),
            info: document.getElementById('info'),
            reviews: document.getElementById('reviews'),
            cast: document.getElementById('cast'),
            whereToWatch: document.getElementById('watch'),
        },
    },
    template: {
        seasonSelectCard: document.querySelector('template#seasonSelectCard'),
        episode: document.querySelector('template#episode'),
        review: document.querySelector('template#review'),
        character: document.querySelector('template#character'),
        watchWarning: document.querySelector('template#watchWarning'),
        watch: document.querySelector('template#watch')
    }
}

const background = document.getElementById('background');
const mobileBackground = document.getElementById('mobileBackground');

let data = {
    watched: false,
    params: getQueryParams(),
    selectedTab: ""
};

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
        tooltipContainer.classList.add('tooltipContainer', 'd-f');
        
        const warningText = document.createElement('div');
        warningText.classList.add('tooltipText');
        if (extraWarns.cliff) {
            const warningImg = page.template.watchWarning.content.cloneNode(true);
            warningImg.querySelector('use').setAttribute('href', `../assets/img/icons/cliff.svg#icon`);
            warningImg.querySelector('svg').classList.add(extraWarns.cliff.type);
            tooltipContainer.appendChild(warningImg);

            const cliffText = document.createElement('div');
            cliffText.innerHTML = `<h3 class="m-0">${extraWarns.cliff.type} cliffhanger:</h3> ${extraWarns.cliff.text == undefined?  "No text provided" : extraWarns.cliff.text}`;  
            warningText.appendChild(cliffText);
        }
        
        if (extraWarns.deaths) {
            const warningImg = page.template.watchWarning.content.cloneNode(true);
            warningImg.querySelector('use').setAttribute('href', `../assets/img/icons/death.svg#icon`);
            warningImg.querySelector('svg').classList.add(extraWarns.deaths.type);
            tooltipContainer.appendChild(warningImg);
        
            const deathText = document.createElement('div');
            deathText.innerHTML += `<h3 class="m-0">${extraWarns.deaths.type} character(s) death:</h3>${extraWarns.deaths.text == undefined?  "No text provided" : extraWarns.deaths.text}`;
            warningText.appendChild(deathText);
        }
        tooltipContainer.appendChild(warningText);
        episodeDiv.querySelector('#icons').appendChild(tooltipContainer);
        return tooltipContainer;
    }
}

async function setEpisodes(value) {
    page.main.content.episodes.innerHTML = "";
    const url = data.serie.background || `../assets/${data.serie.type}/${data.serie.name}/background/${value}.png`;
    document.documentElement.style.setProperty('--backgroundImage', `url(${new URL(url, window.location.href)})`);
    for (let i = 0; i < data.serie.seasons[value - 1].episodes.length; i++) {
        const element = data.serie.seasons[value - 1].episodes[i];
        const episodeDiv = page.template.episode.content.cloneNode(true);
        episodeDiv.querySelector('#title').textContent = element.title;
        episodeDiv.querySelector('#description').textContent = element.description;
        const url = `../assets/${data.serie.type}/${data.serie.name}/episodes/${data.watched}/${value}/${element.episode}.jpg`;
        if (await basic.imageStatus(url)) {
            episodeDiv.querySelector('#image').src = url;
        } else {
            if (element.comingSoon) {
                episodeDiv.querySelector('#image').src = `../assets/default/comingSoon.png`;
            } else {
                const backupUrl = `../assets/${data.serie.type}/${data.serie.name}/episodes/${data.watched}/false/${element.episode}.jpg`;
                if (await basic.imageStatus(backupUrl)) {
                    episodeDiv.querySelector('#image').src = backupUrl;
                } else {
                    episodeDiv.querySelector('#image').src = `../assets/default/notFound.png`;
                }
            }
        }
        episodeDiv.querySelector('#duration').innerHTML = `<span>${element.duration}</span> min`;
        episodeDiv.querySelector('#number').innerHTML = `E${element.episode}`;
        if (data.watched) {
            loadWarnings(element, episodeDiv);
        }
        page.main.content.episodes.appendChild(episodeDiv);
    }
    console.log("Episodes set");
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

async function setCast() {
    page.main.content.cast.innerHTML = "";
    const url = `../assets/${data.serie.type}/${data.serie.name}/cast/main.png`
    if ( await checkImage(url)) {
        const img = document.createElement('img')
        img.src = url;
        img.classList.add('w-80%');
        page.main.content.cast.appendChild(img);
    }
    for (let i = 0; i < data.serie.cast.length; i++) {
        const element = data.serie.cast[i];
        const characterCard = page.template.character.content.cloneNode(true);
        const template = {
            base: characterCard.firstElementChild,
            image: characterCard.querySelector('.image'),
            background: characterCard.querySelector('.background'),
            info: characterCard.querySelector('.info'),
            name: characterCard.querySelector('.name')
        }
        const backgroundUrl = `../assets/${data.serie.type}/${data.serie.name}/characters/${element.name}/background.png`;
        const characterUrl = `../assets/${data.serie.type}/${data.serie.name}/characters/${element.name}/image.png`;
        if (await checkImage(backgroundUrl) && await checkImage(characterUrl)) {
            template.background.src = backgroundUrl;
            template.image.src = characterUrl;
        }
        template.name.textContent = element.name;
        const titleBackgroundUrl = `../assets/${data.serie.type}/${data.serie.name}/custom/titleBackground.png`;
        if (await checkImage(titleBackgroundUrl)) {
            template.info.style.backgroundImage = `url("${titleBackgroundUrl}")`;
        } else {
            template.info.style.backgroundColor = '#414141';
        }
        template.base.addEventListener('mousemove', function(event) {
            const rect = template.base.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height;
            const rotateX = ((y - centerY) / centerY) * 15;
            const rotateY = ((x - centerX) / centerX) * -15;
            template.info.style.display = `flex`;
            template.background.style.clipPath = `none`;
            template.background.style.transform = `perspective(693px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg)`;
            template.image.style.transform = `perspective(693px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1)`;
        });
        template.base.addEventListener('mouseleave', function() {
            template.background.style.clipPath = 'inset(0)';
            template.background.style.transform = "perspective(693px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            template.image.style.transform = "perspective(693px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            template.info.style.display = `none`;
        });
        page.main.content.cast.appendChild(characterCard);
    }
}

async function setInfo() {
    page.main.content.info.querySelector('name').textContent = data.serie.name;
    const type = data.serie.type;
    if (type === 'series') {
        page.main.content.info.querySelector('type').textContent = 'Series';
        page.main.content.info.querySelector('type').style.backgroundColor = '#550000';
    } else if (type === 'movie') {
        page.main.content.info.querySelector('type').textContent = 'Movie';
        page.main.content.info.querySelector('type').style.backgroundColor = '#000055';
    } else if (type === 'game') {
        page.main.content.info.querySelector('type').textContent = 'Game';
        page.main.content.info.querySelector('type').style.backgroundColor = '#005500';
    }
    page.main.content.info.querySelector('description').textContent = data.serie.description;
    page.main.content.info.querySelector('genre').textContent = data.serie.genre;
    page.main.content.info.querySelector('age').textContent = `${data.serie.age}+`;
    page.main.content.info.querySelector('years').textContent = `${data.serie.startYear} · ${data.serie.finalYear}`;
    let allEpisodes = 0;
    for (let i = 0; i < data.serie.seasons.length; i++) {
        allEpisodes += data.serie.seasons[i].episodes.length;
    }
    page.main.content.info.querySelector('seasons').textContent = `${data.serie.seasons.length} Seasons ( ${allEpisodes} Episodes )`;
}

function seasonsClickHandler() {
    if (seasonSelectCards.style.display === "block") {
        seasonCollapseHandler();
    } else {
        seasonSelectCards.style.display = "block";
    }
}

function seasonCollapseHandler() {
    seasonSelectCards.style.display = "none";
}

function infoClickHandler() {
    page.main.tabs.querySelector('.active').classList.remove('active');
    page.main.tabs.querySelector('.info').classList.add('active');
    const tab = data.selectedTab = "Info";
    loadContent(tab)
    document.querySelector('#info').scrollIntoView({ behavior: 'smooth' });
}

function watchedClickHandler() {
    console.log(data.watched);
    const season = data.params.season;
    if (data.watched) {
        data.watched = false;
        let watchData = JSON.parse(localStorage.getItem("watchedListLibrary6"));
        watchData = watchData.filter((element) => element.name !== data.serie.name);
        localStorage.setItem("watchedListLibrary6", JSON.stringify(watchData));
        page.main.addTo.querySelector("p").textContent = "Add to Watched";
        page.main.addTo.querySelector('use').setAttribute('href', "../assets/img/icons/plus.svg#icon");
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
        page.main.addTo.querySelector("p").textContent = "Watched";
        page.main.addTo.querySelector('use').setAttribute('href', "../assets/img/icons/check.svg#check-icon");
    }
    setEpisodes(season);
}

addTo.querySelector('.watched').addEventListener('click', watchedClickHandler);

async function setPage() {
    const season = data.params.season;
    page.landing.seasonSelectCards.innerHTML = "";
    page.main.content.whereToWatch.innerHTML = "";
    checkIfWatched();
    seasonCollapseHandler() 
    for (let i = 1; i < data.serie.seasons.length + 1; i++) {
        const seasonSelectCard = page.template.seasonSelectCard.content.cloneNode(true);
        seasonSelectCard.querySelector('p').textContent = `Season ${i}`;
        seasonSelectCard.querySelector('div').addEventListener('click', async function() {
            const url = new URL(window.location);
            url.searchParams.set('season', i);
            window.history.pushState({}, '', url);
            data.params.season = i;
            setPage();
        });
        page.landing.seasonSelectCards.appendChild(seasonSelectCard);
    }
    const logoUrl = `../assets/${data.serie.type}/${data.serie.name}/logo/${data.params.season}.png`;
    if (await checkImage(logoUrl)) {
        page.landing.logo.src = logoUrl;
    } else {
        page.landing.logo.src = data.serie.logo || `../assets/${data.serie.type}/${data.serie.name}/logo/default.png`;
    }
    const seasonUrl = `../assets/${data.serie.type}/${data.serie.name}/logo/season/${season}.png`;
    if (await checkImage(seasonUrl)) {
        page.landing.season.src = seasonUrl;
    }

    page.landing.buttons.seasons.removeEventListener('click', seasonsClickHandler);
    page.landing.buttons.info.removeEventListener('click', infoClickHandler);
    page.landing.buttons.seasons.addEventListener('click', seasonsClickHandler);
    page.landing.buttons.info.addEventListener('click', infoClickHandler);
    page.landing.seasonSelectCards.removeEventListener('mouseenter', seasonCollapseHandler);
    page.landing.seasonSelectCards.addEventListener('mouseleave', seasonCollapseHandler);
    const buttonActions = ['seasons', 'info'];
    buttonActions.forEach(action => {
        page.landing.buttons[action].removeEventListener('mouseenter', function() {});
    });
    document.getElementById("buttons").removeEventListener('mouseleave', function() {});
    document.getElementById("buttons").addEventListener('mouseleave', () => {
        page.landing.buttons.seasons.classList.add("extended");
        page.landing.buttons.info.classList.remove("extended");
    });
    buttonActions.forEach(action => {
        page.landing.buttons[action].addEventListener('mouseenter', () => {
            buttonActions.forEach(btn => page.landing.buttons[btn].classList.toggle("extended", btn === action));
            seasonCollapseHandler();
        });
    });
    await setEpisodes(season);
    setReviews(season);
    setInfo();
    setCast();
    loadContent(data.selectedTab || "Episodes");
    for (const watchItem of data.serie.watch) {
        const watchClone = page.template.watch.content.cloneNode(true);
        watchClone.querySelector('img').src = `../assets/img/watch/${watchItem.name}.png`;
        watchClone.querySelector('button').textContent = `Watch on ${watchItem.name}`;
        if (!watchItem.removed) {
            if (watchItem.buyType === "buy") {
                watchClone.querySelector('.description').textContent = `Buy on ${watchItem.name}`;
            } else if (watchItem.buyType === "subscription") {
                watchClone.querySelector('.description').textContent = `Subscribe on ${watchItem.name}`;
            } else if (watchItem.buyType === "free") {
                watchClone.querySelector('.description').textContent = `Watch for free on ${watchItem.name}`;
            }
        } else {
            watchClone.querySelector('button').textContent = `Removed`;
            watchClone.querySelector('.description').textContent = `Removed from ${watchItem.name}`;
            watchClone.querySelector('button').disabled = true;
        }
        watchClone.querySelector('.subTitle').textContent = watchItem.name;
        watchClone.querySelector('button').addEventListener('click', function() {
            window.open(watchItem.link, '_blank');
        });
        page.main.content.whereToWatch.appendChild(watchClone);
    }
    setScroll();
    window.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            scrollPosition = window.scrollY;
            localStorage.setItem('scrollPosition', scrollPosition);
        }, 100);
    });
}

function loadContent(tab) {
    console.log("Loading " + tab);
    const sections = { Episodes: page.main.content.episodes, Info: page.main.content.info, Reviews: page.main.content.reviews, Cast: page.main.content.cast };
    Object.values(sections).forEach(section => section.style.display = "none");
    if (sections[tab]) sections[tab].style.display = "flex";
    if (tab === "Episodes") { addTo.style.display = "flex"; } else { addTo.style.display = "none"; }
}

function resize() {
    const width = window.innerWidth;
    if (width <= 800) {
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

let scrollPosition = 0;

let isScrolling;

function setScroll() {
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10));
        localStorage.removeItem('scrollPosition');
        console.log("scroll set to " + savedPosition);
    }
    if (window.scrollY <= 50) {
        window.scrollTo(0, 50);
    }
}

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
    await setPage();
})();