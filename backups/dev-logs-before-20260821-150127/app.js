/* ============================================================
   CONFIG — 唯一需要定制的地方（与手机版结构一致）。
   modules 里每个模块 = 一个功能页；type 决定它长什么样、记什么字段。
   支持的 type：
     todo     待办/待办（勾选 + 优先级）
     checkin  习惯打卡（连续天数，每天清零）
     progress 长期计划（进度条：当前/目标）
     finance  记账（收入/支出 + 分类 + 金额）
     note     内容记录/日记（标题 + 正文 + 心情标签）
   图标用 icon 字段（取自下方 ICONS 图标库，全部为单色线性图标）。
   ============================================================ */
const CONFIG = {
  storageKey: "workbench-desktop-v1",   // 换 key 可强制重置
  owner: "我的工作台",                  // 侧栏顶部标题
  slogan: "Personal Workbench",

  // 每日一句（一周七天各一句，按星期轮换：周一→周日）
  quotes: [
    "新的一周，从把最重要的一件事做好开始。",   // 周一
    "保持节奏，稳一点也没关系。",                 // 周二
    "把大目标拆小，今天只推进一步。",             // 周三
    "坚持到一半时最难，也最值得。",               // 周四
    "收个尾，给这一周一个交代。",                 // 周五
    "允许自己慢下来，好好休息也是正事。",         // 周六
    "复盘一下，为下一周留点方向。",               // 周日
  ],

  // 今日概览环形（value 为 0-100 的完成度，calc 返回 {value, sub}）
  overview: [
    { key:"todo", label:"待办", icon:"list", color:"var(--accent)",
      calc: d => { const it=d.todo||[]; const done=it.filter(x=>x.done).length; return { value: it.length?Math.round(done/it.length*100):0, sub:`${done}/${it.length} 项` }; } },
    { key:"checkin", label:"打卡", icon:"leaf", color:"var(--module-1)",
      calc: d => { const it=d.checkin||[]; const t=today(); const done=it.filter(x=>x.log&&x.log[t]).length; return { value: it.length?Math.round(done/it.length*100):0, sub:`${done}/${it.length} 项` }; } },
    { key:"read", label:"阅读", icon:"book", color:"var(--module-2)", calc: d => avgProgress(d.read) },
    { key:"sport", label:"运动", icon:"activity", color:"var(--module-3)", calc: d => avgProgress(d.sport) },
  ],

  // 本周状态趋势（真实数据：读取用户填写的 __trend，7 个数字；没有就留空）
  trend: {
    title:"本周状态趋势", unit:"分",
    series: d => (Array.isArray(d.__trend) && d.__trend.length===7) ? d.__trend : [],
  },

  // 快速记录按钮（点了直接给对应模块新建）
  quickAdd: [
    { label:"记运动", icon:"activity", module:"sport",   tint:"#f6f0e6", color:"var(--module-3)" },
    { label:"记打卡", icon:"check",    module:"checkin", tint:"#eef3ec", color:"var(--module-1)" },
    { label:"记一笔", icon:"wallet",   module:"money",   tint:"#f6efe8", color:"var(--module-4)" },
    { label:"记想法", icon:"pen",      module:"note",    tint:"#f1eef4", color:"var(--module-5)" },
  ],

  // ============ 模块定义 ============
  modules: [
    { key:"todo", name:"待办", icon:"list", tint:"#efeee8", color:"var(--accent)", type:"todo", desc:"任务清单与进度追踪", category:"今日行动",
      priorities:[ {key:"P0",label:"重要",color:"#f6ece9",text:"#c25d4f"}, {key:"P1",label:"一般",color:"#f6efe6",text:"#bd8a4e"}, {key:"P2",label:"随手",color:"#eef2ec",text:"#6f8f6a"} ],
      seed:[ {id:11,title:"完成英语核心词汇 30min",priority:"P0",done:false,note:"积累词汇量，稳步提升英语能力"},
             {id:12,title:"发布 1 篇笔记 / 视频",priority:"P1",done:false,note:""},
             {id:13,title:"整理今日工作纪要",priority:"P2",done:true,note:""} ] },
    { key:"checkin", name:"习惯打卡", icon:"leaf", tint:"#eef3ec", color:"var(--module-1)", type:"checkin", desc:"补品·护肤·早睡等每日打卡", category:"今日行动",
      seed:[ {id:21,title:"喝够 8 杯水",log:{}}, {id:22,title:"23:30 前睡觉",log:{}}, {id:23,title:"维生素 / 补品",log:{}} ] },
    { key:"read", name:"阅读打卡", icon:"book", tint:"#edf1f5", color:"var(--module-2)", type:"progress", unit:"页", desc:"书籍进度·摘录·想法", category:"打卡追踪",
      seed:[ {id:31,title:"《认知觉醒》",current:168,target:300,unit:"页",note:"第 7 章：习惯的复利，早晚各读 30 分钟"}, {id:32,title:"《原子习惯》",current:90,target:260,unit:"页",note:"聚焦身份认同的养成，做好读书笔记"} ] },
    { key:"sport", name:"每日锻炼", icon:"activity", tint:"#f6f0e6", color:"var(--module-3)", type:"progress", unit:"分钟", desc:"游泳·跑步·力量训练", category:"打卡追踪",
      seed:[ {id:41,title:"力量训练",current:12,target:20,unit:"分钟",note:"核心 + 上肢，组间休息 60 秒"}, {id:42,title:"跑步",current:30,target:40,unit:"分钟",note:"慢跑热身，配速 6 分半保持心率"} ] },
    { key:"money", name:"记账本", icon:"wallet", tint:"#f6efe8", color:"var(--module-4)", type:"finance", desc:"收入·支出·分类·占比", category:"打卡追踪",
      categories:["餐饮","交通","购物","居家","娱乐","工资","其他"],
      fields:[
        { key:"spendTag", label:"支出标签", type:"select", options:["必要固定支出","不必要固定支出","必要不固定支出","不固定不必要支出"] }
      ],
      seed:[ {id:51,title:"午餐",type:"expense",amount:32,category:"餐饮",spendTag:"必要不固定支出",date:isoToday()},
             {id:52,title:"地铁",type:"expense",amount:6,category:"交通",spendTag:"必要固定支出",date:isoToday()},
             {id:53,title:"稿费",type:"income",amount:400,category:"工资",date:isoToday()} ] },
    { key:"note", name:"心情日记", icon:"pen", tint:"#f1eef4", color:"var(--module-5)", type:"note", desc:"文字·摘录·心情记录", category:"内容记录",
      moods:["开心","平静","低落","焦虑","疲惫"],
      seed:[ {id:61,title:"今天的小确幸",content:"阳台的多肉冒出了新芽，顺手拍了张照片。",mood:"开心",date:isoToday()} ] },
    { key:"hot", name:"今日热点", icon:"flame", tint:"#f6ece9", color:"var(--danger)", type:"note", desc:"热点内容·收藏·稍后阅读", category:"内容记录",
      moods:["收藏","稍后读","已读"],
      seed:[ {id:71,title:"AI 提示词技巧合集",content:"整理常用提示词模板，方便复用。",mood:"收藏",date:isoToday()} ] },
    { key:"learning", name:"学习进度", icon:"graduation-cap", tint:"#edf1f5", color:"var(--module-2)", type:"progress", unit:"课时", desc:"追踪学习课程、技能和目标", category:"打卡追踪",
      seed:[ {id:Date.now(), title:"前端开发入门", current:15, target:40, unit:"课时", note:"完成 HTML/CSS 基础，开始 JavaScript"} ] },
    { key:"recipes", name:"食谱与餐单", icon:"cooking-pot", tint:"#f6efe8", color:"var(--module-4)", type:"note", desc:"收藏食谱，规划每日用餐", category:"内容记录",
      fields:[
        { key: "cuisine", label: "菜系", type: "select", options: ["中餐", "西餐", "日料", "甜点", "其他"] },
        { key: "prepTime", label: "准备时间", type: "text", placeholder: "15分钟" },
        { key: "cookTime", label: "烹饪时间", type: "text", placeholder: "30分钟" },
        { key: "servings", label: "份数", type: "number", placeholder: "2" },
        { key: "ingredients", label: "主要食材", type: "textarea", placeholder: "列出主要食材..." }
      ],
      seed:[ {id:Date.now() + 1, title:"香煎三文鱼", content:"健康美味的快速晚餐选择。", cuisine:"西餐", prepTime:"10分钟", cookTime:"15分钟", servings:1, ingredients:"三文鱼、柠檬、橄榄油、时蔬", date:isoToday()} ] },
    { key:"projects", name:"项目管理", icon:"briefcase", tint:"#f1eef4", color:"var(--module-5)", type:"todo", desc:"管理个人项目，追踪任务和里程碑",
      fields:[
        { key: "projectStatus", label: "项目状态", type: "select", options: ["进行中", "已暂停", "已完成", "待开始"] },
        { key: "dueDate", label: "截止日期", type: "text", placeholder: "YYYY-MM-DD" },
        { key: "priority", label: "优先级", type: "select", options: ["高", "中", "低"] }
      ],
      seed:[ {id:Date.now() + 2, title:"个人博客搭建", projectStatus:"进行中", dueDate:"2026-09-30", priority:"高", done:false, note:"选择技术栈、设计界面、撰写第一篇文章。"} ] },
    { key:"timetable", name:"我的课程表", icon:"calendar-days", tint:"#eef3ec", color:"var(--module-1)", type:"timetable", desc:"管理您的大学课程安排", category:"内容记录",
      fields:[
        { key: "courseName", label: "课程名称", type: "text" },
        { key: "instructor", label: "授课教师", type: "text" },
        { key: "location", label: "上课地点", type: "text" },
        { key: "dayOfWeek", label: "星期几", type: "select", options: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] },
        { key: "startTime", label: "开始时间", type: "text", placeholder: "HH:MM" },
        { key: "endTime", label: "结束时间", type: "text", placeholder: "HH:MM" },
        { key: "startWeek", label: "起始周", type: "number", placeholder: "1" },
        { key: "endWeek", label: "结束周", type: "number", placeholder: "16" },
        { key: "weekType", label: "周类型", type: "select", options: ["每周", "单周", "双周"] },
        { key: "customWeeks", label: "不规则周", type: "text", placeholder: "如：1,3,5,7" },
        { key: "note", label: "备注", type: "textarea" }
      ],
      seed:[ {id:Date.now() + 3, title:"高等数学", courseName:"高等数学", instructor:"张教授", location:"主楼 A101", dayOfWeek:"周一", startTime:"08:00", endTime:"09:40", startWeek:1, endWeek:16, weekType:"每周", customWeeks:"", note:"需要带计算器"}, {id:Date.now() + 4, title:"大学英语", courseName:"大学英语", instructor:"李老师", location:"教3楼 B203", dayOfWeek:"周三", startTime:"10:00", endTime:"11:40", startWeek:1, endWeek:16, weekType:"每周", customWeeks:"", note:"口语课"} ] },
    { key:"schedule", name:"日程管理", icon:"timeline", tint:"#f6e6ed", color:"var(--module-5)", type:"schedule", desc:"每日日程安排与可视化", category:"今日行动",
      seed:[
        {id:Date.now()+101, title:"晨间冥想", date:localDateStr(new Date()), startTime:"07:00", endTime:"07:20", relatedModule:"无", relatedItemId:"", color:"#a87020", note:"正念呼吸 10 分钟"},
        {id:Date.now()+102, title:"深度工作时段", date:localDateStr(new Date()), startTime:"09:00", endTime:"11:30", relatedModule:"无", relatedItemId:"", color:"#5588bb", note:"关闭通知，专注核心任务"},
        {id:Date.now()+103, title:"午休 & 散步", date:localDateStr(new Date()), startTime:"12:00", endTime:"13:00", relatedModule:"无", relatedItemId:"", color:"#b05878", note:"饭后散步 15 分钟"},
        {id:Date.now()+104, title:"英语学习", date:localDateStr(new Date()), startTime:"14:00", endTime:"14:30", relatedModule:"无", relatedItemId:"", color:"#8070b0", note:"核心词汇 30min"},
        {id:Date.now()+105, title:"运动训练", date:localDateStr(new Date()), startTime:"18:00", endTime:"19:00", relatedModule:"sport", relatedItemId:"", color:"#a87020", note:"力量训练 · 上肢日"},
      ],
      fields:[
        { key: "date", label: "日期", type: "date" },
        { key: "startTime", label: "开始时间", type: "text", placeholder: "HH:MM" },
        { key: "endTime", label: "结束时间", type: "text", placeholder: "HH:MM" },
        { key: "relatedModule", label: "关联模块", type: "select", options: ["无", "todo", "learning", "projects", "sport"] },
        { key: "relatedItemId", label: "关联任务ID", type: "text", placeholder: "仅在关联模块时填写" },
        { key: "color", label: "显示颜色", type: "select", options: ["#a87020", "#5588bb", "#b05878", "#8070b0", "#4a8a4a"] },
        { key: "note", label: "备注", type: "textarea" }
      ]
    },
  ],
};

/* ============================================================
   ICONS — 单色线性图标库（stroke 跟随 color）
   ============================================================ */
const ICONS = {
  home:'<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10.5V19h12v-8.5"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  chart:'<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4"/><path d="M12 16v-7"/><path d="M16 16v-2"/>',
  user:'<circle cx="12" cy="8" r="3.4"/><path d="M5.5 19c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5"/>',
  plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
  menu:'<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 9.5h16"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  list:'<path d="M8.5 6h11"/><path d="M8.5 12h11"/><path d="M8.5 18h11"/><circle cx="4.5" cy="6" r=".9"/><circle cx="4.5" cy="12" r=".9"/><circle cx="4.5" cy="18" r=".9"/>',
  leaf:'<path d="M20 4C10 4 4 9 4 17c0 1 .1 2 .5 3 5.5-9 9-9.5 15.5-16z"/><path d="M4.5 20c3-6 7-9.5 13-11.5"/>',
  book:'<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5z"/><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19v4H7.5A2.5 2.5 0 0 1 5 19.5z"/>',
  activity:'<path d="M3 12h4l2.5 6L14 5l2.5 7H21"/>',
  wallet:'<path d="M4 8a2 2 0 0 1 2-2h11a1.5 1.5 0 0 1 1.5 1.5V8"/><rect x="3.5" y="7.5" width="17" height="11.5" rx="2.5"/><circle cx="16.5" cy="13.2" r="1.3"/>',
  pen:'<path d="M4 20l1.2-4L16 5.2l2.8 2.8L8 19z"/><path d="M14.2 7l2.8 2.8"/>',
  camera:'<path d="M4 8.5h3l1.5-2h7L17 8.5h3v10H4z"/><circle cx="12" cy="13" r="3.2"/>',
  flame:'<path d="M12 3c3 3 5 5.5 5 9a5 5 0 0 1-10 0c0-2 1-3.6 2.6-4.6C9 10.4 10.4 6.2 12 3z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  shield:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  star:'<path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.9l-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z"/>',
  quote:'<path d="M9.5 7C7.6 7.9 6.5 9.6 6.5 12v5h5v-6H8.5c0-1.7.7-2.7 2.2-3.4zM19 7c-1.9.9-3 2.6-3 5v5h5v-6h-3c0-1.7.7-2.7 2.2-3.4z"/>',
  chevron:'<path d="M9 5l7 7-7 7"/>',
  'chevron-left':'<path d="M15 5l-7 7 7 7"/>',
  'chevron-right':'<path d="M9 5l7 7-7 7"/>',
  tag:'<path d="M20.5 4l-10 1.2-8.5 8.5a1.4 1.4 0 0 0 0 2l6.5 6.5a1.4 1.4 0 0 0 2 0l8.5-8.5L20.5 4z"/><circle cx="17" cy="7" r="1.2"/>',
  check:'<path d="M5 12.5 10 17 19 7"/>',
  trash:'<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  download:'<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 19h14"/>',
  upload:'<path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 19h14"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
  bolt:'<path d="M13 3 5 13h5l-1 8 8-11h-5z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  'graduation-cap':'<path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />',
  'cooking-pot':'<path d="M2 12h20"/><path d="M20 12v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M8 2h8"/><path d="M12 2v4"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M14.5 4a2.5 2.5 0 0 0-5 0"/>',
  'calendar-days':'<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  gear:'<path d="M12 4.5V2.5"/><path d="M12 21.5v-2"/><path d="M5.5 18.5l-1-1.7"/><path d="M19.5 6.2l1-1.7"/><path d="M4.5 6.2l1 1.7"/><path d="M18.5 18.5l1-1.7"/><path d="M21.5 12h-2"/><path d="M4.5 12h-2"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>',
  timeline:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  sync:'<path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3"/><path d="M21 3v6h-6"/><path d="M3 21v-6h6"/>',
  'cloud-off':'<path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.5"/><path d="M3 3l18 18"/>',
};
function icon(name, size=22, sw=1.7){
  const path = ICONS[name] || ICONS.grid;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/* ============================================================
   ENGINE — 一般无需改动
   ============================================================ */
function isoToday(){ return localDateStr(new Date()); }
function today(){ return isoToday(); }
function localDateStr(d){
  const y=d.getFullYear();
  const m=pad2(d.getMonth()+1);
  const day=pad2(d.getDate());
  return `${y}-${m}-${day}`;
}
function shiftDate(dateValue, days){
  const d = new Date(`${dateValue || isoToday()}T12:00:00`);
  if(Number.isNaN(d.getTime())) return isoToday();
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}
/** 月份偏移："YYYY-MM" 加减 n 个月 */
function shiftMonth(ym, n){
  let [y,m]=ym.split('-').map(Number);
  y += Math.floor((m-1+n)/12);
  m = ((m-1+n)%12+12)%12+1;
  return `${y}-${pad2(m)}`;
}
/** 根据背景色亮度自动返回适合的前景文字色 */
function contrastText(bgHex){
  try{
    const h=bgHex.replace('#','');
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    const lum=(0.299*r+0.587*g+0.114*b)/255;
    return lum>0.5 ? '#2a2418' : '#ffffff';
  }catch(e){ return '#2a2418'; }
}
function avgProgress(list){
  if(!list||!list.length) return { value:0, sub:"0" };
  const v = Math.round(list.reduce((s,x)=>s+Math.min(100,(x.current/x.target)*100||0),0)/list.length);
  return { value:v, sub:`${list.length} 项` };
}
const modOf = k => CONFIG.modules.find(m=>m.key===k);
const $ = s => document.querySelector(s);
const MOBILE = document.body.classList.contains('mobile');

/* ---- 图片压缩工具：将本地图片文件压缩为 DataURL ---- */
function compressImage(file, maxW, maxH, quality, cb){
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let { width:w, height:h } = img;
      if(w > maxW || h > maxH){
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   VERSION — 版本号（每次更新代码时递增，显示在设置页与侧栏底部）
   ============================================================ */
const APP_VERSION = "v1.8.0";

function seedDeveloperPlannerData(d){
  if(d.__developerPlannerSeeded) return;
  const todayDate=isoToday();
  const addDays=(value,days)=>{ const date=new Date(`${value}T12:00:00`); date.setDate(date.getDate()+days); return localDateStr(date); };
  const goalId="dev-goal-product-validation";
  const milestoneId="dev-milestone-core-loop";
  const deliverableId="dev-deliverable-planner-center";
  const taskRows=[
    {id:"dev-task-model",title:"确认目标与里程碑层级",priority:"P0",estimatedMinutes:35,reason:"验证计划中心的层级关系",status:"completed",done:true,dueDate:todayDate,executionResult:{actualStart:`${todayDate}T08:30`,actualEnd:`${todayDate}T09:15`,actualMinutes:45,result:"已确认目标、里程碑和交付物关系",nextStep:"继续验证今日执行"}},
    {id:"dev-task-execution",title:"验证今日执行状态更新",priority:"P0",estimatedMinutes:45,reason:"验证执行闭环",status:"in_progress",done:false,dueDate:todayDate},
    {id:"dev-task-blocked",title:"补齐外部数据并更新报告",priority:"P1",estimatedMinutes:60,reason:"验证延期与阻塞处理",status:"deferred",done:false,dueDate:addDays(todayDate,-1),delayReason:"external_blocker",delayReasonLabel:"外部阻塞",delayNote:"等待测试数据返回后继续",delayedAt:`${todayDate}T10:00:00`},
    {id:"dev-task-review",title:"记录本轮测试结论",priority:"P1",estimatedMinutes:30,reason:"验证执行结果和复盘字段",status:"pending",done:false,dueDate:addDays(todayDate,1)}
  ];
  const blocks=[
    {id:"dev-block-model",title:"确认目标与里程碑层级",date:todayDate,startTime:"08:30",endTime:"09:05",relatedModule:"todo",relatedItemId:"dev-task-model",plannerGoalId:goalId,plannerTaskId:"dev-task-model",goalId,milestoneId,deliverableId,status:"completed",locked:true,manual:true,color:"#5588bb",note:"开发者默认测试数据：锁定时间块"},
    {id:"dev-block-execution",title:"验证今日执行状态更新",date:todayDate,startTime:"10:00",endTime:"10:45",relatedModule:"todo",relatedItemId:"dev-task-execution",plannerGoalId:goalId,plannerTaskId:"dev-task-execution",goalId,milestoneId,deliverableId,status:"in_progress",color:"#8070b0",note:"开发者默认测试数据：当前行动"},
    {id:"dev-block-review",title:"记录本轮测试结论",date:addDays(todayDate,1),startTime:"19:00",endTime:"19:30",relatedModule:"todo",relatedItemId:"dev-task-review",plannerGoalId:goalId,plannerTaskId:"dev-task-review",goalId,milestoneId,deliverableId,status:"pending",manual:true,color:"#a87020",note:"开发者默认测试数据：用户调整时间块"}
  ];
  taskRows.forEach(task=>{ task.plannerGoalId=goalId; task.goalId=goalId; task.milestoneId=milestoneId; task.deliverableId=deliverableId; task.scheduleBlockIds=blocks.filter(block=>block.relatedItemId===task.id).map(block=>block.id); });
  const goal={id:goalId,title:"验证个人工作台计划中心",deadline:addDays(todayDate,7),current:"计划中心主体已完成，正在验证执行、延期和复盘闭环",status:"active",progress:25};
  const milestone={id:milestoneId,goalId,title:"完成核心闭环验收",deadline:addDays(todayDate,7),status:"active",progress:25};
  const deliverable={id:deliverableId,goalId,milestoneId,title:"计划中心可用性验证记录",dueDate:addDays(todayDate,7),status:"in_progress"};
  const draft={id:"dev-draft-planner",mode:"professional",title:goal.title,deadline:goal.deadline,startDate:todayDate,current:goal.current,available:"2小时",availableMinutes:120,scope:"short_term",status:"applied",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),tasks:structuredClone(taskRows),scheduleBlocks:structuredClone(blocks),goal:structuredClone(goal),milestones:[structuredClone(milestone)],deliverables:[structuredClone(deliverable)],totalMinutes:170,capacityMinutes:960,availableDays:8,scheduledMinutes:110,remainingMinutes:60,conflicts:[],unscheduledTasks:["dev-task-blocked"],isFeasible:false,assumptions:["这是开发者默认测试数据，不代表真实用户数据"]};
  d.todo=(d.todo||[]).concat(taskRows);
  d.schedule=(d.schedule||[]).concat(blocks);
  d.__planner={mode:"professional",goals:[{...structuredClone(goal),draft:structuredClone(draft)}],currentGoalId:goalId,goal:structuredClone(goal),milestones:[structuredClone(milestone)],deliverables:[structuredClone(deliverable)],draft,permissions:{readTasks:true,readSchedule:true,writeTasks:true,writeSchedule:true},snapshots:[]};
  d.__developerPlannerSeeded=true;
}

const store = {
  load(){
    const raw = localStorage.getItem(CONFIG.storageKey);
    if(raw){ try { return JSON.parse(raw); } catch(e){} }
    const d={}; CONFIG.modules.forEach(m=>d[m.key]=structuredClone(m.seed||[]));
    seedDeveloperPlannerData(d);
    d.__onboarding = { seen:false, demoChoice:"pending" };
    d.__isDemoData = true;
    d.__termStartDate = d.__termStartDate || "2026-08-31"; // Default term start date
    d.__greetImage = d.__greetImage || ""; // Greet background image (empty = no background)
  d.__avatar = d.__avatar || ""; // Avatar (empty = no avatar)
  d.__pageBgImage = d.__pageBgImage || ""; // Default page background image (empty = solid color)
  d.__pageBgBlur = d.__pageBgBlur ?? 12; // Default page background blur in px
  d.__sidebarOpacity = d.__sidebarOpacity ?? 1; // Default sidebar opacity (0-1)
  d.__cardOpacity = d.__cardOpacity ?? 1; // Default card opacity (0-1)
  return d;
  },
  save(){ localStorage.setItem(CONFIG.storageKey, JSON.stringify(data)); },
};
let data = store.load();

/* ---- GitHub Gist 云端同步 ---- */
let syncState = { status:"idle", lastSync:null, error:null };
let syncPushTimer = null;
let suppressAutoPush = false;  // 拉取后短暂抑制自动推送，避免回环
let pendingPush = false;       // 抑制窗口内有变更时标记，结束后补推
let syncSignalEtag = null;     // 云端变更信号（Gist ETag），null=未知需全量探测
let syncSignalProbing = false; // 信号探测防重入

function getSyncConfig(){ return data.__sync || {}; }
function setSyncConfig(cfg){ data.__sync = { ...getSyncConfig(), ...cfg }; store.save(); }
function getAIConfig(){ return data.__aiConfig || {}; }
function setAIConfig(cfg){ data.__aiConfig = { ...cfg }; store.save(); }
const AI_BRIDGE_ENDPOINT="http://127.0.0.1:5174";
function aiConfigHeaders(cfg){
  const headers={"Content-Type":"application/json"};
  if(cfg.apiKey) headers.Authorization=`Bearer ${cfg.apiKey}`;
  return headers;
}
async function aiBridgeRequest(cfg,messages,requestOptions={}){
  if(!cfg.endpoint) throw new Error("请填写接口地址");
  if(!cfg.apiKey) throw new Error("请填写 API Key");
  if(!cfg.model) throw new Error("请填写模型名称");
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),Number(cfg.timeout)||30000);
  try{
    const res=await fetch(`${AI_BRIDGE_ENDPOINT}/api/ai/chat`,{method:"POST",headers:{"Content-Type":"application/json"},signal:controller.signal,body:JSON.stringify({config:cfg,messages,requestOptions})});
    const body=await res.json().catch(()=>({}));
    if(!res.ok||body.ok===false) throw new Error(body.error||`本机中转层返回 HTTP ${res.status}`);
    return body.result;
  }finally{ clearTimeout(timer); }
}
async function testAIConnection(cfg){
  return aiBridgeRequest(cfg,[{role:"user",content:"请只回复：连接测试成功"}]);
}
function aiWorkspacePayload(){
  const copy=JSON.parse(JSON.stringify(data||{}));
  delete copy.__aiConfig;
  if(copy.__sync) delete copy.__sync.token;
  return copy;
}
function aiResponseText(response){
  const seen=new Set();
  const read=(value,depth=0)=>{
    if(value==null||depth>6) return "";
    if(typeof value==="string") return value.trim();
    if(typeof value!=="object"||seen.has(value)) return "";
    seen.add(value);
    if(Array.isArray(value)) return value.map(item=>read(item,depth+1)).filter(Boolean).join("\n").trim();
    const preferred=["content","text","value","output_text","reasoning_content","reasoning"];
    for(const key of preferred){ const result=read(value[key],depth+1); if(result) return result; }
    for(const key of ["message","output","choices","data","result"]){ const result=read(value[key],depth+1); if(result) return result; }
    return "";
  };
  return read(response);
}
function parseAIAnalysis(response){
  const text=aiResponseText(response);
  if(!text) throw new Error("接口已响应，但未识别到可读取的文本内容");
  const cleaned=text.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim();
  let parsed;
  try{ parsed=JSON.parse(cleaned); }catch(e){
    const match=cleaned.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("AI 已返回文字，但不是可识别的 JSON 格式");
    try{ parsed=JSON.parse(match[0]); }catch(err){ throw new Error("AI 已返回内容，但 JSON 格式不完整"); }
  }
  if(!parsed||typeof parsed!=="object") throw new Error("AI 返回结构无效");
  const priorities=Array.isArray(parsed.priorities)?parsed.priorities:[];
  return {summary:String(parsed.summary||"AI 已完成今日判断"),priorities:priorities.map(x=>({taskId:x.taskId,title:String(x.title||"未命名任务"),level:String(x.level||"中"),reason:String(x.reason||"未提供判断原因"),nextAction:String(x.nextAction||"请确认下一步行动")})),risks:Array.isArray(parsed.risks)?parsed.risks.map(String):[],suggestions:Array.isArray(parsed.suggestions)?parsed.suggestions.map(x=>typeof x==="string"?{title:x,reason:"AI 建议"}:{taskId:x.taskId,title:String(x.title||x.nextAction||"建议行动"),reason:String(x.reason||"AI 建议")}):[],confidence:Number(parsed.confidence)||0.5,generatedAt:new Date().toISOString(),source:"api"};
}

async function gistCreate(token, payload){
  const res = await fetch("https://api.github.com/gists", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${token}`, "Content-Type":"application/json", "Accept":"application/vnd.github+json" },
    body: JSON.stringify({ description:"Personal Workbench Data Sync", public:false, files:{ "workbench-data.json":{ content:payload } } })
  });
  if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.message||`HTTP ${res.status}`); }
  const j=await res.json(); return j.id;
}

async function gistPush(token, gistId, payload){
  const res=await fetch(`https://api.github.com/gists/${gistId}`, {
    method:"PATCH",
    headers:{ "Authorization":`Bearer ${token}`, "Content-Type":"application/json", "Accept":"application/vnd.github+json" },
    body: JSON.stringify({ files:{ "workbench-data.json":{ content:payload } } })
  });
  if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.message||`HTTP ${res.status}`); }
  const j=await res.json(); return j.updated_at;
}

/* 信号检测：带 If-None-Match 探测。内容未变→304(unchanged)，有变化→200 返回数据+新ETag */
async function gistPull(token, gistId, etag){
  const headers={ "Authorization":`Bearer ${token}`, "Accept":"application/vnd.github+json" };
  if(etag) headers["If-None-Match"]=etag;
  const res=await fetch(`https://api.github.com/gists/${gistId}`, { method:"GET", headers });
  if(res.status===304) return { unchanged:true };   // 信号未变：无需拉取
  if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.message||`HTTP ${res.status}`); }
  const j=await res.json();
  const f=j.files&&j.files["workbench-data.json"];
  if(!f) throw new Error("Gist 中未找到 workbench-data.json");
  return { content:f.content, updatedAt:j.updated_at, etag:res.headers.get("ETag")||null };
}

/* ---- 构建同步载荷：剔除 token 明文与底板背景（双端比例不一，各自保留） ---- */
function buildSyncPayload(){
  const sync = data.__sync || {};
  const { token: _stripped, ...safeSync } = sync;
  const { __pageBgImage: _bg1, __pageBgBlur: _bg2, ...safeData } = data;
  return JSON.stringify({ ...safeData, __sync: safeSync });
}

