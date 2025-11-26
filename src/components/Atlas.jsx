import React, { useState, useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAVEL_DATA, getUniqueCountries, getUniqueYears } from '../data/travelData.js';
import '../styles/glassmorphism.css';

// 键盘快捷键显示组件
const KeyboardShortcut = ({ keys, description, theme }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '6px'
  }}>
    <div style={{ display: 'flex', gap: '4px' }}>
      {keys.map((key, idx) => (
        <kbd 
          key={idx}
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            minWidth: '24px',
            textAlign: 'center'
          }}
        >
          {key}
        </kbd>
      ))}
    </div>
    <span style={{ color: theme === 'dark' ? '#ccc' : '#666', marginLeft: '10px' }}>
      {description}
    </span>
  </div>
);

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

/**
 * My Travel Atlas - 交互式 3D 旅行地图
 * Interactive 3D Travel Map by Lucy Sun
 */
const Atlas = () => {
  const globeEl = useRef();
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineIdx, setTimelineIdx] = useState(0);
  const [lang, setLang] = useState('en'); // 默认英文
  
  // 新增状态
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [showTip, setShowTip] = useState(true); // 使用提示
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false); // 键盘快捷键帮助
  const autoPlayIntervalRef = useRef(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // 筛选状态
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Vision Pro 导航栏状态
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // 响应式设计 - 媒体查询
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  
  // 模拟加载进度
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 
  
  // --- 过滤逻辑 (支持搜索 + 年份 + 国家筛选) ---
  const filteredData = useMemo(() => {
    let data = TRAVEL_DATA;
    
    // 1. 年份筛选
    if (selectedYear !== 'all') {
      data = data.filter(loc => loc.date.startsWith(selectedYear));
    }
    
    // 2. 国家筛选
    if (selectedCountry !== 'all') {
      data = data.filter(loc => loc.country.en === selectedCountry);
    }
    
    // 3. 搜索筛选（城市名或标签）
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(loc => {
        return loc.city.zh.includes(lowerQuery) || 
               loc.city.en.toLowerCase().includes(lowerQuery) ||
               loc.aiTags.some(tag => tag.toLowerCase().includes(lowerQuery));
      });
    }
    
    return data;
  }, [searchQuery, selectedYear, selectedCountry]);

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

  // --- 键盘快捷键支持 ---
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 如果正在输入搜索框，不触发快捷键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'h': // Vim 风格
          e.preventDefault();
          setTimelineIdx(prev => Math.max(0, prev - 1));
          break;
          
        case 'ArrowRight':
        case 'l': // Vim 风格
          e.preventDefault();
          setTimelineIdx(prev => Math.min(TRAVEL_DATA.length - 1, prev + 1));
          break;
          
        case 'ArrowUp':
        case 'k': // Vim 风格
          e.preventDefault();
          setTimelineIdx(0); // 跳到第一个
          break;
          
        case 'ArrowDown':
        case 'j': // Vim 风格
          e.preventDefault();
          setTimelineIdx(TRAVEL_DATA.length - 1); // 跳到最后一个
          break;
          
        case ' ':
        case 'Enter':
          e.preventDefault();
          setSelectedLoc(TRAVEL_DATA[timelineIdx]);
          break;
          
        case 'Escape':
          e.preventDefault();
          setSelectedLoc(null);
          setShowStats(false);
          setShowTip(false);
          break;
          
        case '/':
          e.preventDefault();
          document.querySelector('input[type="text"]')?.focus();
          break;
          
        case 's':
        case 'S':
          e.preventDefault();
          setShowStats(prev => !prev);
          break;
          
        case 't':
        case 'T':
          e.preventDefault();
          setTheme(prev => prev === 'dark' ? 'light' : 'dark');
          break;
          
        case 'p':
        case 'P':
          e.preventDefault();
          setIsAutoPlaying(prev => !prev);
          break;
          
        case 'e':
        case 'E':
          e.preventDefault();
          setLang(prev => prev === 'zh' ? 'en' : 'zh');
          break;
          
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(prev => !prev);
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [timelineIdx]);  // --- 新增状态：存储重叠的地点列表 ---
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
    <div className="deep-space-bg" style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      overflow: 'hidden', zIndex: 0,
      transition: 'background 0.5s ease'
    }}>
      
      {/* 加载屏幕 - Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* 旋转地球图标 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{
                fontSize: isMobile ? '80px' : '120px',
                marginBottom: '30px',
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
              }}
            >
              🌍
            </motion.div>
            
            {/* 标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                color: '#fff',
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 'bold',
                marginBottom: '10px',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              ✈️ My Travel Atlas
            </motion.h1>
            
            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: isMobile ? '14px' : '16px',
                marginBottom: '40px',
                textAlign: 'center'
              }}
            >
              {lang === 'zh' ? '加载旅行回忆中...' : 'Loading travel memories...'}
            </motion.p>
            
            {/* 进度条 */}
            <div style={{
              width: isMobile ? '80%' : '300px',
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                  borderRadius: '2px'
                }}
              />
            </div>
            
            {/* 进度百分比 */}
            <motion.div
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            >
              {loadingProgress}%
            </motion.div>
            
            {/* 提示文字 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                marginTop: '30px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                textAlign: 'center'
              }}
            >
              {lang === 'zh' 
                ? '探索世界的每一个角落 🌏' 
                : 'Exploring every corner of the world 🌏'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
        
        // 加载完成回调
        onGlobeReady={() => {
          setLoadingProgress(100);
          setTimeout(() => setIsLoading(false), 500);
        }}
        
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

      {/* 🚀 Perfect Immersive Minimalist Sci-Fi Navigation */}
      <nav className="immersive-navbar">
        {/* Left Group - Brand */}
        <div className="navbar-brand">
          {/* Epic Title */}
          <h1 className={lang === 'zh' ? 'epic-title-zh' : 'epic-title-en'}>
            {lang === 'zh' ? '时空足迹' : 'THE JOURNEY'}
          </h1>
          
          {/* Language Switcher - Minimalist Text */}
          <div className="lang-switcher">
            <button 
              className={`lang-option ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <span className="lang-divider">|</span>
            <button 
              className={`lang-option ${lang === 'zh' ? 'active' : ''}`}
              onClick={() => setLang('zh')}
            >
              中
            </button>
          </div>
        </div>
        
        {/* Right Group - Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button 
            className="minimalist-icon"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={lang === 'zh' ? '切换主题' : 'Toggle Theme'}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          
          {/* Stats Toggle */}
          <button 
            className={`minimalist-icon ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats(!showStats)}
            title={lang === 'zh' ? '统计数据' : 'Statistics'}
          >
            📊
          </button>
          
          {/* Filter Toggle */}
          <button 
            className={`minimalist-icon ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title={lang === 'zh' ? '筛选数据' : 'Filter Data'}
          >
            ⚡
          </button>
          
          {/* Auto Play Toggle */}
          <button 
            className={`minimalist-icon ${isAutoPlaying ? 'active' : ''}`}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            title={lang === 'zh' ? (isAutoPlaying ? '暂停播放' : '自动播放') : (isAutoPlaying ? 'Pause' : 'Auto Play')}
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
          
          {/* Keyboard Shortcuts (Desktop only) */}
          {!isMobile && (
            <button 
              className={`minimalist-icon ${showKeyboardHelp ? 'active' : ''}`}
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              title={lang === 'zh' ? '键盘快捷键' : 'Keyboard Shortcuts'}
            >
              ⌨
            </button>
          )}
          
          {/* Expandable Search */}
          <div className={`minimalist-search-container ${isSearchExpanded ? 'minimalist-search-expanded' : 'minimalist-search-collapsed'}`}>
            <button 
              className="minimalist-search-icon"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              title={lang === 'zh' ? '搜索' : 'Search'}
            >
              🔍
            </button>
            
            <input
              type="text"
              className="minimalist-search-input"
              placeholder={lang === 'zh' ? "搜索回忆..." : "Search memories..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
            />
            
            {searchQuery && (
              <button
                className="minimalist-search-close"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }}
                title={lang === 'zh' ? '清除' : 'Clear'}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Floating Panels Container */}
      <div style={{ 
        position: 'fixed', 
        top: '90px', 
        left: isMobile ? '15px' : '40px',
        zIndex: 100, 
        pointerEvents: 'none', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px' 
      }}>
        
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
        
        {/* 筛选面板 - Glass Style */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                padding: '24px',
                minWidth: '300px',
                maxWidth: '400px',
                pointerEvents: 'auto'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-lg)'
              }}>
                <h3 className="glass-filter-label" style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-lg)',
                  color: 'white',
                  fontWeight: 'var(--font-semibold)'
                }}>
                  {lang === 'zh' ? '🔽 筛选选项' : '🔽 Filter Options'}
                </h3>
                {(selectedYear !== 'all' || selectedCountry !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedYear('all');
                      setSelectedCountry('all');
                    }}
                    className="glass-button"
                    style={{
                      padding: '4px 12px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-accent-start)'
                    }}
                  >
                    {lang === 'zh' ? '清除' : 'Clear'}
                  </button>
                )}
              </div>
              
              {/* 年份筛选 */}
              <div className="glass-filter-group">
                <div className="glass-filter-label">
                  📅 {lang === 'zh' ? '按年份' : 'By Year'}
                </div>
                <div className="glass-filter-buttons">
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`glass-filter-button ${selectedYear === 'all' ? 'active' : ''}`}
                  >
                    {lang === 'zh' ? '全部' : 'All'}
                  </button>
                  {getUniqueYears().map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`glass-filter-button ${selectedYear === year ? 'active' : ''}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 国家筛选 */}
              <div className="glass-filter-group">
                <div className="glass-filter-label">
                  🌍 {lang === 'zh' ? '按国家' : 'By Country'}
                </div>
                <div className="glass-filter-buttons">
                  <button
                    onClick={() => setSelectedCountry('all')}
                    className={`glass-filter-button ${selectedCountry === 'all' ? 'active' : ''}`}
                  >
                    {lang === 'zh' ? '全部' : 'All'}
                  </button>
                  {getUniqueCountries().map(country => (
                    <button
                      key={country.en}
                      onClick={() => setSelectedCountry(country.en)}
                      className={`glass-filter-button ${selectedCountry === country.en ? 'active' : ''}`}
                    >
                      {country.code} {lang === 'zh' ? country.zh : country.en}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 筛选结果提示 */}
              <div style={{
                marginTop: 'var(--space-lg)',
                paddingTop: 'var(--space-lg)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: 'var(--font-size-xs)',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center'
              }}>
                {lang === 'zh' 
                  ? `显示 ${filteredData.length} / ${TRAVEL_DATA.length} 条记录`
                  : `Showing ${filteredData.length} / ${TRAVEL_DATA.length} trips`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 键盘快捷键帮助面板 (仅桌面端) */}
      <AnimatePresence>
        {showKeyboardHelp && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              zIndex: 150,
              background: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              color: theme === 'dark' ? 'white' : '#2c3e50',
              minWidth: '280px',
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                ⌨️ {lang === 'zh' ? '键盘快捷键' : 'Keyboard Shortcuts'}
              </h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme === 'dark' ? '#999' : '#666',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
              {/* 导航 */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ 
                  color: theme === 'dark' ? '#ffd700' : '#4a90e2', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  {lang === 'zh' ? '🧭 导航' : '🧭 Navigation'}
                </div>
                <KeyboardShortcut 
                  keys={['←', 'H']} 
                  description={lang === 'zh' ? '上一个城市' : 'Previous city'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['→', 'L']} 
                  description={lang === 'zh' ? '下一个城市' : 'Next city'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['↑', 'K']} 
                  description={lang === 'zh' ? '第一个城市' : 'First city'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['↓', 'J']} 
                  description={lang === 'zh' ? '最后一个城市' : 'Last city'} 
                  theme={theme}
                />
              </div>
              
              {/* 操作 */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ 
                  color: theme === 'dark' ? '#ffd700' : '#4a90e2', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  {lang === 'zh' ? '📝 操作' : '📝 Actions'}
                </div>
                <KeyboardShortcut 
                  keys={['Space', 'Enter']} 
                  description={lang === 'zh' ? '打开旅行日记' : 'Open diary'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['Esc']} 
                  description={lang === 'zh' ? '关闭弹窗' : 'Close modal'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['/']} 
                  description={lang === 'zh' ? '聚焦搜索框' : 'Focus search'} 
                  theme={theme}
                />
              </div>
              
              {/* 切换 */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ 
                  color: theme === 'dark' ? '#ffd700' : '#4a90e2', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  {lang === 'zh' ? '🔄 切换' : '🔄 Toggle'}
                </div>
                <KeyboardShortcut 
                  keys={['S']} 
                  description={lang === 'zh' ? '统计面板' : 'Statistics'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['T']} 
                  description={lang === 'zh' ? '日夜主题' : 'Theme'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['P']} 
                  description={lang === 'zh' ? '自动播放' : 'Auto-play'} 
                  theme={theme}
                />
                <KeyboardShortcut 
                  keys={['E']} 
                  description={lang === 'zh' ? '中英切换' : 'Language'} 
                  theme={theme}
                />
              </div>
              
              {/* 帮助 */}
              <div>
                <div style={{ 
                  color: theme === 'dark' ? '#ffd700' : '#4a90e2', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  {lang === 'zh' ? '❓ 帮助' : '❓ Help'}
                </div>
                <KeyboardShortcut 
                  keys={['?']} 
                  description={lang === 'zh' ? '显示/隐藏此面板' : 'Show/hide this panel'} 
                  theme={theme}
                />
              </div>
            </div>
            
            <div style={{
              marginTop: '15px',
              paddingTop: '10px',
              borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              fontSize: '11px',
              color: '#999',
              textAlign: 'center'
            }}>
              {lang === 'zh' ? '提示：支持 Vim 风格按键 (H J K L)' : 'Tip: Vim-style keys supported (H J K L)'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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