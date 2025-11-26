import React, { useState, useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. 双语数据结构 (Bilingual Data) ---
// 现在每个文本字段都是一个对象：{ zh: "中文", en: "English" }
const TRAVEL_DATA = [
  {
    id: 0,
    // 昆明坐标
    lat: 25.0389, 
    lng: 102.7183,
    date: "2019.10", // 第一次去曼谷前的时间点/或者家乡常驻
    city: { zh: "昆明 (家乡)", en: "Kunming (Hometown)" },
    description: {
      zh: "这是故事的起点。无论走多远，胃永远记得过桥米线的味道。",
      en: "Where the story begins. No matter how far I go, I miss the taste of Crossing-the-bridge noodles."
    },
    // 意境标签也做了双语
    aiTags: ["Hometown", "Start", "Warm"], 
    moodColor: "#ff9f43" // 温暖橙
  },
  {
    id: 1,
    // 曼谷 (第1次 - 2019)
    lat: 13.7563,
    lng: 100.5018,
    date: "2019.10",
    city: { zh: "曼谷 (初见)", en: "Bangkok (1st Visit)" },
    description: {
      zh: "2019年，第一次和家人出国。那是疫情前的最后一个夏天，湄南河的风很暖，芒果糯米饭很甜。",
      en: "First trip abroad with family. It was the last summer before the pandemic. The breeze over Chao Phraya was warm."
    },
    aiTags: ["Family", "First Trip", "Summer"],
    moodColor: "#feca57" 
  },
  {
    id: 2,
    // 曼谷 (第2次 - 2023.03)
    lat: 13.7563,
    lng: 100.5018,
    date: "2023.03",
    city: { zh: "曼谷 (重逢)", en: "Bangkok (Return)" },
    description: {
      zh: "时隔三年再次落地素万那普机场，熟悉的湿热空气扑面而来。",
      en: "Landing at Suvarnabhumi Airport again after three years. The familiar humid air hit my face."
    },
    aiTags: ["Return", "Hot", "Chaos"],
    moodColor: "#feca57"
  },
  {
    id: 3,
    // 涛岛
    lat: 10.0956,
    lng: 99.8404,
    date: "2023.04",
    city: { zh: "涛岛", en: "Koh Tao" },
    description: {
      zh: "在海里吐泡泡的日子。世界很安静，只剩下呼吸的声音。",
      en: "Days spent blowing bubbles underwater. The world was silent, only the sound of breathing remained."
    },
    aiTags: ["Diving", "Ocean", "Blue"],
    moodColor: "#48dbfb"
  },
  {
    id: 4,
    // 清迈
    lat: 18.7932,
    lng: 98.9817,
    date: "2023.11",
    city: { zh: "清迈", en: "Chiang Mai" },
    description: {
      zh: "水灯节的夜晚，万千孔明灯升空，像倒流的银河。",
      en: "Yi Peng Festival. Thousands of lanterns rose into the sky like a reversed galaxy."
    },
    aiTags: ["Lanterns", "Night", "Romantic"],
    moodColor: "#ff6b6b"
  },
  {
    id: 5,
    // 西雅图
    lat: 47.6062,
    lng: -122.3321,
    date: "2024.08",
    city: { zh: "西雅图", en: "Seattle" },
    description: {
      zh: "跨越太平洋的新生活。雨季还没来，雷尼尔山在天边清晰可见。",
      en: "New life across the Pacific. The rainy season hasn't started yet, Mt. Rainier is clearly visible."
    },
    aiTags: ["New Life", "Tech", "Mountain"],
    moodColor: "#54a0ff"
  },
  // ... 你可以继续按这个格式添加温哥华和夏威夷 ...
];

const Atlas = () => {
  const globeEl = useRef();
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineIdx, setTimelineIdx] = useState(0);
  
  // --- 新增：语言状态 ---
  const [lang, setLang] = useState('zh'); // 默认中文 'zh'，切换为 'en'

  // --- 过滤逻辑 (支持搜索英文或中文) ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return TRAVEL_DATA;
    const lowerQuery = searchQuery.toLowerCase();
    return TRAVEL_DATA.filter(loc => {
      // 搜索匹配：城市名(中/英) 或 Tags
      return loc.city.zh.includes(lowerQuery) || 
             loc.city.en.toLowerCase().includes(lowerQuery) ||
             loc.aiTags.some(tag => tag.toLowerCase().includes(lowerQuery));
    });
  }, [searchQuery]);

  // --- 连线逻辑 ---
  const arcsData = useMemo(() => {
    const arcs = [];
    for (let i = 0; i < timelineIdx; i++) {
      if (i < TRAVEL_DATA.length - 1) {
        arcs.push({
          startLat: TRAVEL_DATA[i].lat,
          startLng: TRAVEL_DATA[i].lng,
          endLat: TRAVEL_DATA[i+1].lat,
          endLng: TRAVEL_DATA[i+1].lng,
          color: i === timelineIdx - 1 ? ['#ff0000', '#ff0000'] : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)']
        });
      }
    }
    return arcs;
  }, [timelineIdx]);

  // --- 视角跟随 ---
  useEffect(() => {
    if (globeEl.current) {
      const currentTrip = TRAVEL_DATA[timelineIdx];
      globeEl.current.pointOfView({
        lat: currentTrip.lat,
        lng: currentTrip.lng,
        altitude: 1.8 
      }, 1000);
    }
  }, [timelineIdx]);

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: '#050505', overflow: 'hidden', zIndex: 0 
    }}>
      
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        ringsData={filteredData.filter((_, idx) => idx <= timelineIdx)}
        // 增大光圈，更容易看见
        ringMaxRadius={d => d.id === timelineIdx ? 10 : 5} 
        ringColor={d => d.moodColor}
        ringPropagationSpeed={2}
        ringRepeatPeriod={800}
        
        pointsData={filteredData.filter((_, idx) => idx <= timelineIdx)}
        pointColor={() => "#fce38a"}
        pointAltitude={0.05}
        // --- 关键修改：增大点击热区 ---
        pointRadius={1.5} // 以前是 0.5，现在放大3倍，非常容易点
        onPointClick={(d) => setSelectedLoc(d)}
        
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
      />

      {/* A. 顶部栏：标题 + 搜索 + 语言切换 */}
      <div style={{ position: 'fixed', top: '40px', left: '40px', zIndex: 100, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', pointerEvents: 'auto' }}>
          <h1 style={{ color: 'white', fontFamily: 'serif', margin: 0, textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
            {lang === 'zh' ? '时空足迹' : 'THE JOURNEY'}
          </h1>
          {/* 语言切换按钮 */}
          <button 
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 'bold'
            }}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>

        <div style={{ position: 'relative', pointerEvents: 'auto' }}>
          <input
            type="text"
            placeholder={lang === 'zh' ? "搜索回忆: '夏天', '雪山'..." : "Search mood: 'Summer', 'Snow'..."}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 15px', borderRadius: '20px', color: 'white', width: '250px',
              outline: 'none', backdropFilter: 'blur(10px)'
            }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* B. 右侧时间轴 (双语) */}
      <div style={{ 
        position: 'fixed', top: '50%', right: '20px', transform: 'translateY(-50%)', 
        zIndex: 100, display: 'flex', flexDirection: 'column', gap: '15px', 
        maxHeight: '80vh', overflowY: 'auto', pointerEvents: 'none', paddingRight: '10px'
      }}>
        {TRAVEL_DATA.map((item, index) => (
          <div 
            key={item.id}
            onClick={() => setTimelineIdx(index)}
            style={{ 
              pointerEvents: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
              opacity: index <= timelineIdx ? 1 : 0.4, transition: 'all 0.3s'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>{item.date}</div>
              <div style={{ color: index === timelineIdx ? '#ffeb3b' : 'white', fontWeight: index === timelineIdx ? 'bold' : 'normal' }}>
                {item.city[lang]} {/* 根据语言显示 */}
              </div>
            </div>
            <div style={{ 
              width: '10px', height: '10px', borderRadius: '50%', 
              background: index === timelineIdx ? '#ffeb3b' : 'white',
              boxShadow: index === timelineIdx ? '0 0 10px #ffeb3b' : 'none'
            }}></div>
          </div>
        ))}
      </div>

      {/* C. 底部控制条 */}
      <div style={{ 
        position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
        zIndex: 100, display: 'flex', alignItems: 'center', gap: '20px',
        background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '30px',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button onClick={() => setTimelineIdx(Math.max(0, timelineIdx - 1))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>←</button>
        <div style={{ color: 'white', fontFamily: 'serif', minWidth: '200px', textAlign: 'center' }}>
          {TRAVEL_DATA[timelineIdx].date} • {TRAVEL_DATA[timelineIdx].city[lang]}
        </div>
        <button onClick={() => setTimelineIdx(Math.min(TRAVEL_DATA.length - 1, timelineIdx + 1))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>→</button>
      </div>

      {/* D. 纯净日记模态框 (双语支持 + 无音频) */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '450px', 
              background: '#1a1a1a', // 深灰纸张质感
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px', 
              padding: '40px', 
              zIndex: 200, 
              color: '#e0e0e0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <button onClick={() => setSelectedLoc(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            
            {/* 日期标签 */}
            <div style={{ 
              fontSize: '12px', letterSpacing: '2px', color: selectedLoc.moodColor, 
              textTransform: 'uppercase', marginBottom: '5px', fontWeight: 'bold' 
            }}>
              {selectedLoc.date}
            </div>
            
            {/* 城市标题 */}
            <h2 style={{ fontFamily: 'serif', fontSize: '2.2rem', margin: '0 0 25px 0', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
              {selectedLoc.city[lang]}
            </h2>
            
            {/* 日记正文：使用衬线体，模仿阅读体验 */}
            <div style={{ 
              fontFamily: lang === 'zh' ? '"Songti SC", serif' : '"Georgia", serif', // 中文宋体，英文Georgia
              fontSize: '16px', 
              lineHeight: '1.8', 
              color: '#ccc',
              minHeight: '100px',
              whiteSpace: 'pre-wrap' // 保留换行符
            }}>
              {selectedLoc.description[lang]}
            </div>

            {/* Tags 展示 */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedLoc.aiTags.map(tag => (
                <span key={tag} style={{ fontSize: '10px', color: '#666', border: '1px solid #333', padding: '2px 8px', borderRadius: '10px' }}>
                  #{tag}
                </span>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 遮罩层，点击空白处也可以关闭日记 */}
      {selectedLoc && (
        <div 
          onClick={() => setSelectedLoc(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 150, background: 'rgba(0,0,0,0.3)' }}
        />
      )}
    </div>
  );
};

export default Atlas;