async function syncPush(silent=false){
  const cfg=getSyncConfig();
  if(!cfg.token||!cfg.gistId) return;
  // 防覆盖竞争：推送前检查远端信号，若远端比本地记录的同步时间新（另一端有新数据），先拉取再推送
  try{
    const rc=await gistPull(cfg.token, cfg.gistId);
    if(!rc.unchanged && rc.updatedAt && rc.updatedAt > (cfg.lastSync || "1970-01-01T00:00:00Z")){
      await syncPull(true);   // 拉取远端新数据（含另一端的变更），本地随后基于最新数据推送
    }
  }catch(e){ /* 检查失败则继续推送 */ }
  const cfg2=getSyncConfig();
  if(!cfg2.token||!cfg2.gistId) return;
  syncState={status:"pushing",lastSync:syncState.lastSync,error:null}; updateSyncIndicator();
  if(!silent) toast("正在推送...");
  try{
    const payload=buildSyncPayload();
    const ts=await gistPush(cfg2.token, cfg2.gistId, payload);
    cfg2.lastSync=ts; setSyncConfig(cfg2);
    syncSignalEtag=null;    // 推送后重置信号缓存，下次探测强制全量确认
    syncState={status:"synced",lastSync:ts,error:null};
    if(!silent) toast("推送成功");
  }catch(err){
    syncState={status:"error",lastSync:syncState.lastSync,error:err.message};
    if(!silent) toast("推送失败: "+err.message);
  }
  updateSyncIndicator();
}

async function syncPull(silent=false){
  const cfg=getSyncConfig();
  if(!cfg.token||!cfg.gistId) return;
  syncState={status:"pulling",lastSync:syncState.lastSync,error:null}; updateSyncIndicator();
  if(!silent) toast("正在拉取...");
  try{
    const remote=await gistPull(cfg.token, cfg.gistId);
    if(remote.unchanged){   // 信号未变（304）：仅刷新状态，不重复拉取
      syncState={status:"synced",lastSync:cfg.lastSync||remote.updatedAt,error:null}; updateSyncIndicator();
      return;
    }
    if(remote.etag) syncSignalEtag=remote.etag;   // 记录新信号
    const remoteData=JSON.parse(remote.content);
    // 同步决策统一用 GitHub 服务器时间（updated_at / lastSync），避免双端客户端时钟差异导致"不更新"
    const remoteTS=remote.updatedAt||"1970-01-01T00:00:00Z";
    const localTS =cfg.lastSync||"1970-01-01T00:00:00Z";
    // 拉取后短暂抑制自动推送，避免 render() 间接触发 persist() 导致回环；结束后如有变更则补推
    suppressAutoPush=true;
    setTimeout(()=>{
      suppressAutoPush=false;
      if(pendingPush){ pendingPush=false; syncPush(true); }
    }, 5000);
    if(remoteTS>localTS){
      // 保留本地底板背景（双端不互相同步）与同步配置
      data={...remoteData, __sync:cfg, __pageBgImage:data.__pageBgImage||"", __pageBgBlur:data.__pageBgBlur??12};
      store.save(); buildNav(); render();
      cfg.lastSync=remote.updatedAt; setSyncConfig(cfg);
      syncState={status:"synced",lastSync:remote.updatedAt,error:null};
      if(!silent) toast("已拉取最新数据");
    }else{
      cfg.lastSync=remote.updatedAt; setSyncConfig(cfg);
      syncState={status:"synced",lastSync:cfg.lastSync,error:null};
      if(!silent) toast("本地已是最新");
    }
  }catch(err){
    suppressAutoPush=false;
    syncState={status:"error",lastSync:syncState.lastSync,error:err.message};
    if(!silent) toast("拉取失败: "+err.message);
  }
  updateSyncIndicator();
}

function scheduleSyncPush(){
  const cfg=getSyncConfig();
  if(!cfg.token||!cfg.gistId) return;
  if(cfg.autoSync === false) return;          // 仅显式关闭时跳过（undefined 视为开启，兼容旧数据）
  if(suppressAutoPush){ pendingPush = true; return; }  // 抑制窗口内先标记，结束后补推，不丢弃
  clearTimeout(syncPushTimer);
  syncPushTimer=setTimeout(()=>syncPush(true), 1500);
}

function updateSyncIndicator(){
  const foot=$("#foot"); if(!foot) return;
  const cfg=getSyncConfig();
  if(!cfg.token||!cfg.gistId){ foot.innerHTML="数据仅存在本机 · 可在设置中开启同步"; foot.style.opacity=".42"; return; }
  const map={
    idle:{t:"已配置同步",c:"var(--text-secondary)"},
    synced:{t:"已同步",c:"var(--success)"},
    pushing:{t:"同步中…",c:"var(--text-secondary)"},
    pulling:{t:"拉取中…",c:"var(--text-secondary)"},
    error:{t:"同步异常",c:"var(--danger)"}
  };
  const s=map[syncState.status]||map.idle;
  foot.innerHTML=`${icon("sync",11,1.7)} <span style="color:${s.c}">${s.t}</span>`;
  foot.style.opacity=".7";
}

// Theme is applied by inline script in index.html <head> to prevent FOUC
if(data.__theme) document.documentElement.setAttribute("data-mode", data.__theme);

// Status bar adaptation for native app
function updateStatusBar(){
  if(!window.Capacitor) return;
  const StatusBar = window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar;
  if(!StatusBar) return;
  const isDark = document.documentElement.getAttribute("data-mode") === "dark";
  if(StatusBar.setBackgroundColor){
    StatusBar.setBackgroundColor({ color: isDark ? "#1a1917" : "#f4f3f0" });
  }
  if(StatusBar.setStyle){
    StatusBar.setStyle({ style: isDark ? "LIGHT" : "DARK" });
  }
}
updateStatusBar();

let view = "home";
let scheduleViewMode = "daily";
let timetableViewMode = "daily";
let scheduleWeekOffset = 0;   // 0=本周, -1=上周, 1=下周 …
let scheduleMonthOffset = 0;  // 0=本月, -1=上月, 1=下月 …
let scheduleSelectedDate = null; // null=今天, 或 "YYYY-MM-DD"
let scheduleDayOffset = 0;
let timetableSelectedDate = null; // null=今天, 或 "YYYY-MM-DD"
let timetableWeekOffset = 0;
let searchQ = "";
let moneyMonth = null; // null=未初始化(默认本月), ""=全部, "YYYY-MM"=指定月
let pomo = { running:false, remain:25*60, total:25*60 };   // 番茄钟状态（内存态，跨渲染保留）
let clockTimer = null;                                       // 全局秒级心跳（时钟 + 番茄钟）
function persist(){ data.__lastModified = new Date().toISOString(); store.save(); render(); scheduleSyncPush(); }
function pad2(n){ return String(n).padStart(2,"0"); }

/* ---------- SHARED TIMELINE ---------- */
const TIMELINE = { startHour: 0, endHour: 24, hourHeight: 64, dayHeaderHeight: 48 };
const DAYGRID_TUNING_KEY = "personal-workbench-daygrid-tuning-v2";
const DAYGRID_TUNING_DEFAULTS = { rowHeight: 50, labelWidth: 64, minuteWidth: 96, headerHeight: 40, minuteFont: 10, cornerFont: 11, labelFont: 11, eventTitleFont: 11, eventDetailFont: 9, eventSourceFont: 8, eventShortFont: 10, eventPadding: 4 };
const DAYGRID_TUNING_LIMITS = {
  rowHeight: [30, 70], labelWidth: [48, 180], minuteWidth: [40, 240], headerHeight: [28, 72], minuteFont: [8, 16], cornerFont: [8, 16],
  labelFont: [8, 16], eventTitleFont: [8, 18], eventDetailFont: [7, 14], eventSourceFont: [7, 14], eventShortFont: [8, 18], eventPadding: [1, 10]
};
function dayGridTuning(){
  try {
    const saved = JSON.parse(localStorage.getItem(DAYGRID_TUNING_KEY) || "{}");
    return Object.fromEntries(Object.entries(DAYGRID_TUNING_DEFAULTS).map(([key, fallback]) => {
      const [min] = DAYGRID_TUNING_LIMITS[key];
      const value = Number(saved[key]);
      return [key, Math.max(min, Number.isFinite(value) ? value : fallback)];
    }));
  } catch (_) {
    return {...DAYGRID_TUNING_DEFAULTS};
  }
}
function dayGridTuningStyle(){
  const t = dayGridTuning();
  return `--daygrid-row-height:${t.rowHeight}px;--daygrid-label-width:${t.labelWidth}px;--daygrid-minute-width:${t.minuteWidth}px;--daygrid-header-height:${t.headerHeight}px;--daygrid-minute-font:${t.minuteFont}px;--daygrid-corner-font:${t.cornerFont}px;--daygrid-label-font:${t.labelFont}px;--daygrid-event-title-font:${t.eventTitleFont}px;--daygrid-event-detail-font:${t.eventDetailFont}px;--daygrid-event-source-font:${t.eventSourceFont}px;--daygrid-event-short-font:${t.eventShortFont}px;--daygrid-event-padding:${t.eventPadding}px;`;
}
function bindDayGridTuning(){
  const shell = document.querySelector(".daygrid-shell");
  const controls = document.querySelector("#daygrid-tuning");
  if (!shell || !controls) return;
  const update = (commit = false) => {
    const values = {};
    Object.keys(DAYGRID_TUNING_DEFAULTS).forEach(key => {
      const input = controls.querySelector(`[name='daygrid-${key}']`);
      if (!input || input.value === "") return;
      const [min] = DAYGRID_TUNING_LIMITS[key];
      const raw = Number(input.value);
      if (!Number.isFinite(raw)) return;
      const value = Math.max(min, raw);
      values[key] = value;
      if (commit) input.value = value;
      shell.style.setProperty(`--daygrid-${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`, `${value}px`);
      const output = controls.querySelector(`[data-daygrid-${key}]`);
      if (output) output.textContent = `${value}px`;
    });
    if (Object.keys(values).length) localStorage.setItem(DAYGRID_TUNING_KEY, JSON.stringify({...dayGridTuning(), ...values}));
  };
  controls.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => update(false));
    input.addEventListener("change", () => update(true));
  });
  controls.querySelector("[data-daygrid-reset]").onclick = () => {
    Object.keys(DAYGRID_TUNING_DEFAULTS).forEach(key => {
      const input = controls.querySelector(`[name='daygrid-${key}']`);
      if (input) input.value = DAYGRID_TUNING_DEFAULTS[key];
    });
    update();
  };
}
function timelineMinutes(value, fallback = 0){
  const parts = String(value || "").split(":").map(Number);
  if (!Number.isFinite(parts[0])) return fallback;
  return Math.max(0, Math.min(24 * 60, parts[0] * 60 + (Number.isFinite(parts[1]) ? parts[1] : 0)));
}
function timelineTop(value){ return (timelineMinutes(value) / 60) * TIMELINE.hourHeight; }
function timelineHeight(start, end){
  let s = timelineMinutes(start), e = timelineMinutes(end);
  if (e <= s) e = 24 * 60;
  return Math.max(24, ((e - s) / 60) * TIMELINE.hourHeight);
}
function timelineDateOffset(offset = 0){
  const d = new Date(); d.setDate(d.getDate() + offset); return localDateStr(d);
}
function timelineDayLabel(dateValue){
  const d = new Date(`${dateValue}T12:00:00`);
  return ["周日","周一","周二","周三","周四","周五","周六"][d.getDay()];
}
function timelineLabels(offset = 0){
  return Array.from({length: 25}, (_, hour) => `<div class="timeline-label" style="top:${offset + hour * TIMELINE.hourHeight}px">${pad2(hour)}:00</div>`).join("");
}
function timelineGridLines(){
  return `<div class="timeline-grid-lines" style="height:${24 * TIMELINE.hourHeight}px"></div>`;
}

/* ---- toast 轻提示 ---- */
function toast(msg){
  let t = $("#__toast");
  if(!t){
    t = document.createElement("div");
    t.id = "__toast";
    t.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--text);color:var(--surface-card);padding:10px 22px;border-radius:10px;font-size:14px;font-weight:600;z-index:9999;opacity:0;transition:all .25s;pointer-events:none;box-shadow:var(--shadow-overlay);";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)"; });
  clearTimeout(t.__timer);
  t.__timer = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(20px)"; }, 2200);
}

/* 本周（周一起）7 天的 ISO 日期 */
function weekDates(){
  const n=new Date(); const dow=(n.getDay()+6)%7; const mon=new Date(n); mon.setDate(n.getDate()-dow);
  const arr=[]; for(let i=0;i<7;i++){ const d=new Date(mon); d.setDate(mon.getDate()+i); arr.push(localDateStr(d)); }
  return arr;
}
function weekNum(){ const n=new Date(); const s=new Date(n.getFullYear(),0,1);
  return Math.ceil(((n-s)/86400000 + s.getDay()+1)/7); }

// 获取当前学期周数
function getCurrentTermWeekNumber() {
  const now = new Date();
  if (!data.__termStartDate) return 1; // 如果未设置，则返回 1
  const termStart = new Date(data.__termStartDate);
  const termStartMonday = new Date(termStart);
  // 将 termStart 所在周的周一作为第一周的开始
  const dayOfWeek = termStart.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  termStartMonday.setDate(termStart.getDate() + offset);
  termStartMonday.setHours(0, 0, 0, 0);

  if (now < termStartMonday) return 1; // 开学前算作第一周

  const diffTime = now.getTime() - termStartMonday.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
}

// 判断课程在当前周是否活跃
function getTermWeekNumberForDate(dateValue) {
  const target = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(target.getTime()) || !data.__termStartDate) return 1;
  const termStart = new Date(`${data.__termStartDate}T12:00:00`);
  if (Number.isNaN(termStart.getTime())) return 1;
  const termStartMonday = new Date(termStart);
  const dayOfWeek = termStart.getDay();
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  termStartMonday.setDate(termStart.getDate() + offset);
  termStartMonday.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  if (target < termStartMonday) return 1;
  return Math.floor((target.getTime() - termStartMonday.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
}

function timetableEventForDate(item, dateValue) {
  return {
    ...item,
    id: `course-${item.id}-${dateValue}`,
    timetableId: item.id,
    source: "timetable",
    date: dateValue,
    title: item.courseName || item.title || "课程",
    startTime: item.startTime || "08:00",
    endTime: item.endTime || "09:40",
    color: item.color || "#6f9f84"
  };
}

function scheduleEventsForDate(dateValue) {
  const events = (data.schedule || []).filter(item => item.date === dateValue).map(item => ({...item, source: "schedule"}));
  const weekday = plannerWeekday(dateValue);
  const currentWeek = getTermWeekNumberForDate(dateValue);
  (data.timetable || []).filter(item => item.dayOfWeek === weekday && isClassActiveInWeek(item, currentWeek))
    .forEach(item => events.push(timetableEventForDate(item, dateValue)));
  return events;
}

function timelineEventHTML(event, mode = "schedule"){
  const color = event.color || (event.source === "timetable" ? "#6f9f84" : "#8f83a8");
  const txt = contrastText(color);
  const title = esc(event.title || event.courseName || "无标题");
  const timeStr = `${esc(event.startTime || "00:00")}–${esc(event.endTime || "00:00")}`;
  const sourceLabel = event.source === "timetable" ? "课程" : "日程";
  return `<button class="timeline-event ${event.source === "timetable" ? "is-course" : "is-schedule"}" style="top:${timelineTop(event.startTime)}px;height:${timelineHeight(event.startTime, event.endTime)}px;background:${color};color:${txt}" data-timeline-id="${event.id}" aria-label="${title} ${timeStr}">
    <span class="timeline-event-type">${sourceLabel}</span><strong>${title}</strong><small>${timeStr}</small>
  </button>`;
}
function dayGridColorRGB(value){
  const match = String(value || "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;
  const hex = match[1];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}
function dayGridColorsNear(a, b){
  const left = dayGridColorRGB(a), right = dayGridColorRGB(b);
  if (!left || !right) return false;
  const distance = Math.sqrt(left.reduce((sum, value, index) => sum + Math.pow(value - right[index], 2), 0));
  return distance <= 72;
}
function dailyGridSegmentHTML(event, hour, segmentStart, segmentEnd, startTotal, endTotal, nearColor = false){
  const color = event.color || (event.source === "timetable" ? "#6f9f84" : "#8f83a8");
  const txt = contrastText(color);
  const titleText = event.title || event.courseName || "无标题";
  const timeText = `${event.startTime || "00:00"}–${event.endTime || "00:00"}`;
  // 事件块位于当前小时行内，left 必须使用“小时内分钟”而不是全天绝对分钟。
  const minuteOffset = Math.max(0, Math.min(60, segmentStart - hour * 60));
  const segmentMinutesInHour = Math.max(0, Math.min(60, segmentEnd - segmentStart));
  const left = (minuteOffset / 60) * 100;
  const width = (segmentMinutesInHour / 60) * 100;
  // 日网格以“小时”为纵向行、以“分钟”为横向列；事件时长只能影响横向宽度。
  const top = 0;
  const height = "100%";
  // 所有事件统一保留来源、完整标题和完整时间，不因色块宽度而降级。
  const isContinuation = segmentStart > startTotal;
  const sourceLabel = event.source === "timetable" ? "课程" : "日程";
  const fullLabel = `${sourceLabel}：${titleText}，${timeText}`;
  const continuationClass = isContinuation ? " is-continuation" : "";
  const nearColorClass = nearColor ? " is-near-color" : "";
  const eventContent = `<span class="daygrid-event-source">${sourceLabel}</span><strong>${esc(titleText)}</strong><small>${esc(timeText)}</small>`;
  return `<button class="daygrid-event ${event.source === "timetable" ? "is-course" : "is-schedule"}${continuationClass}${nearColorClass}" style="top:${top}px;height:${height};left:${left}%;width:${width}%;background:${color};color:${txt};--daygrid-event-color:${color}" data-timeline-id="${event.id}" data-tooltip="${attr(fullLabel)}" aria-label="${attr(fullLabel)}" title="${attr(fullLabel)}">
    ${eventContent}
  </button>`;
}
function dayGridProjectPanel(events, mode = "schedule"){
  const uniqueEvents = Array.from(new Map(events.map(event => [String(event.id), event])).values());
  const sourceLabel = mode === "timetable" ? "课程项目" : "日程项目";
  const items = uniqueEvents.map(event => {
    const color = event.color || (event.source === "timetable" ? "#6f9f84" : "#8f83a8");
    const title = esc(event.title || event.courseName || "无标题");
    const time = `${esc(event.startTime || "00:00")}–${esc(event.endTime || "00:00")}`;
    const detail = esc(event.location || event.note || event.description || "");
    return `<button class="daygrid-project-item" type="button" data-timeline-id="${event.id}" style="--project-color:${color}" title="${attr(`${title}，${time}`)}">
      <span class="daygrid-project-dot" aria-hidden="true"></span><span class="daygrid-project-content"><strong>${title}</strong><small>${time}${detail ? ` · ${detail}` : ""}</small></span>
    </button>`;
  }).join("");
  return `<aside class="daygrid-projects" aria-label="${sourceLabel}"><div class="daygrid-projects-head"><strong>${sourceLabel}</strong><span>${uniqueEvents.length} 项</span></div>${items || '<div class="daygrid-projects-empty">暂无安排</div>'}</aside>`;
}
function dayGridCourseRail(allClasses, recordItems = allClasses){
  const m = modOf("timetable");
  const records = recordItems.length ? recordItems.map(item => recHTML(m, item)).join("") : '<div class="daygrid-projects-empty">暂无匹配记录</div>';
  return `<aside class="daygrid-course-rail" aria-label="课程信息">
    <section class="daygrid-course-records"><div class="daygrid-course-records-head"><strong>课程记录</strong><span id="rec-count">${recordItems.length} 条</span></div><div class="rec-grid">${records}</div></section>
    <div class="daygrid-course-stats">${sideStats(m, allClasses)}</div>
  </aside>`;
}
function renderDailyMinuteGrid(dateValue, events, mode = "schedule", courseRail = ""){
  const rows = Array.from({length: 24}, (_, hour) => {
    const rowSegments = [];
    events.forEach(event => {
      const start = timelineMinutes(event.startTime);
      let end = timelineMinutes(event.endTime);
      if (end <= start) end = 24 * 60;
      const hourStart = hour * 60;
      const hourEnd = hourStart + 60;
      const segmentStart = Math.max(start, hourStart);
      const segmentEnd = Math.min(end, hourEnd);
      if (segmentEnd > segmentStart) rowSegments.push({event, start, end, segmentStart, segmentEnd});
    });
    const segments = rowSegments.map(segment => {
      const nearColor = rowSegments.some(other => {
        if (other.event.id === segment.event.id || !dayGridColorsNear(segment.event.color, other.event.color)) return false;
        return other.segmentStart <= segment.segmentEnd + 2 && other.segmentEnd >= segment.segmentStart - 2;
      });
      return dailyGridSegmentHTML(segment.event, hour, segment.segmentStart, segment.segmentEnd, segment.start, segment.end, nearColor);
    });
    const minuteCells = Array.from({length: 6}, () => "<div></div>").join("");
    return `<div class="daygrid-hour-row"><div class="daygrid-minute-grid">${minuteCells}</div>${segments.join("")}</div>`;
  }).join("");
  return `<div class="daygrid-layout" data-timeline-mode="${mode}" style="${dayGridTuningStyle()}"><div class="daygrid-shell">
    <div class="daygrid-corner">时间</div><div class="daygrid-header"><div class="daygrid-minute-head">${["00–10","10–20","20–30","30–40","40–50","50–60"].map(minuteRange => `<span>${minuteRange}</span>`).join("")}</div></div>
    <div class="daygrid-labels">${Array.from({length: 24}, (_, hour) => `<div class="daygrid-label">${pad2(hour)}:00</div>`).join("")}</div>
    <div class="daygrid-body">${rows || '<div class="timeline-empty">暂无安排</div>'}</div>
  </div>${courseRail || dayGridProjectPanel(events, mode)}</div>`;
}
function renderTimelineDayView(dateValue, events, mode = "schedule", courseRail = ""){
  const label = `${timelineDayLabel(dateValue)} ${dateValue}`;
  return `<div class="timeline-toolbar">
    <button class="btn sm" id="timeline-prev-day">${icon("chevron-left",14,2.4)} 前一天</button>
    <span class="date-chip">${icon("calendar",14)} ${label}</span>
    <button class="btn sm" id="timeline-next-day">后一天 ${icon("chevron-right",14,2.4)}</button>
    <button class="btn sm" id="timeline-today">今天</button>
  </div>
  <div class="daygrid-title"><strong>${mode === "timetable" ? "课程日视图" : "日程日视图"}</strong><span>24 小时 × 6 个十分钟刻度；短色块悬停或点击查看完整信息</span></div>
  ${renderDailyMinuteGrid(dateValue, events, mode, courseRail)}`;
}
function compactWeekEventHTML(event, hour, segmentStart, segmentEnd){
  const color = event.color || (event.source === "timetable" ? "#6f9f84" : "#8f83a8");
  const txt = contrastText(color);
  const titleText = event.title || event.courseName || "无标题";
  const timeText = `${event.startTime || "00:00"}–${event.endTime || "00:00"}`;
  const width = ((segmentEnd - segmentStart) / 60) * 100;
  const left = (segmentStart % 60) / 60 * 100;
  const minutes = Math.max(1, segmentEnd - segmentStart);
  const shortLabel = titleText.slice(0, 1) || "·";
  const label = `${event.source === "timetable" ? "课程" : "日程"}：${titleText}，${timeText}`;
  return `<button class="weekgrid-event${minutes < 18 || width < 20 ? " is-micro" : ""}" style="left:${left}%;width:${width}%;background:${color};color:${txt}" data-timeline-id="${event.id}" title="${attr(label)}" aria-label="${attr(label)}">
    <strong>${esc(titleText)}</strong><span aria-hidden="true">${esc(shortLabel)}</span>
  </button>`;
}
function compactWeekHourCell(events, hour){
  const blocks = [];
  events.forEach(event => {
    const start = timelineMinutes(event.startTime);
    let end = timelineMinutes(event.endTime);
    if (end <= start) end = 24 * 60;
    const hourStart = hour * 60;
    const hourEnd = hourStart + 60;
    const segmentStart = Math.max(start, hourStart);
    const segmentEnd = Math.min(end, hourEnd);
    if (segmentEnd > segmentStart) blocks.push(compactWeekEventHTML(event, hour, segmentStart, segmentEnd));
  });
  return `<div class="weekgrid-day-cell"><div class="weekgrid-minute-grid">${Array.from({length:6}, () => "<i></i>").join("")}</div>${blocks.join("")}</div>`;
}
function renderUnifiedWeeklyTimeline(weekDays, eventsForDate, mode = "schedule"){
  const dayEvents = weekDays.map(day => eventsForDate(day.date));
  const headers = weekDays.map(day => `<div class="weekgrid-day-header${day.date === isoToday() ? " is-today" : ""}"><span>${day.label}</span><b>${day.number}</b></div>`).join("");
  const rows = Array.from({length:24}, (_, hour) => `<div class="weekgrid-row"><div class="weekgrid-hour">${pad2(hour)}:00</div>${dayEvents.map(events => compactWeekHourCell(events, hour)).join("")}</div>`).join("");
  return `<div class="weekgrid-title"><strong>${mode === "timetable" ? "课程周视图" : "日程周视图"}</strong><span>一屏展示周一至周日；点击色块查看完整信息</span></div>
  <div class="weekgrid-shell" data-timeline-mode="${mode}">
    <div class="weekgrid-corner">小时</div><div class="weekgrid-headers">${headers}</div>
    <div class="weekgrid-rows">${rows}</div>
  </div>`;
}
function timelineWeekDates(offset = 0, baseDate = null){
  const now = new Date(`${baseDate || isoToday()}T12:00:00`);
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow + offset * 7);
  monday.setHours(12,0,0,0);
  return Array.from({length:7}, (_,i) => { const d = new Date(monday); d.setDate(monday.getDate()+i); return {date:localDateStr(d), label:["周一","周二","周三","周四","周五","周六","周日"][i], number:d.getDate()}; });
}
function renderUnifiedScheduleWeek(){
  const days = timelineWeekDates(scheduleWeekOffset, scheduleSelectedDate || isoToday());
  const range = `${days[0].date} – ${days[6].date}`;
  return `<div class="timeline-toolbar"><button class="btn sm" id="week-prev">${icon("chevron-left",14,2.4)} 上一周</button><span class="date-chip">${icon("calendar",14)} ${range}</span><button class="btn sm" id="week-next">下一周 ${icon("chevron-right",14,2.4)}</button><button class="btn sm" id="week-today">今天</button></div>${renderUnifiedWeeklyTimeline(days, date => scheduleEventsForDate(date), "schedule")}`;
}

function isClassActiveInWeek(classItem, currentWeek) {
  const start = parseInt(classItem.startWeek);
  const end = parseInt(classItem.endWeek);
  if (currentWeek < start || currentWeek > end) {
    return false;
  }

  // 不规则周
  if (classItem.customWeeks) {
    const customWeeks = classItem.customWeeks.split(',').map(Number);
    if (!customWeeks.includes(currentWeek)) {
      return false;
    }
  }

  // 单双周
  if (classItem.weekType === '单周' && currentWeek % 2 === 0) {
    return false;
  }
  if (classItem.weekType === '双周' && currentWeek % 2 !== 0) {
    return false;
  }

  return true;
}

// 获取今天的课程
function getClassesForToday(allClasses) {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 (周日) 到 6 (周六)
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const todayName = dayNames[currentDayOfWeek];
  const currentWeek = getCurrentTermWeekNumber();

  return allClasses.filter(item => {
    return item.dayOfWeek === todayName && isClassActiveInWeek(item, currentWeek);
  }).sort((a, b) => {
    // 按开始时间排序
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
    return timeA[1] - timeB[1];
  });
}

// 获取下一节即将开始的课程
function getNextUpcomingClass(todayClasses) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const classItem of todayClasses) {
    const [hour, minute] = classItem.startTime.split(':').map(Number);
    const classTime = hour * 60 + minute;
    if (classTime > currentTime) {
      return classItem;
    }
  }
  return null;
}

/* 秒级心跳：更新时钟；番茄钟运行时倒计时 */
function startClock(){ if(clockTimer) return; clockTimer=setInterval(heartbeat,1000); heartbeat(); }
function heartbeat(){
  const el=$("#clk"); if(el){ const n=new Date(); el.textContent=`${pad2(n.getHours())}:${pad2(n.getMinutes())}:${pad2(n.getSeconds())}`; }
  if(pomo.running){ pomo.remain--; if(pomo.remain<=0) completePomo(); pomoUpdate(); }
}
function pomoUpdate(){
  const t=$("#pomo-time"); if(t){ t.textContent=`${pad2(Math.floor(pomo.remain/60))}:${pad2(pomo.remain%60)}`; }
  const fg=$("#pomo-fg"); if(fg){ const r=64,c=2*Math.PI*r; fg.style.strokeDashoffset=c*(1-pomo.remain/pomo.total); }
  const st=$("#pomo-status"); if(st) st.textContent=pomo.running?"专注中":"已暂停";
  const b=$("#pomo-toggle"); if(b) b.textContent=pomo.running?"暂停":"开始";
}
function completePomo(){ pomo.running=false; pomo.remain=pomo.total;
  data.__pomo=data.__pomo||{count:0,min:0}; data.__pomo.count++; data.__pomo.min+=Math.round(pomo.total/60); store.save();
  const c=$("#pomo-count"); if(c) c.textContent=data.__pomo.count;
  const mn=$("#pomo-min"); if(mn) mn.textContent=data.__pomo.min;
}

