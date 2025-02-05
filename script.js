if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('config/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

async function getData() {
    try {
        const response = await fetch('data/series.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        // const response2 = await fetch('data/games.json');
        // if (!response2.ok) {
        //     throw new Error('Failed to fetch');
        // }
        let data = await response.json();
        // data = data.concat(await response2.json());
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

const series = document.getElementById('series');
const beta = document.getElementById('beta');
const seriesTemplate = document.getElementById('seriesTemplate');

function changeCover(card, data, i) {
    card.querySelector('#img').src = data[i].cover || `assets/${data[i].type}/${data[i].name}/cover.png`;
}

getData()
.then(data => {
    for (let i = 0; i < data.length; i++) {
        const clone = seriesTemplate.content.cloneNode(true);
        const card = clone.firstElementChild;
        changeCover(card, data, i);
        card.addEventListener('mouseenter', () => {
            console.log('hover');
            card.querySelector('#img').src = `assets/${data[i].type}/${data[i].name}/background/1.png`;
        });
        card.addEventListener('mouseleave', () => {
            setTimeout(() => changeCover(card, data, i), 150);
        });

            const type = data[i].type;
            const typeContainer = clone.querySelector('#type');
            const noteContainer = clone.querySelector('.note');
            noteContainer.textContent = data[i].note;
            if (type === 'series') {
                typeContainer.textContent = 'Series';
                typeContainer.style.backgroundColor = '#550000';
            } else if (type === 'movie') {
                typeContainer.textContent = 'Movie';
                typeContainer.style.backgroundColor = '#000055';
            } else if (type === 'game') {
                typeContainer.textContent = 'Game';
                typeContainer.style.backgroundColor = '#005500';
            }
            clone.querySelector('.series').addEventListener('click', () => {
                window.location.href = `${data[i].type}/?id=${data[i].id}`;
            });
            if (!data[i].note) {
                series.appendChild(clone);
            } else {
                beta.appendChild(clone);
            }
        }
    });