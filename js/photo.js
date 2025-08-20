// photo.js
import { lettersData } from './data.js';

export function createPhotoGrid() {
    const container = document.getElementById('photoGrid');
    container.innerHTML = '';

    const allPhotos = [];
    lettersData.forEach(letter => {
        if (letter.photos && letter.photos.length > 0) {
            letter.photos.forEach(photo => {
                allPhotos.push({
                    src: photo,
                    title: letter.title,
                    date: letter.date
                });
            });
        }
    });

    if (allPhotos.length === 0) {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;">暂无照片</div>';
        container.appendChild(item);
        return;
    }

    allPhotos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.title;
        img.title = `${photo.title} - ${photo.date}`;
        item.appendChild(img);
        container.appendChild(item);
    });
}