/* ---------- ring svg ---------- */
function ringSVG(pct, color){
  const r=25, c=2*Math.PI*r, off=c*(1-Math.min(100,pct)/100);
  return `<svg class="gauge" viewBox="0 0 60 60"><circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--border)" stroke-width="5.5"/>
    <circle cx="30" cy="30" r="${r}" fill="none" stroke="${color}" stroke-width="5.5" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`;
}
function trendSVG(series){
  const w=560, h=170, padX=12, padTop=16, padBot=22;
  const max=Math.max(...series), min=Math.min(...series);
  const rng=(max-min)||1;
  const innerW=w-2*padX, innerH=h-padTop-padBot;
  const pts=series.map((v,i)=>{
    const x=padX+innerW*i/(series.length-1);
    const y=padTop+innerH*(1-(v-min)/rng);
    return [x,y];
  });
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=line+` L ${padX+innerW} ${h-padBot} L ${padX} ${h-padBot} Z`;
  const dots=pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2" fill="var(--surface-card)" stroke="var(--module-2)" stroke-width="2"/>`).join('');
  return `<svg class="trend-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--module-2)" stop-opacity=".22"/><stop offset="1" stop-color="var(--module-2)" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#tg)"/><path d="${line}" fill="none" stroke="var(--module-2)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
}

/* ---------- HOME (Bento 复杂仪表盘) ---------- */
function grp(zh,en){ return `<div class="sec-grp"><span class="bar"></span><span class="zh">${zh}</span><span class="en">${en}</span><span class="line"></span></div>`; }

/* 今日聚焦：跨模块置顶任务（就地交互，不跳转） */
/* ---------- PLAN CENTER: three-mode planning AI foundation ---------- */
function plannerGoalList(){
  const p=data.__planner||{};
  const stored=Array.isArray(p.goals)?p.goals:[];
  if(stored.length) return stored.filter(x=>x&&x.status!=="archived");
  if(p.goal) return [{...p.goal,draft:p.draft||null}];
  return [];
}
function plannerCurrentGoalId(){
  const p=data.__planner||{};
  return p.currentGoalId||p.goal?.id||plannerGoalList()[0]?.id||"";
}
function plannerSaveGoalRecord(d,status){
  if(!d?.goal?.id) return;
  const p=data.__planner||{};
  const previous=plannerGoalList().filter(x=>String(x.id)!==String(d.goal.id));
  const record={...d.goal,status:status||d.status||"active",progress:d.goal.progress||0,updatedAt:new Date().toISOString(),draft:structuredClone({...d,status:d.status||"draft"})};
  data.__planner={...p,goals:[record,...previous],currentGoalId:d.goal.id,goal:d.goal,milestones:d.milestones,deliverables:d.deliverables};
}
function plannerState(){
  const p=data.__planner||{};
  const goals=plannerGoalList();
  const currentId=p.currentGoalId||p.goal?.id||goals[0]?.id||"";
  const current=goals.find(x=>String(x.id)===String(currentId));
  return {
    mode:p.mode||"simple",
    goals,
    currentGoalId:currentId,
    draft:p.draft||current?.draft||null,
    snapshots:Array.isArray(p.snapshots)?p.snapshots:[],
    permissions:{
      readTasks:p.permissions?.readTasks!==false,
      readSchedule:p.permissions?.readSchedule!==false,
      writeTasks:p.permissions?.writeTasks===true,
      writeSchedule:p.permissions?.writeSchedule===true,
      writeCourses:p.permissions?.writeCourses===true,
      writeFinance:p.permissions?.writeFinance===true,
      writeNotes:p.permissions?.writeNotes===true,
      deleteData:p.permissions?.deleteData===true
    }
  };
}
function plannerSelectGoal(id){
  const p=data.__planner||{};
  const goal=plannerGoalList().find(x=>String(x.id)===String(id));
  if(!goal) return false;
  data.__planner={...p,currentGoalId:goal.id,goal, milestones:goal.draft?.milestones||p.milestones||[],deliverables:goal.draft?.deliverables||p.deliverables||[],draft:goal.draft||null};
  store.save();
  renderPlanner();
  return true;
}
function plannerArchiveGoal(id){
  const p=data.__planner||{};
  const goals=plannerGoalList().map(x=>String(x.id)===String(id)?{...x,status:"archived",archivedAt:new Date().toISOString()}:x);
  const next=goals.find(x=>x.status!=="archived");
  data.__planner={...p,goals,currentGoalId:next?.id||"",goal:next||null,draft:next?.draft||null};
  store.save();
  renderPlanner();
}
function plannerRecalculateDraft(d){
  if(!d) return null;
  const taskDrafts=(d.tasks||[]).map(t=>({...t,estimatedMinutes:Math.max(15,Number(t.estimatedMinutes)||30)}));
  const protectedBlocks=(d.scheduleBlocks||[]).filter(b=>b&&!b.deleted&&(b.locked||b.manual)).map(b=>({...b,manual:!!b.manual,locked:!!b.locked}));
  const schedule=plannerBuildSchedule(taskDrafts,d.startDate||isoToday(),d.deadline||"",d.availableMinutes||plannerParseMinutes(d.available||""),protectedBlocks);
  const tasks=taskDrafts.map((t,index)=>({...d.tasks[index],estimatedMinutes:t.estimatedMinutes,dueDate:t.dueDate||d.deadline||"",scheduleBlockIds:schedule.blocks.filter(b=>b.taskIndex===index).map(b=>b.id)}));
  schedule.blocks.forEach(b=>{ b.taskId=tasks[b.taskIndex]?.id||""; b.goalId=d.goal?.id||""; b.milestoneId=tasks[b.taskIndex]?.milestoneId||d.milestones?.[0]?.id||""; b.deliverableId=tasks[b.taskIndex]?.deliverableId||d.deliverables?.[0]?.id||""; b.status=tasks[b.taskIndex]?.status||"pending"; });
  const totalMinutes=tasks.reduce((sum,t)=>sum+(Number(t.estimatedMinutes)||0),0);
  const availableDays=d.deadline&&d.startDate<=d.deadline?Math.floor((new Date(`${d.deadline}T12:00:00`)-new Date(`${d.startDate}T12:00:00`))/86400000)+1:1;
  const capacityMinutes=Math.max(0,availableDays*(d.availableMinutes||plannerParseMinutes(d.available||"")));
  return {...d,tasks,scheduleBlocks:schedule.blocks,conflicts:schedule.conflicts,unscheduledTasks:schedule.unscheduledTasks,scheduledMinutes:schedule.scheduledMinutes,remainingMinutes:schedule.remainingMinutes,isFeasible:schedule.isFeasible,totalMinutes,capacityMinutes,availableDays,status:"draft",updatedAt:new Date().toISOString()};
}
function plannerUpdateDraftTask(index,field,value){
  const p=data.__planner||{}; if(!p.draft?.tasks?.[index]) return;
  const draft=structuredClone(p.draft); const task=draft.tasks[index];
  if(field==="estimatedMinutes") task[field]=Math.max(15,Number(value)||15);
  else if(field==="priority") task[field]=["P0","P1","P2","P3"].includes(value)?value:"P1";
  else task[field]=String(value||"").trim();
  const next=plannerRecalculateDraft(draft);
  data.__planner={...data.__planner,draft:next};
  plannerSaveGoalRecord(next,"active");
  data.__planner.draft=next;
  store.save();
  renderPlanner();
}
function plannerHierarchyHTML(d){
  if(!d) return "";
  const goal=d.goal||{}; const milestone=d.milestones?.[0]||{}; const deliverable=d.deliverables?.[0]||{};
  return `<div class="planner-hierarchy"><div class="planner-tree-node planner-tree-goal"><span>目标</span><b>${esc(goal.title||d.title||"未命名目标")}</b><small>${goal.progress||0}% · ${esc(goal.deadline||d.deadline||"未设置")}</small></div><div class="planner-tree-line"></div><div class="planner-tree-node"><span>里程碑</span><b>${esc(milestone.title||"未设置")}</b><small>${milestone.progress||0}% · ${esc(milestone.status||"pending")}</small></div><div class="planner-tree-line"></div><div class="planner-tree-node"><span>交付物</span><b>${esc(deliverable.title||"未设置")}</b><small>${esc(deliverable.dueDate||d.deadline||"未设置")} · ${esc(deliverable.status||"pending")}</small></div></div>`;
}
function plannerModeLabel(mode){ return mode==="professional"?"专业模式":mode==="smart"?"智能模式":"简易模式"; }
function plannerUid(prefix){ return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
function plannerParseMinutes(value){
  const text=String(value||"").trim().toLowerCase();
  if(!text) return 120;
  const hours=text.match(/(\\d+(?:\\.\\d+)?)\\s*(?:小时|小時|h|hr|hours?)/);
  const minutes=text.match(/(\\d+)\\s*(?:分钟|分鐘|min|mins?)/);
  if(hours) return Math.max(15,Math.round(Number(hours[1])*60));
  if(minutes) return Math.max(15,Number(minutes[1]));
  const numeric=Number(text.replace(/[^0-9.]/g,""));
  return Number.isFinite(numeric)&&numeric>0?Math.max(15,Math.round(numeric*60)):120;
}
function plannerDateAdd(date,days){ const d=new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return localDateStr(d); }
function plannerWeekday(date){ return ["周日","周一","周二","周三","周四","周五","周六"][new Date(`${date}T12:00:00`).getDay()]; }
function plannerTimeMinutes(value){ const m=String(value||"").match(/^(\\d{1,2}):(\\d{2})$/); return m?Number(m[1])*60+Number(m[2]):-1; }
function plannerTimeText(minutes){ const m=Math.max(0,Math.min(23*60+59,minutes)); return `${pad2(Math.floor(m/60))}:${pad2(m%60)}`; }
function plannerExistingBlocks(date){
  const blocks=(data.schedule||[]).filter(x=>x.date===date).map(x=>({start:plannerTimeMinutes(x.startTime),end:plannerTimeMinutes(x.endTime),title:x.title||"已有日程",source:"日程"}));
  const weekday=plannerWeekday(date);
  const currentWeek=getTermWeekNumberForDate(date);
  (data.timetable||[]).filter(x=>x.dayOfWeek===weekday&&isClassActiveInWeek(x,currentWeek)).forEach(x=>blocks.push({start:plannerTimeMinutes(x.startTime),end:plannerTimeMinutes(x.endTime),title:x.courseName||x.title||"课程",source:"课程"}));
  return blocks.filter(x=>x.start>=0&&x.end>x.start);
}
function plannerBuildSchedule(tasks,startDate,deadline,availableMinutes,protectedBlocks=[]){
  const blocks=protectedBlocks.filter(b=>b.date&&plannerTimeMinutes(b.startTime)>=0&&plannerTimeMinutes(b.endTime)>plannerTimeMinutes(b.startTime)).map(b=>({...b})); const conflicts=[]; const dayMinutes=Math.max(15,availableMinutes||120);
  let taskIndex=0, cursorDate=startDate, days=0;
  while(taskIndex<tasks.length && days<370){
    if(deadline && cursorDate>deadline) break;
    const existing=plannerExistingBlocks(cursorDate).concat(blocks.filter(x=>x.date===cursorDate).map(x=>({start:plannerTimeMinutes(x.startTime),end:plannerTimeMinutes(x.endTime),title:x.title||"锁定时间块",source:x.locked?"锁定时间块":"手动时间块"})));
    let used=0;
    // 先使用晚间 19:00 后的可用窗口，并在课程/既有日程后顺延。
    let cursor=19*60;
    for(let guard=0;guard<48&&used<dayMinutes&&taskIndex<tasks.length;guard++){
      const task=tasks[taskIndex]; const remaining=task.estimatedMinutes-(task._scheduled||0);
      const chunk=Math.min(remaining,dayMinutes-used,60);
      if(chunk<=0){ taskIndex++; continue; }
      let start=cursor, end=start+chunk;
      const hit=existing.find(x=>start<x.end&&end>x.start);
      if(hit){ conflicts.push({date:cursorDate,task:task.title,with:hit.title,source:hit.source,type:"blocked-window"}); cursor=Math.max(cursor,hit.end); continue; }
      if(end>23*60+59){ break; }
      blocks.push({id:plannerUid("block"),date:cursorDate,startTime:plannerTimeText(start),endTime:plannerTimeText(end),title:task.title,taskIndex,estimatedMinutes:chunk});
      task._scheduled=(task._scheduled||0)+chunk; used+=chunk; cursor=end+10;
      if(task._scheduled>=task.estimatedMinutes){ task.dueDate=cursorDate; taskIndex++; }
    }
    cursorDate=plannerDateAdd(cursorDate,1); days++;
  }
  const unscheduledTasks=tasks.filter(t=>!(t._scheduled>=t.estimatedMinutes)).map(t=>({title:t.title,remainingMinutes:Math.max(0,t.estimatedMinutes-(t._scheduled||0)),taskIndex:tasks.indexOf(t)}));
  const scheduledMinutes=tasks.reduce((sum,t)=>sum+Math.min(t.estimatedMinutes,t._scheduled||0),0);
  tasks.forEach(t=>{ delete t._scheduled; });
  return {blocks,conflicts,capacityDays:days,unscheduledTasks,scheduledMinutes,remainingMinutes:unscheduledTasks.reduce((sum,t)=>sum+t.remainingMinutes,0),isFeasible:unscheduledTasks.length===0};
}
function plannerSnapshot(reason){
  const p=plannerState();
  const snapshotData=structuredClone(data);
  delete snapshotData.__planner;
  const snap={id:Date.now(),createdAt:new Date().toISOString(),reason,data:snapshotData};
  const list=[snap,...p.snapshots].slice(0,10);
  data.__planner={...(data.__planner||{}),snapshots:list};
  store.save();
  return snap;
}
function plannerBuildDraft(input){
  const title=(input.title||"").trim()||"未命名目标";
  const deadline=input.deadline||"";
  const current=(input.current||"").trim();
  const available=(input.available||"").trim();
  const mode=input.mode||"simple";
  const startDate=input.startDate||isoToday();
  const availableMinutes=plannerParseMinutes(available);
  const tasks=[
    {title:"确认最终交付清单",priority:"P0",estimatedMinutes:30,reason:"先明确完成标准，避免后续返工"},
    {title:"整理现有材料并标记缺口",priority:"P0",estimatedMinutes:60,reason:"当前进度信息需要转化为可执行清单"},
    {title:"完成主要成果初稿",priority:"P0",estimatedMinutes:120,reason:"先形成完整产出，再进行精修"},
    {title:"校对、导出并提交",priority:"P0",estimatedMinutes:60,reason:"截止前保留检查和提交缓冲"}
  ];
  const schedule=plannerBuildSchedule(tasks,startDate,deadline,availableMinutes);
  const totalMinutes=tasks.reduce((sum,t)=>sum+t.estimatedMinutes,0);
  const availableDays=deadline&&startDate<=deadline?Math.floor((new Date(`${deadline}T12:00:00`)-new Date(`${startDate}T12:00:00`))/86400000)+1:1;
  const capacityMinutes=Math.max(0,availableDays*availableMinutes);
  const scope=input.scope||"long_term";
  const goalId=plannerUid("goal");
  const milestoneId=plannerUid("milestone");
  const deliverableId=plannerUid("deliverable");
  tasks.forEach((task,index)=>{ task.id=plannerUid("task"); task.goalId=goalId; task.milestoneId=milestoneId; task.deliverableId=deliverableId; task.taskIndex=index; task.status="pending"; task.dueDate=task.dueDate||deadline||""; task.scheduleBlockIds=schedule.blocks.filter(b=>b.taskIndex===index).map(b=>b.id); });
  schedule.blocks.forEach(block=>{ block.taskId=tasks[block.taskIndex]?.id||""; block.goalId=goalId; block.milestoneId=tasks[block.taskIndex]?.milestoneId||milestoneId; block.deliverableId=tasks[block.taskIndex]?.deliverableId||deliverableId; block.status="pending"; });
  const assumptions=mode==="simple"?["未提供正式通知或模板","未提供完整交付物清单","任务时长为初步估计"]:[];
  if(capacityMinutes<totalMinutes) assumptions.push(`按每天 ${availableMinutes} 分钟计算，当前计划超出可用容量 ${totalMinutes-capacityMinutes} 分钟`);
  if(schedule.conflicts.length) assumptions.push(`发现 ${schedule.conflicts.length} 个课程或已有日程阻塞窗口，系统已顺延安排`);
  if(schedule.unscheduledTasks.length) assumptions.push(`截止日前仍有 ${schedule.remainingMinutes} 分钟任务未排入时间块`);
  return {id:Date.now(),mode,title,deadline,current,available,startDate,scope,availableMinutes,totalMinutes,capacityMinutes,availableDays,createdAt:new Date().toISOString(),status:"draft",assumptions,tasks,scheduleBlocks:schedule.blocks,conflicts:schedule.conflicts,unscheduledTasks:schedule.unscheduledTasks,scheduledMinutes:schedule.scheduledMinutes,remainingMinutes:schedule.remainingMinutes,isFeasible:schedule.isFeasible,goal:{id:goalId,title,deadline,current,status:"active",progress:0},milestones:[{id:milestoneId,goalId,title:"完成目标交付",deadline,status:"pending",progress:0}],deliverables:[{id:deliverableId,goalId,milestoneId,title:"完成并提交最终成果",status:"pending",dueDate:deadline||""}]};
}
function plannerUpdateDraftBlock(index, action, value){
  const p=data.__planner||{}; if(!p.draft?.scheduleBlocks?.[index]) return;
  const draft=structuredClone(p.draft); const block=draft.scheduleBlocks[index];
  if(action==="delete"){ block.deleted=true; }
  else if(action==="locked"){ block.locked=!block.locked; block.manual=true; }
  else if(action==="date"){ block.date=value; block.manual=true; }
  else if(action==="startTime"||action==="endTime"){ block[action]=value; block.manual=true; }
  if(block.startTime&&block.endTime&&block.endTime<=block.startTime) return toast("结束时间必须晚于开始时间");
  const next=plannerRecalculateDraft(draft); data.__planner={...data.__planner,draft:next}; plannerSaveGoalRecord(next,"active"); data.__planner.draft=next; store.save(); renderPlanner();
}
function plannerApplyDraft(){
  const p=plannerState(); const d=p.draft;
  if(!d) return toast("请先生成计划草案");
  if(d.status==="applied") return toast("该计划草案已经应用，不能重复写入");
  if(!p.permissions.writeTasks&&!p.permissions.writeSchedule) return toast("当前权限仅允许预览，请先开启写入任务或调整日程权限");
  if(d.conflicts?.length&&!confirm(`发现 ${d.conflicts.length} 个时间冲突，仍然按预览写入吗？`)) return;
  plannerSnapshot("应用计划草案前自动备份");
  const taskIds={}; const blockIds={}; const now=Date.now();
  d.tasks.forEach((t,i)=>{ taskIds[i]=plannerUid("task-record"); });
  d.scheduleBlocks?.filter(b=>b&&!b.deleted).forEach((b,i)=>{ blockIds[b.id]=plannerUid("schedule"); });
  if(p.permissions.writeTasks){
    data.todo=data.todo||[];
    d.tasks.forEach((t,i)=>data.todo.unshift({id:taskIds[i],title:t.title,priority:t.priority,done:false,status:t.status||"pending",note:`来源：${d.title}；预计 ${t.estimatedMinutes} 分钟；计划范围：${d.startDate||isoToday()} 至 ${d.deadline||"未设置"}`,plannerGoalId:d.goal?.id||d.id,plannerTaskId:t.id,goalId:d.goal?.id||d.id,milestoneId:t.milestoneId,deliverableId:t.deliverableId,planScope:d.scope,estimatedMinutes:t.estimatedMinutes,dueDate:t.dueDate||d.deadline||"",plannerReason:t.reason,scheduleBlockIds:t.scheduleBlockIds||[]}));
  }
  if(p.permissions.writeSchedule&&d.scheduleBlocks?.length){
    data.schedule=data.schedule||[];
    d.scheduleBlocks.filter(b=>b&&!b.deleted).forEach(b=>{ const scheduleId=blockIds[b.id]; const taskId=taskIds[b.taskIndex]; data.schedule.push({id:scheduleId,title:b.title,date:b.date,startTime:b.startTime,endTime:b.endTime,relatedModule:"todo",relatedItemId:taskId||"",color:"#8070b0",note:`来源：${d.title}；规划时间块`,plannerGoalId:d.goal?.id||d.id,plannerTaskId:d.tasks[b.taskIndex]?.id||"",goalId:d.goal?.id||d.id,milestoneId:d.tasks[b.taskIndex]?.milestoneId||"",deliverableId:d.tasks[b.taskIndex]?.deliverableId||"",planScope:d.scope,executionScope:"today",plannerBlockId:b.id,locked:!!b.locked,manual:!!b.manual});
      if(p.permissions.writeTasks&&taskId){ const task=data.todo.find(x=>String(x.id)===String(taskId)); if(task){ task.scheduleBlockIds=task.scheduleBlockIds||[]; task.scheduleBlockIds.push(scheduleId); } }
    });
  }
  data.__planner={...(data.__planner||{}),draft:{...d,status:"applied",appliedAt:new Date().toISOString(),taskRecordIds:Object.values(taskIds),scheduleRecordIds:Object.values(blockIds)},goal:d.goal,milestones:d.milestones,deliverables:d.deliverables};
  persist();
  const taskCount=p.permissions.writeTasks?d.tasks.length:0; const scheduleCount=p.permissions.writeSchedule?(d.scheduleBlocks||[]).length:0;
  toast(`计划已写入 ${taskCount} 项任务、${scheduleCount} 个时间块`);
}
function plannerRefreshProgress(goalId){
  const tasks=(data.todo||[]).filter(x=>String(x.plannerGoalId)===String(goalId));
  if(!tasks.length) return;
  const completed=tasks.filter(x=>x.status==="completed"||x.done).length;
  const progress=Math.round(completed/tasks.length*100);
  const p=data.__planner||{};
  if(p.goal&&String(p.goal.id)===String(goalId)) p.goal={...p.goal,progress,status:progress>=100?"completed":"active"};
  if(Array.isArray(p.milestones)) p.milestones=p.milestones.map(x=>String(x.goalId)===String(goalId)?{...x,progress,status:progress>=100?"completed":"active"}:x);
  if(p.draft&&String(p.draft.goal?.id)===String(goalId)) p.draft={...p.draft,tasks:(p.draft.tasks||[]).map(t=>{ const item=tasks.find(x=>String(x.plannerTaskId)===String(t.id)); return item?{...t,status:item.status|| (item.done?"completed":"pending")} : t; })};
  data.__planner=p;
}
function plannerDelayReasonLabel(reason){ return {time_insufficient:"时间不足",task_too_large:"任务过大",external_blocker:"外部阻塞",priority_change:"优先级变化",other:"其他"}[reason]||"未说明"; }
function plannerTaskStatus(task,status,delayReason,delayNote){
  const item=(data.todo||[]).find(x=>String(x.id)===String(task?.id)||String(x.plannerTaskId)===String(task?.plannerTaskId||task?.id));
  if(!item) return false;
  const next=["pending","in_progress","completed","deferred","cancelled"].includes(status)?status:"pending";
  if(next==="deferred"){
    item.delayReason=delayReason||item.delayReason||"other";
    item.delayReasonLabel=plannerDelayReasonLabel(item.delayReason);
    item.delayNote=String(delayNote||item.delayNote||"").trim();
    item.delayedAt=new Date().toISOString();
  } else if(next!=="deferred") { delete item.delayReason; delete item.delayReasonLabel; delete item.delayNote; }
  item.status=next; item.done=next==="completed";
  (data.schedule||[]).filter(x=>String(x.relatedItemId)===String(item.id)).forEach(block=>{ block.status=next; if(next==="completed"||next==="cancelled") block.executionNote=next==="completed"?"任务已完成":"任务已取消"; });
  let replan=null;
  if(item.plannerGoalId){ plannerRefreshProgress(item.plannerGoalId); replan=plannerReplanRemaining(item.plannerGoalId); }
  persist();
  toast(next==="completed"?"任务已完成，后续计划已更新":next==="deferred"?`任务已延期（${item.delayReasonLabel}），已尝试重排剩余时间块`:next==="cancelled"?"任务已取消，已更新关联时间块":"任务状态已更新");
  return {item,replan};
}
function plannerReplanRemaining(goalId){
  const tasks=(data.todo||[]).filter(x=>String(x.plannerGoalId)===String(goalId)&&!["completed","cancelled"].includes(x.status|| (x.done?"completed":"pending")));
  if(!tasks.length) return {blocks:[],updated:0};
  const goal=(data.__planner?.goal&&String(data.__planner.goal.id)===String(goalId))?data.__planner.goal:null;
  const taskDrafts=tasks.map((x,index)=>({title:x.title,estimatedMinutes:Math.max(15,+x.estimatedMinutes||30),taskIndex:index}));
  const existing=(data.schedule||[]).filter(x=>String(x.plannerGoalId)===String(goalId)&&x.status!=="completed"&&x.status!=="cancelled");
  const protectedBlocks=existing.filter(x=>x.locked||x.manual).map(x=>({...x,taskIndex:tasks.findIndex(t=>String(t.id)===String(x.plannerTaskId))}));
  const schedule=plannerBuildSchedule(taskDrafts,isoToday(),goal?.deadline||"",Math.max(15,plannerParseMinutes(data.__planner?.draft?.available||"")),protectedBlocks);
  let updated=0;
  const movable=existing.filter(x=>!x.locked&&!x.manual);
  schedule.blocks.filter(x=>!x.locked&&!x.manual).forEach((block,index)=>{ const target=movable[index]; if(!target) return; target.date=block.date; target.startTime=block.startTime; target.endTime=block.endTime; target.status="pending"; updated++; });
  return {blocks:schedule.blocks,updated,remainingMinutes:schedule.remainingMinutes};
}
function plannerRestoreSnapshot(id){
  const p=plannerState(); const snap=p.snapshots.find(x=>x.id==id); if(!snap) return toast("找不到备份");
  if(!confirm(`恢复“${snap.reason}”的备份？当前数据会被替换。`)) return;
  const keepPlanner=data.__planner; data=structuredClone(snap.data); data.__planner={...(data.__planner||{}),snapshots:p.snapshots,restoredAt:new Date().toISOString(),restoredFrom:id};
  if(keepPlanner?.permissions) data.__planner.permissions=keepPlanner.permissions;
  if(keepPlanner?.snapshots) data.__planner.snapshots=keepPlanner.snapshots;
  persist(); toast("已恢复备份");
}
function renderPlanner(){
  const p=plannerState(); const d=p.draft;
  const modeCards=[
    ["simple","简易模式","一句话 → 草案","信息少，默认只预览"],
    ["professional","专业模式","材料 + 约束 → 计划","适合项目和正式交付"],
    ["smart","智能模式","描述 → 追问 → 计划","AI 主动发现信息缺口"]
  ].map(([k,n,s,desc])=>`<button class="planner-mode ${p.mode===k?"active":""}" data-planner-mode="${k}"><b>${n}</b><span>${s}</span><small>${desc}</small></button>`).join("");
  const assumptionRows=d?.assumptions?.length?d.assumptions.map(x=>'<div>· '+esc(x)+'</div>').join(""):"";
  const assumptions=d?.assumptions?.length?'<div class="planner-warning"><b>当前假设</b>'+assumptionRows+'</div>':"";
  const taskRows=d?d.tasks.map((t,i)=>`<div class="planner-task"><span class="planner-task-index">${i+1}</span><div class="planner-task-main"><input class="planner-task-title" data-planner-task-field="title" data-planner-task-index="${i}" value="${attr(t.title||"")}" aria-label="任务名称"/><small>${esc(t.reason||"未填写原因")} · <input class="planner-task-minutes" type="number" min="15" step="15" data-planner-task-field="estimatedMinutes" data-planner-task-index="${i}" value="${Number(t.estimatedMinutes)||30}" aria-label="预计分钟数"/> 分钟 · ${t.status==="completed"?"已完成":t.status==="deferred"?"已延期":t.status==="cancelled"?"已取消":"待执行"}</small></div><select class="planner-task-priority" data-planner-task-field="priority" data-planner-task-index="${i}" aria-label="优先级"><option value="P0" ${t.priority==="P0"?"selected":""}>P0</option><option value="P1" ${t.priority==="P1"?"selected":""}>P1</option><option value="P2" ${t.priority==="P2"?"selected":""}>P2</option><option value="P3" ${t.priority==="P3"?"selected":""}>P3</option></select></div>`).join(""):"";
  const scheduleRows=d?.scheduleBlocks?.filter(x=>!x.deleted).length?d.scheduleBlocks.map((x,i)=>x.deleted?"":`<div class="planner-schedule-row ${x.locked?"is-locked":""} ${x.manual?"is-manual":""}"><span><input type="date" value="${attr(x.date)}" data-planner-block-field="date" data-planner-block-index="${i}"/></span><b><input type="time" value="${attr(x.startTime)}" data-planner-block-field="startTime" data-planner-block-index="${i}" step="600"/> - <input type="time" value="${attr(x.endTime)}" data-planner-block-field="endTime" data-planner-block-index="${i}" step="600"/></b><span>${esc(x.title)} <small>${x.locked?"· 已锁定":x.manual?"· 用户调整":""}</small></span><span class="planner-block-actions"><button class="btn ghost sm" data-planner-block-action="locked" data-planner-block-index="${i}">${x.locked?"解锁":"锁定"}</button><button class="btn ghost sm" data-planner-block-action="delete" data-planner-block-index="${i}">删除</button></span></div>`).join(""):"<div class=\"planner-muted\">生成后显示建议时间块</div>";
  const conflictRows=d?.conflicts?.length?`<div class="planner-warning"><b>时间冲突</b>${d.conflicts.map(x=>`<div>· ${esc(x.date)}：${esc(x.task)} 与 ${esc(x.with)}（${esc(x.source)}）重叠</div>`).join("")}</div>`:"";
  const goalRows=p.goals.map(g=>`<div class="planner-goal-row ${String(g.id)===String(p.currentGoalId)?"active":""}"><button class="planner-goal-select" data-planner-select="${attr(String(g.id))}"><span class="planner-goal-dot"></span><span><b>${esc(g.title||"未命名目标")}</b><small>${g.progress||0}% · ${esc(g.deadline||"未设置")}</small></span></button><button class="planner-goal-archive" data-planner-archive="${attr(String(g.id))}" title="归档目标">归档</button></div>`).join("");
  const draftHtml=d?`<div class="planner-draft"><div class="planner-draft-head"><div><span class="eyebrow">计划草案 · ${plannerModeLabel(d.mode)} · ${d.scope==="today"?"今日":d.scope==="short_term"?"近期":"长期"}</span><h3>${esc(d.title)}</h3></div><span class="planner-status">${d.status==="applied"?"已写入":"待确认"}</span></div><div class="planner-meta"><span>范围：${esc(d.startDate||isoToday())} 至 ${esc(d.deadline||"未设置")}</span><span>容量：${d.capacityMinutes||0} / ${d.totalMinutes||0} 分钟</span><span>已排：${d.scheduledMinutes||0} 分钟</span><span>未排：${d.remainingMinutes||0} 分钟</span><span>任务：${d.tasks.length} 项</span></div>${assumptions}${conflictRows}${plannerHierarchyHTML(d)}<div class="planner-task-list">${taskRows}</div><div class="sec-title">建议时间块</div><div class="planner-schedule-list">${scheduleRows}</div><div class="planner-actions"><button class="btn" id="planner-apply" ${d.status==="applied"?"disabled":""}>先备份，再按权限写入</button><button class="btn ghost" id="planner-discard">清除草案</button></div></div>`:'<div class="planner-empty">输入一个目标后，计划草案会先出现在这里。当前版本不会自动修改任何数据。</div>';
  const snaps=p.snapshots.slice(0,5).map(s=>`<div class="planner-snapshot"><div><b>${esc(s.reason)}</b><small>${new Date(s.createdAt).toLocaleString("zh-CN")}</small></div><button class="btn ghost sm" data-planner-restore="${s.id}">恢复</button></div>`).join("")||"<div class=\"planner-muted\">暂无特别备份</div>";
  const fileRows=(data.__planner?.files||[]).map(f=>`<div class="planner-file">${icon("upload",13)} ${esc(f.name)} <small>${Math.round((f.size||0)/1024)} KB</small></div>`).join("");
  $("#screen").innerHTML=`<div class="header"><div><h2>计划中心</h2><p>把长期目标拆到今天，但重要变更由你确认</p></div><div class="spacer"></div><span class="date-chip">${icon("calendar",14)} ${dateStr()}</span></div><div class="planner-layout"><section class="card planner-panel"><div class="sec-title" style="margin-top:0">我的目标</div><div class="planner-goals">${goalRows||'<div class="planner-muted">尚未建立目标，先填写下面的目标信息。</div>'}</div><div class="sec-title">选择规划模式</div><div class="planner-modes">${modeCards}</div><div class="sec-title">目标信息</div><div class="planner-fields"><div class="field"><label>长期目标</label><input id="planner-title" placeholder="例如：8月25日前完成三下乡项目" value="${attr(d?.title||"")}"/></div><div class="planner-row"><div class="field"><label>开始日期</label><input id="planner-start" type="date" value="${attr(d?.startDate||isoToday())}"/></div><div class="field"><label>截止时间</label><input id="planner-deadline" type="date" value="${attr(d?.deadline||"")}"/></div></div><div class="planner-row"><div class="field"><label>每天可用时间</label><input id="planner-available" placeholder="例如：每天2小时" value="${attr(d?.available||"")}"/></div><div class="field"><label>规划层级</label><select id="planner-scope"><option value="long_term" ${d?.scope==="long_term"?"selected":""}>长期目标 → 今日行动</option><option value="short_term" ${d?.scope==="short_term"?"selected":""}>近期/周计划</option><option value="today" ${d?.scope==="today"?"selected":""}>仅今日</option></select></div></div><div class="field"><label>目前进度 / 补充说明</label><textarea id="planner-current" rows="4" placeholder="已经完成什么？有哪些固定要求、材料或困难？">${esc(d?.current||"")}</textarea></div></div>${p.mode==="professional"?`<div class="sec-title">项目材料</div><div class="planner-upload"><label for="planner-files">上传通知、模板、进度、课表或证明材料</label><input id="planner-files" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,image/*"/><small>当前版本只记录本次会话的文件清单，不会伪装成已完成内容解析。</small><div id="planner-file-list">${fileRows}</div></div>`:p.mode==="smart"?`<div class="sec-title">智能追问预览</div><div class="planner-questions"><b>生成计划前，AI 将优先确认：</b><span>最终交付物和完成标准</span><span>固定安排与每天可用时间</span><span>通知、模板或评分标准</span><span>依赖他人的材料和节点</span></div>`:""}<div class="sec-title">本次会话权限</div><div class="planner-permissions"><label><input type="checkbox" id="planner-perm-tasks" ${p.permissions.writeTasks?"checked":""}/>允许写入新任务</label><label><input type="checkbox" id="planner-perm-schedule" ${p.permissions.writeSchedule?"checked":""}/>允许调整日程</label><span>默认不允许修改课程表、记账、日记或删除数据</span></div><div class="planner-permission-note">${icon("shield",15)} 当前模式：${plannerModeLabel(p.mode)} · 写入任务：${p.permissions.writeTasks?"允许":"需确认"} · 写入日程：${p.permissions.writeSchedule?"允许":"禁止"}</div><button class="btn primary planner-generate" id="planner-generate">生成计划草案</button></section><section class="planner-results"><div class="sec-title" style="margin-top:0">计划预览</div>${draftHtml}<div class="card planner-backups"><div class="planner-draft-head"><div><h3>特别备份</h3><small>高影响变更前自动创建，也可随时恢复</small></div><button class="btn ghost sm" id="planner-backup-now">立即备份</button></div>${snaps}</div></section></div>`;
  $("#screen").querySelectorAll("[data-planner-mode]").forEach(el=>el.onclick=()=>{ data.__planner={...(data.__planner||{}),mode:el.dataset.plannerMode}; store.save(); renderPlanner(); });
  $("#screen").querySelectorAll("[data-planner-select]").forEach(el=>el.onclick=()=>plannerSelectGoal(el.dataset.plannerSelect));
  $("#screen").querySelectorAll("[data-planner-archive]").forEach(el=>el.onclick=()=>{ if(confirm("归档这个目标？其历史任务和时间块不会删除。")) plannerArchiveGoal(el.dataset.plannerArchive); });
  $("#screen").querySelectorAll("[data-planner-task-field]").forEach(el=>el.onchange=()=>plannerUpdateDraftTask(Number(el.dataset.plannerTaskIndex),el.dataset.plannerTaskField,el.value));
  $("#screen").querySelectorAll("[data-planner-block-field]").forEach(el=>el.onchange=()=>plannerUpdateDraftBlock(Number(el.dataset.plannerBlockIndex),el.dataset.plannerBlockField,el.value));
  $("#screen").querySelectorAll("[data-planner-block-action]").forEach(el=>el.onclick=()=>plannerUpdateDraftBlock(Number(el.dataset.plannerBlockIndex),el.dataset.plannerBlockAction));
  const fileInput=$("#planner-files");
  if(fileInput){ fileInput.onchange=()=>{ const files=Array.from(fileInput.files||[]); data.__planner={...(data.__planner||{}),files:files.map(f=>({name:f.name,size:f.size,type:f.type,lastModified:f.lastModified}))}; store.save(); const list=$("#planner-file-list"); if(list) list.innerHTML=files.map(f=>`<div class="planner-file">${icon("upload",13)} ${esc(f.name)} <small>${Math.round(f.size/1024)} KB</small></div>`).join(""); toast(files.length?`已登记 ${files.length} 个材料文件，待生成计划时确认`:'已清空材料选择'); }; }
  $("#planner-generate").onclick=()=>{ const mode=plannerState().mode; const perms=plannerState().permissions; const draft=plannerBuildDraft({mode,title:$("#planner-title").value,startDate:$("#planner-start").value,deadline:$("#planner-deadline").value,current:$("#planner-current").value,available:$("#planner-available").value,scope:$("#planner-scope").value}); data.__planner={...(data.__planner||{}),permissions:{...perms,writeTasks:$("#planner-perm-tasks").checked,writeSchedule:$("#planner-perm-schedule").checked},draft}; plannerSaveGoalRecord(draft,"active"); data.__planner.draft=draft; store.save(); renderPlanner(); toast(mode==="smart"?"已生成追问后的本地草案，请核对缺失信息":"已生成草案，请检查假设和影响范围"); };
  const apply=$("#planner-apply"); if(apply) apply.onclick=plannerApplyDraft;
  const discard=$("#planner-discard"); if(discard) discard.onclick=()=>{ data.__planner={...(data.__planner||{}),draft:null}; store.save(); renderPlanner(); };
  $("#planner-backup-now").onclick=()=>{ plannerSnapshot("用户手动创建保护点"); renderPlanner(); toast("特别备份已创建"); };
  $("#screen").querySelectorAll("[data-planner-restore]").forEach(el=>el.onclick=()=>plannerRestoreSnapshot(el.dataset.plannerRestore));
}

function focusTileHTML(){
  const pins=[]; CONFIG.modules.forEach(m=>(data[m.key]||[]).forEach(x=>{ if(x.pinned) pins.push({m,x}); }));
  const chk=icon("check",13,2.6);
  const sub=(m,x)=>{
    if(m.type==="checkin") return `${m.name} · 连续 ${streak(x.log)} 天`;
    if(m.type==="progress"){ const p=Math.min(100,Math.round((x.current/x.target)*100||0)); return `${m.name} · ${x.current}/${x.target} ${x.unit||m.unit||''} · ${p}%`; }
    return m.name;
  };
  const ctl=(m,x)=>{
    if(m.type==="checkin"){ const on=!!(x.log&&x.log[today()]); return `<div class="pin-chk js-pin-chk ${on?'on':''}" data-mkey="${m.key}" data-id="${x.id}">${chk}</div>`; }
    if(m.type==="todo"){ return `<div class="pin-chk js-pin-chk ${x.done?'on':''}" data-mkey="${m.key}" data-id="${x.id}">${chk}</div>`; }
    if(m.type==="progress"){ return `<div class="pin-step"><button class="js-pin-dec" data-mkey="${m.key}" data-id="${x.id}">−</button><button class="js-pin-inc" data-mkey="${m.key}" data-id="${x.id}">+</button></div>`; }
    return `<span style="color:var(--text-tertiary)">${icon("chevron",16,2)}</span>`;
  };
  const rows = pins.length ? pins.map(({m,x})=>`<div class="focus-row">
      <span class="fic" style="color:${m.color}">${icon(m.icon,16)}</span>
      <div class="ft js-pin-open" data-mkey="${m.key}" data-id="${x.id}"><div class="fn ${((m.type==='todo'||m.type==='projects')&&x.done)?'done':''}">${esc(x.title)}</div><div class="fm">${sub(m,x)}</div></div>
      ${ctl(m,x)}</div>`).join("")
    : `<div class="focus-empty">在任意模块点击 <span style="display:inline-flex;color:var(--module-3);vertical-align:-2px">${icon("star",13)}</span> 即可把要事置顶到这里。</div>`;
  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("star",16)}</span><div class="tt"><span class="en">TODAY'S FOCUS</span><span class="zh">今日聚焦</span></div><span class="r">${pins.length} 项</span></div>
    <div class="focus-list">${rows}</div></div>`;
}

