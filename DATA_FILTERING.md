# 🔽 Data Filtering Feature

## 概述 | Overview

为 My Travel Atlas 添加强大的数据筛选功能，让用户可以按年份、国家轻松筛选旅行记录，配合搜索功能实现精准查找。

---

## ✨ 功能特性 | Features

### 1. **多维度筛选**

- 📅 **按年份筛选**：2019, 2023, 2024, 2025
- 🌍 **按国家筛选**：中国 🇨🇳、泰国 🇹🇭、美国 🇺🇸、加拿大 🇨🇦
- 🔍 **搜索筛选**：城市名或标签
- 🎯 **组合筛选**：支持多个条件同时生效

### 2. **直观的 UI 设计**

- 🎨 **渐变按钮**：选中状态显示紫色/绿色渐变
- 📊 **实时计数**：显示筛选结果数量（如 "显示 5 / 13 条记录"）
- 🔄 **一键清除**：快速重置所有筛选条件
- 🌓 **主题适配**：深色/浅色主题自动切换

### 3. **流畅动画**

- ✨ 面板淡入淡出（Framer Motion）
- 🎯 按钮悬停效果
- 📱 响应式布局适配

---

## 🎨 视觉设计 | Visual Design

### 筛选按钮

```
默认状态：rgba(255,255,255,0.1) + 半透明边框
选中状态：rgba(100,150,255,0.3) + 蓝色高亮
图标：🔽（漏斗/筛选符号）
```

### 年份按钮

```
默认：半透明背景 + 细边框
选中：紫色渐变 (#667eea → #764ba2) + 加粗字体
尺寸：padding 6px 12px, borderRadius 6px
```

### 国家按钮

```
默认：半透明背景 + 细边框
选中：绿色渐变 (#1dd1a1 → #10ac84) + 加粗字体
显示：国旗 emoji + 国家名（中英文切换）
```

---

## 🔧 技术实现 | Implementation

### 1. **状态管理**

```javascript
// 筛选状态
const [selectedYear, setSelectedYear] = useState("all");
const [selectedCountry, setSelectedCountry] = useState("all");
const [showFilters, setShowFilters] = useState(false);
```

### 2. **导入工具函数**

```javascript
import {
  TRAVEL_DATA,
  getUniqueCountries, // 获取所有国家（去重）
  getUniqueYears, // 获取所有年份（排序）
} from "../data/travelData.js";
```

### 3. **筛选逻辑**

```javascript
const filteredData = useMemo(() => {
  let data = TRAVEL_DATA;

  // 1. 年份筛选
  if (selectedYear !== "all") {
    data = data.filter((loc) => loc.date.startsWith(selectedYear));
  }

  // 2. 国家筛选
  if (selectedCountry !== "all") {
    data = data.filter((loc) => loc.country.en === selectedCountry);
  }

  // 3. 搜索筛选
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    data = data.filter((loc) => {
      return (
        loc.city.zh.includes(lowerQuery) ||
        loc.city.en.toLowerCase().includes(lowerQuery) ||
        loc.aiTags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  return data;
}, [searchQuery, selectedYear, selectedCountry]);
```

### 4. **UI 组件**

```jsx
{
  /* 筛选面板切换按钮 */
}
<button onClick={() => setShowFilters(!showFilters)}>🔽</button>;

{
  /* 筛选面板 */
}
<AnimatePresence>
  {showFilters && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* 年份筛选 */}
      <div>
        <button onClick={() => setSelectedYear("all")}>全部</button>
        {getUniqueYears().map((year) => (
          <button key={year} onClick={() => setSelectedYear(year)}>
            {year}
          </button>
        ))}
      </div>

      {/* 国家筛选 */}
      <div>
        <button onClick={() => setSelectedCountry("all")}>全部</button>
        {getUniqueCountries().map((country) => (
          <button
            key={country.en}
            onClick={() => setSelectedCountry(country.en)}
          >
            {country.code} {lang === "zh" ? country.zh : country.en}
          </button>
        ))}
      </div>

      {/* 筛选结果 */}
      <div>
        显示 {filteredData.length} / {TRAVEL_DATA.length} 条记录
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

---

## 📊 筛选组合示例 | Filter Combinations

### 示例 1：按年份

```
选择：2023
结果：显示 2023 年的所有旅行（清迈、曼谷x2、涛岛、广州）
```

### 示例 2：按国家

```
选择：🇹🇭 泰国
结果：显示所有泰国旅行（曼谷x3、涛岛、清迈、大城府）
```

### 示例 3：组合筛选

```
选择：2023 + 🇹🇭 泰国
结果：2023 年在泰国的旅行（曼谷x2、涛岛、清迈）
```

### 示例 4：三重筛选

```
选择：2023 + 🇹🇭 泰国 + 搜索 "Bangkok"
结果：2023 年在泰国曼谷的旅行（2条记录）
```

---

## 🎯 用户体验 | UX Features

### 1. **实时反馈**

- 选择筛选条件后，地球上的标记点立即更新
- 时间轴自动调整到筛选后的第一个城市
- 统计数据实时重新计算

### 2. **清除功能**

```javascript
// 一键清除按钮（当有筛选条件时显示）
{
  (selectedYear !== "all" || selectedCountry !== "all") && (
    <button
      onClick={() => {
        setSelectedYear("all");
        setSelectedCountry("all");
      }}
    >
      清除
    </button>
  );
}
```

### 3. **结果计数**

```
显示格式：
- 中文：显示 5 / 13 条记录
- English: Showing 5 / 13 trips
```

---

## 🎨 动画效果 | Animations

### 1. **面板进入**

```javascript
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

