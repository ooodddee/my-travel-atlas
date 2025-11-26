import React, { useState, useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';

// 添加 CSS 动画样式
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.6; 
      transform: scale(1.1);
    }
  }
  
  @keyframes bounce {
    0%, 100% { 
      transform: translateY(0);
    }
    50% { 
      transform: translateY(-4px);
    }
  }
`;
document.head.appendChild(styleSheet);

// --- 数据结构 ---
// 💡 提示：可以为每个地点添加 photos 字段来显示照片
// 示例: photos: ["url1.jpg", "url2.jpg"] 或 photos: ["https://..."]
const TRAVEL_DATA = [
  { 
    id: 0, 
    lat: 25.0389, 
    lng: 102.7183, 
    date: "2019.10", 
    city: { zh: "昆明", en: "Kunming" },
    country: { zh: "中国", en: "China", code: "🇨🇳" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: ["Hometown", "Start", "Warm"], 
    moodColor: "#ff9f43" 
  },
  { 
    id: 1, 
    lat: 13.7563, 
    lng: 100.5018, 
    date: "2019.10", 
    city: { zh: "曼谷", en: "Bangkok" },
    country: { zh: "泰国", en: "Thailand", code: "🇹🇭" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: ["Family"], 
    moodColor: "#feca57" 
  },
  { 
    id: 2, 
    lat: 13.7563, 
    lng: 100.5018, 
    date: "2023.03", 
    city: { zh: "曼谷", en: "Bangkok" },
    country: { zh: "泰国", en: "Thailand", code: "🇹🇭" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: ["Start"], 
    moodColor: "#feca57" 
  },
  { 
    id: 3, 
    lat: 10.0956, 
    lng: 99.8404, 
    date: "2023.04", 
    city: { zh: "涛岛", en: "Koh Tao" },
    country: { zh: "泰国", en: "Thailand", code: "🇹🇭" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: ["Diving", "Muay Thai"], 
    moodColor: "#48dbfb" 
  },
  { 
    id: 4, 
    lat: 13.7563, 
    lng: 100.5018, 
    date: "2023.05", 
    city: { zh: "曼谷", en: "Bangkok" },
    country: { zh: "泰国", en: "Thailand", code: "🇹🇭" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: [""], 
    moodColor: "#ffa502" 
  },
  { 
    id: 5, 
    lat: 18.7932, 
    lng: 98.9817, 
    date: "2023.11", 
    city: { zh: "清迈", en: "Chiang Mai" },
    country: { zh: "泰国", en: "Thailand", code: "🇹🇭" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: [""], 
    moodColor: "#ff6b6b" 
  },
  { 
    id: 6, 
    lat: 14.3532, 
    lng: 100.5676, 
    date: "2024.08", 
    city: { zh: "大城府", en: "Ayutthaya" },
    country: { zh: "泰国", en: "Thailand", code: "🇹🇭" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: [""], 
    moodColor: "#d4a574" 
  },
  { 
    id: 7, 
    lat: 47.6062, 
    lng: -122.3321, 
    date: "2024.08", 
    city: { zh: "西雅图", en: "Seattle" },
    country: { zh: "美国", en: "USA", code: "🇺🇸" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: ["New Life"], 
    moodColor: "#54a0ff" 
  },
  { 
    id: 8, 
    lat: 49.2827, 
    lng: -123.1207, 
    date: "2024.12.29", 
    city: { zh: "温哥华", en: "Vancouver" },
    country: { zh: "加拿大", en: "Canada", code: "🇨🇦" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: [""], 
    moodColor: "#c8d6e5" 
  },
  { 
    id: 9, 
    lat: 22.0964, 
    lng: -159.5261, 
    date: "2025.05.19", 
    city: { zh: "可爱岛", en: "Kauai" },
    country: { zh: "美国", en: "USA", code: "🇺🇸" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: [""], 
    moodColor: "#1dd1a1" 
  },
  { 
    id: 10, 
    lat: 21.3069, 
    lng: -157.8583, 
    date: "2025.06.17", 
    city: { zh: "檀香山", en: "Honolulu" },
    country: { zh: "美国", en: "USA", code: "🇺🇸" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: [""], 
    moodColor: "#ff9f43" 
  },
  { 
    id: 11, 
    lat: 19.5429, 
    lng: -155.6659, 
    date: "2025.06.29", 
    city: { zh: "大岛", en: "Big Island" },
    country: { zh: "美国", en: "USA", code: "🇺🇸" },
    description: { 
      zh: "正在努力回忆中。。。", 
      en: "Trying hard to recall..." 
    }, 
    aiTags: ["Volcano"], 
    moodColor: "#ee5253" 
  }
];


const Atlas = () => {
  const globeEl = useRef();
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineIdx, setTimelineIdx] = useState(0);
  const [lang, setLang] = useState('zh');
  
  // 新增状态
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [showTip, setShowTip] = useState(true); // 使用提示
  const autoPlayIntervalRef = useRef(null);
  
  // 响应式设计 - 媒体查询
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 
  // --- 过滤逻辑 (支持中英双语语义搜索) ---
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

  // --- 统计数据计算 ---
  const stats = useMemo(() => {
    const uniqueCities = new Set(TRAVEL_DATA.map(loc => loc.city.en)).size;
    const uniqueCountries = new Set(
      TRAVEL_DATA.map(loc => {
        // 简单的国家判断（可以根据实际情况扩展）
        if (loc.city.en.includes('Bangkok') || loc.city.en.includes('Koh Tao') || loc.city.en.includes('Chiang Mai')) return '泰国';
        if (loc.city.en.includes('Seattle')) return '美国';
        if (loc.city.en.includes('Vancouver')) return '加拿大';
        if (loc.city.en.includes('Kauai') || loc.city.en.includes('Honolulu') || loc.city.en.includes('Big Island')) return '美国';
        if (loc.city.en.includes('Kunming')) return '中国';
        return 'Unknown';
      })
    ).size;
    
    // 计算总里程（简化版，使用经纬度估算）
    let totalDistance = 0;
    for (let i = 0; i < TRAVEL_DATA.length - 1; i++) {
      const R = 6371; // 地球半径（公里）
      const dLat = (TRAVEL_DATA[i+1].lat - TRAVEL_DATA[i].lat) * Math.PI / 180;
      const dLng = (TRAVEL_DATA[i+1].lng - TRAVEL_DATA[i].lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(TRAVEL_DATA[i].lat * Math.PI / 180) * Math.cos(TRAVEL_DATA[i+1].lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDistance += R * c;
    }
    
    return {
      totalTrips: TRAVEL_DATA.length,
      uniqueCities,
      uniqueCountries,
      totalDistance: Math.round(totalDistance),
      firstTrip: TRAVEL_DATA[0].date,
      latestTrip: TRAVEL_DATA[TRAVEL_DATA.length - 1].date
    };
  }, []);

  // --- 自动播放功能 ---
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        setTimelineIdx(prev => {
          if (prev >= TRAVEL_DATA.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 每2秒切换一个地点
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying]);

  // --- 新增状态：存储重叠的地点列表 ---
  const [overlappingLocs, setOverlappingLocs] = useState(null); 
  
  // 阈值：2度以内我们视为重叠（约220公里）
  const OVERLAP_THRESHOLD = 2; 

  // --- 连线逻辑 (科技流光) ---
  const arcsData = useMemo(() => {
    const arcs = [];
    for (let i = 0; i < timelineIdx; i++) {
      if (i < TRAVEL_DATA.length - 1) {
        arcs.push({
          startLat: TRAVEL_DATA[i].lat,
          startLng: TRAVEL_DATA[i].lng,
          endLat: TRAVEL_DATA[i+1].lat,
          endLng: TRAVEL_DATA[i+1].lng,
          color: [TRAVEL_DATA[i].moodColor, TRAVEL_DATA[i+1].moodColor], 
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
  
  // --- 关键交互逻辑：处理重叠点击 ---
  const handlePointClick = (clickedLoc) => {
    // 过滤出所有在 clickedLoc 2度地理距离内的点，且必须是 timelineIdx 之前的点
    const overlapping = TRAVEL_DATA.filter((loc, index) => {
        // 排除未来的点，只考虑已经点亮的路程
        if (index > timelineIdx) return false; 
        
        // 排除正在点击的点本身
        if (loc.id === clickedLoc.id) return true; 

        // 简单的地理距离检查
        return (
            Math.abs(loc.lat - clickedLoc.lat) < OVERLAP_THRESHOLD && 
            Math.abs(loc.lng - clickedLoc.lng) < OVERLAP_THRESHOLD
        );
    });

    if (overlapping.length > 1) {
        // 如果有多个点重叠，弹出选择菜单
        setOverlappingLocs(overlapping);
    } else {
        // 否则，直接打开时空胶囊
        setSelectedLoc(clickedLoc);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: theme === 'dark' ? '#050505' : '#e8f4f8', 
      overflow: 'hidden', zIndex: 0,
      transition: 'background 0.5s ease'
    }}>
      
      <Globe
        ref={globeEl}
        globeImageUrl={theme === 'dark' 
          ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
          : "//unpkg.com/three-globe/example/img/earth-day.jpg"
        }
        backgroundImageUrl={theme === 'dark'
          ? "//unpkg.com/three-globe/example/img/night-sky.png"
          : null
        }
        backgroundColor={theme === 'dark' ? '#050505' : '#e8f4f8'}
        
        // 优雅的脉冲圆环 - 更细更精致
        ringsData={filteredData.filter((_, idx) => idx <= timelineIdx)}
        ringMaxRadius={d => d.id === timelineIdx ? 8 : 4} 
        ringColor={d => [d.moodColor, `${d.moodColor}00`]} // 渐变消失效果
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={1200}
        
        // 精致的地点标记
        pointsData={filteredData.filter((_, idx) => idx <= timelineIdx)}
        pointColor={d => d.id === timelineIdx ? '#fff' : d.moodColor}
        pointAltitude={0.02}
        pointRadius={d => d.id === timelineIdx ? 0.8 : 0.5} 
        onPointClick={handlePointClick}
        
        // 优雅的连线 - 细线条 + 流动动画
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.6} 
        arcDashGap={0.4}   
        arcDashAnimateTime={2500} 
        arcStroke={0.5} // 从2.0改为0.5，更细腻
        arcAltitude={0.15} // 略微降低高度，更贴合地球
        arcDashInitialGap={() => Math.random()} // 随机起始位置，更有活力
        
        // 柔和的大气层
        atmosphereColor={theme === 'dark' ? '#3a228a' : '#87ceeb'}
        atmosphereAltitude={0.12}
      />

      {/* A. 顶部栏：标题 + 搜索 + 语言切换 + 新功能按钮 */}
      <div style={{ 
        position: 'fixed', 
        top: isMobile ? '15px' : '40px', 
        left: isMobile ? '15px' : '40px', 
        right: isMobile ? '15px' : 'auto',
        zIndex: 100, 
        pointerEvents: 'none', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '10px' : '15px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '8px' : '15px', 
          pointerEvents: 'auto', 
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-start'
        }}>
          <h1 style={{ 
            color: theme === 'dark' ? 'white' : '#2c3e50', 
            fontFamily: 'serif', 
            margin: 0, 
            textShadow: theme === 'dark' ? '0 0 10px rgba(255,255,255,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px'
          }}>
            {lang === 'zh' ? '时空足迹' : 'THE JOURNEY'}
          </h1>
          
          {/* 语言切换 */}
          <button 
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            style={{
              background: 'rgba(255,255,255,0.1)', 
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              padding: isMobile ? '4px 8px' : '5px 10px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: isMobile ? '11px' : '12px', 
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          
          {/* 主题切换 */}
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'rgba(255,255,255,0.1)', 
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              padding: '5px 10px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.3s'
            }}
            title={lang === 'zh' ? '切换主题' : 'Toggle Theme'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* 统计面板切换 */}
          <button 
            onClick={() => setShowStats(!showStats)}
            style={{
              background: showStats ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)', 
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              padding: '5px 10px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.3s'
            }}
            title={lang === 'zh' ? '统计数据' : 'Statistics'}
          >
            📊
          </button>
          
          {/* 自动播放按钮 */}
          <button 
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            style={{
              background: isAutoPlaying ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.1)', 
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              padding: '5px 10px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.3s'
            }}
            title={lang === 'zh' ? (isAutoPlaying ? '暂停播放' : '自动播放') : (isAutoPlaying ? 'Pause' : 'Auto Play')}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>
        </div>

        <div style={{ position: 'relative', pointerEvents: 'auto', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: isMobile ? '100%' : 'auto' }}>
            {/* 搜索图标 */}
            <span style={{
              position: 'absolute',
              left: isMobile ? '14px' : '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: isMobile ? '14px' : '16px',
              opacity: 0.5,
              pointerEvents: 'none',
              zIndex: 1
            }}>
              🔍
            </span>
            
            {/* 搜索输入框 */}
            <input
              type="text"
              placeholder={lang === 'zh' ? "搜索回忆..." : "Search memories..."}
              style={{
                background: theme === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(255,255,255,0.9)', 
                border: 'none',
                boxShadow: theme === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                padding: isMobile ? '12px 16px 12px 42px' : '14px 20px 14px 48px', 
                borderRadius: isMobile ? '12px' : '16px', 
                color: theme === 'dark' ? 'white' : '#2c3e50', 
                width: isMobile ? '100%' : '320px',
                outline: 'none', 
                backdropFilter: 'blur(20px)',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '400',
                letterSpacing: '0.2px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                WebkitFontSmoothing: 'antialiased',
                boxSizing: 'border-box'
              }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                e.target.style.background = theme === 'dark' 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(255,255,255,1)';
                e.target.style.boxShadow = theme === 'dark'
                  ? '0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 3px rgba(255,215,0,0.15)'
                  : '0 8px 30px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 3px rgba(100,150,255,0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.background = theme === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(255,255,255,0.9)';
                e.target.style.boxShadow = theme === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
            
            {/* 清除按钮 */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(128,128,128,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  transition: 'all 0.2s',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.background = 'rgba(128,128,128,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '0.6';
                  e.target.style.background = 'rgba(128,128,128,0.2)';
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* 统计面板 */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '12px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
                color: theme === 'dark' ? 'white' : '#2c3e50',
                minWidth: '300px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              <h3 style={{ 
                margin: '0 0 15px 0', 
                fontSize: '18px', 
                borderBottom: `2px solid ${theme === 'dark' ? '#ffeb3b' : '#3498db'}`,
                paddingBottom: '10px'
              }}>
                {lang === 'zh' ? '📈 旅行统计' : '📈 Travel Stats'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>
                    {lang === 'zh' ? '总旅程' : 'Total Trips'}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9f43' }}>
                    {stats.totalTrips}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>
                    {lang === 'zh' ? '访问城市' : 'Cities Visited'}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#48dbfb' }}>
                    {stats.uniqueCities}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>
                    {lang === 'zh' ? '访问国家' : 'Countries'}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1dd1a1' }}>
                    {stats.uniqueCountries}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>
                    {lang === 'zh' ? '总里程' : 'Total Distance'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6b6b' }}>
                    {stats.totalDistance.toLocaleString()} {lang === 'zh' ? '公里' : 'km'}
                  </div>
                </div>
              </div>
              <div style={{ 
                marginTop: '15px', 
                paddingTop: '15px', 
                borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                fontSize: '12px',
                color: '#999'
              }}>
                <div>{lang === 'zh' ? '首次旅行' : 'First Trip'}: {stats.firstTrip}</div>
                <div>{lang === 'zh' ? '最近旅行' : 'Latest Trip'}: {stats.latestTrip}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* B. 右侧时间轴 - 可点击打开日记 (移动端隐藏) */}
      {!isMobile && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          right: isTablet ? '10px' : '20px', 
          transform: 'translateY(-50%)', 
          zIndex: 100, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isTablet ? '12px' : '15px', 
          maxHeight: '80vh', 
          overflowY: 'auto', 
          pointerEvents: 'none', 
          paddingRight: '10px'
        }}>
          {TRAVEL_DATA.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => {
                setTimelineIdx(index);
                // 双击打开日记
                if (index === timelineIdx) {
                  setSelectedLoc(item);
                }
            }}
            onDoubleClick={() => {
              setTimelineIdx(index);
              setSelectedLoc(item);
            }}
            style={{ 
              pointerEvents: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
              opacity: index <= timelineIdx ? 1 : 0.4, 
              transition: 'all 0.3s',
              padding: '8px 12px',
              borderRadius: '12px',
              background: index === timelineIdx ? (theme === 'dark' ? 'rgba(255,235,59,0.1)' : 'rgba(100,150,255,0.1)') : 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = index === timelineIdx 
                ? (theme === 'dark' ? 'rgba(255,235,59,0.15)' : 'rgba(100,150,255,0.15)')
                : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = index === timelineIdx 
                ? (theme === 'dark' ? 'rgba(255,235,59,0.1)' : 'rgba(100,150,255,0.1)')
                : 'transparent';
            }}
            title={lang === 'zh' ? '点击切换，双击查看日记' : 'Click to switch, Double-click to view diary'}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: theme === 'dark' ? '#888' : '#666' }}>{item.date}</div>
              <div style={{ 
                  color: index === timelineIdx ? '#ffeb3b' : (theme === 'dark' ? 'white' : '#2c3e50'), 
                  fontWeight: index === timelineIdx ? 'bold' : 'normal',
                  minWidth: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '2px'
                }}>
                <span>{item.city[lang]}</span>
                <span style={{ 
                  fontSize: '9px', 
                  opacity: 0.6,
                  letterSpacing: '0.5px'
                }}>
                  {item.country.code} {item.country[lang]}
                </span>
              </div>
            </div>
            <div style={{ 
              width: '10px', height: '10px', borderRadius: '50%', 
              background: index === timelineIdx ? '#ffeb3b' : (theme === 'dark' ? 'white' : '#3498db'),
              boxShadow: index === timelineIdx ? '0 0 10px #ffeb3b' : 'none',
              transition: 'all 0.3s'
            }}></div>
          </div>
        ))}
        </div>
      )}

      {/* C. 底部控制条 - 带国家标识 + 可点击城市名打开日记 */}
      <div style={{ 
        position: 'fixed', 
        bottom: isMobile ? '20px' : '40px', 
        left: isMobile ? '15px' : '50%', 
        right: isMobile ? '15px' : 'auto',
        transform: isMobile ? 'none' : 'translateX(-50%)', 
        zIndex: 100, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: isMobile ? '6px' : '8px',
        background: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)', 
        padding: isMobile ? '12px 18px' : '15px 25px', 
        borderRadius: isMobile ? '16px' : '20px',
        backdropFilter: 'blur(10px)', 
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s',
        minWidth: isMobile ? 'auto' : '280px',
        width: isMobile ? '100%' : 'auto',
        boxSizing: 'border-box'
      }}>
        {/* 国家标识 - 顶部 */}
        <div style={{
          fontSize: isMobile ? '10px' : '11px',
          color: theme === 'dark' ? '#999' : '#666',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{TRAVEL_DATA[timelineIdx].country.code}</span>
          <span>{TRAVEL_DATA[timelineIdx].country[lang]}</span>
        </div>
        
        {/* 主要信息 - 中间 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '15px' : '20px',
          width: '100%',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => setTimelineIdx(Math.max(0, timelineIdx - 1))} 
            disabled={timelineIdx === 0}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              cursor: timelineIdx === 0 ? 'not-allowed' : 'pointer', 
              fontSize: '20px',
              opacity: timelineIdx === 0 ? 0.3 : 1,
              transition: 'all 0.2s'
            }}>
            ←
          </button>
          
          <div 
            onClick={() => setSelectedLoc(TRAVEL_DATA[timelineIdx])}
            style={{ 
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              fontFamily: 'serif', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              cursor: 'pointer',
              padding: isMobile ? '6px 12px' : '8px 16px',
              borderRadius: isMobile ? '10px' : '12px',
              transition: 'all 0.3s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,235,59,0.1)' : 'rgba(100,150,255,0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={lang === 'zh' ? '📖 点击查看旅行日记' : '📖 Click to view travel diary'}
          >
            <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>
              {TRAVEL_DATA[timelineIdx].city[lang]}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', opacity: 0.7 }}>
              {TRAVEL_DATA[timelineIdx].date}
            </div>
            {/* 悬浮提示图标 */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                fontSize: '14px',
                animation: 'pulse 2s infinite'
              }}>
                📖
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setTimelineIdx(Math.min(TRAVEL_DATA.length - 1, timelineIdx + 1))} 
            disabled={timelineIdx === TRAVEL_DATA.length - 1}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: theme === 'dark' ? 'white' : '#2c3e50', 
              cursor: timelineIdx === TRAVEL_DATA.length - 1 ? 'not-allowed' : 'pointer', 
              fontSize: isMobile ? '18px' : '20px',
              opacity: timelineIdx === TRAVEL_DATA.length - 1 ? 0.3 : 1,
              transition: 'all 0.2s'
            }}>
            →
          </button>
        </div>
      </div>
      
      {/* D. 增强的旅行日记模态框 */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed', 
              top: isMobile ? '0' : '50%', 
              left: isMobile ? '0' : '50%', 
              right: isMobile ? '0' : 'auto',
              bottom: isMobile ? '0' : 'auto',
              transform: isMobile ? 'none' : 'translate(-50%, -50%)',
              width: isMobile ? '100%' : (selectedLoc.photos && selectedLoc.photos.length > 0 ? (isTablet ? '90%' : '550px') : (isTablet ? '80%' : '450px')),
              maxWidth: isMobile ? 'none' : '90vw',
              maxHeight: isMobile ? '100vh' : '85vh',
              overflowY: 'auto',
              background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              border: isMobile ? 'none' : `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: isMobile ? '0' : '12px', 
              padding: isMobile ? '30px 20px' : (isTablet ? '35px 25px' : '40px'), 
              zIndex: 200, 
              color: theme === 'dark' ? '#e0e0e0' : '#2c3e50',
              boxShadow: isMobile ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <button 
              onClick={() => setSelectedLoc(null)} 
              style={{ 
                position: 'absolute', 
                top: isMobile ? '15px' : '20px', 
                right: isMobile ? '15px' : '20px', 
                background: 'transparent', 
                border: 'none', 
                color: theme === 'dark' ? '#666' : '#999', 
                cursor: 'pointer', 
                fontSize: isMobile ? '28px' : '24px',
                transition: 'color 0.3s',
                zIndex: 1
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#333'}
              onMouseOut={(e) => e.currentTarget.style.color = theme === 'dark' ? '#666' : '#999'}
            >
              ✕
            </button>
            
            {/* 照片画廊 */}
            {selectedLoc.photos && selectedLoc.photos.length > 0 && (
              <div style={{ 
                marginBottom: isMobile ? '20px' : '25px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: (isMobile || selectedLoc.photos.length === 1) ? '1fr' : 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {selectedLoc.photos.map((photo, idx) => (
                  <img 
                    key={idx}
                    src={photo} 
                    alt={`${selectedLoc.city[lang]} - ${idx + 1}`}
                    style={{ 
                      width: '100%', 
                      height: selectedLoc.photos.length === 1 ? '250px' : '150px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(photo, '_blank')}
                  />
                ))}
              </div>
            )}
            
            <div style={{ 
              fontSize: '12px', 
              letterSpacing: '2px', 
              color: selectedLoc.moodColor, 
              textTransform: 'uppercase', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              {selectedLoc.date}
            </div>
            
            <h2 style={{ 
              fontFamily: 'serif', 
              fontSize: '2.2rem', 
              margin: '0 0 25px 0', 
              borderBottom: `2px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`, 
              paddingBottom: '15px',
              color: theme === 'dark' ? '#fff' : '#2c3e50'
            }}>
              {selectedLoc.city[lang]}
            </h2>
            
            <div style={{ 
              fontFamily: lang === 'zh' ? '"Songti SC", serif' : '"Georgia", serif', 
              fontSize: '16px', 
              lineHeight: '1.8', 
              color: theme === 'dark' ? '#ccc' : '#555', 
              minHeight: '100px', 
              whiteSpace: 'pre-wrap' 
            }}>
              {selectedLoc.description[lang]}
            </div>
            
            <div style={{ marginTop: '30px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedLoc.aiTags.map(tag => (
                <span 
                  key={tag} 
                  style={{ 
                    fontSize: '11px', 
                    color: theme === 'dark' ? '#888' : '#666', 
                    border: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`, 
                    padding: '4px 10px', 
                    borderRadius: '12px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* E. 重叠点位选择器 */}
      <AnimatePresence>
        {overlappingLocs && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              background: theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              border: `2px solid ${theme === 'dark' ? '#ffeb3b' : '#3498db'}`,
              borderRadius: '12px', 
              padding: '20px', 
              zIndex: 300, 
              color: theme === 'dark' ? 'white' : '#2c3e50',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
              minWidth: '250px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ 
              color: theme === 'dark' ? '#ffeb3b' : '#3498db', 
              marginBottom: '15px', 
              fontSize: '14px', 
              fontWeight: 'bold' 
            }}>
              {lang === 'zh' ? '🎯 多个足迹点重叠，请选择：' : '🎯 Multiple points. Select one:'}
            </div>
            {overlappingLocs.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  setSelectedLoc(loc);
                  setOverlappingLocs(null);
                }}
                style={{
                  padding: '12px', 
                  cursor: 'pointer', 
                  borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                  transition: 'all 0.2s',
                  borderRadius: '6px',
                  marginBottom: '5px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme === 'dark' ? '#222' : '#f0f0f0';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {loc.date} • {loc.city[lang]}
              </div>
            ))}
             <div 
               onClick={() => setOverlappingLocs(null)} 
               style={{ 
                 textAlign: 'center', 
                 marginTop: '15px', 
                 color: '#999', 
                 cursor: 'pointer',
                 fontSize: '13px'
               }}
             >
                {lang === 'zh' ? '✕ 取消' : '✕ Cancel'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 遮罩层 */}
      {selectedLoc && (
        <div 
          onClick={() => setSelectedLoc(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 150, background: 'rgba(0,0,0,0.3)' }}
        />
      )}
      
      {/* 使用提示浮窗 - 首次访问时显示 */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? '100px' : '120px',
              left: isMobile ? '15px' : '50%',
              right: isMobile ? '15px' : 'auto',
              transform: isMobile ? 'none' : 'translateX(-50%)',
              zIndex: 200,
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,235,59,0.1))' 
                : 'linear-gradient(135deg, rgba(100,150,255,0.15), rgba(150,200,255,0.1))',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${theme === 'dark' ? 'rgba(255,215,0,0.3)' : 'rgba(100,150,255,0.3)'}`,
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px 20px' : '20px 30px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              maxWidth: isMobile ? 'none' : '400px',
              animation: 'bounce 2s infinite'
            }}
          >
            <div style={{
              color: theme === 'dark' ? '#fff' : '#2c3e50',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '500',
              marginBottom: isMobile ? '10px' : '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: isMobile ? '20px' : '24px' }}>💡</span>
              <span>{lang === 'zh' ? '如何查看旅行日记？' : 'How to view diary?'}</span>
            </div>
            
            <div style={{
              color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '1.6',
              marginBottom: isMobile ? '12px' : '15px'
            }}>
              {lang === 'zh' ? (
                <>
                  <div>📖 <strong>点击底部城市名称</strong></div>
                  {!isMobile && <div>📍 <strong>双击右侧时间轴</strong></div>}
                  <div>🌍 <strong>点击地球上的标记点</strong></div>
                </>
              ) : (
                <>
                  <div>📖 <strong>Click city name below</strong></div>
                  {!isMobile && <div>📍 <strong>Double-click timeline</strong></div>}
                  <div>🌍 <strong>Click marks on globe</strong></div>
                </>
              )}
            </div>
            
            <button
              onClick={() => setShowTip(false)}
              style={{
                background: theme === 'dark' ? 'rgba(255,215,0,0.2)' : 'rgba(100,150,255,0.2)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,215,0,0.4)' : 'rgba(100,150,255,0.4)'}`,
                color: theme === 'dark' ? '#ffd700' : '#4a90e2',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                width: '100%',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme === 'dark' ? 'rgba(255,215,0,0.3)' : 'rgba(100,150,255,0.3)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = theme === 'dark' ? 'rgba(255,215,0,0.2)' : 'rgba(100,150,255,0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {lang === 'zh' ? '知道了 ✓' : 'Got it ✓'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Atlas;