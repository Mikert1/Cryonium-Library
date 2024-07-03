async function getData() {
    try {
        const response = await fetch('episodes.json');
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

const title = document.getElementById('title');
const description = document.getElementById('description');
const image = document.getElementById('image');
getData()
    .then(data => {
        console.log(data[0]);
        title.textContent = data[0].title;
        description.textContent = data[0].description;
        image.src = data[0].image;
    });