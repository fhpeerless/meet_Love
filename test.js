// 测试脚本，用于检查函数是否被正确暴露到全局
console.log('Testing global functions:');
console.log('toggleProfile:', typeof window.toggleProfile);
console.log('toggleContact:', typeof window.toggleContact);
console.log('toggleDeclaration:', typeof window.toggleDeclaration);

// 测试DOM元素是否存在
console.log('Testing DOM elements:');
console.log('profile element:', document.getElementById('profile'));
console.log('contact element:', document.getElementById('contact'));
console.log('declaration element:', document.getElementById('xuanshi'));
