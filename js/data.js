// js/data.js
export const lettersData = [
    {
        id: 1,
        title: "让我快一些遇见你！sum=0(代表此帖此时星星的数量)",
        date: "2025-08-18",
        text: "我想快一些遇见你，这样世界就少了两个孤单的人！\n 在历史的长河中，十年如沧海一粟，但在人生的旅途中，屈指可数，\n 花开堪折直须折 莫待无花空折枝 \n 今日星星数量为0",
        photos: [
            "https://picsum.photos/seed/love1/400/300",
            "https://picsum.photos/seed/love2/400/300"
        ],
        musicUrl: "https://example.com/music/song1.mp3", // 替换为实际的音乐直链
        videoUrl: "https://example.com/videos/video1.mp4"  // 替换为实际的视频直链
    },

    {
        id: 2,
        title: "我的照片sum=0",
        date: "2025-08-20",
        text: "去干饭吧！去运动吧，去看剧吧，去逛逛大街吧，嗯，只不过是一个人！，",
        photos: [
            "./images/5b50a9502e745b6480ee27afafe17bf.jpg",
            "./images/5cda81b90c55443835d42f0fb073b53.jpg",
            "./images/5cda81b90c55443835d42f0fb073b53.jpg"
        ],
        musicUrl: "https://example.com/music/song2.mp3", // 替换为实际的音乐直链
        videoUrl: ""  // 如果没有视频，留空
    }

        {
        id: 3,
        title: "准备的发光礼盒，sum=0",
        date: "2025-08-20",
        text: "去干饭吧！去运动吧，去看剧吧，去逛逛大街吧，嗯，只不过是一个人！，",
        photos: [
            "./images/5b50a9502e745b6480ee27afafe17bf.jpg",
        ],
        musicUrl: "", // 替换为实际的音乐直链
        videoUrl: "http://note.youdao.com/yws/api/personal/file/99e2a3bf2df913cd8e09dac1c510cc5f?method=download&inline=true&shareKey=26b960b4014fb9007c696ca53d53b1b1"  // 如果没有视频，留空
    }
    // ... 其他信件
];

// ✅ 移除了：window.lettersData = lettersData;
// ✅ 移除了：console.log('✅ data.js 已成功加载');
