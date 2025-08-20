// sidebar.js
export function toggleProfile() {
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    profile.classList.toggle('show');
    contact.classList.remove('show');
}

export function toggleContact() {
    const contact = document.getElementById('contact');
    const profile = document.getElementById('profile');
    contact.classList.toggle('show');
    profile.classList.remove('show');
}