/* 快速记录 */
function quickTileHTML(){
  const quick = CONFIG.quickAdd.map(q=>`<button class="qbtn" data-quick="${q.module}"><span class="e" style="background:${q.tint};color:${q.color}">${icon(q.icon,20)}<i class="qplus">${icon("plus",10,3)}</i></span><span class="l">${q.label}</span></button>`).join("");
  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("plus",16,2.2)}</span><div class="tt"><span class="en">QUICK ADD</span><span class="zh">快速记录</span></div></div>
    <div class="quick-grid" style="flex:1;align-content:start">${quick}</div></div>`;
}

/* 课程表首页卡片 */
function timetableTileHTML(){
  const m = modOf("timetable");
  const todayClasses = getClassesForToday(data.timetable || []);
  const nextClass = getNextUpcomingClass(todayClasses);

  let content;
  if (todayClasses.length === 0) {
    content = `<div class="focus-empty">今天没有课程，好好休息吧！</div>`;
  } else if (nextClass) {
    content = `<div class="focus-list"><div class="focus-row">
      <span class="fic" style="color:${m.color}">${icon("calendar-days",16)}</span>
      <div class="ft"><div class="fn">下一节：${esc(nextClass.courseName)}</div><div class="fm">${esc(nextClass.startTime)} - ${esc(nextClass.endTime)} @ ${esc(nextClass.location)}</div></div>
      <span style="color:var(--text-tertiary)">${icon("chevron",16,2)}</span>
    </div>
    <div class="focus-empty" style="padding-top:10px;">今天还有 ${todayClasses.length - todayClasses.indexOf(nextClass) -1} 节课</div></div>`;
  } else {
    content = `<div class="focus-empty">今天的课程已全部结束</div>`;
  }

  return `<div class="tile b12"><div class="tile-h"><span class="tic">${icon("calendar-days",16)}</span><div class="tt"><span class="en">TODAY'S CLASSES</span><span class="zh">今日课程</span></div><span class="r js-open" data-open="timetable">查看全部</span></div>
    ${content}</div>`;
}
/* 今日执行面板：把计划时间块转换为可执行的当日队列 */
function executionTasksForToday(){
  const today=isoToday();
  return (data.todo||[]).filter(x=>x.plannerGoalId&&!['completed','cancelled'].includes(x.status|| (x.done?'completed':'pending')) && (!x.dueDate||x.dueDate<=today));
}
function executionTodayBlocks(){
  return scheduleEventsForDate(isoToday()).filter(x=>x.source==='schedule'&&x.plannerGoalId).sort((a,b)=>plannerTimeMinutes(a.startTime)-plannerTimeMinutes(b.startTime));
}
function executionStatusLabel(status){ return {pending:'待执行',in_progress:'进行中',completed:'已完成',deferred:'已延期',cancelled:'已取消'}[status]||'待执行'; }
function executionStatusOptions(current){ return ['pending','in_progress','completed','deferred'].map(s=>`<option value="${s}" ${current===s?'selected':''}>${executionStatusLabel(s)}</option>`).join(''); }
function executionDelayEditor(task){
  if(!task||task.status!=="deferred") return '';
  return `<div class="execution-delay-editor"><label>延期原因<select data-execution-delay-field="reason" data-execution-task-id="${attr(String(task.id))}"><option value="time_insufficient" ${task.delayReason==='time_insufficient'?'selected':''}>时间不足</option><option value="task_too_large" ${task.delayReason==='task_too_large'?'selected':''}>任务过大</option><option value="external_blocker" ${task.delayReason==='external_blocker'?'selected':''}>外部阻塞</option><option value="priority_change" ${task.delayReason==='priority_change'?'selected':''}>优先级变化</option><option value="other" ${!task.delayReason||task.delayReason==='other'?'selected':''}>其他</option></select></label><label>说明<textarea rows="2" data-execution-delay-field="note" data-execution-task-id="${attr(String(task.id))}" placeholder="记录延期原因和处理建议">${esc(task.delayNote||'')}</textarea></label></div>`;
}
function executionUpdateDelay(taskId,field,value){ const task=(data.todo||[]).find(x=>String(x.id)===String(taskId)); if(!task) return; if(field==='reason'){ task.delayReason=value; task.delayReasonLabel=plannerDelayReasonLabel(value); } else task.delayNote=String(value||'').trim(); task.delayedAt=task.delayedAt||new Date().toISOString(); persist(); renderExecution(); }
function executionBlockTask(block){ return (data.todo||[]).find(t=>String(t.id)===String(block.relatedItemId)||String(t.plannerTaskId)===String(block.plannerTaskId)); }
function executionUpdateResult(taskId,field,value){
  const task=(data.todo||[]).find(x=>String(x.id)===String(taskId)); if(!task) return;
  task.executionResult=task.executionResult||{}; task.executionResult[field]=field==='actualMinutes'?Math.max(0,Number(value)||0):String(value||'').trim(); task.executionUpdatedAt=new Date().toISOString();
  if(field==='actualStart'&&task.executionResult.actualStart&&!task.executionResult.actualEnd){ task.executionResult.actualEnd=''; }
  persist(); renderExecution();
}
function executionResultEditor(task){
  if(!task) return '';
  const r=task.executionResult||{};
  return `<div class="execution-result-editor"><div class="execution-result-title">执行结果记录</div><div class="execution-result-fields"><label>实际开始<input type="datetime-local" data-execution-result="actualStart" data-execution-task-id="${attr(String(task.id))}" value="${attr(r.actualStart||'')}"/></label><label>实际完成<input type="datetime-local" data-execution-result="actualEnd" data-execution-task-id="${attr(String(task.id))}" value="${attr(r.actualEnd||'')}"/></label><label>实际用时<input type="number" min="0" step="5" placeholder="分钟" data-execution-result="actualMinutes" data-execution-task-id="${attr(String(task.id))}" value="${attr(r.actualMinutes??'')}"/></label></div><label class="execution-result-wide">完成结果<textarea rows="2" data-execution-result="result" data-execution-task-id="${attr(String(task.id))}" placeholder="完成了什么？产出了什么？">${esc(r.result||'')}</textarea></label><label class="execution-result-wide">问题与下一步<textarea rows="2" data-execution-result="nextStep" data-execution-task-id="${attr(String(task.id))}" placeholder="遇到什么问题？下一步准备做什么？">${esc(r.nextStep||'')}</textarea></label></div>`;
}
function plannerAITodayAnalysis(){
  const today=isoToday();
  const statusOf=t=>t.status||(t.done?'completed':'pending');
  const tasks=(data.todo||[]).filter(t=>t.plannerGoalId&&!['completed','cancelled'].includes(statusOf(t)));
  const blocks=executionTodayBlocks();
  const priority={P0:30,P1:20,P2:10,P3:4};
  const scored=tasks.map(t=>{
    const reasons=[]; let score=priority[t.priority]||8;
    if(t.dueDate&&t.dueDate<today){ score+=35; reasons.push(`已逾期（${t.dueDate}）`); }
    else if(t.dueDate===today){ score+=28; reasons.push('今天截止'); }
    if(statusOf(t)==='deferred'){ score+=12; reasons.push(`曾延期：${t.delayReasonLabel||plannerDelayReasonLabel(t.delayReason)}`); }
    if(t.blockedBy||t.delayReason==='external_blocker'||statusOf(t)==='blocked'){ score+=10; reasons.push('存在外部阻塞'); }
    const block=blocks.find(b=>String(b.relatedItemId)===String(t.id)||String(b.plannerTaskId)===String(t.plannerTaskId));
    if(block&&plannerTimeMinutes(block.startTime)<=new Date().getHours()*60+new Date().getMinutes()&&plannerTimeMinutes(block.endTime)>new Date().getHours()*60+new Date().getMinutes()){ score+=8; reasons.push('当前时间块正在进行'); }
    if(!reasons.length) reasons.push(t.priority?`优先级 ${t.priority}`:'属于当前规划任务');
    return {taskId:t.id,title:t.title||'未命名任务',level:score>=45?'高':score>=25?'中':'低',score,reason:reasons.slice(0,2).join('；'),nextAction:t.nextAction||`开始：${t.title||'未命名任务'}`};
  }).sort((a,b)=>b.score-a.score).slice(0,5);
  const risks=[];
  const overdue=tasks.filter(t=>t.dueDate&&t.dueDate<today);
  const deferred=tasks.filter(t=>statusOf(t)==='deferred');
  const blocked=tasks.filter(t=>t.blockedBy||t.delayReason==='external_blocker'||statusOf(t)==='blocked');
  if(overdue.length) risks.push(`有 ${overdue.length} 项任务已逾期且尚未完成`);
  if(deferred.length) risks.push(`有 ${deferred.length} 项任务处于延期状态`);
  if(blocked.length) risks.push(`有 ${blocked.length} 项任务可能受到外部阻塞`);
  const summary=scored[0]?`建议先处理“${scored[0].title}”，因为${scored[0].reason}`:'当前没有足够的未完成规划任务，适合先补充或确认今日计划';
  return {summary,priorities:scored,risks,suggestions:scored.slice(0,3).map(x=>({taskId:x.taskId,title:x.nextAction,reason:x.reason})),confidence:0.62,generatedAt:new Date().toISOString(),source:'local-preview'};
}
async function plannerAIAnalyzeToday(){
  const cfg=getAIConfig();
  if(!cfg.endpoint||!cfg.model){
    const analysis=plannerAITodayAnalysis();
    data.__planner={...(data.__planner||{}),aiToday:{analysis,decisions:data.__planner?.aiToday?.decisions||{}}};
    persist(); renderExecution(); toast('未配置真实 AI，已生成本地判断预览');
    return;
  }
  const btn=$("#execution-ai-analyze"); if(btn){ btn.disabled=true; btn.textContent='正在分析…'; }
  try{
    const prompt=`你是个人工作台的判断助手。请只返回严格 JSON，不要 Markdown，不要额外说明。JSON 结构必须为：{"summary":"简短总结","priorities":[{"taskId":"任务ID","title":"任务标题","level":"高/中/低","reason":"判断原因","nextAction":"具体下一步"}],"risks":["风险"],"suggestions":[{"taskId":"任务ID","title":"建议","reason":"原因"}],"confidence":0到1之间的数字}。你只能分析和提出建议，不能要求系统自动修改计划。以下是完整工作台数据：${JSON.stringify(aiWorkspacePayload())}`;
    const messages=[{role:"system",content:"你是一个严谨、可解释、只提供建议的个人计划判断助手。必须只输出合法 JSON。"},{role:"user",content:prompt}];
    let response;
    try{
      response=await aiBridgeRequest(cfg,messages,{responseFormat:{type:"json_object"}});
    }catch(firstError){
      response=await aiBridgeRequest(cfg,messages);
    }
    let analysis;
    try{ analysis=parseAIAnalysis(response); }
    catch(parseError){
      const rawText=aiResponseText(response);
      if(!rawText) throw parseError;
      const repairPrompt=`请将下面的 AI 分析内容整理为严格 JSON。不要重新分析，不要补充新判断，只做格式转换。只返回 JSON，不要 Markdown。固定格式：{"summary":"简短总结","priorities":[{"taskId":"任务ID","title":"任务标题","level":"高/中/低","reason":"判断原因","nextAction":"具体下一步"}],"risks":["风险"],"suggestions":[{"taskId":"任务ID","title":"建议","reason":"原因"}],"confidence":0到1之间的数字}。原始内容：${rawText}`;
      const repaired=await aiBridgeRequest(cfg,[{role:"system",content:"你只负责将文本整理为指定 JSON，不负责重新判断。"},{role:"user",content:repairPrompt}],{responseFormat:{type:"json_object"}}).catch(()=>aiBridgeRequest(cfg,[{role:"system",content:"你只负责将文本整理为指定 JSON，不负责重新判断。"},{role:"user",content:repairPrompt}]));
      analysis=parseAIAnalysis(repaired);
    }
    data.__planner={...(data.__planner||{}),aiToday:{analysis,decisions:data.__planner?.aiToday?.decisions||{}}};
    persist(); renderExecution(); toast('已生成真实 AI 判断');
  }catch(err){
    const analysis=plannerAITodayAnalysis(); analysis.source='local-fallback'; analysis.fallbackReason=err.message;
    data.__planner={...(data.__planner||{}),aiToday:{analysis,decisions:data.__planner?.aiToday?.decisions||{}}};
    persist(); renderExecution(); toast(`AI 接口失败，已使用本地判断：${err.message}`);
  }
}
function plannerAIDecide(taskId,decision){
  const ai=data.__planner?.aiToday; if(!ai?.analysis) return;
  data.__planner={...(data.__planner||{}),aiToday:{...ai,decisions:{...(ai.decisions||{}),[String(taskId)]:{decision,at:new Date().toISOString()}}}};
  persist(); renderExecution(); toast(decision==='accept'?'已采纳这条判断（未修改计划）':'已忽略这条判断');
}
function executionAIHTML(){
  const ai=data.__planner?.aiToday;
  if(!ai?.analysis) return `<section class="card execution-ai"><div class="execution-ai-head"><div><span class="eyebrow">AI TODAY REVIEW</span><h3>AI 今日判断</h3><p>先分析现有事实，再由你决定是否采纳。不会自动修改任务或时间块。</p></div><button class="btn" id="execution-ai-analyze">分析今日</button></div><div class="execution-ai-empty">点击“分析今日”，查看优先级、风险和下一步建议。</div></section>`;
  const analysis=ai.analysis; const decisions=ai.decisions||{};
  const rows=(analysis.priorities||[]).map(item=>{ const decision=decisions[String(item.taskId)]?.decision; return `<div class="execution-ai-row"><div class="execution-ai-rank">${item.level}</div><div class="execution-ai-main"><b>${esc(item.title)}</b><small>${esc(item.reason)}</small><span>下一步：${esc(item.nextAction)}</span></div><div class="execution-ai-actions">${decision?`<em>${decision==='accept'?'已采纳':'已忽略'}</em>`:`<button class="btn ghost sm" data-ai-decision="accept" data-ai-task-id="${attr(String(item.taskId))}">采纳</button><button class="btn ghost sm" data-ai-decision="ignore" data-ai-task-id="${attr(String(item.taskId))}">忽略</button>`}</div></div>`; }).join('')||'<div class="execution-ai-empty">当前没有可判断的未完成规划任务。</div>';
  const risks=analysis.risks?.length?`<div class="execution-ai-risks"><b>需要留意</b>${analysis.risks.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<div class="execution-ai-risks is-clear"><b>风险概览</b><span>目前没有识别到明显执行风险。</span></div>';
  const sourceLabel=analysis.source==='api'?'真实 AI 分析':analysis.source==='local-fallback'?'接口失败后本地兜底':'本地判断预览';
  return `<section class="card execution-ai"><div class="execution-ai-head"><div><span class="eyebrow">AI TODAY REVIEW · ${esc(new Date(analysis.generatedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}))}</span><h3>AI 今日判断</h3><p>${esc(analysis.summary)}</p></div><button class="btn ghost" id="execution-ai-analyze">重新分析</button></div><div class="execution-ai-list">${rows}</div>${risks}<div class="execution-ai-note">本次来源：${sourceLabel}。采纳只记录你的决定，不会自动重排计划。${analysis.fallbackReason?` 兜底原因：${esc(analysis.fallbackReason)}`:''}</div></section>`;
}
function executionPanelHTML(){
  const today=isoToday(), now=new Date(), currentMinutes=now.getHours()*60+now.getMinutes();
  const blocks=executionTodayBlocks();
  const activeBlock=blocks.find(x=>plannerTimeMinutes(x.startTime)<=currentMinutes&&currentMinutes<plannerTimeMinutes(x.endTime));
  const nextBlock=blocks.find(x=>plannerTimeMinutes(x.startTime)>currentMinutes);
  const tasks=executionTasksForToday();
  const plannerTasks=(data.todo||[]).filter(x=>x.plannerGoalId);
  const taskStatus=x=>x.status||(x.done?'completed':'pending');
  const overdue=plannerTasks.filter(x=>x.dueDate&&x.dueDate<today&&!['completed','cancelled'].includes(taskStatus(x)));
  const overdueCompleted=plannerTasks.filter(x=>x.dueDate&&x.dueDate<today&&['completed','cancelled'].includes(taskStatus(x)));
  const deferred=plannerTasks.filter(x=>taskStatus(x)==='deferred');
  const blocked=plannerTasks.filter(x=>!['completed','cancelled'].includes(taskStatus(x))&&(taskStatus(x)==='blocked'||x.blockedBy||x.delayReason==='external_blocker'));
  const done=blocks.filter(b=>executionBlockTask(b)?.status==='completed'||b.status==='completed').length;
  const queue=tasks.slice().sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999'))).slice(0,8);
  const blockRows=blocks.length?blocks.map(b=>{ const task=executionBlockTask(b); const status=task?.status||b.status||'pending'; return `<div class="execution-block ${activeBlock&&String(activeBlock.id)===String(b.id)?'is-current':''}"><div class="execution-block-time">${esc(b.startTime)}<small>${esc(b.endTime)}</small></div><div class="execution-block-main"><b>${esc(b.title||'未命名时间块')}</b><small>${task?`待办：${esc(task.title)}`:'规划时间块'}${b.locked?' · 已锁定':''}${b.manual?' · 用户调整':''}</small></div><select class="execution-status" data-execution-task="${attr(String(task?.id||''))}" data-execution-block="${attr(String(b.id||''))}">${executionStatusOptions(status)}</select>${task?`<details class="execution-result-details"><summary>记录结果</summary>${executionResultEditor(task)}</details>`:''}</div>`; }).join(''):'<div class="planner-muted">今天还没有已落地的规划时间块。</div>';
  const taskRows=queue.length?queue.map(t=>`<div class="execution-task"><div class="execution-task-main"><b>${esc(t.title||'未命名待办')}</b><small>${t.dueDate?`截止 ${esc(t.dueDate)}`:'未设置截止日期'} · ${Number(t.estimatedMinutes)||0} 分钟${t.priority?` · ${esc(t.priority)}`:''}${t.status==='deferred'?` · 延期：${esc(t.delayReasonLabel||plannerDelayReasonLabel(t.delayReason))}`:''}</small>${executionDelayEditor(t)}</div><select class="execution-status" data-execution-task="${attr(String(t.id))}">${executionStatusOptions(t.status|| (t.done?'completed':'pending'))}</select></div>`).join(''):'<div class="planner-muted">今天没有待执行的规划待办。</div>';
  const alertItems=[...overdue.map(t=>`<span>逾期未完成：${esc(t.title)} · ${esc(t.dueDate)}</span>`),...deferred.map(t=>`<span>主动延期：${esc(t.title)}</span>`),...blocked.filter(t=>!deferred.includes(t)).map(t=>`<span>外部阻塞：${esc(t.title)}</span>`),...(!overdue.length&&overdueCompleted.length?['<span>已逾期任务均已完成</span>']:[])];
  const aiReview=MOBILE?"":executionAIHTML();
  return `<div class="execution-panel"><div class="execution-hero"><div><span class="eyebrow">TODAY EXECUTION · ${esc(today)}</span><h2>今日执行</h2><p>${activeBlock?`当前时间块：${esc(activeBlock.title)}`:nextBlock?`下一步：${esc(nextBlock.title)}`:'今天暂无进行中的时间块'}</p></div><div class="execution-stats"><span><b>${blocks.length}</b><small>时间块</small></span><span><b>${done}/${blocks.length||0}</b><small>已完成</small></span><span><b>${overdue.length}</b><small>逾期未完成</small></span><span><b>${blocked.length}</b><small>阻塞</small></span></div></div>${aiReview}<div class="execution-grid"><section class="card execution-card"><div class="sec-title" style="margin-top:0">今日时间块</div>${blockRows}</section><section class="card execution-card"><div class="sec-title" style="margin-top:0">行动队列</div>${taskRows}</section></div><section class="card execution-alert"><div><b>执行异常</b><span>系统已根据截止日期和任务状态整理，具体处理建议可由 AI 分析后提供。</span></div><div class="execution-alert-items">${alertItems.length?alertItems.join(''):'<span>当前没有需要立即处理的异常</span>'}</div></section></div>`;
}
function renderExecution(){
  $("#screen").innerHTML=`<div class="header"><div><h2>今日执行</h2><p>按时间块行动，记录状态，及时处理偏差</p></div><div class="spacer"></div><span class="date-chip">${icon('calendar',14)} ${dateStr()}</span></div>${executionPanelHTML()}`;
  $("#screen").querySelectorAll('[data-execution-task]').forEach(el=>el.onchange=()=>{ const task=(data.todo||[]).find(x=>String(x.id)===String(el.dataset.executionTask)); if(task) plannerTaskStatus(task,el.value); else { const block=(data.schedule||[]).find(x=>String(x.id)===String(el.dataset.executionBlock)); if(block){ block.status=el.value; persist(); renderExecution(); } } });
  $("#screen").querySelectorAll('[data-execution-result]').forEach(el=>el.onchange=()=>executionUpdateResult(el.dataset.executionTaskId,el.dataset.executionResult,el.value));
  $("#screen").querySelectorAll('[data-execution-delay-field]').forEach(el=>el.onchange=()=>executionUpdateDelay(el.dataset.executionTaskId,el.dataset.executionDelayField,el.value));
  const aiAnalyze=$("#execution-ai-analyze"); if(aiAnalyze) aiAnalyze.onclick=()=>{ plannerAIAnalyzeToday(); };
  $("#screen").querySelectorAll('[data-ai-decision]').forEach(el=>el.onclick=()=>plannerAIDecide(el.dataset.aiTaskId,el.dataset.aiDecision));
}
/* 日程管理首页卡片 */
function plannerNextAction(){
  const candidates=(data.todo||[]).filter(x=>x.plannerGoalId&&x.status!=="completed"&&x.status!=="cancelled"&&!x.done);
  if(!candidates.length) return null;
  return candidates.slice().sort((a,b)=>{
    const priority={P0:0,P1:1,P2:2,P3:3};
    const pa=priority[a.priority]??9, pb=priority[b.priority]??9;
    if(pa!==pb) return pa-pb;
    return String(a.dueDate||"9999-12-31").localeCompare(String(b.dueDate||"9999-12-31"));
  })[0];
}
function plannerNextActionTileHTML(){
  const next=plannerNextAction();
  if(!next) return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("target",16)}</span><div class="tt"><span class="en">NEXT PLANNED ACTION</span><span class="zh">规划下一步</span></div></div><div class="focus-empty">当前没有已落地的规划任务</div></div>`;
  const reason=next.plannerReason||"按优先级和截止日期排序";
  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("target",16)}</span><div class="tt"><span class="en">NEXT PLANNED ACTION</span><span class="zh">规划下一步</span></div><span class="r">${esc(next.priority||"P1")}</span></div><div class="focus-list"><div class="focus-row js-pin-open" data-mkey="todo" data-id="${next.id}"><span class="fic" style="color:var(--accent)">${icon("arrow-right",16)}</span><div class="ft"><div class="fn">${esc(next.title)}</div><div class="fm">${esc(reason)} · ${next.estimatedMinutes||0} 分钟</div></div></div></div></div>`;
}
/* 日程管理首页卡片 */
function scheduleTileHTML() {
    const m = modOf("schedule");
    const today = isoToday();
    const todayEvents = scheduleEventsForDate(today)
        .sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentEvent = todayEvents.find(event => plannerTimeMinutes(event.startTime)<=currentTime&&currentTime<plannerTimeMinutes(event.endTime));
    const nextEvent = currentEvent || todayEvents.find(event => plannerTimeMinutes(event.startTime)>currentTime);

    let content;
    if (todayEvents.length === 0) {
        content = `<div class="focus-empty">今日无日程，去添加吧！</div>`;
    } else if (nextEvent) {
        const eventLabel=currentEvent?`进行中：${nextEvent.title}`:`下一个：${nextEvent.title}`;
        const remainingEvents=todayEvents.filter(event=>plannerTimeMinutes(event.endTime)>currentTime).length;
        content = `<div class="focus-list">
      <div class="focus-row js-open" data-open="schedule">
        <span class="fic" style="color:${nextEvent.color || m.color}">${icon(nextEvent.source === "timetable" ? "calendar-days" : m.icon, 16)}</span>
        <div class="ft">
          <div class="fn">${esc(eventLabel)}</div>
          <div class="fm">${esc(nextEvent.startTime)} - ${esc(nextEvent.endTime)}${nextEvent.source === "timetable" ? " · 课程" : ""}</div>
        </div>
        <span style="color:var(--text-tertiary)">${icon("chevron", 16, 2)}</span>
      </div>
      <div class="focus-empty" style="padding-top:10px;">今日剩余 ${remainingEvents} 个时间项</div>
    </div>`;
    } else {
        content = `<div class="focus-empty">今日日程已全部完成</div>`;
    }

    return `<div class="tile b4">
    <div class="tile-h">
      <span class="tic">${icon("timeline", 16)}</span>
      <div class="tt"><span class="en">DAILY SCHEDULE</span><span class="zh">今日日程</span></div>
      <span class="r js-open" data-open="schedule">查看全部</span>
    </div>
    ${content}
  </div>`;
}

