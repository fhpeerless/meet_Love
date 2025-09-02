// js/sidebar.js

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

// js/sidebar.js
export function toggleDeclaration() {
    const declaration = document.getElementById('xuanshi');
    declaration.classList.toggle('show');
}
window.toggleDeclaration = toggleDeclaration;

// ✅ 新增：点击外部关闭侧边栏
export function setupCloseOnOutsideClick() {
    document.addEventListener('click', function(e) {
        const profile = document.getElementById('profile');
        const contact = document.getElementById('contact');
        const avatar = document.querySelector('.avatar');
        const btns = document.querySelectorAll('.sidebar-btn');

        // 如果点击的是头像或按钮，不关闭
        if (
            avatar?.contains(e.target) ||
            btns[0]?.contains(e.target) ||
            btns[1]?.contains(e.target)
        ) {
            return;
        }

        // 如果点击的是 profile 或 contact 内部，不关闭
        if (
            profile?.contains(e.target) ||
            contact?.contains(e.target)
        ) {
            return;
        }

        // 否则关闭所有
        profile?.classList.remove('show');
        contact?.classList.remove('show');
    });
}
