// profileModule.js
(function () {
    const profileModule = {
        toggleProfile() {
            const profile = document.getElementById('profile');
            if (!profile) return;
            profile.classList.toggle('show');
        },
        toggleContact() {
            const contact = document.getElementById('contact');
            if (!contact) return;
            contact.classList.toggle('show');
        }
    };

    // 暴露模块方法到 window 上下文（仅限需要调用的地方）
    window.profileModule = profileModule;
})();