/* 今日概览（环形 + 深色统计侧栏，合并原「整体情况」独有指标） */
function overviewTileHTML(){
  const rings = CONFIG.overview.map(o=>{ const r=o.calc(data);
    return `<div class="ring" data-open="${o.key}"><div class="dial">${ringSVG(r.value,o.color)}<span class="mid" style="color:${o.color}">${icon(o.icon,26)}</span></div>
      <div class="pct">${r.value}%</div><div class="lbl">${o.label}</div><div class="sub">${r.sub}</div></div>`; }).join("");
  const recCount=CONFIG.modules.reduce((s,m)=>s+((data[m.key]||[]).length),0);
  const pinCount=CONFIG.modules.reduce((s,m)=>s+((data[m.key]||[]).filter(x=>x.pinned).length),0);
  const money=data.money||[];
  const inc=money.filter(x=>x.type==="income").reduce((a,x)=>a+ +x.amount,0);
  const exp=money.filter(x=>x.type==="expense").reduce((a,x)=>a+ +x.amount,0);
  const bal=inc-exp, balCol=bal>=0?"var(--module-1)":"var(--danger)";
  return `<div class="tile b12"><div class="tile-h"><span class="tic">${icon("target",16)}</span><div class="tt"><span class="en">DAILY VITALS</span><span class="zh">今日概览</span></div><span class="r">${dateStr()}</span></div>
    <div class="ov2-body">
      <div class="rings">${rings}</div>
      <div class="ov2-side">
        <div class="ov2-stat" data-open="note"><span class="s-ic" style="color:var(--module-2)">${icon("chart",17)}</span><div class="s-tx"><div class="s-v">${recCount}</div><div class="s-l">累计记录条数</div></div></div>
        <div class="ov2-stat"><span class="s-ic" style="color:var(--module-3)">${icon("star",17)}</span><div class="s-tx"><div class="s-v">${pinCount}</div><div class="s-l">置顶要事</div></div></div>
        <div class="ov2-stat" data-open="money"><span class="s-ic" style="color:${balCol}">${icon("wallet",17)}</span><div class="s-tx"><div class="s-v" style="color:${balCol}">¥${bal}</div><div class="s-l">本月结余 · 收¥${inc} 支¥${exp}</div></div></div>
      </div>
    </div></div>`;
}

/* 本周习惯追踪表：checkin.log × 本周 7 天 */
function habitTileHTML(){
  const items=data.checkin||[]; const wk=weekDates(); const t=today(); const tIdx=wk.indexOf(t);
  const dnames=["一","二","三","四","五","六","日"];
  const palette=["var(--module-1)","var(--module-2)","var(--module-3)","var(--module-4)","var(--module-5)","var(--accent)"];
  const chk=icon("check",13,2.8);
  const ths=dnames.map((d,i)=>`<th class="${i===tIdx?'tdcol':''}">${d}</th>`).join("");
  const rows = items.length ? items.map((x,ri)=>{
    let cnt=0;
    const cells=wk.map((day,i)=>{ const on=!!(x.log&&x.log[day]); if(on)cnt++;
      return `<td class="${i===tIdx?'tdcol':''}"><span class="hcell js-habit ${on?'on':'off'}" data-id="${x.id}" data-day="${day}">${chk}</span></td>`; }).join("");
    const rate=Math.round(cnt/7*100);
    return `<tr><td class="hn"><span class="hdot" style="background:${palette[ri%palette.length]}"></span>${esc(x.title)}</td>${cells}<td class="hrate" style="color:${palette[ri%palette.length]}">${rate}%</td></tr>`;
  }).join("") : `<tr><td colspan="9" style="text-align:center;color:var(--text-tertiary);font-size:12.5px;padding:18px 0">还没有习惯，去「习惯打卡」添加吧</td></tr>`;
  return `<div class="tile b7"><div class="tile-h"><span class="tic">${icon("leaf",16)}</span><div class="tt"><span class="en">HABIT TRACKER</span><span class="zh">本周习惯追踪表</span></div><span class="r js-open" data-open="checkin">本周 · 周${dnames[((new Date().getDay())+6)%7]}</span></div>
    <table class="habit-tb"><thead><tr><th class="hh">习惯</th>${ths}<th class="hr">完成率</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* 待办清单（仪表盘式，就地勾选） */
function todoTileHTML(){
  const it=data.todo||[]; const done=it.filter(x=>x.done).length; const pct=it.length?Math.round(done/it.length*100):0;
  const chk=icon("check",12,2.8);
  const list = it.length ? it.map(x=>{ const m=modOf("todo"); const p=(m.priorities||[]).find(p=>p.key===x.priority);
    return `<div class="tk-row"><div class="tk-chk js-pin-chk ${x.done?'on':''}" data-mkey="todo" data-id="${x.id}">${chk}</div>
      <span class="tk-name ${x.done?'done':''} js-pin-open" data-mkey="todo" data-id="${x.id}">${esc(x.title)}</span>
      ${p?`<span class="badge" style="background:${p.color};color:${p.text}"><span class="dot"></span>${p.label}</span>`:''}</div>`; }).join("")
    : `<div class="focus-empty">还没有待办，去「待办」添加吧</div>`;
  return `<div class="tile b5"><div class="tile-h"><span class="tic">${icon("list",16)}</span><div class="tt"><span class="en">TODO LIST</span><span class="zh">待办清单</span></div><span class="r js-open" data-open="todo">查看全部</span></div>
    <div class="tk-head"><span class="pct">${done}<span style="color:var(--text-secondary)">/${it.length}</span></span><span class="cnt">完成 ${pct}%</span><span class="bar"><i style="width:${pct}%"></i></span></div>
    <div class="tk-list">${list}</div></div>`;
}

/* 专注番茄钟（暗色炫酷卡 · 实时倒计时） */
function pomoTileHTML(){
  const p=data.__pomo||{count:0,min:0};
  const r=64,c=2*Math.PI*r,off=c*(1-pomo.remain/pomo.total);
  return `<div class="pomo b4"><div><div class="pen">POMODORO · 25 / 5</div><div class="pzh">专注番茄钟</div></div>
    <div class="ring-wrap"><svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="rgba(244,243,240,.14)" stroke-width="7"/>
      <circle id="pomo-fg" cx="75" cy="75" r="${r}" fill="none" stroke="#e6b877" stroke-width="7" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>
      <div class="ptime"><span class="t" id="pomo-time">${pad2(Math.floor(pomo.remain/60))}:${pad2(pomo.remain%60)}</span><span class="s" id="pomo-status">${pomo.running?'专注中':'保持专注'}</span></div></div>
    <div class="pctl"><button class="primary" id="pomo-toggle">${pomo.running?'暂停':'开始'}</button><button id="pomo-reset">重置</button></div>
    <div class="pstats"><div class="ps"><div class="pv" id="pomo-count">${p.count}</div><div class="pl">今日番茄</div></div>
      <div class="ps"><div class="pv" id="pomo-min">${p.min}</div><div class="pl">专注分钟</div></div>
      <div class="ps"><div class="pv">${p.count+ (pomo.running?1:0)}</div><div class="pl">轮次</div></div></div></div>`;
}

/* 心情趋势折线（复用 trend） */
function trendTileHTML(){
  const series=CONFIG.trend.series(data); const has=series.length>0;
  const avg=has?Math.round(series.reduce((a,b)=>a+b,0)/series.length):0;
  const body=has?trendSVG(series):`<div class="trend-empty">${icon("chart",26)}<span>暂无本周数据</span><button class="btn" id="btn-trend-edit" style="margin-top:6px;padding:8px 18px">${icon("plus",14,2.2)}记录本周状态</button></div>`;
  return `<div class="tile b8"><div class="tile-h"><span class="tic">${icon("chart",16)}</span><div class="tt"><span class="en">MOOD TREND · 近 7 天</span><span class="zh">${CONFIG.trend.title}</span></div>${has?`<span class="r" id="btn-trend-edit" style="cursor:pointer">均 ${avg}${CONFIG.trend.unit} · 编辑</span>`:''}</div>
    ${body}${has?`<div class="trend-x"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>`:''}</div>`;
}

/* 月度开销：finance 支出按分类占比 */
function spendTileHTML(){
  const all=data.money||[]; const exp=all.filter(x=>x.type==="expense").reduce((a,x)=>a+ +x.amount,0);
  const palette=["var(--module-4)","var(--module-3)","var(--module-1)","var(--module-2)","var(--module-5)","var(--accent)","var(--danger)"];
  const byCat={}; all.filter(x=>x.type==="expense").forEach(x=>{ const c=x.category||"其他"; byCat[c]=(byCat[c]||0)+ +x.amount; });
  const cats=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const maxC=cats.length?cats[0][1]:1;
  const catBars=cats.length? cats.map((c,i)=>`<div class="cbrow"><span class="cbn">${esc(c[0])}</span><span class="cbt"><i style="width:${Math.round(c[1]/maxC*100)}%;background:${palette[i%palette.length]}"></i></span><span class="cbv">¥${c[1]}</span></div>`).join("")
    : `<div class="focus-empty">暂无支出记录</div>`;
  let rows = ``;
  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("wallet",16)}</span><div class="tt"><span class="en">MONTHLY SPENDING</span><span class="zh">月度开销</span></div><span class="r js-open" data-open="money">明细</span></div>
    <div class="spend-sum"><span class="spend-total">¥${exp}</span><span class="spend-cap">本月支出 · 共 ${all.filter(x=>x.type==='expense').length} 笔</span></div>
    <div class="catbar">${catBars}</div></div>`;
}

/* 在读好书：read (progress) 各书进度 */
function booksTileHTML(){
  const all=data.read||[]; const colors=["var(--module-2)","var(--module-1)","var(--module-3)","var(--module-4)","var(--module-5)"];
  const rows=all.length? all.map((x,i)=>{ const pct=Math.min(100,Math.round((x.current/x.target)*100||0)); const col=colors[i%colors.length];
    return `<div class="book-row js-open" data-open="read"><span class="spine" style="background:${col}">${icon("book",16)}</span>
      <div class="bmid"><div class="btt">${esc(x.title)}</div><div class="bsub">${x.note?esc(x.note):`${x.current}/${x.target} ${x.unit||'页'}`}</div>
        <div class="bbar"><i style="width:${pct}%;background:${col}"></i></div></div>
      <div class="pstep"><button class="pstep-btn js-pin-dec" data-mkey="read" data-id="${x.id}">−</button><span class="bpct" style="color:${col}">${pct}%</span><button class="pstep-btn js-pin-inc" data-mkey="read" data-id="${x.id}">+</button></div></div>`; }).join("")
    : `<div class="focus-empty">还没有在读书籍，去「阅读打卡」添加吧</div>`;
  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("book",16)}</span><div class="tt"><span class="en">CURRENTLY READING</span><span class="zh">在读好书</span></div><span class="r">${all.length} 本</span></div>
    <div class="book-list">${rows}</div></div>`;
}

/* 本周目标：sport (progress) 各项进度条 */
function goalsTileHTML(){
  const all=data.sport||[]; const colors=["var(--module-3)","var(--module-1)","var(--module-2)","var(--module-4)","var(--module-5)"];
  const rows=all.length? all.map((x,i)=>{ const pct=Math.min(100,Math.round((x.current/x.target)*100||0)); const col=colors[i%colors.length];
    return `<div class="book-row"><span class="spine" style="background:${col}">${icon("activity",16)}</span>
      <div class="bmid"><div class="btt">${pct>=100?`<span style="color:var(--module-1);display:inline-flex;vertical-align:-2px;margin-right:3px">${icon("check",13,2.6)}</span>`:''}${esc(x.title)}</div>
        <div class="bsub">${x.current}/${x.target} ${x.unit||'次'}</div>
        <div class="bbar"><i style="width:${pct}%;background:${col}"></i></div></div>
      <div class="pstep"><button class="pstep-btn js-pin-dec" data-mkey="sport" data-id="${x.id}">−</button><span class="bpct" style="color:${col}">${pct}%</span><button class="pstep-btn js-pin-inc" data-mkey="sport" data-id="${x.id}">+</button></div></div>`; }).join("")
    : `<div class="focus-empty">还没有锻炼目标，去「每日锻炼」添加吧</div>`;
  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("activity",16)}</span><div class="tt"><span class="en">WEEKLY GOALS</span><span class="zh">本周目标</span></div><span class="r js-open" data-open="sport">${all.length} 项</span></div>
    <div class="book-list">${rows}</div></div>`;
}

/* 健康概览瓷砖：运动进度 + 食谱数量 */
function healthTileHTML(){
  const sportM = modOf("sport");
  const recipesM = modOf("recipes");

  const sportItems = data.sport || [];
  const recipesItems = data.recipes || [];

  // Sport summary
  const sportProgress = avgProgress(sportItems);
  const sportSummary = sportItems.length > 0 ?
    `<div class="focus-row js-open" data-open="sport">
      <span class="fic" style="color:${sportM.color}">${icon(sportM.icon,16)}</span>
      <div class="ft"><div class="fn">${sportM.name}</div><div class="fm">平均进度 ${sportProgress.value}% · ${sportItems.length} 项</div></div>
      <span style="color:var(--text-tertiary)">${icon("chevron",16,2)}</span>
    </div>` : ``;

  // Recipes summary
  const recipesCount = recipesItems.length;
  const recipesSummary = recipesCount > 0 ?
    `<div class="focus-row js-open" data-open="recipes">
      <span class="fic" style="color:${recipesM.color}">${icon(recipesM.icon,16)}</span>
      <div class="ft"><div class="fn">${recipesM.name}</div><div class="fm">${recipesCount} 份食谱</div></div>
      <span style="color:var(--text-tertiary)">${icon("chevron",16,2)}</span>
    </div>` : ``;

  const content = (sportSummary || recipesSummary) ? `${sportSummary}${recipesSummary}` : 
    `<div class="focus-empty">还没有健康记录，去「每日锻炼」或「食谱与餐单」添加吧</div>`;

  return `<div class="tile b4"><div class="tile-h"><span class="tic" style="color:var(--module-1)">${icon("leaf",16)}</span><div class="tt"><span class="en">HEALTH & WELLNESS</span><span class="zh">健康生活</span></div><span class="r">${sportItems.length + recipesCount} 项</span></div>
    <div class="focus-list">${content}</div></div>`;
}

function onboardingCardHTML(){
  const onboarding = data.__onboarding || {};
  if(onboarding.seen === true) return "";
  return `<div class="onboarding-card" id="onboarding-card">
    <div class="onboarding-copy"><span class="eyebrow">首次使用</span><h3>先完成一个最短闭环</h3><p>从创建一个待办开始，完成后回到首页查看进度。演示数据只用于展示，可以保留，也可以切换到空白工作台。</p>
      <div class="onboarding-steps"><span>1 创建待办</span><span>2 完成记录</span><span>3 查看进度</span></div></div>
    <div class="onboarding-actions"><button class="btn" id="onboarding-keep">保留演示数据</button><button class="btn ghost" id="onboarding-blank">使用空白工作台</button></div>
  </div>`;
}
function bindOnboarding(){
  const card=$("#onboarding-card"); if(!card) return;
  const finish=(blank)=>{
    if(blank){
      CONFIG.modules.forEach(m=>{ data[m.key]=[]; });
      data.__isDemoData=false;
      data.__onboarding={seen:true,demoChoice:"blank",completedAt:new Date().toISOString()};
      persist();
      toast("已切换为空白工作台");
    } else {
      data.__isDemoData=true;
      data.__onboarding={seen:true,demoChoice:"keep",completedAt:new Date().toISOString()};
      persist();
      toast("已保留演示数据");
    }
  };
  const keep=$("#onboarding-keep"), blank=$("#onboarding-blank");
  if(keep) keep.onclick=()=>finish(false);
  if(blank) blank.onclick=()=>{ if(confirm("使用空白工作台将清空当前演示记录，是否继续？")) finish(true); };
}
function renderHome(){
  const now = new Date();
  const dow = (now.getDay()+6)%7;
  const q = CONFIG.quotes[dow % CONFIG.quotes.length];
  const hour = now.getHours();
  const hi = hour<5?"夜深了":hour<11?"早上好":hour<13?"中午好":hour<18?"下午好":"晚上好";

  // 时钟卡
  const clockCard=`<div class="clock-card b4">
    <div><div class="hi">${hi}，${esc(CONFIG.owner)}</div><div class="sub">${esc(q)}</div></div>
    <div><div class="clk" id="clk">${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}</div>
      <div class="cmeta"><span>${dateStr()}</span><span class="dot"></span><span>第 ${weekNum()} 周</span></div></div></div>`;

  $("#screen").innerHTML = `
    ${onboardingCardHTML()}
    ${grp("今日行动","TODAY&nbsp;&nbsp;·&nbsp;&nbsp;ACTION")}
    <div class="bento">
      ${clockCard}
      ${focusTileHTML()}
      ${quickTileHTML()}
      ${scheduleTileHTML()}
      ${plannerNextActionTileHTML()}
    </div>

    ${grp("今日课程","TODAY&nbsp;&nbsp;·&nbsp;&nbsp;CLASSES")}
    <div class="bento">${timetableTileHTML()}</div>

    ${grp("打卡追踪","TRACKING&nbsp;&nbsp;·&nbsp;&nbsp;PROGRESS")}
    <div class="bento">${overviewTileHTML()}${habitTileHTML()}${todoTileHTML()}${booksTileHTML()}${goalsTileHTML()}${healthTileHTML()}${spendTileHTML()}</div>

    ${grp("内容记录","CONTENT&nbsp;&nbsp;·&nbsp;&nbsp;RECORDS")}
    <div class="bento">${trendTileHTML()}${pomoTileHTML()}</div>`;
  wireHome();
  bindOnboarding();
  startClock();
}

function wireHome(){
  $("#screen").querySelectorAll("[data-open]").forEach(el=>el.onclick=()=>go(el.dataset.open));
  $("#screen").querySelectorAll("[data-quick]").forEach(el=>el.onclick=()=>{ go(el.dataset.quick); openEditor(el.dataset.quick,null); });
  const find=el=>(data[el.dataset.mkey]||[]).find(i=>i.id==el.dataset.id);
  // 就地打卡 / 完成
  $("#screen").querySelectorAll(".js-pin-chk").forEach(el=>el.onclick=e=>{
    e.stopPropagation(); const m=modOf(el.dataset.mkey), x=find(el); if(!x) return;
    if(m.type==="todo"){ x.done=!x.done; }
    else if(m.type==="checkin"){ x.log=x.log||{}; const t=today(); x.log[t]?delete x.log[t]:x.log[t]=true; }
    persist();
  });
  $("#screen").querySelectorAll(".js-pin-inc").forEach(el=>el.onclick=e=>{ e.stopPropagation(); const x=find(el); if(!x) return; x.current=(+x.current||0)+1; persist(); });
  $("#screen").querySelectorAll(".js-pin-dec").forEach(el=>el.onclick=e=>{ e.stopPropagation(); const x=find(el); if(!x) return; x.current=Math.max(0,(+x.current||0)-1); persist(); });
  $("#screen").querySelectorAll(".js-pin-open").forEach(el=>el.onclick=e=>{ e.stopPropagation(); openEditor(el.dataset.mkey, find(el)); });
  // 习惯追踪表：点方框直接给对应日期打卡 / 取消
  $("#screen").querySelectorAll(".js-habit").forEach(el=>el.onclick=e=>{
    e.stopPropagation(); const x=(data.checkin||[]).find(i=>i.id==el.dataset.id); if(!x) return;
    const d=el.dataset.day; x.log=x.log||{}; x.log[d]?delete x.log[d]:x.log[d]=true; persist();
  });
  // 番茄钟控制
  const tg=$("#pomo-toggle"); if(tg) tg.onclick=()=>{ pomo.running=!pomo.running; pomoUpdate(); };
  const rs=$("#pomo-reset"); if(rs) rs.onclick=()=>{ pomo.running=false; pomo.remain=pomo.total; pomoUpdate(); };
  // 趋势录入
  const te=$("#btn-trend-edit"); if(te) te.onclick=()=>openTrendEditor();
}

/* ---------- INSIGHT ---------- */
function plannerReviewHTML(){
  const p=plannerState(), goal=p.goals.find(g=>String(g.id)===String(p.currentGoalId));
  if(!goal) return `<section class="card planner-review"><div class="sec-title" style="margin-top:0">规划复盘</div><div class="planner-muted">完成一个规划目标后，这里会汇总计划与实际执行偏差。</div></section>`;
  const tasks=(data.todo||[]).filter(x=>String(x.plannerGoalId)===String(goal.id));
  const total=tasks.length, completed=tasks.filter(x=>x.status==='completed'||x.done).length, deferred=tasks.filter(x=>x.status==='deferred').length;
  const planned=tasks.reduce((n,x)=>n+(Number(x.estimatedMinutes)||0),0);
  const actual=tasks.reduce((n,x)=>n+(Number(x.executionResult?.actualMinutes)||0),0);
  const reasons={time_insufficient:0,task_too_large:0,external_blocker:0,priority_change:0,other:0};
  tasks.filter(x=>x.status==='deferred').forEach(x=>{ reasons[x.delayReason||'other']=(reasons[x.delayReason||'other']||0)+1; });
  const reasonRows=Object.entries(reasons).filter(([,n])=>n>0).map(([key,n])=>`<div class="review-reason"><span>${plannerDelayReasonLabel(key)}</span><i><em style="width:${deferred?Math.round(n/deferred*100):0}%"></em></i><b>${n}</b></div>`).join('')||'<div class="planner-muted">暂无延期记录</div>';
  const suggestions=[];
  if(deferred) suggestions.push('优先处理延期原因最多的任务，必要时缩小任务范围。');
  if(planned&&actual&&actual>planned*1.2) suggestions.push('实际用时明显高于估计，下次将同类任务拆得更小并增加缓冲。');
  if(completed===total&&total) suggestions.push('目标任务已全部完成，可以建立下一阶段目标或归档当前目标。');
  if(!suggestions.length) suggestions.push('继续记录实际用时和执行结果，数据足够后会形成更可靠的复盘建议。');
  return `<section class="card planner-review"><div class="planner-review-head"><div><div class="sec-title" style="margin-top:0">规划复盘</div><h3>${esc(goal.title||'当前目标')}</h3><small>目标进度 ${goal.progress||0}% · ${total} 项任务 · ${deferred} 次延期</small></div><span class="planner-review-badge">${completed}/${total} 完成</span></div><div class="review-metrics"><span><b>${planned}</b><small>计划分钟</small></span><span><b>${actual||'—'}</b><small>实际分钟</small></span><span><b>${actual&&planned?Math.round((actual/planned)*100)+'%':'—'}</b><small>用时偏差</small></span><span><b>${deferred}</b><small>延期次数</small></span></div><div class="review-columns"><div><div class="review-label">延期原因</div>${reasonRows}</div><div><div class="review-label">下一阶段建议</div><ul class="review-suggestions">${suggestions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></section>`;
}
function renderInsight(){
  const cards=CONFIG.modules.map(m=>{ const it=data[m.key]||[]; let main="", pct=0;
    if(m.type==="todo"){ main=`${it.filter(x=>x.done).length}/${it.length} 已完成`; pct=it.length?Math.round(it.filter(x=>x.done).length/it.length*100):0; }
    else if(m.type==="checkin"){ const t=today(); main=`今日 ${it.filter(x=>x.log&&x.log[t]).length}/${it.length} 打卡`; pct=it.length?Math.round(it.filter(x=>x.log&&x.log[t]).length/it.length*100):0; }
    else if(m.type==="progress"){ pct=avgProgress(it).value; main=`平均进度 ${pct}%`; }
    else if(m.type==="finance"){ const e=it.filter(x=>x.type==="expense").reduce((a,x)=>a+ +x.amount,0); const inc=it.filter(x=>x.type==="income").reduce((a,x)=>a+ +x.amount,0); main=`收 ¥${inc} · 支 ¥${e}`; }
    else if(m.type==="timetable"){
      const wd=["周日","周一","周二","周三","周四","周五","周六"];
      const todayName=wd[new Date().getDay()];
      const todayCourses=it.filter(x=>x.dayOfWeek===todayName);
      main=`今日 ${todayCourses.length} 节 · 共 ${it.length} 门`;
      pct=it.length?Math.min(100,Math.round(todayCourses.length/Math.max(1,it.length)*100)):0;
    }
    else if(m.type==="schedule"){
      const t=isoToday();
      const todayEvents=it.filter(x=>x.date===t);
      let totalMins=0;
      todayEvents.forEach(e=>{
        const [sh,sm]=(e.startTime||"00:00").split(':').map(Number);
        const [eh,em]=(e.endTime||"00:00").split(':').map(Number);
        let dur=(eh*60+em)-(sh*60+sm); if(dur<0) dur+=1440;
        totalMins+=dur;
      });
      const hrs=(totalMins/60).toFixed(1);
      main=`今日 ${todayEvents.length} 项 · ${hrs}h`;
      pct=it.length?Math.min(100,Math.round(todayEvents.length/Math.max(1,it.length)*100)):0;
    }
    else main=`${it.length} 条记录`;
    return `<div class="pin" data-open="${m.key}" style="cursor:pointer">
      <span class="pin-ic" style="color:${m.color};background:${m.tint};border-color:transparent">${icon(m.icon,19)}</span>
      <div class="pin-b"><div class="pin-t">${m.name}</div><div class="pin-m">${main}</div>
      ${['progress','todo','checkin','timetable','schedule'].includes(m.type)?`<div class="hero-bar" style="margin-top:9px"><i style="width:${pct}%;background:${m.color}"></i></div>`:''}</div>
      <span class="arw" style="color:var(--text-tertiary)">${icon("chevron",16,2)}</span></div>`; }).join("");
  $("#screen").innerHTML=`<div class="header"><div><h2>洞察</h2><p>各模块进展一览 · 记录—执行—统计—反馈</p></div><div class="spacer"></div><span class="date-chip">${icon("calendar",14)} ${dateStr()}</span></div>
    <div class="sec-title">模块概况</div><div class="pin-list" style="grid-template-columns:repeat(3,1fr)">${cards}</div>${plannerReviewHTML()}`;
  $("#screen").querySelectorAll("[data-open]").forEach(el=>el.onclick=()=>go(el.dataset.open));
}

function renderSchedule() {
  const m = modOf("schedule");
  let content = "";

  // Main header and view switcher
  let headerHtml = `<div class="header"><div><h2>${m.name}</h2><p>${m.desc}</p></div><div class="spacer"></div>
    <div class="seg" id="schedule-view-switcher">
      <div class="opt ${scheduleViewMode === 'daily' ? 'on' : ''}" data-v="daily">日</div>
      <div class="opt ${scheduleViewMode === 'weekly' ? 'on' : ''}" data-v="weekly">周</div>
      <div class="opt ${scheduleViewMode === 'monthly' ? 'on' : ''}" data-v="monthly">月</div>
    </div>
    <button class="btn" id="btn-add-schedule-item">${icon("plus", 16, 2.2)}新建日程</button>
  </div>`;

  if (scheduleViewMode === "daily") {
    const selectedDate = scheduleSelectedDate || isoToday();
    content = renderTimelineDayView(selectedDate, scheduleEventsForDate(selectedDate), "schedule");
  } else if (scheduleViewMode === "weekly") {
    content = renderUnifiedScheduleWeek();
  } else if (scheduleViewMode === "monthly") {
    content = renderMonthlySchedule();
  }

  $("#screen").innerHTML = headerHtml + content;

  // Wire up shared event listeners
  $("#btn-add-schedule-item").onclick = () => openEditor("schedule", null);

  $("#schedule-view-switcher").querySelectorAll(".opt").forEach(opt => {
    opt.onclick = () => {
      scheduleViewMode = opt.dataset.v;
      render();
    };
  });

  // Wire up view-specific listeners
  if (scheduleViewMode === "daily") {
    const prevDay = $("#timeline-prev-day"), nextDay = $("#timeline-next-day"), todayDay = $("#timeline-today");
    if (prevDay) prevDay.onclick = () => { scheduleSelectedDate = shiftDate(scheduleSelectedDate || isoToday(), -1); render(); };
    if (nextDay) nextDay.onclick = () => { scheduleSelectedDate = shiftDate(scheduleSelectedDate || isoToday(), 1); render(); };
    if (todayDay) todayDay.onclick = () => { scheduleSelectedDate = null; scheduleDayOffset = 0; render(); };
    bindDayGridTuning();
    document.querySelectorAll('.timeline-event, .daygrid-event, .daygrid-project-item, .weekgrid-event').forEach(eventEl => {
      eventEl.onclick = (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.timelineId;
        const itemToEdit = (data.schedule || []).find(item => String(item.id) === String(eventId));
        if (itemToEdit) return openEditor("schedule", itemToEdit);
        const courseId = String(eventId).replace(/^course-/, "").split("-")[0];
        const course = (data.timetable || []).find(item => String(item.id) === courseId);
        if (course) openEditor("timetable", course);
      };
    });
  } else if (scheduleViewMode === "weekly") {
    $("#week-prev").onclick = () => { scheduleWeekOffset--; render(); };
    $("#week-next").onclick = () => { scheduleWeekOffset++; render(); };
    $("#week-today").onclick = () => { scheduleWeekOffset = 0; render(); };
    document.querySelectorAll('.timeline-event, .daygrid-event, .weekgrid-event').forEach(eventEl => {
      eventEl.onclick = (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.timelineId;
        const itemToEdit = (data.schedule || []).find(item => String(item.id) === String(eventId));
        if (itemToEdit) return openEditor("schedule", itemToEdit);
        const courseId = String(eventId).replace(/^course-/, "").split("-")[0];
        const course = (data.timetable || []).find(item => String(item.id) === courseId);
        if (course) openEditor("timetable", course);
      };
    });
  } else if (scheduleViewMode === "monthly") {
    $("#month-prev").onclick = () => { scheduleMonthOffset--; render(); };
    $("#month-next").onclick = () => { scheduleMonthOffset++; render(); };
    $("#month-today").onclick = () => { scheduleMonthOffset = 0; render(); };
    document.querySelectorAll('.month-cell[data-date]').forEach(cellEl => {
      cellEl.onclick = () => {
        scheduleSelectedDate = cellEl.dataset.date;
        scheduleViewMode = "daily";
        render();
      };
    });
  }
}

