async function getData() {
    try {
        const response = await fetch('data/series.json');
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

const series = document.getElementById('series');
const seriesTemplate = document.getElementById('seriesTemplate');

getData()
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            const seriesClone = seriesTemplate.content.cloneNode(true);
            
            seriesClone.querySelector('#img').src = data[i].cover || `assets/${data[i].type}/${data[i].name}/cover.png`;
            seriesClone.querySelector('#name').textContent = data[i].name;
            const type = data[i].type;
            const typeContainer = seriesClone.querySelector('#type');
            if (type === 'series') {
                typeContainer.textContent = 'Series';
                typeContainer.style.backgroundColor = '#550000';
            } else if (type === 'movie') {
                typeContainer.textContent = 'Movie';
                typeContainer.style.backgroundColor = '#000055';
            }
            seriesClone.querySelector('.series').addEventListener('click', () => {
                window.location.href = `series/?id=${data[i].id}`;
            });
            series.appendChild(seriesClone);
        }
    });