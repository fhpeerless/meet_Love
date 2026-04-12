(function() {
    'use strict';
    
    function initProtection() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showToast('右键菜单已禁用');
        });
        
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('copy', function(e) {
            e.preventDefault();
            showToast('复制功能已禁用');
        });
        
        document.addEventListener('cut', function(e) {
            e.preventDefault();
            showToast('剪切功能已禁用');
        });
        
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'c':
                        e.preventDefault();
                        showToast('复制快捷键已禁用');
                        break;
                    case 'a':
                        e.preventDefault();
                        showToast('全选快捷键已禁用');
                        break;
                    case 'u':
                        e.preventDefault();
                        showToast('查看源码已禁用');
                        break;
                    case 's':
                        e.preventDefault();
                        showToast('保存快捷键已禁用');
                        break;
                    case 'p':
                        e.preventDefault();
                        showToast('打印快捷键已禁用');
                        break;
                }
            }
            
            if (e.key === 'F12') {
                e.preventDefault();
                showToast('开发者工具已禁用');
            }
            
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch(e.key.toLowerCase()) {
                    case 'i':
                    case 'j':
                    case 'c':
                        e.preventDefault();
                        showToast('开发者工具已禁用');
                        break;
                }
            }
        });
        
        let devToolsOpened = false;
        const threshold = 160;
        
        function checkDevTools() {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!devToolsOpened) {
                    devToolsOpened = true;
                    onDevToolsOpen();
                }
            } else {
                devToolsOpened = false;
            }
        }
        
        setInterval(checkDevTools, 500);
        
        function onDevToolsOpen() {
            showToast('检测到开发者工具打开');
        }
        
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                showToast('请勿使用控制台');
            }
        });
        
        setInterval(function() {
            console.log('%c警告', 'color: red; font-size: 50px; font-weight: bold;');
            console.log('%c本网站内容受保护，请勿盗取！', 'color: red; font-size: 20px;');
            console.log(element);
        }, 3000);
    }
    
    function showToast(message) {
        const existingToast = document.querySelector('.protection-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'protection-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(231, 76, 60, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: fadeInOut 2s ease-in-out;
            font-family: sans-serif;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        
        if (!document.querySelector('style[data-protection]')) {
            style.setAttribute('data-protection', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProtection);
    } else {
        initProtection();
    }
    
    function disableViewSource() {
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
        });
    }
    
    disableViewSource();
    
    console.log('%c⚠️ 警告', 'color: red; font-size: 40px; font-weight: bold;');
    console.log('%c本网站内容受版权保护，请勿盗取！', 'color: red; font-size: 16px;');
    console.log('%cstudy.xtwa.org 智能笔记系统', 'color: blue; font-size: 14px;');
})();