/* ---------- WEEKLY SCHEDULE VIEW ---------- */
function renderWeeklySchedule() {
  const now = new Date();

  // Calculate the Monday of the target week
  const dow = now.getDay(); // 0=Sun .. 6=Sat
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + scheduleWeekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const todayStr = isoToday();

  // Visible hour range: 6:00 – 23:00
  const startHr = 6, endHr = 23;
  const hrPx = 40;
  const totalH = (endHr - startHr) * hrPx;

  // Time labels (every 2 hours)
  let timeLabels = '';
  for (let h = startHr; h <= endHr; h += 2) {
    timeLabels += `<div class="week-time-label" style="height:${hrPx * 2}px">${pad2(h)}:00</div>`;
  }

  // Day columns
  let dayColumns = weekDays.map((day, idx) => {
    const ds = localDateStr(day);
    const dayEvents = scheduleEventsForDate(ds);
    const isToday = ds === todayStr;

    let eventsHtml = '';
    dayEvents.forEach(e => {
      const [sh, sm] = (e.startTime || "00:00").split(':').map(Number);
      const [eh, em] = (e.endTime || "00:00").split(':').map(Number);
      let top = ((sh * 60 + sm) - startHr * 60) / 60 * hrPx;
      let bottom = ((eh * 60 + em) - startHr * 60) / 60 * hrPx;
      if (bottom <= top) bottom = top + hrPx;          // guard zero-length
      if (top < 0) top = 0;
      if (bottom > totalH) bottom = totalH;
      const height = Math.max(18, bottom - top);       // min height for readability
      const color = e.color || '#8f83a8';
      const txt = contrastText(color);
      const title = esc(e.title || '无标题');
      const timeStr = `${esc(e.startTime)}–${esc(e.endTime)}`;
      eventsHtml += `<div class="week-event" style="top:${top}px;height:${height}px;background-color:${color};color:${txt}" data-id="${e.id}" title="${title} ${timeStr}">
        <div class="week-event-title">${title}</div>
        <div class="week-event-time">${timeStr}</div>
      </div>`;
    });

    return `<div class="week-day-col${isToday ? ' is-today' : ''}" data-date="${ds}">
      <div class="week-day-header">
        <span class="week-day-name">${dayNames[idx]}</span>
        <span class="week-day-num${isToday ? ' today' : ''}">${day.getDate()}</span>
      </div>
      <div class="week-day-body" style="height:${totalH}px">${eventsHtml}</div>
    </div>`;
  }).join('');

  const ws = weekDays[0], we = weekDays[6];
  const rangeStr = `${ws.getFullYear()}.${pad2(ws.getMonth() + 1)}.${pad2(ws.getDate())} – ${we.getFullYear()}.${pad2(we.getMonth() + 1)}.${pad2(we.getDate())}`;

  return `<div class="toolbar">
    <button class="btn sm" id="week-prev">${icon("chevron-left",14,2.4)} 上一周</button>
    <span class="date-chip">${icon("calendar",14)} ${rangeStr}</span>
    <button class="btn sm" id="week-next">下一周 ${icon("chevron-right",14,2.4)}</button>
    <div class="spacer"></div>
    <button class="btn sm" id="week-today">今天</button>
  </div>
  <div class="schedule-grid-container week-grid">
    <div class="week-time-labels">${timeLabels}</div>
    <div class="week-day-columns">${dayColumns}</div>
  </div>`;
}

/* ---------- MONTHLY SCHEDULE VIEW ---------- */
function renderMonthlySchedule() {
  const now = new Date();

  // Calculate target month
  const vm = new Date(now.getFullYear(), now.getMonth() + scheduleMonthOffset, 1);
  const year = vm.getFullYear();
  const month = vm.getMonth();

  // Calendar grid: Monday-based
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();                          // 0=Sun
  const startOffset = startDow === 0 ? 6 : startDow - 1;       // Monday=0
  const daysInMonth = lastDay.getDate();

  const todayStr = isoToday();
  const monthNames = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

  // Build cells
  let cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d, isCur: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), isCur: true });
  }
  const totalCells = Math.ceil(cells.length / 7) * 7;
  for (let i = 1; cells.length < totalCells; i++) {
    cells.push({ date: new Date(year, month + 1, i), isCur: false });
  }

  const dayHeaders = ["一","二","三","四","五","六","日"];

  let cellsHtml = cells.map(cell => {
    const ds = localDateStr(cell.date);
    const dayEvents = scheduleEventsForDate(ds);
    const isToday = ds === todayStr;

    let dotsHtml = '';
    dayEvents.slice(0, 3).forEach(e => {
      dotsHtml += `<div class="month-event-dot" style="background:${e.color || '#8f83a8'}"></div>`;
    });
    if (dayEvents.length > 3) {
      dotsHtml += `<span class="month-event-more">+${dayEvents.length - 3}</span>`;
    }

    return `<div class="month-cell${cell.isCur ? '' : ' other-month'}${isToday ? ' is-today' : ''}" data-date="${ds}">
      <span class="month-date${isToday ? ' today' : ''}">${cell.date.getDate()}</span>
      <div class="month-events">${dotsHtml}</div>
    </div>`;
  }).join('');

  return `<div class="toolbar">
    <button class="btn sm" id="month-prev">${icon("chevron-left",14,2.4)} 上一月</button>
    <span class="date-chip">${icon("calendar",14)} ${year}年 ${monthNames[month]}</span>
    <button class="btn sm" id="month-next">下一月 ${icon("chevron-right",14,2.4)}</button>
    <div class="spacer"></div>
    <button class="btn sm" id="month-today">今天</button>
  </div>
  <div class="month-calendar">
    <div class="month-header-row">
      ${dayHeaders.map(d => `<div class="month-header-cell">${d}</div>`).join('')}
    </div>
    <div class="month-grid">${cellsHtml}</div>
  </div>`;
}

/* ---------- MODULE VIEW ---------- */
/* 通用搜索：标题/备注/正文 + 自定义字段 + 类型特有字段 */
function matchSearch(x, q, m){
  if((x.title||"").toLowerCase().includes(q)) return true;
  if((x.note||x.content||"").toLowerCase().includes(q)) return true;
  if((x.courseName||"").toLowerCase().includes(q)) return true;
  if((x.category||"").toLowerCase().includes(q)) return true;
  if((x.location||"").toLowerCase().includes(q)) return true;
  // 自定义字段
  const fields = m.fields || [];
  for(const f of fields){
    if(x[f.key] && String(x[f.key]).toLowerCase().includes(q)) return true;
  }
  return false;
}

function renderTimetableDayView(allClasses, recordItems = allClasses){
  const dateValue = timetableSelectedDate || isoToday();
  const events = scheduleEventsForDate(dateValue).filter(e => e.source === "timetable");
  return renderTimelineDayView(dateValue, events, "timetable", dayGridCourseRail(allClasses, recordItems));
}
function renderTimetableWeekView(allClasses){
  const days = timelineWeekDates(timetableWeekOffset, timetableSelectedDate || isoToday());
  const range = `${days[0].date} – ${days[6].date}`;
  return `<div class="timeline-toolbar"><button class="btn sm" id="timetable-week-prev">${icon("chevron-left",14,2.4)} 上一周</button><span class="date-chip">${icon("calendar",14)} ${range}</span><button class="btn sm" id="timetable-week-next">下一周 ${icon("chevron-right",14,2.4)}</button><button class="btn sm" id="timetable-week-today">今天</button></div>${renderUnifiedWeeklyTimeline(days, date => scheduleEventsForDate(date).filter(e => e.source === "timetable"), "timetable")}`;
}
function renderTimetableWeekViewLegacy(allClasses){
  const days = ["周一","周二","周三","周四","周五","周六","周日"];
  const currentWeek = getCurrentTermWeekNumber();
  const active = allClasses.filter(x => isClassActiveInWeek(x, currentWeek));
  const startHour = 0, endHour = 24, hourHeight = 54;
  const totalHeight = (endHour - startHour) * hourHeight;
  const labels = Array.from({length:endHour-startHour+1}, (_,i) => `<div class="timetable-axis-label" style="top:${i*hourHeight}px;transform:translateY(${i===0?"0":"-50%"})">${pad2(startHour+i)}:00</div>`).join("");
  const columns = days.map(day => {
    const items = active.filter(x => x.dayOfWeek === day).sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));
    const blocks = items.map(x => {
      const [sh,sm] = String(x.startTime || "08:00").split(":").map(Number);
      const [eh,em] = String(x.endTime || "09:40").split(":").map(Number);
      const top = Math.max(0, ((sh * 60 + sm) - startHour * 60) / 60 * hourHeight);
      const end = Math.min(totalHeight, ((eh * 60 + em) - startHour * 60) / 60 * hourHeight);
      const height = Math.max(30, end - top);
      return `<button class="timetable-block" data-edit-timetable="${x.id}" style="top:${top}px;height:${height}px"><strong>${esc(x.courseName || x.title || "未命名课程")}</strong><span>${esc(x.startTime || "")} - ${esc(x.endTime || "")}</span><small>${esc(x.location || "未设置地点")}</small></button>`;
    }).join("");
    return `<div class="timetable-axis-col"><div class="timetable-axis-day">${day}</div><div class="timetable-axis-body" style="height:${totalHeight}px">${blocks || '<span class="timetable-axis-empty">暂无课程</span>'}</div></div>`;
  }).join("");
  return `<div class="timetable-week-panel"><div class="sec-title">第 ${currentWeek} 周课程时间表</div><div class="timetable-axis"><div class="timetable-axis-labels" style="height:${totalHeight}px">${labels}</div><div class="timetable-axis-days">${columns}</div></div></div>`;
}

function renderModule(key){
  const m=modOf(key); const rawData=data[key]||[];
  // 记账模块：按月份过滤
  let all = rawData;
  if(m.type==="finance"){
    if(moneyMonth===null) moneyMonth = localDateStr(new Date()).slice(0,7);
    all = moneyMonth ? rawData.filter(x => (x.date||"").startsWith(moneyMonth)) : rawData;
  }
  let it=all;
  const t=today();
  const q=searchQ.trim().toLowerCase();
  if(q) it=all.filter(x=>matchSearch(x,q,m));

  let head="";
  if(m.type==="finance"){
    const inc=all.filter(x=>x.type==="income").reduce((a,x)=>a+ +x.amount,0);
    const exp=all.filter(x=>x.type==="expense").reduce((a,x)=>a+ +x.amount,0);
    head=`<div class="mod-summary">
      <div class="mini"><div class="l">收入</div><div class="v" style="color:var(--module-1)">¥${inc}</div></div>
      <div class="mini"><div class="l">支出</div><div class="v" style="color:var(--danger)">¥${exp}</div></div>
      <div class="mini"><div class="l">结余</div><div class="v">¥${inc-exp}</div></div>
      <div class="mini"><div class="l">笔数</div><div class="v">${all.length}</div></div></div>`;
  } else if(m.type==="todo"){
    const done=all.filter(x=>x.done).length;
    head=headHero(m, `${done}/${all.length}`, "今日已完成");
  } else if(m.type==="checkin"){
    const done=all.filter(x=>x.log&&x.log[t]).length;
    head=headHero(m, `${done}/${all.length}`, "今日已打卡");
  } else if(m.type==="progress"){
    const p=avgProgress(all);
    head=headHero(m, `${p.value}%`, `平均进度 · ${all.length} 项`);
  } else if(m.type==="note"){
    const todayN=all.filter(x=>x.date===t).length;
    head=headHero(m, `${all.length}`, `条记录 · 今日 ${todayN} 条`, null);
  } else if(m.type==="timetable"){
    const currentWeek = getCurrentTermWeekNumber();
    head=`<div class="hero"><div class="hero-ic" style="background:${m.tint};color:${m.color}">${icon(m.icon,24)}</div>
      <div class="hero-tx"><div class="hero-row"><span class="hero-v">第 ${currentWeek} 周</span><span class="hero-l">当前学期周数</span></div></div></div>`;
  }

  // 记账月度选择器
  let monthNav="";
  if(m.type==="finance"){
    let monthLabel;
    if(moneyMonth){
      const [yy,mm]=moneyMonth.split('-');
      monthLabel=`${yy}年${parseInt(mm,10)}月`;
    } else {
      monthLabel="全部记录";
    }
    monthNav=`<div class="month-nav">
      <button class="month-btn" id="money-prev" title="上一月">${icon("chevron-left",14,2.2)}</button>
      <span class="month-label">${monthLabel}</span>
      <button class="month-btn" id="money-next" title="下一月">${icon("chevron-right",14,2.2)}</button>
      <button class="month-btn month-all" id="money-all" title="显示全部">全部</button>
    </div>`;
  }

  const body = it.length ? it.map(x=>recHTML(m,x)).join("")
    : `<div class="empty"><span class="e">${icon(m.icon,28)}</span><div>${q?'没有匹配的记录':'还没有记录，点右上角「新建」添加第一条吧'}</div></div>`;
  const timetableView = m.type === "timetable" ? `<div class="seg timetable-switch" id="timetable-view-switcher"><div class="opt ${timetableViewMode === 'daily' ? 'on' : ''}" data-v="daily">日视图</div><div class="opt ${timetableViewMode === 'weekly' ? 'on' : ''}" data-v="weekly">周视图</div></div>${timetableViewMode === "weekly" ? renderTimetableWeekView(all) : renderTimetableDayView(all, it)}` : "";

  const sectionTitle = m.type==="finance" ? (moneyMonth?`${moneyMonth.split('-')[0]}年${parseInt(moneyMonth.split('-')[1],10)}月记录`:"全部记录") : "全部记录";

  $("#screen").innerHTML=`<div class="header"><div><h2>${m.name}</h2><p>${m.desc}</p></div><div class="spacer"></div><span class="date-chip">${icon("calendar",14)} ${dateStr()}</span></div>
    <div class="toolbar">
      <div class="search-box">${icon("search",15,2.2)}<input id="search" placeholder="搜索…" value="${attr(searchQ)}"/></div>
      ${monthNav}
      <div class="spacer"></div><button class="btn" id="btn-new">${icon("plus",16,2.2)}新建</button></div>
    ${head}
    ${timetableView}
    ${m.type === "timetable" && timetableViewMode === "daily" ? "" : `<div class="mod-layout">
      <div class="mod-main">
        <div class="sec-title">${sectionTitle} <span id="rec-count" style="margin-left:auto;font-weight:500;color:var(--text-secondary);font-size:12px">${it.length} 条</span></div>
        <div class="rec-grid">${body}</div>
      </div>
      <aside class="mod-side">${sideStats(m,all)}</aside>
    </div>`}`;
  const s=$("#search");
  let composing=false;
  const refresh=()=>{ searchQ=s.value; renderModuleResults(key); };
  s.addEventListener("compositionstart",()=>{ composing=true; });
  s.addEventListener("compositionend",()=>{ composing=false; refresh(); });
  s.addEventListener("input",()=>{ if(!composing) refresh(); });
  $("#btn-new").onclick=()=>openEditor(key,null);
  // 记账月度切换
  if(m.type==="finance"){
    const prev=$("#money-prev"), next=$("#money-next"), allBtn=$("#money-all");
    if(prev) prev.onclick=()=>{
      moneyMonth = shiftMonth(moneyMonth || localDateStr(new Date()).slice(0,7), -1);
      if(moneyMonth==="") moneyMonth = localDateStr(new Date()).slice(0,7);
      renderModule(key);
    };
    if(next) next.onclick=()=>{
      moneyMonth = shiftMonth(moneyMonth || localDateStr(new Date()).slice(0,7), 1);
      if(moneyMonth==="") moneyMonth = localDateStr(new Date()).slice(0,7);
      renderModule(key);
    };
    if(allBtn) allBtn.onclick=()=>{ moneyMonth=""; renderModule(key); };
  }
  if(m.type === "timetable"){
    const switcher = $("#timetable-view-switcher");
    if(switcher) switcher.querySelectorAll(".opt").forEach(opt => opt.onclick = () => { timetableViewMode = opt.dataset.v; renderModule(key); });
    const prevDay = $("#timeline-prev-day"), nextDay = $("#timeline-next-day"), todayDay = $("#timeline-today");
    if(prevDay) prevDay.onclick = () => { timetableSelectedDate = shiftDate(timetableSelectedDate || isoToday(), -1); renderModule(key); };
    if(nextDay) nextDay.onclick = () => { timetableSelectedDate = shiftDate(timetableSelectedDate || isoToday(), 1); renderModule(key); };
    if(todayDay) todayDay.onclick = () => { timetableSelectedDate = null; timetableWeekOffset = 0; renderModule(key); };
    const prevWeek = $("#timetable-week-prev"), nextWeek = $("#timetable-week-next"), todayWeek = $("#timetable-week-today");
    if(prevWeek) prevWeek.onclick = () => { timetableWeekOffset--; renderModule(key); };
    if(nextWeek) nextWeek.onclick = () => { timetableWeekOffset++; renderModule(key); };
    if(todayWeek) todayWeek.onclick = () => { timetableWeekOffset = 0; timetableSelectedDate = null; renderModule(key); };
    bindDayGridTuning();
    $("#screen").querySelectorAll("[data-timeline-id]").forEach(el => el.onclick = () => {
      const id = String(el.dataset.timelineId).replace(/^course-/, "").split("-")[0];
      const course = (data[key] || []).find(x => String(x.id) === id);
      if(course) openEditor(key, course);
    });
    $("#screen").querySelectorAll(".daygrid-course-records [data-edit]").forEach(el => el.onclick = () => openEditor(key, (data[key] || []).find(x => String(x.id) === String(el.dataset.edit))));
  }
  wireModule(key);
}

/* 仅刷新受搜索影响的记录列表与计数，不重建搜索框（避免打断中文输入法） */
function renderModuleResults(key){
  const m=modOf(key); const rawData=data[key]||[];
  // 记账模块：按月份过滤
  let all = rawData;
  if(m.type==="finance"){
    if(moneyMonth===null) moneyMonth = localDateStr(new Date()).slice(0,7);
    all = moneyMonth ? rawData.filter(x => (x.date||"").startsWith(moneyMonth)) : rawData;
  }
  const q=searchQ.trim().toLowerCase();
  const it=q?all.filter(x=>matchSearch(x,q,m)):all;
  const body = it.length ? it.map(x=>recHTML(m,x)).join("")
    : `<div class="empty"><span class="e">${icon(m.icon,28)}</span><div>${q?'没有匹配的记录':'还没有记录，点右上角「新建」添加第一条吧'}</div></div>`;
  const grid=$(".rec-grid"); if(grid) grid.innerHTML=body;
  const cnt=$("#rec-count"); if(cnt) cnt.textContent=`${it.length} 条`;
  wireModule(key);
}

/* 模块统计侧栏：按 type 生成多维数据，填满右侧空间 */
function sideStats(m, all){
  const t=today();
  const palette=["var(--accent)","var(--module-1)","var(--module-2)","var(--module-3)","var(--module-4)","var(--module-5)","var(--danger)"];
  const row=(k,v,dot)=>`<div class="stat-row"><span class="k">${dot?`<span class="kd" style="background:${dot}"></span>`:''}${k}</span><span class="val">${v}</span></div>`;

  if(m.type==="finance"){
    const inc=all.filter(x=>x.type==="income").reduce((a,x)=>a+ +x.amount,0);
    const exp=all.filter(x=>x.type==="expense").reduce((a,x)=>a+ +x.amount,0);
    // 支出按分类聚合
    const byCat={}; all.filter(x=>x.type==="expense").forEach(x=>{ const c=x.category||"其他"; byCat[c]=(byCat[c]||0)+ +x.amount; });
    const cats=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
    const maxC=cats.length?cats[0][1]:1;
    const catBars=cats.length? cats.map((c,i)=>`<div class="cbrow"><span class="cbn">${esc(c[0])}</span><span class="cbt"><i style="width:${Math.round(c[1]/maxC*100)}%;background:${palette[i%palette.length]}"></i></span><span class="cbv">¥${c[1]}</span></div>`).join("")
      : `<div style="color:var(--text-tertiary);font-size:12.5px;padding:6px 0">暂无支出记录</div>`;
    const todayExp=all.filter(x=>x.type==="expense"&&x.date===t).reduce((a,x)=>a+ +x.amount,0);
    // 支出标签统计
    const tagDefs=["必要固定支出","不必要固定支出","必要不固定支出","不固定不必要支出"];
    const tagPalette=["var(--module-1)","var(--module-3)","var(--module-2)","var(--danger)"];
    const byTag={}; all.filter(x=>x.type==="expense").forEach(x=>{ const tg=x.spendTag||"未标注"; byTag[tg]=(byTag[tg]||0)+ +x.amount; });
    const tagRows=tagDefs.map((tg,i)=>`<div class="stat-row"><span class="k"><span class="kd" style="background:${tagPalette[i]}"></span>${tg}</span><span class="val">¥${byTag[tg]||0}</span></div>`).join("");
    const tagUnlabeled=byTag["未标注"]?`<div class="stat-row"><span class="k"><span class="kd" style="background:var(--text-tertiary)"></span>未标注</span><span class="val">¥${byTag["未标注"]}</span></div>`:'';
    return `<div class="side-card"><div class="sh">${icon("wallet",15)} 收支概况</div>
        ${row("总收入",`<span style="color:var(--module-1)">¥${inc}</span>`)}
        ${row("总支出",`<span style="color:var(--danger)">¥${exp}</span>`)}
        ${row("净结余",`¥${inc-exp}`)}
        ${row("今日支出",`¥${todayExp}`)}
        ${row("总笔数",`${all.length} 笔`)}</div>
      <div class="side-card"><div class="sh">${icon("chart",15)} 支出分类占比</div><div class="catbar">${catBars}</div></div>
      <div class="side-card"><div class="sh">${icon("tag",15)} 支出标签统计</div>${tagRows}${tagUnlabeled}</div>`;
  }

  if(m.type==="progress"){
    const p=avgProgress(all);
    const doneN=all.filter(x=>((x.current/x.target)*100||0)>=100).length;
    const totalCur=all.reduce((a,x)=>a+ (+x.current||0),0);
    const totalTgt=all.reduce((a,x)=>a+ (+x.target||0),0);
    return `<div class="side-card"><div class="sh">${icon("target",15)} 总体进度</div>
        <div class="side-ring"><div class="dial">${ringSVG(p.value,m.color)}<span class="mid"><span class="big" style="color:${m.color}">${p.value}%</span><span class="cap">平均进度</span></span></div></div></div>
      <div class="side-card"><div class="sh">${icon("list",15)} 数据统计</div>
        ${row("进行项目",`${all.length} 项`)}
        ${row("已达成",`${doneN} 项`)}
        ${row("累计完成",`${totalCur} ${all[0]?.unit||m.unit||''}`)}
        ${row("总目标量",`${totalTgt} ${all[0]?.unit||m.unit||''}`)}</div>`;
  }

  if(m.type==="checkin"){
    const done=all.filter(x=>x.log&&x.log[t]).length; const pct=all.length?Math.round(done/all.length*100):0;
    const streaks=all.map(x=>({title:x.title,s:streak(x.log)})).sort((a,b)=>b.s-a.s);
    const best=streaks[0]?streaks[0].s:0;
    const list=streaks.slice(0,6).map(x=>`<div class="stat-row"><span class="k">${esc(x.title)}</span><span class="val" style="color:var(--module-3)">${x.s} 天</span></div>`).join("");
    return `<div class="side-card"><div class="sh">${icon("leaf",15)} 今日打卡</div>
        <div class="side-ring"><div class="dial">${ringSVG(pct,m.color)}<span class="mid"><span class="big" style="color:${m.color}">${done}/${all.length}</span><span class="cap">已完成</span></span></div></div></div>
      <div class="side-card"><div class="sh">${icon("flame",15)} 连续天数</div>
        ${row("最长连续",`<span style="color:var(--module-3)">${best} 天</span>`)}
        ${row("习惯总数",`${all.length} 个`)}
        <div style="margin-top:6px">${list}</div></div>`;
  }

  if(m.type==="todo"){
    const done=all.filter(x=>x.done).length; const pct=all.length?Math.round(done/all.length*100):0;
    const byP={}; (m.priorities||[]).forEach(p=>byP[p.key]=0); all.forEach(x=>{ if(byP[x.priority]!=null) byP[x.priority]++; });
    const pRows=(m.priorities||[]).map(p=>`<div class="stat-row"><span class="k"><span class="kd" style="background:${p.text}"></span>${p.label}</span><span class="val">${byP[p.key]||0} 项</span></div>`).join("");
    return `<div class="side-card"><div class="sh">${icon("list",15)} 完成情况</div>
        <div class="side-ring"><div class="dial">${ringSVG(pct,m.color)}<span class="mid"><span class="big" style="color:${m.color}">${pct}%</span><span class="cap">${done}/${all.length} 完成</span></span></div></div></div>
      <div class="side-card"><div class="sh">${icon("chart",15)} 优先级分布</div>
        ${pRows}
        ${row("剩余待办",`${all.length-done} 项`)}</div>`;
  }

  if(m.type==="timetable"){
    const currentWeek = getCurrentTermWeekNumber();
    const todayClasses = getClassesForToday(all);
    const upcomingClasses = todayClasses.filter(x => {
      const [hour, minute] = x.startTime.split(':').map(Number);
      const now = new Date();
      const classTime = hour * 60 + minute;
      const currentTime = now.getHours() * 60 + now.getMinutes();
      return classTime > currentTime;
    });
    return `<div class="side-card"><div class="sh">${icon("calendar-days",15)} 课程统计</div>
        ${row("当前周次",`${currentWeek} 周`)}
        ${row("今日课程",`${todayClasses.length} 节`)}
        ${row("未上课程",`${upcomingClasses.length} 节`)}
        ${row("全部课程",`${all.length} 节`)}</div>
      <div class="side-card"><div class="sh">${icon("calendar",15)} 学期设置</div>
        ${row("开学日期",`<span id="term-start-date">${data.__termStartDate}</span>`)}
        <button class="btn ghost" style="width:100%;margin-top:10px" id="btn-edit-term-start">${icon("pen",16,2)} 修改开学日期</button>
      </div>`;
  }

  // note
  const todayN=all.filter(x=>x.date===t).length;
  const byMood={}; all.forEach(x=>{ const md=x.mood||"未分类"; byMood[md]=(byMood[md]||0)+1; });
  const moods=Object.entries(byMood).sort((a,b)=>b[1]-a[1]);
  const maxM=moods.length?moods[0][1]:1;
  const moodBars=moods.length? moods.map((c,i)=>`<div class="cbrow"><span class="cbn">${esc(c[0])}</span><span class="cbt"><i style="width:${Math.round(c[1]/maxM*100)}%;background:${palette[i%palette.length]}"></i></span><span class="cbv">${c[1]} 条</span></div>`).join("")
    : `<div style="color:var(--text-tertiary);font-size:12.5px;padding:6px 0">暂无记录</div>`;
  return `<div class="side-card"><div class="sh">${icon("pen",15)} 记录统计</div>
      ${row("累计记录",`${all.length} 条`)}
      ${row("今日新增",`${todayN} 条`)}
      ${row("标签种类",`${moods.length} 种`)}</div>
    <div class="side-card"><div class="sh">${icon("chart",15)} 标签分布</div><div class="catbar">${moodBars}</div></div>`;
}

/* per-module hero header: icon + big number + label */
function headHero(m, big, label){
  const inner=`<div class="hero-ic" style="background:${m.tint};color:${m.color}">${icon(m.icon,24)}</div>
    <div class="hero-tx"><div class="hero-row"><span class="hero-v">${big}</span><span class="hero-l">${label}</span></div></div>`;
  if(m.cover) return `<div class="hero has-cover"><div class="hero-bg" style="background-image:url('${attr(m.cover)}')"></div><div class="hero-inner">${inner}</div></div>`;
  return `<div class="hero">${inner}</div>`;
}

function recHTML(m,x){
  const pin=`<button class="pin-btn js-pin ${x.pinned?'on':''}" data-id="${x.id}" title="置顶">${icon("star",15)}</button>`;
  const del=`<button class="del js-del" data-id="${x.id}" title="删除">${icon("trash",15)}</button>`;
  const acts=`<div class="acts">${pin}${del}</div>`;
  const chkMark=icon("check",13,2.4);
  const thumb=x.image?`<img class="thumb" src="${attr(x.image)}" alt="">`:'';
  const customMeta=(m.fields||[]).filter(f=>x[f.key] && f.key!=="spendTag").map(f=>`<span class="meta-tag">${esc(x[f.key])}</span>`).join("");
  const customBlock=customMeta?`<div class="meta-line">${customMeta}</div>`:'';
  const layout=x.layout||'default';
  const layoutCls=`rec-layout-${layout}`;

  // feature layout: 大图在上 + 标题 + 正文在下 (适合有图记录)
  if(layout==='feature' && x.image){
    const body=(x.content||x.note||'').trim();
    return `<div class="rec ${layoutCls}">${acts}<div class="top" data-edit="${x.id}">
      ${thumb}
      <div class="feat-title">${esc(x.title||'无标题')}</div>
      ${body?`<div class="feat-body">${esc(body)}</div>`:''}
      ${customBlock?`<div style="padding:0 16px 14px">${customBlock}</div>`:''}</div></div>`;
  }
  // quote layout: 大字居中 (适合短文本/灵感/金句)
  if(layout==='quote'){
    const text=(x.content||x.title||'').trim();
    return `<div class="rec ${layoutCls}">${acts}<div class="top" data-edit="${x.id}" style="flex-direction:column;align-items:center;text-align:center">
      <div class="quote-text">${esc(text)}</div>
      ${x.mood?`<div class="quote-meta">${esc(x.mood)}${x.date?` · ${esc(x.date)}`:''}</div>`:(x.date?`<div class="quote-meta">${esc(x.date)}</div>`:'')}
      ${customBlock?`<div style="margin-top:8px">${customBlock}</div>`:''}</div></div>`;
  }

  // default layout
  if(m.type==="todo"){ const p=(m.priorities||[]).find(p=>p.key===x.priority);
    const todoStatus=x.status||(x.done?"completed":"pending");
    const statusLabel={pending:"待执行",in_progress:"进行中",completed:"已完成",deferred:"已延期",cancelled:"已取消"}[todoStatus]||"待执行";
    const todoMeta=`<span class="rdate" style="margin-left:0;color:${x.plannerGoalId?"var(--accent)":"var(--text-secondary)"}">${x.plannerGoalId?"规划待办":"手动待办"} · ${statusLabel}${x.dueDate?` · 截止 ${esc(x.dueDate)}`:""}${x.estimatedMinutes?` · ${esc(String(x.estimatedMinutes))} 分钟`:""}</span>`;
    return `<div class="rec ${layoutCls} ${todoStatus==="cancelled"?"is-muted":""}">${acts}<div class="top" style="padding-right:60px"><div class="chk js-chk ${x.done?'on':''}" data-id="${x.id}">${chkMark}</div>
      ${thumb}
      <div class="body" data-edit="${x.id}"><span class="rname ${x.done?'done':''}">${esc(x.title)}</span>
      ${p?`<span class="badge" style="background:${p.color};color:${p.text}"><span class="dot"></span>${p.label}</span>`:''}
      ${x.note?`<span class="rdate" style="margin-left:0;color:var(--text-tertiary)">${esc(x.note).slice(0,40)}</span>`:''}${todoMeta}${customBlock}</div></div></div>`; }
  if(m.type==="checkin"){ const on=!!(x.log&&x.log[today()]); const st=streak(x.log);
    return `<div class="rec ${layoutCls}">${acts}<div class="top" style="padding-right:60px"><div class="chk js-chk ${on?'on':''}" data-id="${x.id}">${chkMark}</div>
      ${thumb}
      <div class="body" data-edit="${x.id}"><span class="rname">${esc(x.title)}</span>
      <span class="streak">${icon("flame",13)} 连续 ${st} 天</span>${on?'<span class="badge" style="background:var(--accent-muted);color:var(--accent)">今日已打卡</span>':''}${customBlock}</div></div></div>`; }
  if(m.type==="progress"){ const pct=Math.min(100,Math.round((x.current/x.target)*100||0));
    return `<div class="rec ${layoutCls}">${acts}<div class="top" style="padding-right:60px">${thumb}<div class="body" data-edit="${x.id}">
      <span class="rname">${esc(x.title)}</span>
      <div class="pbar"><i style="width:${pct}%;background:${m.color}"></i></div>
      <span class="rdate" style="margin-left:0;color:var(--text-secondary)">${x.current}/${x.target} ${x.unit||m.unit||''} · ${pct}%</span>
      ${x.note?`<div class="rnote">${esc(x.note)}</div>`:''}${customBlock}</div></div></div>`; }
  if(m.type==="finance"){ const inc=x.type==="income";
    return `<div class="rec ${layoutCls}">${acts}<div class="top" style="padding-right:60px">${thumb}<div class="body" data-edit="${x.id}">
      <span class="rname">${esc(x.title)}</span>
      <span class="badge" style="background:var(--surface-nested);color:var(--text-secondary)">${esc(x.category||'其他')}</span>
      ${x.spendTag?`<span class="badge" style="background:var(--accent-muted);color:var(--accent)">${esc(x.spendTag)}</span>`:''}
      <span class="rdate">${x.date||''}</span>${customBlock}</div>
      <div class="amt ${inc?'inc':'exp'}">${inc?'+':'-'}¥${x.amount}</div></div></div>`; }
  if(m.type==="timetable"){
    return `<div class="rec ${layoutCls}">${acts}<div class="top" style="padding-right:60px">${thumb}<div class="body" data-edit="${x.id}">
      <span class="rname">${esc(x.courseName)}</span>
      <span class="badge" style="background:var(--accent-muted);color:var(--accent)">${esc(x.dayOfWeek)} ${esc(x.startTime)}-${esc(x.endTime)}</span>
      <span class="rdate" style="margin-left:0;color:var(--text-tertiary)">${esc(x.location)} (${esc(x.startWeek)}-${esc(x.endWeek)}周 ${esc(x.weekType)})</span>
      ${x.note?`<div class="rnote">${esc(x.note)}</div>`:''}${customBlock}</div></div></div>`;
  }
  // note
  return `<div class="rec ${layoutCls}">${acts}<div class="top" style="padding-right:60px">${thumb}<div class="body" data-edit="${x.id}">
    <span class="rname">${esc(x.title||'无标题')}</span>
    ${x.mood?`<span class="badge" style="background:var(--accent-muted);color:var(--accent)">${esc(x.mood)}</span>`:''}
    ${x.content?`<span class="rdate" style="margin-left:0;color:var(--text-tertiary)">${esc(x.content).slice(0,40)}</span>`:''}
    <span class="rdate">${x.date||''}</span>${customBlock}</div></div></div>`;
}

