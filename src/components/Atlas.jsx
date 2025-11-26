import React, { useState, useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. 你的真实数据 (The Real Journey) ---
// 注意：我帮你修正了温哥华的时间逻辑(推测是2024年12月)，如果不对可以自己改
const TRAVEL_DATA = [
  {
    id: 0,
    city: "Yunnan",
    country: "China",
    lat: 25.0389,
    lng: 102.7183,
    date: "Hometown", // 起点
    description: "故事开始的地方，彩云之南。",
    aiTags: ["家乡", "起点", "宁静", "山脉"],
    audio: "https://actions.google.com/sounds/v1/nature/forest_morning.ogg", // 森林音效
    moodColor: "#ff9f43" // 温暖的橙色
  },
  {
    id: 1,
    city: "Bangkok",
    country: "Thailand",
    lat: 13.7563,
    lng: 100.5018,
    date: "2023.03",
    description: "第一次抵达曼谷，热浪与突突车的轰鸣。",
    aiTags: ["热闹", "城市", "夏天", "寺庙"],
    audio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    moodColor: "#feca57"
  },
  {
    id: 2,
    city: "Koh Tao",
    country: "Thailand",
    lat: 10.0956,
    lng: 99.8404,
    date: "2023.04",
    description: "在涛岛潜水，蓝色的果冻海。",
    aiTags: ["海岛", "潜水", "蓝色", "宁静"],
    audio: "https://actions.google.com/sounds/v1/water/waves_crashing.ogg",
    moodColor: "#48dbfb"
  },
  {
    id: 3,
    city: "Chiang Mai",
    country: "Thailand",
    lat: 18.7932,
    lng: 98.9817,
    date: "2023.11",
    description: "清迈的水灯节，天灯升起。",
    aiTags: ["浪漫", "夜晚", "灯火", "古城"],
    audio: "https://actions.google.com/sounds/v1/fire/fire_crackling.ogg",
    moodColor: "#ff6b6b"
  },
  {
    id: 4,
    city: "Bangkok (Return)",
    country: "Thailand",
    lat: 13.7563,
    lng: 100.5018,
    date: "2024.08",
    description: "故地重游，告别东南亚。",
    aiTags: ["离别", "中转", "回忆"],
    audio: "https://actions.google.com/sounds/v1/transportation/airplane_cabin.ogg",
    moodColor: "#feca57"
  },
  {
    id: 5,
    city: "Seattle",
    country: "USA",
    lat: 47.6062,
    lng: -122.3321,
    date: "2024.08 (Late)",
    description: "跨越太平洋，抵达西雅图，新的开始。",
    aiTags: ["新生活", "雨季", "科技", "现代"],
    audio: "https://actions.google.com/sounds/v1/weather/rain_heavy.ogg",
    moodColor: "#54a0ff"
  },
  {
    id: 6,
    city: "Vancouver",
    country: "Canada",
    lat: 49.2827,
    lng: -123.1207,
    date: "2024.12.29",
    description: "北上温哥华，冬日的雪山。",
    aiTags: ["寒冷", "雪山", "滑雪"],
    audio: "https://actions.google.com/sounds/v1/weather/strong_wind_whistling.ogg",
    moodColor: "#c8d6e5"
  },
  {
    id: 7,
    city: "Kauai",
    country: "USA (Hawaii)",
    lat: 22.0964,
    lng: -159.5261,
    date: "2025.05.19",
    description: "可爱岛，原始的侏罗纪公园。",
    aiTags: ["自然", "丛林", "壮观"],
    audio: "https://actions.google.com/sounds/v1/animals/birds_forest_morning.ogg",
    moodColor: "#1dd1a1"
  },
  {
    id: 8,
    city: "Honolulu",
    country: "USA (Hawaii)",
    lat: 21.3069,
    lng: -157.8583,
    date: "2025.06.17",
    description: "檀香山的繁华与Waikiki海滩。",
    aiTags: ["海滩", "日落", "城市"],
    audio: "https://actions.google.com/sounds/v1/water/beach_waves.ogg",
    moodColor: "#ff9f43"
  },
  {
    id: 9,
    city: "Big Island",
    country: "USA (Hawaii)",
    lat: 19.5429,
    lng: -155.6659,
    date: "2025.06.29",
    description: "大岛火山，毁灭与新生。",
    aiTags: ["火山", "震撼", "黑色"],
    audio: "https://actions.google.com/sounds/v1/science_fiction/scifi_drone_flyby.ogg",
    moodColor: "#ee5253"
  }
];

const Atlas = () => {
  const globeEl = useRef();
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineIdx, setTimelineIdx] = useState(0); // 默认从起点开始

  // --- AI 搜索逻辑 ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return TRAVEL_DATA;
    return TRAVEL_DATA.filter(loc => {
      return loc.aiTags.some(tag => tag.includes(searchQuery)) || 
             loc.city.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  // --- 足迹连线逻辑 (只画出当前时间点之前的线) ---
  const arcsData = useMemo(() => {
    const arcs = [];
    // 只遍历到 timelineIdx
    for (let i = 0; i < timelineIdx; i++) {
      if (i < TRAVEL_DATA.length - 1) {
        arcs.push({
          startLat: TRAVEL_DATA[i].lat,
          startLng: TRAVEL_DATA[i].lng,
          endLat: TRAVEL_DATA[i+1].lat,
          endLng: TRAVEL_DATA[i+1].lng,
          // 如果是刚才飞过的航线，设为亮色，否则稍微暗一点
          color: i === timelineIdx - 1 ? ['#ff0000', '#ff0000'] : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.5)']
        });
      }
    }
    return arcs;
  }, [timelineIdx]);

  // --- 视角自动跟随 ---
  // --- 视角自动跟随 ---
  useEffect(() => {
    if (globeEl.current) {
      const currentTrip = TRAVEL_DATA[timelineIdx];
      
      // 让它一开始就飞到当前地点
      globeEl.current.pointOfView({
        lat: currentTrip.lat,
        lng: currentTrip.lng,
        altitude: 2.0 
      }, 1000); // 1秒飞过去
    }
  }, [timelineIdx]); // 初始化时 timelineIdx 是 0，所以会自动执行一次

  return (
    <div style={{ 
        position: 'fixed', /* 强制固定，无视父元素 */
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#050505', 
        overflow: 'hidden',
        zIndex: 0 /* 确保在最底层，不遮挡其他可能存在的元素 */
      }}>
      
      {/* 1. 3D 地球 */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // 只显示当前时间点及之前的地点 (Ring)
        ringsData={filteredData.filter((_, idx) => idx <= timelineIdx)}
        ringColor={d => searchQuery ? d.moodColor : (d.id === timelineIdx ? "#ffeb3b" : "#ffffff")} // 当前点亮黄色
        ringMaxRadius={d => d.id === timelineIdx ? 8 : 4} // 当前点光圈大
        ringPropagationSpeed={2}
        ringRepeatPeriod={800}
        
        // 点击点
        pointsData={filteredData.filter((_, idx) => idx <= timelineIdx)}
        pointColor={() => "#fce38a"}
        pointAltitude={0.05}
        pointRadius={0.5}
        onPointClick={(d) => setSelectedLoc(d)}
        
        // 连线
        arcsData={arcsData}
        arcColor="color" // 使用数据里定义的颜色
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
      />

      {/* 2. 左上角标题与搜索 - 增加 pointerEvents: 'none' 防止遮挡，子元素恢复 'auto' */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 10, pointerEvents: 'none' }}>
        <h1 style={{ color: 'white', fontFamily: 'serif', margin: '0 0 10px 0', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>THE JOURNEY</h1>
        <div style={{ position: 'relative', pointerEvents: 'auto' }}>
          <input
            type="text"
            placeholder="Search mood: '热浪', '雪山'..."
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 15px',
              borderRadius: '20px',
              color: 'white',
              width: '250px',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. 右侧垂直时间轴 (Timeline Sidebar) - 修复交互问题 */}
      {/* 3. 右侧垂直时间轴 - 优化了边距 */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        right: '20px',  /* 改小一点，或者保持40px */
        transform: 'translateY(-50%)', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxHeight: '80vh',
        overflowY: 'auto',
        pointerEvents: 'none',
        paddingRight: '10px' /* 增加一点右侧内边距 */
      }}>
        {TRAVEL_DATA.map((item, index) => (
          <div 
            key={item.id}
            onClick={() => setTimelineIdx(index)}
            style={{ 
              pointerEvents: 'auto', // 按钮本身可点击
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              opacity: index <= timelineIdx ? 1 : 0.4, // 未来的行程变暗
              transition: 'all 0.3s'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>{item.date}</div>
              <div style={{ color: index === timelineIdx ? '#ffeb3b' : 'white', fontWeight: index === timelineIdx ? 'bold' : 'normal' }}>
                {item.city}
              </div>
            </div>
            {/* 时间轴的点 */}
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: index === timelineIdx ? '#ffeb3b' : 'white',
              boxShadow: index === timelineIdx ? '0 0 10px #ffeb3b' : 'none'
            }}></div>
          </div>
        ))}
      </div>

      {/* 4. 底部控制条 (Player Controls) */}
      <div style={{ 
        position: 'absolute', 
        bottom: '40px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px 20px',
        borderRadius: '30px',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button 
          onClick={() => setTimelineIdx(Math.max(0, timelineIdx - 1))}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
        >
          ← Prev
        </button>
        
        <div style={{ color: 'white', fontFamily: 'serif', minWidth: '150px', textAlign: 'center' }}>
          {TRAVEL_DATA[timelineIdx].date} • {TRAVEL_DATA[timelineIdx].city}
        </div>

        <button 
          onClick={() => setTimelineIdx(Math.min(TRAVEL_DATA.length - 1, timelineIdx + 1))}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
        >
          Next →
        </button>
      </div>

      {/* 5. 时空胶囊模态框 */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '400px', background: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px', padding: '30px', zIndex: 100, color: 'white',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
          >
            <button onClick={() => setSelectedLoc(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            <h5 style={{ fontSize: '12px', letterSpacing: '2px', color: selectedLoc.moodColor, textTransform: 'uppercase' }}>Memory • {selectedLoc.date}</h5>
            <h2 style={{ fontFamily: 'serif', fontSize: '2rem', margin: '10px 0' }}>{selectedLoc.city}</h2>
            <div style={{ borderLeft: `2px solid ${selectedLoc.moodColor}`, paddingLeft: '15px', margin: '20px 0', fontSize: '14px', lineHeight: '1.6', color: '#ddd' }}>
              {selectedLoc.description}
            </div>
            <audio autoPlay loop src={selectedLoc.audio} controls style={{ width: '100%', height: '30px', opacity: 0.6, marginTop: '10px' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Atlas;