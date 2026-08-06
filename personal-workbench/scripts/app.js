/* ============================================================
   CONFIG — 唯一需要定制的地方（与手机版结构一致）。
   modules 里每个模块 = 一个功能页；type 决定它长什么样、记什么字段。
   支持的 type：
     todo     今日计划/待办（勾选 + 优先级）
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
    { key:"todo", label:"今日计划", icon:"list", color:"var(--accent)",
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
    { key:"todo", name:"今日计划", icon:"list", tint:"#efeee8", color:"var(--accent)", type:"todo", desc:"任务清单与进度追踪",
      priorities:[ {key:"P0",label:"重要",color:"#f6ece9",text:"#c25d4f"}, {key:"P1",label:"一般",color:"#f6efe6",text:"#bd8a4e"}, {key:"P2",label:"随手",color:"#eef2ec",text:"#6f8f6a"} ],
      seed:[ {id:11,title:"完成英语核心词汇 30min",priority:"P0",done:false,note:"积累词汇量，稳步提升英语能力"},
             {id:12,title:"发布 1 篇笔记 / 视频",priority:"P1",done:false,note:""},
             {id:13,title:"整理今日工作纪要",priority:"P2",done:true,note:""} ] },
    { key:"checkin", name:"习惯打卡", icon:"leaf", tint:"#eef3ec", color:"var(--module-1)", type:"checkin", desc:"补品·护肤·早睡等每日打卡",
      seed:[ {id:21,title:"喝够 8 杯水",log:{}}, {id:22,title:"23:30 前睡觉",log:{}}, {id:23,title:"维生素 / 补品",log:{}} ] },
    { key:"read", name:"阅读打卡", icon:"book", tint:"#edf1f5", color:"var(--module-2)", type:"progress", unit:"页", desc:"书籍进度·摘录·想法",
      seed:[ {id:31,title:"《认知觉醒》",current:168,target:300,unit:"页",note:"第 7 章：习惯的复利，早晚各读 30 分钟"}, {id:32,title:"《原子习惯》",current:90,target:260,unit:"页",note:"聚焦身份认同的养成，做好读书笔记"} ] },
    { key:"sport", name:"每日锻炼", icon:"activity", tint:"#f6f0e6", color:"var(--module-3)", type:"progress", unit:"分钟", desc:"游泳·跑步·力量训练", category:"health",
      seed:[ {id:41,title:"力量训练",current:12,target:20,unit:"分钟",note:"核心 + 上肢，组间休息 60 秒"}, {id:42,title:"跑步",current:30,target:40,unit:"分钟",note:"慢跑热身，配速 6 分半保持心率"} ] },
    { key:"money", name:"记账本", icon:"wallet", tint:"#f6efe8", color:"var(--module-4)", type:"finance", desc:"收入·支出·分类·占比",
      categories:["餐饮","交通","购物","居家","娱乐","工资","其他"],
      fields:[
        { key:"spendTag", label:"支出标签", type:"select", options:["必要固定支出","不必要固定支出","必要不固定支出","不固定不必要支出"] }
      ],
      seed:[ {id:51,title:"午餐",type:"expense",amount:32,category:"餐饮",spendTag:"必要不固定支出",date:isoToday()},
             {id:52,title:"地铁",type:"expense",amount:6,category:"交通",spendTag:"必要固定支出",date:isoToday()},
             {id:53,title:"稿费",type:"income",amount:400,category:"工资",date:isoToday()} ] },
    { key:"note", name:"心情日记", icon:"pen", tint:"#f1eef4", color:"var(--module-5)", type:"note", desc:"文字·摘录·心情记录",
      moods:["开心","平静","低落","焦虑","疲惫"],
      seed:[ {id:61,title:"今天的小确幸",content:"阳台的多肉冒出了新芽，顺手拍了张照片。",mood:"开心",date:isoToday()} ] },
    { key:"hot", name:"今日热点", icon:"flame", tint:"#f6ece9", color:"var(--danger)", type:"note", desc:"热点内容·收藏·稍后阅读",
      moods:["收藏","稍后读","已读"],
      seed:[ {id:71,title:"AI 提示词技巧合集",content:"整理常用提示词模板，方便复用。",mood:"收藏",date:isoToday()} ] },
    { key:"learning", name:"学习进度", icon:"graduation-cap", tint:"#edf1f5", color:"var(--module-2)", type:"progress", unit:"课时", desc:"追踪学习课程、技能和目标",
      seed:[ {id:Date.now(), title:"前端开发入门", current:15, target:40, unit:"课时", note:"完成 HTML/CSS 基础，开始 JavaScript"} ] },
    { key:"recipes", name:"食谱与餐单", icon:"cooking-pot", tint:"#f6efe8", color:"var(--module-4)", type:"note", desc:"收藏食谱，规划每日用餐", category:"health",
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
    { key:"timetable", name:"我的课程表", icon:"calendar-days", tint:"#eef3ec", color:"var(--module-1)", type:"timetable", desc:"管理您的大学课程安排",
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
    { key:"schedule", name:"日程管理", icon:"timeline", tint:"#f6e6ed", color:"var(--module-5)", type:"schedule", desc:"每日日程安排与可视化",
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
const APP_VERSION = "v1.5.1";

const store = {
  load(){
    const raw = localStorage.getItem(CONFIG.storageKey);
    if(raw){ try { return JSON.parse(raw); } catch(e){} }
    const d={}; CONFIG.modules.forEach(m=>d[m.key]=structuredClone(m.seed||[]));
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

function getSyncConfig(){ return data.__sync || {}; }
function setSyncConfig(cfg){ data.__sync = { ...getSyncConfig(), ...cfg }; store.save(); }

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

async function gistPull(token, gistId){
  const res=await fetch(`https://api.github.com/gists/${gistId}`, {
    method:"GET",
    headers:{ "Authorization":`Bearer ${token}`, "Accept":"application/vnd.github+json" }
  });
  if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.message||`HTTP ${res.status}`); }
  const j=await res.json();
  const f=j.files&&j.files["workbench-data.json"];
  if(!f) throw new Error("Gist 中未找到 workbench-data.json");
  return { content:f.content, updatedAt:j.updated_at };
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
  syncState={status:"pushing",lastSync:syncState.lastSync,error:null}; updateSyncIndicator();
  if(!silent) toast("正在推送...");
  try{
    const payload=buildSyncPayload();
    const ts=await gistPush(cfg.token, cfg.gistId, payload);
    cfg.lastSync=ts; setSyncConfig(cfg);
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
let view = "home";
let scheduleViewMode = "daily";
let scheduleWeekOffset = 0;   // 0=本周, -1=上周, 1=下周 …
let scheduleMonthOffset = 0;  // 0=本月, -1=上月, 1=下月 …
let scheduleSelectedDate = null; // null=今天, 或 "YYYY-MM-DD"
let searchQ = "";
let moneyMonth = null; // null=未初始化(默认本月), ""=全部, "YYYY-MM"=指定月
let pomo = { running:false, remain:25*60, total:25*60 };   // 番茄钟状态（内存态，跨渲染保留）
let clockTimer = null;                                       // 全局秒级心跳（时钟 + 番茄钟）
function persist(){ data.__lastModified = new Date().toISOString(); store.save(); render(); scheduleSyncPush(); }
function pad2(n){ return String(n).padStart(2,"0"); }

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

  return `<div class="tile b4"><div class="tile-h"><span class="tic">${icon("calendar-days",16)}</span><div class="tt"><span class="en">TODAY'S CLASSES</span><span class="zh">今日课程</span></div><span class="r js-open" data-open="timetable">查看全部</span></div>
    ${content}</div>`;
}
/* 日程管理首页卡片 */
function scheduleTileHTML() {
    const m = modOf("schedule");
    const today = isoToday();
    const todayEvents = (data.schedule || []).filter(item => item.date === today)
        .sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const nextEvent = todayEvents.find(event => {
        const [hour, minute] = event.startTime.split(':').map(Number);
        return hour * 60 + minute > currentTime;
    });

    let content;
    if (todayEvents.length === 0) {
        content = `<div class="focus-empty">今日无日程，去添加吧！</div>`;
    } else if (nextEvent) {
        content = `<div class="focus-list">
      <div class="focus-row js-open" data-open="schedule">
        <span class="fic" style="color:${nextEvent.color || m.color}">${icon(m.icon, 16)}</span>
        <div class="ft">
          <div class="fn">下一个：${esc(nextEvent.title)}</div>
          <div class="fm">${esc(nextEvent.startTime)} - ${esc(nextEvent.endTime)}</div>
        </div>
        <span style="color:var(--text-tertiary)">${icon("chevron", 16, 2)}</span>
      </div>
      <div class="focus-empty" style="padding-top:10px;">今日剩余 ${todayEvents.length - todayEvents.indexOf(nextEvent)} 个日程</div>
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
    : `<div class="focus-empty">还没有待办，去「今日计划」添加吧</div>`;
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
    ${grp("今日节奏","TODAY&nbsp;&nbsp;·&nbsp;&nbsp;RHYTHM")}
    <div class="bento">
      ${clockCard}
      ${focusTileHTML()}
      ${quickTileHTML()}
      ${timetableTileHTML()}
      ${scheduleTileHTML()}
      ${overviewTileHTML()}
    </div>

    ${grp("习惯与待办","HABITS&nbsp;&nbsp;&&nbsp;&nbsp;TASKS")}
    <div class="bento">${habitTileHTML()}${todoTileHTML()}</div>

    ${grp("专注与状态","FOCUS&nbsp;&nbsp;&&nbsp;&nbsp;MOOD")}
    <div class="bento">${pomoTileHTML()}${trendTileHTML()}</div>

    ${grp("收支与成长","MONEY&nbsp;&nbsp;&&nbsp;&nbsp;GROWTH")}
    <div class="bento">${spendTileHTML()}${booksTileHTML()}${goalsTileHTML()}</div>

    ${grp("健康生活","HEALTH&nbsp;&nbsp;&&nbsp;&nbsp;WELLNESS")}
    <div class="bento">${healthTileHTML()}</div>`;
  wireHome();
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
    <div class="sec-title">模块概况</div><div class="pin-list" style="grid-template-columns:repeat(3,1fr)">${cards}</div>`;
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
    const today = scheduleSelectedDate || isoToday();

    let timeLabelsHtml = '';
    for (let h = 0; h < 24; h++) {
      timeLabelsHtml += `<div class="time-label">${pad2(h)}:00</div>`;
    }

    // Split events into per-hour segments, positioned by minute columns (left/width %)
    const todayEvents = (data.schedule || []).filter(item => item.date === today);
    const hourRows = Array.from({length:24}, () => []);

    todayEvents.forEach(event => {
      const [sh, sm] = event.startTime.split(':').map(Number);
      const [eh, em] = event.endTime.split(':').map(Number);
      let startTotal = sh * 60 + sm;
      let endTotal = eh * 60 + em;
      if (endTotal <= startTotal) endTotal = 24 * 60; // clamp midnight-crossing
      const color = event.color || '#8f83a8';
      const txt = contrastText(color);
      const title = esc(event.title || event.relatedModule || '无标题');
      const timeStr = `${esc(event.startTime)} - ${esc(event.endTime)}`;

      for (let h = sh; h < 24; h++) {
        const hourStart = h * 60;
        const hourEnd = hourStart + 60;
        if (startTotal >= hourEnd || endTotal <= hourStart) continue;
        const segStart = Math.max(0, startTotal - hourStart);
        const segEnd = Math.min(60, endTotal - hourStart);
        if (segEnd <= segStart) continue;
        hourRows[h].push({
          id: event.id,
          left: (segStart / 60) * 100,
          width: ((segEnd - segStart) / 60) * 100,
          color, txt, title, timeStr,
          isFirst: h === sh
        });
      }
    });

    const rowsHtml = hourRows.map((segs, h) => {
      const segHtml = segs.map(s =>
        `<div class="schedule-event${s.isFirst ? ' seg-first' : ''}" style="left:${s.left}%;width:${s.width}%;background-color:${s.color};color:${s.txt}" data-id="${s.id}">
          <div class="schedule-event-title">${s.title}</div>
          ${s.isFirst ? `<div class="schedule-event-time">${s.timeStr}</div>` : ''}
        </div>`
      ).join('');
      return `<div class="schedule-hour-row" data-hour="${h}">
        <div class="schedule-min-grid"><div></div><div></div><div></div><div></div><div></div><div></div></div>
        ${segHtml}
      </div>`;
    }).join('');

    content = `<div class="toolbar">
      <div class="spacer"></div>
      ${scheduleSelectedDate && scheduleSelectedDate !== isoToday() ? `<button class="btn sm" id="day-today">${icon("calendar",14)} 返回今天</button>` : ''}
    </div>
      <div class="sec-title">单日日程 · ${today}</div>
      <div class="schedule-grid-container">
        <div class="time-labels">${timeLabelsHtml}</div>
        <div class="schedule-grid-v2">${rowsHtml}</div>
      </div>`;
  } else if (scheduleViewMode === "weekly") {
    content = renderWeeklySchedule();
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
    const dayTodayBtn = $("#day-today");
    if (dayTodayBtn) dayTodayBtn.onclick = () => { scheduleSelectedDate = null; render(); };
    document.querySelectorAll('.schedule-event').forEach(eventEl => {
      eventEl.onclick = (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.id;
        const itemToEdit = (data.schedule || []).find(item => item.id == eventId);
        if (itemToEdit) {
          openEditor("schedule", itemToEdit);
        }
      };
    });
  } else if (scheduleViewMode === "weekly") {
    $("#week-prev").onclick = () => { scheduleWeekOffset--; render(); };
    $("#week-next").onclick = () => { scheduleWeekOffset++; render(); };
    $("#week-today").onclick = () => { scheduleWeekOffset = 0; render(); };
    document.querySelectorAll('.week-event').forEach(eventEl => {
      eventEl.onclick = (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.id;
        const itemToEdit = (data.schedule || []).find(item => item.id == eventId);
        if (itemToEdit) openEditor("schedule", itemToEdit);
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
  const allEvents = data.schedule || [];
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
    const dayEvents = allEvents.filter(e => e.date === ds);
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
  const allEvents = data.schedule || [];
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
    const dayEvents = allEvents.filter(e => e.date === ds);
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

  const sectionTitle = m.type==="finance" ? (moneyMonth?`${moneyMonth.split('-')[0]}年${parseInt(moneyMonth.split('-')[1],10)}月记录`:"全部记录") : "全部记录";

  $("#screen").innerHTML=`<div class="header"><div><h2>${m.name}</h2><p>${m.desc}</p></div><div class="spacer"></div><span class="date-chip">${icon("calendar",14)} ${dateStr()}</span></div>
    <div class="toolbar">
      <div class="search-box">${icon("search",15,2.2)}<input id="search" placeholder="搜索…" value="${attr(searchQ)}"/></div>
      ${monthNav}
      <div class="spacer"></div><button class="btn" id="btn-new">${icon("plus",16,2.2)}新建</button></div>
    ${head}
    <div class="mod-layout">
      <div class="mod-main">
        <div class="sec-title">${sectionTitle} <span id="rec-count" style="margin-left:auto;font-weight:500;color:var(--text-secondary);font-size:12px">${it.length} 条</span></div>
        <div class="rec-grid">${body}</div>
      </div>
      <aside class="mod-side">${sideStats(m,all)}</aside>
    </div>`;
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
    return `<div class="rec ${layoutCls}">${acts}<div class="top" style="padding-right:60px"><div class="chk js-chk ${x.done?'on':''}" data-id="${x.id}">${chkMark}</div>
      ${thumb}
      <div class="body" data-edit="${x.id}"><span class="rname ${x.done?'done':''}">${esc(x.title)}</span>
      ${p?`<span class="badge" style="background:${p.color};color:${p.text}"><span class="dot"></span>${p.label}</span>`:''}
      ${x.note?`<span class="rdate" style="margin-left:0;color:var(--text-tertiary)">${esc(x.note).slice(0,40)}</span>`:''}${customBlock}</div></div></div>`; }
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
    if(m.type==="todo") x.done=!x.done;
    else if(m.type==="checkin"){ x.log=x.log||{}; const t=today(); x.log[t]?delete x.log[t]:x.log[t]=true; }
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

/* ---------- EDITOR MODAL (per type) ---------- */
function openEditor(key,item){
  const m=modOf(key); const editing=!!item; const d=item||newItem(m);
  let fields="";
  if(m.type==="todo"){
    fields=`<div class="field"><label>任务</label><input id="f-title" value="${attr(d.title)}" placeholder="要做什么？"/></div>
      <div class="field"><label>优先级</label><div class="seg" id="f-prio">${(m.priorities||[]).map(p=>`<div class="opt ${p.key===d.priority?'on':''}" data-v="${p.key}">${p.label}</div>`).join("")}</div></div>
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
      <div class="field"><label>关联模块</label><div class="seg" id="f-relatedModule">${(m.fields.find(f=>f.key==="relatedModule").options||[]).map(o=>`<div class="opt ${o===d.relatedModule?'on':''}" data-v="${attr(o)}">${esc(o)}</div>`).join("")}</div></div>
      <div class="field"><label>关联任务ID</label><input id="f-relatedItemId" value="${attr(d.relatedItemId)}" placeholder="仅在关联模块时填写"/></div>
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

  const close=()=>overlay.remove();
  overlay.onclick=e=>{ if(e.target===overlay) close(); };
  overlay.querySelector("#m-cancel").onclick=close;
  overlay.querySelectorAll(".seg").forEach(seg=>seg.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{ seg.querySelectorAll(".opt").forEach(x=>x.classList.remove("on")); o.classList.add("on"); }));
  if(editing) overlay.querySelector("#m-del").onclick=()=>{ close(); confirmDelete(key,d.id); };
  overlay.querySelector("#m-save").onclick=()=>{
    const val=id=>{ const el=overlay.querySelector(id); return el?el.value:undefined; };
    const seg=id=>{ const el=overlay.querySelector(id+" .on"); return el?el.dataset.v:undefined; };
    d.title=(val("#f-title")||"").trim()||"未命名";
    d.layout=seg("#f-layout")||'default';
    if(m.type==="todo"){ d.priority=seg("#f-prio")||d.priority; d.note=(val("#f-note")||"").trim(); }
    else if(m.type==="progress"){ d.current=Math.max(0,+val("#f-cur")||0); d.target=Math.max(1,+val("#f-tgt")||1); d.unit=(val("#f-unit")||"").trim(); d.note=(val("#f-note")||"").trim(); }
    else if(m.type==="finance"){ d.type=seg("#f-ftype")||"expense"; d.amount=Math.max(0,+val("#f-amt")||0); d.category=seg("#f-cat")||(m.categories&&m.categories[0])||"其他"; d.date=val("#f-date"); }
    else if(m.type==="timetable"){ d.courseName=(val("#f-courseName")||"").trim(); d.instructor=(val("#f-instructor")||"").trim(); d.location=(val("#f-location")||"").trim(); d.dayOfWeek=seg("#f-dayOfWeek")||d.dayOfWeek; d.startTime=(val("#f-startTime")||"").trim(); d.endTime=(val("#f-endTime")||"").trim(); d.startWeek=Math.max(1,+val("#f-startWeek")||1); d.endWeek=Math.max(1,+val("#f-endWeek")||16); d.weekType=seg("#f-weekType")||d.weekType; d.customWeeks=(val("#f-customWeeks")||"").trim(); d.note=(val("#f-note")||"").trim(); }
    else if(m.type==="schedule"){ d.title=(val("#f-title")||"").trim()||"未命名"; d.date=val("#f-date"); d.startTime=val("#f-start-time")||"09:00"; d.endTime=val("#f-end-time")||"10:00"; d.relatedModule=seg("#f-relatedModule"); d.relatedItemId=(val("#f-relatedItemId")||"").trim(); d.color=seg("#f-color"); d.note=(val("#f-note")||"").trim(); }
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
  if(m.type==="todo") item={...base,title:"",priority:(m.priorities&&m.priorities[1]?m.priorities[1].key:"P1"),done:false,note:""};
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
  const overlay=document.createElement("div"); overlay.className="overlay";
  overlay.innerHTML=`<div class="modal" style="width:400px"><h3>删除记录</h3><div class="sub">确定删除「${esc(item.title||'这条记录')}」？此操作不可撤销。</div>
    <div class="modal-actions"><div class="spacer"></div><button class="btn ghost" id="c-cancel">取消</button><button class="btn danger" id="c-ok">删除</button></div></div>`;
  document.body.appendChild(overlay);
  const close=()=>overlay.remove();
  overlay.onclick=e=>{ if(e.target===overlay) close(); };
  overlay.querySelector("#c-cancel").onclick=close;
  overlay.querySelector("#c-ok").onclick=()=>{ data[key]=data[key].filter(i=>i.id!=id); persist(); close(); };
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
  overlay.querySelectorAll(".trend-slider").forEach(s=>{
    const span=s.nextElementSibling;
    s.oninput=()=>{ span.textContent=s.value; };
  });
  const close=()=>overlay.remove();
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
  const close=()=>overlay.remove();
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
        // 确保 CONFIG 中定义的所有模块 key 都存在
        CONFIG.modules.forEach(m => {
          if(!imported[m.key]) imported[m.key] = structuredClone(m.seed || []);
        });
        // 写入并刷新，保留同步配置
        const preservedSync = data.__sync;
        data = imported;
        if(preservedSync) data.__sync = preservedSync;
        data.__lastModified = new Date().toISOString();
        store.save();
        buildNav();
        render();
        scheduleSyncPush();
        toast("数据导入成功");
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
    localStorage.removeItem(CONFIG.storageKey);
    data = store.load();
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
let lastPullByView = 0;   // 视图切换拉取节流时间戳
function ifPullOnView(v){
  // 设置页不拉取（避免打断填写），其余视图切换时拉取并给出可见反馈
  if(v === "settings") return;
  const cfg = getSyncConfig();
  if(!cfg.token || !cfg.gistId || cfg.autoSync === false) return;
  const now = Date.now();
  if(now - lastPullByView < 2000) return;   // 2 秒节流，快速切换不重复拉取
  lastPullByView = now;
  syncPull(false);
}
function dateStr(){ const n=new Date(); const wd="日一二三四五六"[n.getDay()]; return `${n.getFullYear()}年${n.getMonth()+1}月${n.getDate()}日 周${wd}`; }
function go(v){ view=v; searchQ=""; renderNavActive(); render(); closeDrawer(); window.scrollTo({top:0}); ifPullOnView(v); }
function render(){
  if(view==="home") renderHome();
  else if(view==="insight") renderInsight();
  else if(view==="settings") renderSettings();
  else if(view==="schedule") {
    renderSchedule();
  } else renderModule(view);
  // 手机端：更新顶栏标题
  if(MOBILE){
    const m = modOf(view);
    if(view==="home"){ $("#topTitle").firstChild.textContent="我的工作台"; $("#topSub").textContent=CONFIG.slogan; }
    else if(view==="insight"){ $("#topTitle").firstChild.textContent="洞察复盘"; $("#topSub").textContent="各模块进展一览"; }
    else if(view==="settings"){ $("#topTitle").firstChild.textContent="设置"; $("#topSub").textContent="个性化你的工作台"; }
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

  const groupedModules = {};
  CONFIG.modules.forEach(m => {
    const category = m.category || "功能模块"; // Default category
    if (!groupedModules[category]) {
      groupedModules[category] = [];
    }
    groupedModules[category].push(m);
  });

  let html = [`<div class="navi" data-go="home">${icon("home",19)}首页</div>`];

  // Render grouped modules
  for (const categoryName in groupedModules) {
    html.push(`<div class="nav-sep">${categoryName}</div>`);
    groupedModules[categoryName].forEach(m => {
      html.push(`<div class="navi" data-go="${m.key}">${icon(m.icon,19)}${m.name}</div>`);
    });
  }

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
    store.save();
    buildNav(); // Rebuild nav to update icon/text
    updateSyncIndicator();
  };
  renderNavActive();

  // 手机端：初始化日期标签、抽屉、FAB、底部导航
  if(MOBILE) initMobileUI();
}
function renderNavActive(){
  const navContainer = MOBILE ? $("#drawerList") : $("#nav");
  navContainer.querySelectorAll(".navi").forEach(el=>el.classList.toggle("active", el.dataset.go===view));
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

// 定时自动拉取（每 15 秒静默检查云端更新，autoSync 未显式关闭时生效）
setInterval(()=>{
  const cfg=getSyncConfig();
  if(cfg.token && cfg.gistId && cfg.autoSync !== false){
    syncPull(true);
  }
}, 15000);

// 前台返回时拉取：手机切换 App 回到页面立即同步（备选增强）
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "visible"){
    const cfg = getSyncConfig();
    if(cfg.token && cfg.gistId && cfg.autoSync !== false){
      syncPull(true);
    }
  }
});