function streak(log){ if(!log) return 0; let n=0; const d=new Date();
  for(;;){ const k=localDateStr(d); if(log[k]){ n++; d.setDate(d.getDate()-1);} else break; } return n; }

function wireModule(key){ const m=modOf(key);
  $("#screen").querySelectorAll(".js-chk").forEach(el=>el.onclick=e=>{ e.stopPropagation();
    const x=(data[key]).find(i=>i.id==el.dataset.id);
    if(m.type==="todo"){
      const nextStatus=x.done?"pending":"completed";
      if(x.plannerGoalId){ plannerTaskStatus(x,nextStatus); return; }
      x.status=nextStatus; x.done=nextStatus==="completed";
      (data.schedule||[]).filter(block=>String(block.relatedItemId)===String(x.id)).forEach(block=>{ block.status=nextStatus; });
    } else if(m.type==="checkin"){ x.log=x.log||{}; const t=today(); x.log[t]?delete x.log[t]:x.log[t]=true; }
    persist(); });
  $("#screen").querySelectorAll("[data-edit]").forEach(el=>el.onclick=()=>openEditor(key,(data[key]).find(i=>i.id==el.dataset.edit)));
  $("#screen").querySelectorAll(".js-del").forEach(el=>el.onclick=e=>{ e.stopPropagation(); confirmDelete(key,el.dataset.id); });
  $("#screen").querySelectorAll(".js-pin").forEach(el=>el.onclick=e=>{ e.stopPropagation(); const x=(data[key]).find(i=>i.id==el.dataset.id); x.pinned=!x.pinned; persist(); });
  // For timetable module, wire up the term settings button
  if(key === "timetable") {
    const editTermBtn = $("#btn-edit-term-start");
    if(editTermBtn) editTermBtn.onclick = () => openTermSettingsEditor();
  }
}

/* ---------- scroll lock (prevent background scroll when modal open) ---------- */
let __scrollLockCount = 0;
function lockScroll(){
  __scrollLockCount++;
  if(__scrollLockCount === 1){
    document.body.style.overflow = "hidden";
  }
}
function unlockScroll(){
  if(__scrollLockCount > 0) __scrollLockCount--;
  if(__scrollLockCount === 0){
    document.body.style.overflow = "";
  }
}

/* ---------- EDITOR MODAL (per type) ---------- */
function openEditor(key,item){
  const m=modOf(key); const editing=!!item; const d=item||newItem(m);
  let fields="";
  if(m.type==="todo"){
    const planner=data.__planner||{};
    const plannerGoal=planner.goal||{};
    const plannerGoals=plannerGoal.id?[plannerGoal]:[];
    const plannerGoalOptions=plannerGoals.map(g=>`<option value="${attr(String(g.id))}" ${String(g.id)===String(d.plannerGoalId||d.goalId)?"selected":""}>${esc(g.title||"未命名目标")}</option>`).join("");
    const status=d.status|| (d.done?"completed":"pending");
    fields=`<div class="field"><label>任务</label><input id="f-title" value="${attr(d.title)}" placeholder="要做什么？"/></div>
      <div class="field"><label>优先级</label><div class="seg" id="f-prio">${(m.priorities||[]).map(p=>`<div class="opt ${p.key===d.priority?'on':''}" data-v="${p.key}">${p.label}</div>`).join("")}</div></div>
      <div class="frow"><div class="field"><label>状态</label><select id="f-todo-status"><option value="pending" ${status==="pending"?"selected":""}>待执行</option><option value="in_progress" ${status==="in_progress"?"selected":""}>进行中</option><option value="completed" ${status==="completed"?"selected":""}>已完成</option><option value="deferred" ${status==="deferred"?"selected":""}>已延期</option><option value="cancelled" ${status==="cancelled"?"selected":""}>已取消</option></select></div>
      <div class="field"><label>预计用时（分钟）</label><input id="f-estimatedMinutes" type="number" min="1" step="5" value="${attr(d.estimatedMinutes??"")}" placeholder="例如 30"/></div></div>
      <div class="frow"><div class="field"><label>截止日期</label><input id="f-dueDate" type="date" value="${attr(d.dueDate||"")}"/></div>
      <div class="field"><label>关联规划目标</label><select id="f-plannerGoalId"><option value="">不关联</option>${plannerGoalOptions}</select></div></div>
      ${plannerGoals.length?`<p class="sub" style="margin:-4px 0 8px">手动待办也可以纳入当前规划；自动生成的待办会保留原有目标关联。</p>`:""}
      <div class="field"><label>备注</label><textarea id="f-note" placeholder="补充说明">${esc(d.note||'')}</textarea></div>`;
  } else if(m.type==="checkin"){
    fields=`<div class="field"><label>打卡项</label><input id="f-title" value="${attr(d.title)}" placeholder="例如：喝够 8 杯水"/></div>
      <p class="sub" style="margin:0">保存后可在卡片点击左侧方块打卡；连续天数自动统计，每天从零开始。</p>`;
  } else if(m.type==="progress"){
    fields=`<div class="field"><label>名称</label><input id="f-title" value="${attr(d.title)}" placeholder="书名 / 目标"/></div>
      <div class="frow"><div class="field"><label>当前</label><input id="f-cur" type="number" value="${d.current??0}"/></div>
      <div class="field"><label>目标</label><input id="f-tgt" type="number" value="${d.target??1}"/></div>
      <div class="field"><label>单位</label><input id="f-unit" value="${attr(d.unit||m.unit||'')}"/></div class="frow"></div>
      <div class="field"><label>摘录 / 想法</label><textarea id="f-note" placeholder="随手记">${esc(d.note||'')}</textarea></div>`;
  } else if(m.type==="finance"){
    fields=`<div class="field"><label>类型</label><div class="seg" id="f-ftype">
        <div class="opt ${d.type!=='income'?'on':''}" data-v="expense">支出</div><div class="opt ${d.type==='income'?'on':''}" data-v="income">收入</div></div></div>
      <div class="frow"><div class="field"><label>项目</label><input id="f-title" value="${attr(d.title)}" placeholder="午餐 / 稿费"/></div>
      <div class="field"><label>金额 ¥</label><input id="f-amt" type="number" value="${d.amount??''}" placeholder="0"/></div></div>
      <div class="field"><label>分类</label><div class="seg" id="f-cat">${(m.categories||[]).map(c=>`<div class="opt ${c===d.category?'on':''}" data-v="${attr(c)}" style="flex:0 0 auto;min-width:auto">${esc(c)}</div>`).join("")}</div></div>
      <div class="field"><label>日期</label><input id="f-date" type="date" value="${d.date||isoToday()}"/></div>`;
  } else if (m.type === "timetable") {
    fields=`<div class="field"><label>课程名称</label><input id="f-courseName" value="${attr(d.courseName)}" placeholder="如：高等数学"/></div>
      <div class="frow"><div class="field"><label>授课教师</label><input id="f-instructor" value="${attr(d.instructor)}" placeholder="如：张教授"/></div>
      <div class="field"><label>上课地点</label><input id="f-location" value="${attr(d.location)}" placeholder="如：主楼 A101"/></div></div>
      <div class="field"><label>星期几</label><div class="seg" id="f-dayOfWeek">${(m.fields.find(f=>f.key==="dayOfWeek").options||[]).map(o=>`<div class="opt ${o===d.dayOfWeek?'on':''}" data-v="${attr(o)}">${esc(o)}</div>`).join("")}</div></div>
      <div class="frow"><div class="field"><label>开始时间</label><input id="f-startTime" value="${attr(d.startTime)}" placeholder="HH:MM"/></div>
      <div class="field"><label>结束时间</label><input id="f-endTime" value="${attr(d.endTime)}" placeholder="HH:MM"/></div></div>
      <div class="frow"><div class="field"><label>起始周</label><input id="f-startWeek" type="number" value="${d.startWeek??1}"/></div>
      <div class="field"><label>结束周</label><input id="f-endWeek" type="number" value="${d.endWeek??16}"/></div></div>
      <div class="field"><label>周类型</label><div class="seg" id="f-weekType">${(m.fields.find(f=>f.key==="weekType").options||[]).map(o=>`<div class="opt ${o===d.weekType?'on':''}" data-v="${attr(o)}">${esc(o)}</div>`).join("")}</div></div>
      <div class="field"><label>不规则周</label><input id="f-customWeeks" value="${attr(d.customWeeks)}" placeholder="如：1,3,5,7"/></div>
      <div class="field"><label>备注</label><textarea id="f-note" placeholder="如：需要带计算器">${esc(d.note||'')}</textarea></div>`;
  } else if (m.type === "schedule") {
    fields=`<div class="field"><label>日程标题</label><input id="f-title" value="${attr(d.title)}" placeholder="日程名称"/></div>
      <div class="field"><label>日期</label><input id="f-date" type="date" value="${d.date||isoToday()}"/></div>
      <div class="frow">
        <div class="field"><label>开始时间</label>
          <input type="time" id="f-start-time" value="${attr(d.startTime || '09:00')}" step="600">
        </div>
        <div class="field"><label>结束时间</label>
          <input type="time" id="f-end-time" value="${attr(d.endTime || '10:00')}" step="600">
        </div>
      </div>
      <div class="field"><label>关联模块</label><div class="seg" id="f-relatedModule">${(m.fields.find(f=>f.key==="relatedModule").options||[]).map(o=>`<div class="opt ${o===d.relatedModule?'on':''}" data-v="${attr(o)}">${esc(o==="todo"?"待办":o)}</div>`).join("")}</div></div>
      <div class="field"><label>关联待办</label><select id="f-relatedItemId"><option value="">不关联</option>${(data.todo||[]).filter(x=>!x.done&&x.status!=="cancelled").map(x=>`<option value="${attr(String(x.id))}" ${String(x.id)===String(d.relatedItemId)?"selected":""}>${esc(x.title||"未命名待办")}</option>`).join("")}</select></div>
      <div class="field"><label>显示颜色</label><div class="seg" id="f-color">${(m.fields.find(f=>f.key==="color").options||[]).map(o=>`<div class="opt ${o===d.color?'on':''}" data-v="${attr(o)}" style="background-color:${o}"></div>`).join("")}</div></div>
      <div class="field"><label>备注</label><textarea id="f-note" placeholder="备注信息">${esc(d.note||'')}</textarea></div>`;
  } else {
    fields=`<div class="field"><label>标题</label><input id="f-title" value="${attr(d.title)}" placeholder="给这条起个名"/></div>
      ${(m.moods&&m.moods.length)?`<div class="field"><label>标签 / 心情</label><div class="seg" id="f-mood">${m.moods.map(md=>`<div class="opt ${md===d.mood?'on':''}" data-v="${attr(md)}" style="flex:0 0 auto;min-width:auto">${md}</div>`).join("")}</div></div>`:''}
      <div class="field"><label>内容</label><textarea id="f-content" placeholder="写点什么…">${esc(d.content||'')}</textarea></div>
      <div class="field"><label>日期</label><input id="f-date" type="date" value="${d.date||isoToday()}"/></div>`;
  }
  // layout variant selector
  const layoutOpts=[{v:'default',l:'标准'},{v:'feature',l:'大图'},{v:'quote',l:'引文'}];
  fields=`<div class="field"><label>卡片样式</label><div class="seg" id="f-layout">${layoutOpts.map(o=>`<div class="opt ${o.v===(d.layout||'default')?'on':''}" data-v="${o.v}">${o.l}</div>`).join("")}</div></div>`+fields;
  // custom fields (from m.fields config) — rendered after type-specific fields
  // timetable & schedule have hardcoded fields above; skip to avoid duplication
  const skipCustomFields = m.type==="timetable" || m.type==="schedule";
  if(!skipCustomFields) (m.fields||[]).forEach(f=>{
    const v=d[f.key]||"";
    if(f.type==="select") fields+=`<div class="field"><label>${esc(f.label)}</label><div class="seg" id="f-cf-${f.key}">${(f.options||[]).map(o=>`<div class="opt ${o===v?'on':''}" data-v="${attr(o)}" style="flex:0 0 auto;min-width:auto">${esc(o)}</div>`).join("")}</div></div>`;
    else if(f.type==="textarea") fields+=`<div class="field"><label>${esc(f.label)}</label><textarea id="f-cf-${f.key}" placeholder="${attr(f.placeholder||'')}">${esc(v)}</textarea></div>`;
    else if(f.type==="number") fields+=`<div class="field"><label>${esc(f.label)}</label><input id="f-cf-${f.key}" type="number" value="${attr(v)}" placeholder="${attr(f.placeholder||'')}"/></div>`;
    else fields+=`<div class="field"><label>${esc(f.label)}</label><input id="f-cf-${f.key}" value="${attr(v)}" placeholder="${attr(f.placeholder||'')}"/></div>`;
  });
  // shared image URL field (all types)
  fields+=`<div class="field"><label>图片 URL（可选） <span style="font-size:11px;color:var(--text-tertiary);font-weight:500;">仅支持外链 · 不压缩 · 建议宽高比 1:1 · 双端记录卡片</span></label><input id="f-image" value="${attr(d.image||'')}" placeholder="https://..."/></div>`;
  const overlay=document.createElement("div"); overlay.className="overlay";
  overlay.innerHTML=`<div class="modal"><h3>${editing?'编辑':'新建'} · ${m.name}</h3><div class="sub">${m.desc}</div>${fields}
    <div class="modal-actions">${editing?'<button class="link-danger" id="m-del">删除</button>':''}<div class="spacer"></div>
      <button class="btn ghost" id="m-cancel">取消</button><button class="btn" id="m-save">保存</button></div></div>`;
  document.body.appendChild(overlay);
  lockScroll();

  // Wire up time pickers if they exist (enforce end ≥ start)
  const startTimeInput = overlay.querySelector("#f-start-time");
  const endTimeInput = overlay.querySelector("#f-end-time");
  if (startTimeInput && endTimeInput) {
    startTimeInput.addEventListener("change", () => {
      if (endTimeInput.value && startTimeInput.value > endTimeInput.value) {
        endTimeInput.value = startTimeInput.value;
      }
    });
    endTimeInput.addEventListener("change", () => {
      if (startTimeInput.value && endTimeInput.value < startTimeInput.value) {
        startTimeInput.value = endTimeInput.value;
      }
    });
  }

  const close=()=>{ unlockScroll(); overlay.remove(); };
  overlay.onclick=e=>{ if(e.target===overlay) close(); };
  overlay.querySelector("#m-cancel").onclick=close;
  overlay.querySelectorAll(".seg").forEach(seg=>seg.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{ seg.querySelectorAll(".opt").forEach(x=>x.classList.remove("on")); o.classList.add("on"); }));
  if(editing) overlay.querySelector("#m-del").onclick=()=>{ close(); confirmDelete(key,d.id); };
  overlay.querySelector("#m-save").onclick=()=>{
    const val=id=>{ const el=overlay.querySelector(id); return el?el.value:undefined; };
    const seg=id=>{ const el=overlay.querySelector(id+" .on"); return el?el.dataset.v:undefined; };
    d.title=(val("#f-title")||"").trim()||"未命名";
    d.layout=seg("#f-layout")||'default';
    if(m.type==="todo"){
      d.priority=seg("#f-prio")||d.priority;
      d.note=(val("#f-note")||"").trim();
      const nextStatus=val("#f-todo-status")||d.status||(d.done?"completed":"pending");
      const allowedStatus=["pending","in_progress","completed","deferred","cancelled"];
      d.status=allowedStatus.includes(nextStatus)?nextStatus:"pending";
      d.done=d.status==="completed";
      const estimated=Number(val("#f-estimatedMinutes"));
      if(Number.isFinite(estimated)&&estimated>0) d.estimatedMinutes=Math.round(estimated);
      else if(!editing) delete d.estimatedMinutes;
      d.dueDate=(val("#f-dueDate")||"").trim();
      const selectedGoal=(val("#f-plannerGoalId")||"").trim();
      if(selectedGoal){
        d.plannerGoalId=selectedGoal; d.goalId=selectedGoal; d.source=d.source||"manual";
        const planner=data.__planner||{};
        const goal=planner.goal&&String(planner.goal.id)===String(selectedGoal)?planner.goal:null;
        if(goal){ d.planScope=d.planScope||"long_term"; d.plannerReason=d.plannerReason||"手动加入当前规划"; }
      } else if(!d.plannerTaskId){
        delete d.plannerGoalId; delete d.goalId; delete d.milestoneId; delete d.deliverableId;
      }
      if(d.plannerGoalId){
        plannerTaskStatus(d,d.status);
      } else {
        (data.schedule||[]).filter(x=>String(x.relatedItemId)===String(d.id)).forEach(block=>{ block.status=d.status; });
        persist();
      }
    }
    else if(m.type==="progress"){ d.current=Math.max(0,+val("#f-cur")||0); d.target=Math.max(1,+val("#f-tgt")||1); d.unit=(val("#f-unit")||"").trim(); d.note=(val("#f-note")||"").trim(); }
    else if(m.type==="finance"){ d.type=seg("#f-ftype")||"expense"; d.amount=Math.max(0,+val("#f-amt")||0); d.category=seg("#f-cat")||(m.categories&&m.categories[0])||"其他"; d.date=val("#f-date"); }
    else if(m.type==="timetable"){ d.courseName=(val("#f-courseName")||"").trim(); d.instructor=(val("#f-instructor")||"").trim(); d.location=(val("#f-location")||"").trim(); d.dayOfWeek=seg("#f-dayOfWeek")||d.dayOfWeek; d.startTime=(val("#f-startTime")||"").trim(); d.endTime=(val("#f-endTime")||"").trim(); d.startWeek=Math.max(1,+val("#f-startWeek")||1); d.endWeek=Math.max(1,+val("#f-endWeek")||16); d.weekType=seg("#f-weekType")||d.weekType; d.customWeeks=(val("#f-customWeeks")||"").trim(); d.note=(val("#f-note")||"").trim(); }
    else if(m.type==="schedule"){ d.title=(val("#f-title")||"").trim()||"未命名"; d.date=val("#f-date"); d.startTime=val("#f-start-time")||"09:00"; d.endTime=val("#f-end-time")||"10:00"; if(d.endTime<=d.startTime){ toast("结束时间必须晚于开始时间"); return; } d.relatedModule=seg("#f-relatedModule")||"无"; d.relatedItemId=(val("#f-relatedItemId")||"").trim(); d.color=seg("#f-color"); d.note=(val("#f-note")||"").trim(); }
    else if(m.type==="note"){ d.mood=seg("#f-mood")||d.mood||""; d.content=(val("#f-content")||"").trim(); d.date=val("#f-date"); }
    // save custom fields (skip timetable & schedule — saved via hardcoded branches above)
    if(!skipCustomFields) (m.fields||[]).forEach(f=>{
      if(f.type==="select") d[f.key]=seg("#f-cf-"+f.key)||d[f.key]||"";
      else if(f.type==="number") d[f.key]=Math.max(0,+val("#f-cf-"+f.key)||0);
      else d[f.key]=(val("#f-cf-"+f.key)||"").trim();
    });
    // save image
    d.image=(val("#f-image")||"").trim();
    if(!editing) (data[key]=data[key]||[]).unshift(d);
    persist(); close();
  };
}

function newItem(m){ const base={id:Date.now()}; let item;
  if(m.type==="todo") item={...base,title:"",priority:(m.priorities&&m.priorities[1]?m.priorities[1].key:"P1"),done:false,status:"pending",dueDate:"",estimatedMinutes:"",plannerGoalId:"",source:"manual",note:""};
  else if(m.type==="checkin") item={...base,title:"",log:{}};
  else if(m.type==="progress") item={...base,title:"",current:0,target:(m.unit==="页"?100:20),unit:m.unit||"",note:""};
  else if(m.type==="finance") item={...base,title:"",type:"expense",amount:"",category:(m.categories&&m.categories[0])||"其他",date:isoToday()};
  else if(m.type==="timetable") {
    item={...base,title:"",courseName:"",instructor:"",location:"",dayOfWeek:m.fields.find(f=>f.key==="dayOfWeek").options[0]||"",startTime:"08:00",endTime:"09:40",startWeek:1,endWeek:16,weekType:m.fields.find(f=>f.key==="weekType").options[0]||"每周",customWeeks:"",note:""};
    item.title = item.courseName; // Ensure title is same as courseName for timetable
  }
  else if(m.type==="schedule") item={...base,title:"",date:isoToday(),startTime:"09:00",endTime:"10:00",relatedModule:"",relatedItemId:"",color:"",note:""};
  else item={...base,title:"",content:"",mood:(m.moods&&m.moods[0])||"",date:isoToday()};
  // initialize custom fields
  (m.fields||[]).forEach(f=>{ if(!(f.key in item)) item[f.key]= f.type==="select"?(f.options&&f.options[0]||""):""; });
  return item;
}

/* ---------- delete confirm ---------- */
function confirmDelete(key,id){ const item=(data[key]||[]).find(i=>i.id==id); if(!item) return;
  const undoData=structuredClone(item);
  const overlay=document.createElement("div"); overlay.className="overlay";
  overlay.innerHTML=`<div class="modal" style="width:400px"><h3>删除记录</h3><div class="sub">确定删除「${esc(item.title||'这条记录')}」？此操作不可撤销。</div>
    <div class="modal-actions"><div class="spacer"></div><button class="btn ghost" id="c-cancel">取消</button><button class="btn danger" id="c-ok">删除</button></div></div>`;
  document.body.appendChild(overlay);
  lockScroll();
  const close=()=>{ unlockScroll(); overlay.remove(); };
  overlay.onclick=e=>{ if(e.target===overlay) close(); };
  overlay.querySelector("#c-cancel").onclick=close;
  overlay.querySelector("#c-ok").onclick=()=>{ data[key]=data[key].filter(i=>i.id!=id); if(item.plannerGoalId&&key==="todo"){ (data.schedule||[]).filter(x=>String(x.relatedItemId)===String(id)).forEach(x=>{ x.relatedItemId=""; x.status="orphaned"; }); } persist(); close(); setTimeout(()=>{ const undo=confirm("已删除。是否撤销这次删除？"); if(undo){ data[key]=data[key]||[]; data[key].unshift(undoData); persist(); toast("已恢复删除的记录"); } },100); };
}

/* ---------- TREND EDITOR MODAL ---------- */
function openTrendEditor(){
  const days=["周一","周二","周三","周四","周五","周六","周日"];
  const cur=Array.isArray(data.__trend)&&data.__trend.length===7?data.__trend:[50,50,50,50,50,50,50];
  const rows=days.map((d,i)=>`<div class="field trend-row"><label>${d}</label>
    <div class="trend-row-inner"><input type="range" class="trend-slider" min="0" max="100" step="1" value="${cur[i]}" data-idx="${i}"><span class="trend-val">${cur[i]}</span></div></div>`).join("");
  const overlay=document.createElement("div"); overlay.className="overlay";
  overlay.innerHTML=`<div class="modal" style="width:420px"><h3>本周状态趋势</h3><div class="sub">为每天的状态打分（0-100），用于首页趋势折线图。</div>
    ${rows}
    <div class="modal-actions"><div class="spacer"></div><button class="btn ghost" id="t-cancel">取消</button><button class="btn" id="t-save">保存</button></div></div>`;
  document.body.appendChild(overlay);
  lockScroll();
  overlay.querySelectorAll(".trend-slider").forEach(s=>{
    const span=s.nextElementSibling;
    s.oninput=()=>{ span.textContent=s.value; };
  });
  const close=()=>{ unlockScroll(); overlay.remove(); };
  overlay.onclick=e=>{ if(e.target===overlay) close(); };
  overlay.querySelector("#t-cancel").onclick=close;
  overlay.querySelector("#t-save").onclick=()=>{
    const vals=Array.from(overlay.querySelectorAll(".trend-slider")).map(s=>parseInt(s.value)||0);
    data.__trend=vals; persist(); close();
  };
}

/* ---------- TERM SETTINGS MODAL ---------- */
function openTermSettingsEditor(){
  const overlay=document.createElement("div"); overlay.className="overlay";
  overlay.innerHTML=`<div class="modal" style="width:400px"><h3>学期设置</h3><div class="sub">设置当前学期的开始日期，将影响课程表的周次计算。</div>
    <div class="field"><label>开学日期</label><input id="f-termStartDate" type="date" value="${data.__termStartDate||isoToday()}"/></div>
    <div class="modal-actions"><div class="spacer"></div><button class="btn ghost" id="ts-cancel">取消</button><button class="btn" id="ts-save">保存</button></div></div>`;
  document.body.appendChild(overlay);
  lockScroll();
  const close=()=>{ unlockScroll(); overlay.remove(); };
  overlay.onclick=e=>{ if(e.target===overlay) close(); };
  overlay.querySelector("#ts-cancel").onclick=close;
  overlay.querySelector("#ts-save").onclick=()=>{
    const newDate = overlay.querySelector("#f-termStartDate").value;
    if(newDate) data.__termStartDate = newDate;
    persist(); close();
  };
}

