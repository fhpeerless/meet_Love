// js/utils.js
export function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                  '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return `${date.getFullYear()}年${months[date.getMonth()]}${date.getDate()}日`;
}