### 2. **面板退出**

```javascript
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.2 }}
```

### 3. **按钮交互**

```css
transition: all 0.2s
hover: transform: scale(1.05)
active: transform: scale(0.95)
```

---

## 📱 响应式设计 | Responsive

### 移动端

- 面板宽度：minWidth 280px
- 按钮布局：flexWrap 自动换行
- 触摸优化：padding 增大，易点击

### 桌面端

- 面板位置：左上角（与搜索栏对齐）
- 按钮间距：gap 8px
- 悬停效果：显示提示信息

---

## 🔄 数据流 | Data Flow

```
用户操作
  ↓
点击筛选按钮
  ↓
setSelectedYear / setSelectedCountry
  ↓
触发 useMemo 重新计算
  ↓
filteredData 更新
  ↓
Globe 重新渲染（显示筛选后的点）
  ↓
时间轴更新（只显示筛选后的城市）
  ↓
统计数据重新计算（基于筛选结果）
```

---

## 🚀 性能优化 | Performance

### 1. **useMemo 缓存**

```javascript
const filteredData = useMemo(() => {
  // 筛选逻辑
}, [searchQuery, selectedYear, selectedCountry]);
```

- 只在依赖项变化时重新计算
- 避免每次渲染都执行筛选

### 2. **工具函数缓存**

```javascript
// 这些函数返回的数组会被缓存
getUniqueYears(); // 只计算一次
getUniqueCountries(); // 只计算一次
```

---

## 🌍 多语言支持 | i18n

### 中文

```
- 🔽 筛选选项
- 📅 按年份
- 🌍 按国家
- 全部
- 清除
- 显示 X / Y 条记录
```

### English

```
- 🔽 Filter Options
- 📅 By Year
- 🌍 By Country
- All
- Clear
- Showing X / Y trips
```

---

## 🎯 使用场景 | Use Cases

### 场景 1：回顾某年旅行

```
操作：点击 🔽 → 选择 "2024"
结果：看到 2024 年去过的所有地方
```

### 场景 2：查看某国所有旅行

```
操作：点击 🔽 → 选择 "🇹🇭 泰国"
结果：看到所有去泰国的旅行记录
```

### 场景 3：精准查找

```
操作：选择 "2023" → 选择 "🇹🇭 泰国" → 搜索 "diving"
结果：2023 年在泰国的潜水之旅（涛岛）
```

---

## 📝 代码统计 | Code Stats

| 指标             | 数值                                               |
| ---------------- | -------------------------------------------------- |
| **新增代码行数** | ~200 行                                            |
| **新增状态**     | 3 个（selectedYear, selectedCountry, showFilters） |
| **修改 useMemo** | 1 个（filteredData）                               |
| **新增 UI 组件** | 1 个（筛选面板）                                   |
| **导入工具函数** | 2 个（getUniqueYears, getUniqueCountries）         |

---

## 🔮 未来增强 | Future Enhancements

### 1. **按标签筛选**

```javascript
const [selectedTags, setSelectedTags] = useState([]);

// 获取所有标签
const allTags = [...new Set(TRAVEL_DATA.flatMap((loc) => loc.aiTags))];

// 筛选逻辑
if (selectedTags.length > 0) {
  data = data.filter((loc) =>
    selectedTags.some((tag) => loc.aiTags.includes(tag))
  );
}
```

### 2. **日期范围筛选**

```javascript
const [dateRange, setDateRange] = useState({ start: null, end: null });

// UI: 日期选择器
<input
  type="date"
  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
/>;
```

### 3. **高级筛选**

- 按大陆筛选
- 按旅行时长筛选
- 按心情颜色筛选
- 组合逻辑（AND/OR）

### 4. **保存筛选**

```javascript
// 保存到 localStorage
localStorage.setItem(
  "lastFilter",
  JSON.stringify({
    year: selectedYear,
    country: selectedCountry,
  })
);

// 页面加载时恢复
useEffect(() => {
  const saved = localStorage.getItem("lastFilter");
  if (saved) {
    const { year, country } = JSON.parse(saved);
    setSelectedYear(year);
    setSelectedCountry(country);
  }
}, []);
```

---

## ✅ 测试清单 | Testing Checklist

- [x] 年份筛选正常工作
- [x] 国家筛选正常工作
- [x] 组合筛选正确（年份 + 国家）
- [x] 三重筛选正确（年份 + 国家 + 搜索）
- [x] 清除按钮重置所有筛选
- [x] 结果计数准确显示
- [x] 地球标记点正确更新
- [x] 时间轴正确调整
- [x] 面板动画流畅
- [x] 按钮选中状态正确
- [x] 主题切换正常
- [x] 多语言切换正常
- [x] 移动端布局适配

---

## 🎯 总结 | Summary

通过添加数据筛选功能，My Travel Atlas 的数据探索能力得到显著提升：

✅ **功能完整**：支持年份、国家、搜索三维度筛选  
✅ **UI 美观**：渐变按钮 + 流畅动画 + 主题适配  
✅ **性能优秀**：useMemo 缓存 + 工具函数复用  
✅ **体验友好**：实时反馈 + 一键清除 + 结果计数  
✅ **扩展性强**：易于添加新的筛选维度

现在用户可以轻松找到：

- "2023 年的所有旅行"
- "去过泰国的所有地方"
- "2024 年在美国的旅行"
- ...更多组合查询

---

**Author**: Lucy Sun - Global Travel Enthusiast  
**Date**: November 25, 2025  
**Version**: 1.0.0