/* ---------- SETTINGS VIEW ---------- */
function renderSettings() {
  $("#screen").innerHTML = `<div class="header"><div><h2>设置</h2><p>个性化你的工作台</p></div><div class="spacer"></div><span class="date-chip">${icon("calendar",14)} ${dateStr()}</span></div>
    <div class="sec-title">通用设置</div>
    <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:15px;">
      <div class="field"><label>你的名字</label><input id="f-owner" value="${attr(CONFIG.owner)}"/></div>
      <div class="field"><label>个性签名/标语</label><input id="f-slogan" value="${attr(CONFIG.slogan)}"/></div>
      <div class="field"><label>首页背景图 <span style="font-size:11px;color:var(--text-tertiary);font-weight:500;">上传规格：≤1280×720 · JPEG 80% · 双端首页问候区背景</span></label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input id="f-greet-image" value="${attr(data.__greetImage || '')}" placeholder="URL 或点击上传，清除则无背景" style="flex:1;min-width:120px;"/><button class="btn ghost sm" id="btn-greet-upload">${icon("upload",14,2)}上传</button><button class="btn ghost sm" id="btn-greet-clear" ${!data.__greetImage?'disabled':''}>清除</button><input type="file" id="greet-file-input" accept="image/*" hidden/>
          <img id="f-greet-image-preview" src="${attr(data.__greetImage || '')}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;${data.__greetImage?'':'display:none;'}" onerror="this.style.display='none'" onload="this.style.display='inline-block'"/>
        </div>
      </div>
      <div class="field"><label>头像 <span style="font-size:11px;color:var(--text-tertiary);font-weight:500;">上传规格：≤256×256 · JPEG 85% · 桌面侧栏/手机抽屉</span></label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input id="f-avatar" value="${attr(data.__avatar || '')}" placeholder="URL 或点击上传，清除则不显示头像" style="flex:1;min-width:120px;"/><button class="btn ghost sm" id="btn-avatar-upload">${icon("upload",14,2)}上传</button><button class="btn ghost sm" id="btn-avatar-clear" ${!data.__avatar?'disabled':''}>清除</button><input type="file" id="avatar-file-input" accept="image/*" hidden/>
          <img id="f-avatar-preview" src="${attr(data.__avatar || '')}" style="width:40px;height:40px;object-fit:cover;border-radius:50%;${data.__avatar?'':'display:none;'}" onerror="this.style.display='none'" onload="this.style.display='inline-block'"/>
        </div>
      </div>
      <div style="height:1px;background:var(--border);margin:4px 0;"></div>
      <div class="field"><label>底板背景图 <span style="font-size:11px;color:var(--text-tertiary);font-weight:500;">上传规格：≤1920×1080 · JPEG 80% · 双端整页背景</span></label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input id="f-pagebg" value="${attr(data.__pageBgImage || '')}" placeholder="URL 或点击上传，留空则纯色" style="flex:1;min-width:120px;"/>
          <button class="btn ghost sm" id="btn-pagebg-upload">${icon("upload",14,2)}上传</button>
          <button class="btn ghost sm" id="btn-pagebg-clear" ${!data.__pageBgImage?'disabled':''}>清除</button>
          <input type="file" id="pagebg-file-input" accept="image/*" hidden/>
          <img id="f-pagebg-preview" src="${attr(data.__pageBgImage || '')}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;${data.__pageBgImage?'':'display:none;'}" onerror="this.style.display='none'" onload="this.style.display='inline-block'"/>
        </div>
      </div>
      <div class="field"><label>底板模糊度 <span id="f-blur-val" style="color:var(--accent);font-weight:700;">${data.__pageBgBlur ?? 12}px</span></label>
        <input type="range" id="f-pagebg-blur" min="0" max="40" step="1" value="${data.__pageBgBlur ?? 12}" style="width:100%;accent-color:var(--accent);"/>
      </div>
      <div style="height:1px;background:var(--border);margin:4px 0;"></div>
      <div class="field"><label>侧栏透明度 <span id="f-sidebar-op-val" style="color:var(--accent);font-weight:700;">${Math.round((data.__sidebarOpacity ?? 1) * 100)}%</span></label>
        <input type="range" id="f-sidebar-opacity" min="0.2" max="1" step="0.05" value="${data.__sidebarOpacity ?? 1}" style="width:100%;accent-color:var(--accent);"/>
      </div>
      <div class="field"><label>卡片透明度 <span id="f-card-op-val" style="color:var(--accent);font-weight:700;">${Math.round((data.__cardOpacity ?? 1) * 100)}%</span></label>
        <input type="range" id="f-card-opacity" min="0.2" max="1" step="0.05" value="${data.__cardOpacity ?? 1}" style="width:100%;accent-color:var(--accent);"/>
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button class="btn ghost" id="btn-settings-cancel">取消</button>
        <button class="btn" id="btn-settings-save">保存</button>
      </div>
    </div>

    <div class="sec-title">自定义 AI 模型</div>
    <div class="card ai-config-card" style="padding:20px;display:flex;flex-direction:column;gap:15px;">
      <div class="ai-config-intro"><div><div style="font-weight:700;font-size:14px;">AI 接口配置</div><div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">只需填写接口地址、API Key 和模型名称，配置仅保存在本机。</div></div><span class="ai-config-state" id="ai-config-state">${getAIConfig().endpoint?'已配置':'未配置'}</span></div>
      <div class="field"><label>接口地址</label><input id="f-ai-endpoint" type="url" value="${attr(getAIConfig().endpoint||'')}" placeholder="例如：https://api.example.com/v1/chat/completions"/></div>
      <div class="field"><label>API Key</label><input id="f-ai-key" type="password" value="${attr(getAIConfig().apiKey||'')}" placeholder="仅保存在本机，不会写入项目文件"/></div>
      <div class="field"><label>模型名称</label><input id="f-ai-model" value="${attr(getAIConfig().model||'')}" placeholder="例如：my-model"/></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn" id="btn-ai-save">保存配置</button><button class="btn ghost" id="btn-ai-test">测试连接</button><button class="btn danger" id="btn-ai-clear" ${getAIConfig().endpoint?'':'disabled'}>清除配置</button></div>
      <div id="ai-config-message" class="ai-config-message"></div>
    </div>

    <div class="sec-title">数据管理</div>
    <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:15px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:14px;">导出数据</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">将全部数据导出为 JSON 文件，可用于备份或迁移。</div>
        </div>
        <button class="btn ghost" id="btn-export">${icon("download",16,2)}导出</button>
      </div>
      <div style="height:1px;background:var(--border);"></div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:14px;">导入数据</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">从 JSON 文件导入数据，将覆盖当前全部数据。</div>
        </div>
        <button class="btn ghost" id="btn-import">${icon("upload",16,2)}导入</button>
        <input type="file" id="import-file-input" accept=".json,application/json" hidden/>
      </div>
      <div style="height:1px;background:var(--border);"></div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:14px;color:var(--danger);">重置数据</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">清除全部数据并恢复初始状态，此操作不可撤销。</div>
        </div>
        <button class="btn danger" id="btn-reset">${icon("trash",16,2)}重置</button>
      </div>
    </div>

    <div class="sec-title">云端同步</div>
    <div class="card sync-card" style="padding:20px;display:flex;flex-direction:column;gap:15px;">
      <div class="sync-status-bar" id="sync-status-bar"></div>
      <div class="field"><label>GitHub Token</label><input id="f-sync-token" type="password" value="${attr(getSyncConfig().token||'')}" placeholder="ghp_xxx... (需 gist 权限)"/></div>
      <div class="field"><label>Gist ID</label><input id="f-sync-gistid" value="${attr(getSyncConfig().gistId||'')}" placeholder="留空则自动创建新 Gist"/></div>
      <div class="field" style="flex-direction:row;align-items:center;gap:8px;">
        <input type="checkbox" id="f-sync-auto" ${getSyncConfig().autoSync===false?'':'checked'} style="width:auto;"/>
        <label for="f-sync-auto" style="margin:0;cursor:pointer;">自动同步（数据变更后 1.5 秒自动推送）</label>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:5px;">
        <button class="btn" id="btn-sync-connect">${icon("sync",15,1.8)}连接</button>
        <button class="btn ghost" id="btn-sync-push" ${!getSyncConfig().token?'disabled':''}>推送</button>
        <button class="btn ghost" id="btn-sync-pull" ${!getSyncConfig().token?'disabled':''}>拉取</button>
        <button class="btn danger" id="btn-sync-disconnect" ${!getSyncConfig().token?'disabled':''}>断开</button>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">
        ${icon("sync",11,1.7)} 通过 GitHub Gist 实现跨设备数据同步。前往 <a href="https://github.com/settings/tokens" target="_blank" style="color:var(--accent);">GitHub Settings → Tokens</a> 创建 Classic Token（勾选 gist 权限，过期时间可选 No expiration 永久有效），粘贴到上方。Gist 为私有，仅你自己可访问。
      </div>
    </div>

    <div style="text-align:center;padding:18px 0 6px;font-size:12px;color:var(--text-tertiary);">
      ${icon("grid",12,1.7)} <span style="font-weight:700;">个人工作台 ${APP_VERSION}</span> · 本地数据存储 · 更新日志见 GitHub
    </div>
    </div>`;

  $("#btn-settings-cancel").onclick = () => go("home");
  $("#btn-settings-save").onclick = () => {
    CONFIG.owner = $("#f-owner").value.trim();
    CONFIG.slogan = $("#f-slogan").value.trim();
    data.__greetImage = $("#f-greet-image").value.trim();
    data.__avatar = $("#f-avatar").value.trim();
    data.__pageBgImage = $("#f-pagebg").value.trim();
    data.__pageBgBlur = parseInt($("#f-pagebg-blur").value) || 0;
    data.__sidebarOpacity = parseFloat($("#f-sidebar-opacity").value) || 1;
    data.__cardOpacity = parseFloat($("#f-card-opacity").value) || 1;
    // 保存"自动同步"复选框状态到同步配置
    const autoEl = $("#f-sync-auto");
    if(autoEl) setSyncConfig({ autoSync: autoEl.checked });
    persist();
    buildNav();          // 刷新侧栏/抽屉中的用户名与头像
    applyPageBg();
    applyOpacity();
    go("home");
  };

  // Real-time preview for greet image (URL input)
  const greetImageInput = $("#f-greet-image");
  const greetImagePreview = $("#f-greet-image-preview");
  const greetClearBtn = $("#btn-greet-clear");
  greetImageInput.oninput = () => {
    const url = greetImageInput.value.trim();
    greetImagePreview.style.display = url ? 'inline-block' : 'none';
    greetImagePreview.src = url || '';
    if(url){
      document.body.style.setProperty('--greet-image', `url('${url}')`);
    } else {
      document.body.style.setProperty('--greet-image', 'none');
    }
    if(greetClearBtn) greetClearBtn.disabled = !url;
  };
  if(greetClearBtn) greetClearBtn.onclick = () => {
    greetImageInput.value = "";
    greetImagePreview.style.display = 'none';
    greetImagePreview.src = '';
    document.body.style.setProperty('--greet-image', 'none');
    greetClearBtn.disabled = true;
    toast("首页背景图已清除");
  };

  // Real-time preview for avatar (URL input)
  const avatarInput = $("#f-avatar");
  const avatarPreview = $("#f-avatar-preview");
  const avatarClearBtn = $("#btn-avatar-clear");
  avatarInput.oninput = () => {
    const url = avatarInput.value.trim();
    avatarPreview.style.display = url ? 'inline-block' : 'none';
    avatarPreview.src = url || '';
    if(url){
      $("#avaImg").src = url; $("#avaImg").style.display = 'block';
      [$("#ava"), $("#drawerBrand")].forEach(b=>b&&b.classList.remove("no-img"));
    } else {
      $("#avaImg").style.display = 'none';
      [$("#ava"), $("#drawerBrand")].forEach(b=>b&&b.classList.add("no-img"));
    }
    if(avatarClearBtn) avatarClearBtn.disabled = !url;
  };
  if(avatarClearBtn) avatarClearBtn.onclick = () => {
    avatarInput.value = "";
    avatarPreview.style.display = 'none';
    avatarPreview.src = '';
    $("#avaImg").style.display = 'none';
    [$("#ava"), $("#drawerBrand")].forEach(b=>b&&b.classList.add("no-img"));
    avatarClearBtn.disabled = true;
    toast("头像已清除");
  };

  // ---- 图片压缩工具已提取为全局函数 compressImage() ----

  // ---- 背景图上传 ----
  const greetFileInput = $("#greet-file-input");
  $("#btn-greet-upload").onclick = () => greetFileInput.click();
  greetFileInput.onchange = e => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    compressImage(f, 1280, 720, 0.8, dataUrl => {
      greetImageInput.value = dataUrl;
      greetImagePreview.src = dataUrl;
      document.body.style.setProperty('--greet-image', `url('${dataUrl}')`);
      toast("背景图已加载（压缩至 ≤1280×720 JPEG 80%），点击保存生效");
    });
    e.target.value = "";
  };

  // ---- 头像上传 ----
  const avatarFileInput = $("#avatar-file-input");
  $("#btn-avatar-upload").onclick = () => avatarFileInput.click();
  avatarFileInput.onchange = e => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    compressImage(f, 256, 256, 0.85, dataUrl => {
      avatarInput.value = dataUrl;
      avatarPreview.src = dataUrl;
      $("#avaImg").src = dataUrl;
      toast("头像已加载（压缩至 ≤256×256 JPEG 85%），点击保存生效");
    });
    e.target.value = "";
  };

  // ---- 底板背景图 ----
  const pagebgInput = $("#f-pagebg");
  const pagebgPreview = $("#f-pagebg-preview");
  const pagebgFileInput = $("#pagebg-file-input");
  const blurSlider = $("#f-pagebg-blur");
  const blurVal = $("#f-blur-val");

  // URL 输入实时预览
  pagebgInput.oninput = () => {
    const url = pagebgInput.value.trim();
    const resolved = url && !url.startsWith("data:") && !url.startsWith("http") ? new URL(url, document.baseURI).href : url;
    pagebgPreview.src = resolved;
    pagebgPreview.style.display = url ? 'inline-block' : 'none';
    document.body.style.setProperty('--page-bg-image', resolved ? `url('${resolved}')` : 'none');
    document.body.setAttribute('data-has-pagebg', url ? 'true' : 'false');
    $("#btn-pagebg-clear").disabled = !url;
  };

  // 上传本地图片
  $("#btn-pagebg-upload").onclick = () => pagebgFileInput.click();
  pagebgFileInput.onchange = e => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    compressImage(f, 1920, 1080, 0.8, dataUrl => {
      pagebgInput.value = dataUrl;
      pagebgPreview.src = dataUrl;
      pagebgPreview.style.display = 'inline-block';
      document.body.style.setProperty('--page-bg-image', `url('${dataUrl}')`);
      document.body.setAttribute('data-has-pagebg', 'true');
      $("#btn-pagebg-clear").disabled = false;
      toast("底板背景图已加载（压缩至 ≤1920×1080 JPEG 80%），点击保存生效");
    });
    e.target.value = "";
  };

  // 清除底板背景图
  $("#btn-pagebg-clear").onclick = () => {
    pagebgInput.value = "";
    pagebgPreview.style.display = 'none';
    document.body.style.setProperty('--page-bg-image', 'none');
    document.body.setAttribute('data-has-pagebg', 'false');
    $("#btn-pagebg-clear").disabled = true;
  };

  // 模糊度滑块实时预览
  blurSlider.oninput = () => {
    const v = parseInt(blurSlider.value) || 0;
    blurVal.textContent = `${v}px`;
    document.body.style.setProperty('--page-bg-blur', `${v}px`);
  };

  // 侧栏透明度滑块实时预览
  const sidebarOpSlider = $("#f-sidebar-opacity");
  const sidebarOpVal = $("#f-sidebar-op-val");
  sidebarOpSlider.oninput = () => {
    const v = parseFloat(sidebarOpSlider.value) || 1;
    sidebarOpVal.textContent = `${Math.round(v * 100)}%`;
    document.documentElement.style.setProperty('--sidebar-opacity', v);
  };

  // 卡片透明度滑块实时预览
  const cardOpSlider = $("#f-card-opacity");
  const cardOpVal = $("#f-card-op-val");
  cardOpSlider.oninput = () => {
    const v = parseFloat(cardOpSlider.value) || 1;
    cardOpVal.textContent = `${Math.round(v * 100)}%`;
    document.documentElement.style.setProperty('--card-opacity', v);
  };

  // ---- 自定义 AI 模型 ----
  const readAIForm=()=>({endpoint:$("#f-ai-endpoint").value.trim(),model:$("#f-ai-model").value.trim(),authType:"bearer",apiKey:$("#f-ai-key").value.trim()});
  const aiMessage=(text,good=false)=>{ const el=$("#ai-config-message"); if(el){el.textContent=text;el.className=`ai-config-message ${good?'is-good':'is-error'}`;} };
  $("#btn-ai-save").onclick=()=>{ const cfg=readAIForm(); if(!cfg.endpoint||!cfg.apiKey||!cfg.model){ aiMessage("请填写接口地址、API Key 和模型名称"); return; } setAIConfig({...cfg,lastTest:null}); $("#ai-config-state").textContent="已配置"; $("#btn-ai-clear").disabled=false; aiMessage("配置已保存在本机",true); toast("AI 配置已保存"); };
  $("#btn-ai-test").onclick=async()=>{ const cfg=readAIForm(); aiMessage("正在测试接口..."); try{ await testAIConnection(cfg); setAIConfig({...cfg,lastTest:new Date().toISOString()}); $("#ai-config-state").textContent="连接正常"; $("#btn-ai-clear").disabled=false; aiMessage("连接测试成功，配置已保存在本机",true); toast("AI 接口连接成功"); }catch(err){ aiMessage(`连接测试失败：${err.name==='AbortError'?'请求超时':err.message}`); } };
  $("#btn-ai-clear").onclick=()=>{ if(!confirm("确定清除本机保存的 AI 配置吗？")) return; delete data.__aiConfig; store.save(); renderSettings(); toast("AI 配置已清除"); };

  // ---- 数据导出 ----
  $("#btn-export").onclick = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const d = new Date();
    a.download = `workbench-backup-${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("数据已导出");
  };

  // ---- 数据导入 ----
  const importInput = $("#import-file-input");
  $("#btn-import").onclick = () => importInput.click();
  importInput.onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        // 基本校验：确保导入的是合法数据对象
        if(typeof imported !== "object" || imported === null || Array.isArray(imported))
          throw new Error("文件格式不正确");
        // 校验模块结构，避免合法 JSON 覆盖成不可用的数据结构
        CONFIG.modules.forEach(m => {
          if(imported[m.key] == null) imported[m.key] = structuredClone(m.seed || []);
          if(!Array.isArray(imported[m.key])) throw new Error(`${m.name} 数据必须是数组`);
        });
        const importedCount = CONFIG.modules.reduce((sum,m)=>sum + imported[m.key].length, 0);
        const currentCount = CONFIG.modules.reduce((sum,m)=>sum + ((data[m.key]||[]).length), 0);
        if(!confirm(`导入将覆盖当前 ${currentCount} 条记录，替换为 ${importedCount} 条记录。已确认文件格式，是否继续？`)) return;
        // 写入并刷新，保留同步配置与导入前备份
        const preservedSync = data.__sync;
        const importBackup = structuredClone(data);
        data = imported;
        data.__lastImportBackup = importBackup;
        if(preservedSync) data.__sync = preservedSync;
        data.__lastModified = new Date().toISOString();
        data.__onboarding = { seen:true, demoChoice:"imported", completedAt:new Date().toISOString() };
        data.__isDemoData = false;
        store.save();
        buildNav();
        render();
        scheduleSyncPush();
        toast(`数据导入成功，已保留导入前备份（${currentCount} 条）`);
      } catch(err) {
        toast("导入失败: " + err.message);
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  // ---- 数据重置 ----
  $("#btn-reset").onclick = () => {
    if(!confirm("确定要清除全部数据并恢复初始状态吗？此操作不可撤销。")) return;
    const preservedSync = data.__sync; // 保留同步配置，避免重置后丢失 token
    const resetBackup = structuredClone(data);
    localStorage.removeItem(CONFIG.storageKey);
    data = store.load();
    data.__lastImportBackup = resetBackup;
    data.__onboarding = { seen:false, demoChoice:"pending" };
    data.__isDemoData = true;
    if(preservedSync) data.__sync = preservedSync;
    store.save();
    buildNav();
    render();
    updateSyncIndicator();
    toast("数据已重置");
  };

  // ---- 云端同步 ----
  function renderSyncStatus(){
    const bar=$("#sync-status-bar"); if(!bar) return;
    const cfg=getSyncConfig();
    if(!cfg.token){ bar.innerHTML=""; bar.style.display="none"; return; }
    bar.style.display="block";
    let statusText="已配置", statusColor="var(--text-secondary)";
    if(syncState.status==="synced"){ statusText="已同步"; statusColor="var(--success)"; }
    else if(syncState.status==="pushing"){ statusText="推送中…"; statusColor="var(--text-secondary)"; }
    else if(syncState.status==="pulling"){ statusText="拉取中…"; statusColor="var(--text-secondary)"; }
    else if(syncState.status==="error"){ statusText="同步异常: "+(syncState.error||""); statusColor="var(--danger)"; }
    let lastText="";
    if(cfg.lastSync){ const d=new Date(cfg.lastSync); lastText=` · 上次: ${d.getMonth()+1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
    bar.innerHTML=`${icon("sync",13,1.7)} <span style="color:${statusColor}">${statusText}</span>${lastText?`<span style="color:var(--text-secondary);margin-left:4px;">${lastText}</span>`:""}`;
  }
  renderSyncStatus();

  // 连接 / 创建 Gist
  $("#btn-sync-connect").onclick = async () => {
    const token=$("#f-sync-token").value.trim();
    const gistIdInput=$("#f-sync-gistid").value.trim();
    if(!token){ toast("请先填写 GitHub Token"); return; }
    if(gistIdInput){
      // 连接已有 Gist — 先验证
      try{
        syncState={status:"pulling",lastSync:null,error:null}; renderSyncStatus(); updateSyncIndicator();
        const remote=await gistPull(token, gistIdInput);
        setSyncConfig({ token, gistId:gistIdInput, autoSync:$("#f-sync-auto").checked, lastSync:remote.updatedAt });
        const remoteData=JSON.parse(remote.content);
        // 连接已有 Gist：以云端数据为准（单用户双端场景），保留本地底板背景与同步配置
        data={...remoteData, __sync:getSyncConfig(), __pageBgImage:data.__pageBgImage||"", __pageBgBlur:data.__pageBgBlur??12};
        store.save(); buildNav(); render();
        toast("已连接并拉取最新数据");
        syncState={status:"synced",lastSync:remote.updatedAt,error:null};
        renderSettings();
      }catch(err){
        syncState={status:"error",lastSync:null,error:err.message};
        toast("连接失败: "+err.message);
        renderSyncStatus();
      }
      updateSyncIndicator();
    }else{
      // 创建新 Gist 并推送当前数据
      try{
        syncState={status:"pushing",lastSync:null,error:null}; renderSyncStatus(); updateSyncIndicator();
        toast("正在创建 Gist...");
        const payload=buildSyncPayload();
        const gid=await gistCreate(token, payload);
        setSyncConfig({ token, gistId:gid, autoSync:$("#f-sync-auto").checked, lastSync:new Date().toISOString() });
        syncState={status:"synced",lastSync:new Date().toISOString(),error:null};
        toast("已创建 Gist 并推送数据");
        renderSettings();
      }catch(err){
        syncState={status:"error",lastSync:null,error:err.message};
        toast("创建失败: "+err.message);
        renderSyncStatus();
      }
      updateSyncIndicator();
    }
  };

  // 推送
  $("#btn-sync-push").onclick = () => syncPush(false);
  // 拉取
  $("#btn-sync-pull").onclick = () => syncPull(false);

  // 断开
  $("#btn-sync-disconnect").onclick = () => {
    if(!confirm("确定断开云端同步吗？本地数据不受影响，但将不再自动同步。")) return;
    delete data.__sync;
    syncState={status:"idle",lastSync:null,error:null};
    store.save();
    buildNav();
    render();
    toast("已断开同步");
  };
}

/* ---------- router / sidebar ---------- */
let lastPullByView = 0;   // 保留节流状态，页面切换不再触发同步提示
function ifPullOnView(v){
  // 页面切换只负责渲染，云端同步仅由设置页中的手动按钮触发。
  return;
}
function dateStr(){ const n=new Date(); const wd="日一二三四五六"[n.getDay()]; return `${n.getFullYear()}年${n.getMonth()+1}月${n.getDate()}日 周${wd}`; }
function go(v){ view=v; searchQ=""; renderNavActive(); render(); closeDrawer(); window.scrollTo({top:0}); ifPullOnView(v); }
function render(){
  if(view==="home") renderHome();
  else if(view==="insight") renderInsight();
  else if(view==="planner") renderPlanner();
  else if(view==="execution") renderExecution();
  else if(view==="settings") renderSettings();
  else if(view==="schedule") {
    renderSchedule();
  } else renderModule(view);
  // 手机端：更新顶栏标题
  if(MOBILE){
    const m = modOf(view);
    if(view==="home"){ $("#topTitle").firstChild.textContent="我的工作台"; $("#topSub").textContent=CONFIG.slogan; }
    else if(view==="insight"){ $("#topTitle").firstChild.textContent="洞察复盘"; $("#topSub").textContent="各模块进展一览"; }
    else if(view==="planner"){ $("#topTitle").firstChild.textContent="计划中心"; $("#topSub").textContent="目标拆解与计划变更"; }
    else if(view==="execution"){ $("#topTitle").firstChild.textContent="今日执行"; $("#topSub").textContent="时间块与行动队列"; }
    else if(view==="settings"){  $("#topTitle").firstChild.textContent="设置"; $("#topSub").textContent="个性化你的工作台"; }
    else if(view==="schedule"){ $("#topTitle").firstChild.textContent="日程管理"; $("#topSub").textContent="每日日程安排与可视化"; }
    else if(m){ $("#topTitle").firstChild.textContent=m.name; $("#topSub").textContent=m.desc||""; }
  }
}

/* ---------- page background (底板背景图 + 模糊度) ---------- */
function applyPageBg(){
  const img = data.__pageBgImage || "";
  const blur = data.__pageBgBlur ?? 12;
  // Resolve relative URLs to absolute (CSS vars resolve relative to stylesheet, not document)
  const resolved = img && !img.startsWith("data:") && !img.startsWith("http") ? new URL(img, document.baseURI).href : img;
  document.body.style.setProperty('--page-bg-image', resolved ? `url('${resolved}')` : 'none');
  document.body.style.setProperty('--page-bg-blur', `${blur}px`);
  document.body.setAttribute('data-has-pagebg', img ? 'true' : 'false');
}

/* ---------- opacity (侧栏 + 卡片透明度) ---------- */
function applyOpacity(){
  document.documentElement.style.setProperty('--sidebar-opacity', data.__sidebarOpacity ?? 1);
  document.documentElement.style.setProperty('--card-opacity', data.__cardOpacity ?? 1);
}

function buildNav(){
  $("#brandName").textContent=CONFIG.owner; $("#brandSlogan").textContent=CONFIG.slogan;
  // 头像：空值则不显示（空白占位 + 相机图标常显）
  const avaBoxes=[$("#ava"), $("#drawerBrand")];
  if(data.__avatar){ $("#avaImg").src = data.__avatar; $("#avaImg").style.display = "block"; avaBoxes.forEach(b=>b&&b.classList.remove("no-img")); }
  else { $("#avaImg").removeAttribute("src"); $("#avaImg").style.display = "none"; avaBoxes.forEach(b=>b&&b.classList.add("no-img")); }
  // 首页背景：空值则无背景（纯色）
  document.body.style.setProperty('--greet-image', data.__greetImage ? `url('${data.__greetImage}')` : 'none');
  applyPageBg(); // Apply page background image + blur
  applyOpacity(); // Apply sidebar + card opacity

  const groupedModules = {"今日行动":[], "打卡追踪":[], "内容记录":[]};
  CONFIG.modules.forEach(m => {
    const category = m.category || "内容记录";
    (groupedModules[category] || groupedModules["内容记录"]).push(m);
  });

  let html = [`<div class="navi" data-go="home">${icon("home",19)}首页</div>`];
  html.push(`<div class="nav-sep">规划</div>`, `<div class="navi" data-go="planner">${icon("target",19)}计划中心</div>`, `<div class="navi" data-go="execution">${icon("play",19)}今日执行</div>`);
  ["今日行动", "打卡追踪", "内容记录"].forEach(categoryName => {
    html.push(`<div class="nav-sep">${categoryName}</div>`);
    groupedModules[categoryName].forEach(m => {
      html.push(`<div class="navi" data-go="${m.key}">${icon(m.icon,19)}${m.name}</div>`);
    });
  });

  html.push(`<div class="nav-sep">统计</div>`, `<div class="navi" data-go="insight">${icon("chart",19)}洞察复盘</div>`);
  // Theme toggle button
  const theme = data.__theme || "light";
  html.push(`<div class="nav-sep">其他</div>`);
  html.push(`<div class="navi theme-toggle" id="themeToggle">${icon(theme === "dark" ? "sun" : "moon", 19)}${theme === "dark" ? "浅色模式" : "深色模式"}</div>`);
  html.push(`<div class="navi" data-go="settings">${icon("gear",19)}设置</div>`);

  // 桌面端：填充侧栏 #nav；手机端：填充抽屉 #drawerList
  const navContainer = MOBILE ? $("#drawerList") : $("#nav");
  navContainer.innerHTML=html.join("");
  navContainer.querySelectorAll("[data-go]").forEach(el=>el.onclick=()=>go(el.dataset.go));
  // Theme toggle click handler
  const themeBtn = navContainer.querySelector("#themeToggle");
  if(themeBtn) themeBtn.onclick = () => {
    const newTheme = (data.__theme || "light") === "dark" ? "light" : "dark";
    data.__theme = newTheme;
    document.documentElement.setAttribute("data-mode", newTheme);
    updateStatusBar();
    store.save();
    buildNav(); // Rebuild nav to update icon/text
    updateSyncIndicator();
  };
  renderNavActive();

  // 手机端：初始化日期标签、抽屉、FAB、底部导航
  if(MOBILE) initMobileUI();
}
function renderMobileTabs(){
  if(!MOBILE) return;
  const bar=$("#mobileTabbar"); if(!bar) return;
  bar.querySelectorAll("[data-mobile-go]").forEach(el=>el.classList.toggle("active",el.dataset.mobileGo===view));
  bar.querySelectorAll("[data-mobile-more]").forEach(el=>el.classList.toggle("active",["planner","insight","settings"].includes(view)));
}
function renderNavActive(){
  const navContainer = MOBILE ? $("#drawerList") : $("#nav");
  navContainer.querySelectorAll(".navi").forEach(el=>el.classList.toggle("active", el.dataset.go===view));
  renderMobileTabs();
}

/* ---------- 手机端 UI 初始化 ---------- */
function initMobileUI(){
  // 日期标签
  const dc=$("#dateChip");
  if(dc) dc.innerHTML = `${icon("calendar",13)} ${dateStr()}`;

  // 菜单按钮 / 遮罩 / 关闭抽屉
  const btnMenu=$("#btn-menu"); const scrim=$("#scrim"); const drawerClose=$("#drawerClose");
  if(btnMenu) btnMenu.innerHTML = icon("menu",20);
  if(btnMenu) btnMenu.onclick = openDrawer;
  if(scrim) scrim.onclick = closeDrawer;
  if(drawerClose) drawerClose.innerHTML = icon("close",18);
  if(drawerClose) drawerClose.onclick = closeDrawer;
  const tabbar=$("#mobileTabbar");
  if(tabbar){
    tabbar.querySelectorAll("[data-mobile-go]").forEach(el=>el.onclick=()=>go(el.dataset.mobileGo));
    tabbar.querySelectorAll("[data-mobile-more]").forEach(el=>el.onclick=openDrawer);
  }
  renderMobileTabs();
}

function openDrawer(){
  const drawer=$("#drawer"); const scrim=$("#scrim");
  if(drawer) drawer.classList.add("show");
  if(scrim) scrim.classList.add("show");
}
function closeDrawer(){
  const drawer=$("#drawer"); const scrim=$("#scrim");
  if(drawer) drawer.classList.remove("show");
  if(scrim) scrim.classList.remove("show");
}

/* ---------- avatar upload (侧栏/抽屉快捷上传，自动压缩) ---------- */
$("#avaCam").innerHTML = icon("camera",18);
if(data.__avatar){ $("#avaImg").src = data.__avatar; $("#avaImg").style.display = "block"; }
else { $("#avaImg").removeAttribute("src"); $("#avaImg").style.display = "none"; }
// 桌面端：点击侧栏头像；手机端：点击抽屉头像
const avaContainer = MOBILE ? $("#drawerBrand") : $("#ava");
if(avaContainer) avaContainer.onclick = () => $("#avatarInput").click();
$("#avatarInput").onchange = e => {
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  // 自动压缩：256×256, JPEG 85%
  compressImage(f, 256, 256, 0.85, dataUrl => {
    data.__avatar = dataUrl;
    $("#avaImg").src = dataUrl; $("#avaImg").style.display = "block";
    [$("#ava"), $("#drawerBrand")].forEach(b=>b&&b.classList.remove("no-img"));
    store.save();
    toast("头像已更新（已压缩至 ≤256×256 JPEG 85%）");
  });
  e.target.value = "";
};

/* ---------- utils ---------- */
function esc(s){ return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function attr(s){ return esc(s).replace(/"/g,'&quot;'); }

// 填充版本标签（侧栏/抽屉底部）
const verTag=$("#verTag");
if(verTag) verTag.textContent = APP_VERSION;

buildNav();
render();
updateSyncIndicator();

// 页面加载时自动拉取云端数据（静默）
(function autoPullOnLoad(){
  const cfg=getSyncConfig();
  if(cfg.token && cfg.gistId){
    syncPull(true);
  }
})();

/* 信号检测循环（每 5 秒）：304=云端无变更(信号未变)，跳过；200=云端有变更(信号变了)，立即拉取。
   一端推送后 Gist 内容哈希(ETag)变化，对端最多 5 秒内感知到信号并同步。 */
setInterval(async ()=>{
  const cfg=getSyncConfig();
  if(!cfg.token||!cfg.gistId) return;
  if(syncSignalProbing) return;             // 上一次探测未完成，跳过本次
  syncSignalProbing=true;
  try{
    const r=await gistPull(cfg.token, cfg.gistId, syncSignalEtag);
    if(r.unchanged) return;                 // 无信号：跳过
    syncSignalEtag=r.etag||null;            // 记录新信号
    syncPull(true);                         // 有信号：拉取数据（不等待，异步执行）
  }catch(e){ /* 网络/限流错误静默，下轮重试 */ }
  finally{ syncSignalProbing=false; }
}, 5000);

// 前台返回时拉取：手机切换 App 回到页面 / PC 切回标签页立即同步
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "visible"){
    const cfg = getSyncConfig();
    if(cfg.token && cfg.gistId){
      syncPull(true);
    }
  }
});
// PC 端切回标签页必触发 focus（兼容后台定时器被节流的场景）
window.addEventListener("focus", () => {
  const cfg = getSyncConfig();
  if(cfg.token && cfg.gistId){
    syncPull(true);
  }
});

/* ---------- Android back button ---------- */
function handleBackButton(){
  // 1. close any open overlay/modal
  const overlay = document.querySelector(".overlay");
  if(overlay){ overlay.remove(); unlockScroll(); return; }
  // 2. close drawer if open
  const drawer = document.getElementById("drawer");
  if(drawer && drawer.classList.contains("show")){ closeDrawer(); return; }
  // 3. go back to home if on a sub-page
  if(view !== "home"){ go("home"); return; }
  // 4. on home → exit app
  if(window.Capacitor){
    const App = window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if(App && App.exitApp){ App.exitApp(); }
  }
}

if(window.Capacitor){
  const App = window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if(App && App.addListener){
    App.addListener("backButton", handleBackButton);
  }
} else {
  document.addEventListener("backbutton", handleBackButton);
}
