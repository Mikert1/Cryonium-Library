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
const template = document.getElementById('serie');

getData()
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            const serie = template.content.cloneNode(true);
            
            serie.querySelector('#img').src = data[i].cover || `assets/${data[i].type}/${data[i].name}/cover.png`;
            serie.querySelector('#name').textContent = data[i].name;
            const type = data[i].type;
            const typeContainer = serie.querySelector('#type');
            if (type === 'serie') {
                typeContainer.textContent = 'Serie';
                typeContainer.style.backgroundColor = '#550000';
            } else if (type === 'movie') {
                typeContainer.textContent = 'Movie';
                typeContainer.style.backgroundColor = '#000055';
            }
            serie.querySelector('.serie').addEventListener('click', () => {
                window.location.href = `serie/?id=${data[i].id}`;
            });
            series.appendChild(serie);
        }
    });