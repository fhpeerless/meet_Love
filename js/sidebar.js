// js/sidebar.js

export function toggleProfile() {
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    const declaration = document.getElementById('xuanshi');
    profile.classList.toggle('show');
    contact.classList.remove('show');
    declaration.classList.remove('show');
}

export function toggleContact() {
    const contact = document.getElementById('contact');
    const profile = document.getElementById('profile');
    const declaration = document.getElementById('xuanshi');
    contact.classList.toggle('show');
    profile.classList.remove('show');
    declaration.classList.remove('show');
}

// js/sidebar.js
export function toggleDeclaration() {
    const declaration = document.getElementById('xuanshi');
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    declaration.classList.toggle('show');
    profile.classList.remove('show');
    contact.classList.remove('show');
}


