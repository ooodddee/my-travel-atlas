# 🎯 快速使用指南

## 如何为地点添加照片

### 方法 1: 使用在线图片链接
```javascript
const TRAVEL_DATA = [
  {
    id: 0,
    lat: 25.0389,
    lng: 102.7183,
    date: "2019.10",
    city: { zh: "昆明", en: "Kunming" },
    description: { 
      zh: "家乡的起点，温暖的回忆。", 
      en: "The starting point of home, warm memories." 
    },
    aiTags: ["Hometown", "Start", "Warm"],
    moodColor: "#ff9f43",
    // 🆕 添加照片数组
    photos: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d"
    ]
  }
];
```

### 方法 2: 使用本地照片
1. 在 `public/photos/` 目录下放置照片
2. 引用相对路径：
```javascript
photos: [
  "/photos/kunming-1.jpg",
  "/photos/kunming-2.jpg"
]
```

## 推荐的免费图床服务

1. **Unsplash** - https://unsplash.com (高质量旅行照片)
2. **Imgur** - https://imgur.com (上传你自己的照片)
3. **Cloudinary** - https://cloudinary.com (免费版支持 25GB)

## 控制按钮说明

| 按钮 | 功能 | 快捷键 |
|------|------|--------|
| 中/EN | 切换中英文 | - |
| ☀️/🌙 | 切换主题 | - |
| 📊 | 显示/隐藏统计 | - |
| ▶️/⏸️ | 自动播放/暂停 | - |
| ← / → | 上一个/下一个地点 | 计划中 |

## 自定义配置

### 调整自动播放速度
在 `Atlas.jsx` 中找到：
```javascript
setInterval(() => {
  // ...
}, 2000); // 2000ms = 2秒，可以修改这个值
```

### 修改统计计算
在 `stats` useMemo 中自定义你的统计逻辑：
```javascript
const stats = useMemo(() => {
  // 添加你自己的统计逻辑
  const myCustomStat = TRAVEL_DATA.filter(/* ... */).length;
  
  return {
    totalTrips: TRAVEL_DATA.length,
    // ... 其他统计
    myCustomStat // 你的自定义统计
  };
}, []);
```

## 常见问题

**Q: 照片显示不出来？**
- 检查图片 URL 是否有效
- 确保 URL 支持 CORS（跨域访问）
- 使用 HTTPS 链接而不是 HTTP

**Q: 如何隐藏某些地点？**
- 在 `TRAVEL_DATA` 中添加 `hidden: true` 字段
- 然后过滤：`const visibleData = TRAVEL_DATA.filter(loc => !loc.hidden)`

**Q: 能否添加视频？**
- 目前只支持图片
- 可以考虑在 description 中添加视频链接

## 数据结构完整示例

```javascript
{
  id: 0,                    // 唯一标识
  lat: 25.0389,             // 纬度
  lng: 102.7183,            // 经度
  date: "2019.10",          // 日期
  city: {                   // 城市名（双语）
    zh: "昆明",
    en: "Kunming"
  },
  description: {            // 描述（双语）
    zh: "详细的中文描述...",
    en: "Detailed English description..."
  },
  aiTags: [                 // 标签（英文）
    "Hometown",
    "Start",
    "Warm"
  ],
  moodColor: "#ff9f43",     // 心情颜色（16进制）
  photos: [                 // 🆕 照片数组（可选）
    "https://...",
    "https://..."
  ]
}
```

## 推荐工作流程

1. **收集数据** - 整理你的旅行记录（日期、地点、坐标）
2. **获取坐标** - 使用 Google Maps 查找经纬度
3. **上传照片** - 将照片上传到图床
4. **填充数据** - 在 TRAVEL_DATA 中添加记录
5. **测试查看** - 运行 `npm run dev` 查看效果
6. **调整优化** - 调整颜色、描述等细节

## 下一步

查看 `FEATURES.md` 了解所有新功能的详细说明！

---

💡 提示：每次修改数据后，页面会自动刷新（热重载）
