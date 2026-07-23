export type MapStationStatus = 'open' | 'coming-soon';

export type MapStation = {
  id: `s${string}`;
  number: string;
  phase: 1 | 2 | 3 | 4;
  phaseName: string;
  name: string;
  status: MapStationStatus;
  hook: string;
  tool: {
    title: string;
    intro: string;
    points: string[];
  };
  characters: string[];
  sceneKind: string;
  d1Event: string;
  mapPosition: {
    x: number;
    y: number;
    island: 1 | 2 | 3 | 4 | 5 | 6;
  };
};

const phaseNames = {
  1: '籌備與規劃',
  2: '拆改與保護',
  3: '裝潢與粉刷',
  4: '設備與入住',
} as const;

export const mapStations: MapStation[] = [
  {
    id: 's01', number: '01', phase: 1, phaseName: phaseNames[1], name: '買屋驗屋站', status: 'open',
    hook: '空屋看起來沒事，不代表真的沒事。先把牆角、窗邊和地坪看清楚。',
    tool: {
      title: '驗屋自檢工具包',
      intro: '跟著現場順序檢查空鼓、漏水與裂縫，看到問題時也知道該怎麼留下紀錄。',
      points: ['先看容易藏水氣的交界', '把異常位置拍清楚、寫清楚', '分辨表面痕跡與需要追查的問題'],
    },
    characters: ['defender'], sceneKind: 'inspection', d1Event: 'map_s01_view', mapPosition: { x: 13, y: 30, island: 1 },
  },
  {
    id: 's02', number: '02', phase: 1, phaseName: phaseNames[1], name: '需求釐清站', status: 'open',
    hook: '你要的不是一張風格圖，是回家後每一天怎麼過。',
    tool: {
      title: '生活需求釐清',
      intro: '從收納、工作、寵物與家人習慣往回問，先把真正會影響格局的需求抓出來。',
      points: ['把「喜歡」換成具體生活場景', '找出不能妥協的日常動線', '先排需求，再談風格'],
    },
    characters: ['planner'], sceneKind: 'needs', d1Event: 'map_s02_view', mapPosition: { x: 22, y: 31, island: 1 },
  },
  {
    id: 's03', number: '03', phase: 1, phaseName: phaseNames[1], name: '設計繪圖站', status: 'open',
    hook: '圖畫得漂亮還不夠。你得看懂，住進去後才不會跟想像差一截。',
    tool: {
      title: '看懂設計圖',
      intro: '把平面、立面與空間關係對在一起，知道圖面上的線最後會變成家裡哪個地方。',
      points: ['先從你最常走的動線開始看', '對照家具尺寸與開門方向', '把看不懂的符號留到會議裡問清楚'],
    },
    characters: ['intuitive'], sceneKind: 'drawing', d1Event: 'map_s03_view', mapPosition: { x: 32, y: 35, island: 1 },
  },
  {
    id: 's04', number: '04', phase: 1, phaseName: phaseNames[1], name: '預算與合約站', status: 'open',
    hook: '報價最怕的不是貴，是看不出每筆錢到底花在哪裡。',
    tool: {
      title: '合約與報價單診斷',
      intro: '把模糊項目、付款安排與變更方式攤開來看，簽名前先把雙方怎麼合作講清楚。',
      points: ['模糊的「一式」要追問範圍', '確認追加與變更怎麼留下紀錄', '付款要對得上實際進度'],
    },
    characters: ['resource'], sceneKind: 'contract', d1Event: 'map_s04_view', mapPosition: { x: 41, y: 39, island: 1 },
  },
  {
    id: 's05', number: '05', phase: 2, phaseName: phaseNames[2], name: '保護工程站', status: 'coming-soon',
    hook: '還沒開始拆，先把不能受傷的地方包好。這一步省不得。',
    tool: {
      title: '保護工程檢查',
      intro: '從公共區域走進屋內，確認動線、轉角、地坪和電梯都有對應的保護方式。',
      points: ['先對照管委會規範', '轉角與高頻動線要特別留意', '施工中也要回頭檢查破損'],
    },
    characters: ['worker'], sceneKind: 'protection', d1Event: 'map_s05_view', mapPosition: { x: 51, y: 33, island: 2 },
  },
  {
    id: 's06', number: '06', phase: 2, phaseName: phaseNames[2], name: '拆除工程站', status: 'coming-soon',
    hook: '牆不是想拆就拆。先確認結構，再決定要開多大的口。',
    tool: {
      title: '牆體拆除判讀',
      intro: '把圖面、現場與專業確認放在一起，避開只憑目測就動工的風險。',
      points: ['先辨認結構與非結構牆', '確認牆內可能藏著什麼', '拆除範圍要回到核定圖面'],
    },
    characters: ['solo'], sceneKind: 'demolition', d1Event: 'map_s06_view', mapPosition: { x: 61, y: 33, island: 2 },
  },
  {
    id: 's07', number: '07', phase: 2, phaseName: phaseNames[2], name: '泥作防水站', status: 'coming-soon',
    hook: '防水做完看起來都差不多，真正的差別要等試水才知道。',
    tool: {
      title: '浴室試水驗收',
      intro: '先看施作邊界，再用現場紀錄確認水有沒有跑到不該去的地方。',
      points: ['牆角、門檻與管線周邊先看', '試水前後都要留下狀態', '發現異常先找路徑，不急著只補表面'],
    },
    characters: ['worker'], sceneKind: 'waterproof', d1Event: 'map_s07_view', mapPosition: { x: 70, y: 38, island: 2 },
  },
  {
    id: 's08', number: '08', phase: 2, phaseName: phaseNames[2], name: '水電弱電站', status: 'coming-soon',
    hook: '插座不是越多越好。位置、迴路和你會用的家電要一起想。',
    tool: {
      title: '插座與迴路配對',
      intro: '用實際家電和使用位置檢查配置，避免完工後才發現線不夠長、電不夠用。',
      points: ['從固定家電先排', '確認專用迴路需求', '別忘了充電、清潔與網路設備'],
    },
    characters: ['planner'], sceneKind: 'utilities', d1Event: 'map_s08_view', mapPosition: { x: 86, y: 25, island: 3 },
  },
  {
    id: 's09', number: '09', phase: 3, phaseName: phaseNames[3], name: '空調消防站', status: 'coming-soon',
    hook: '天花板封起來以前，冷氣排水、迴風和消防位置要先對好。',
    tool: {
      title: '空調與消防配置',
      intro: '把設備尺寸、維修路徑與天花高度一起檢查，別只看出風口好不好看。',
      points: ['先留維修空間', '確認排水坡度與路徑', '消防設備不能被造型天花遮住'],
    },
    characters: ['worker'], sceneKind: 'hvac', d1Event: 'map_s09_view', mapPosition: { x: 84, y: 42, island: 4 },
  },
  {
    id: 's10', number: '10', phase: 3, phaseName: phaseNames[3], name: '木作工程站', status: 'coming-soon',
    hook: '封板之後看不到的骨架，才是這一站真正要看的地方。',
    tool: {
      title: '木作材料辨識',
      intro: '從角料、板材到固定方式，先知道哪些資訊值得在封板前確認。',
      points: ['材料來源與規格要能說清楚', '潮濕區域要注意邊界', '封板前留一份現場紀錄'],
    },
    characters: ['worker'], sceneKind: 'woodwork', d1Event: 'map_s10_view', mapPosition: { x: 88, y: 58, island: 4 },
  },
  {
    id: 's11', number: '11', phase: 3, phaseName: phaseNames[3], name: '系統家具站', status: 'coming-soon',
    hook: '櫃子不是塞得滿就好。開門、拿東西和日後維修都要留空間。',
    tool: {
      title: '板材與櫃體檢查',
      intro: '從板材資訊、五金到收邊，把每天會碰到的細節先走一遍。',
      points: ['確認板材與封邊資訊', '開門後不能撞到燈具或家具', '常用物品放在順手的位置'],
    },
    characters: ['solo'], sceneKind: 'cabinetry', d1Event: 'map_s11_view', mapPosition: { x: 30, y: 62, island: 5 },
  },
  {
    id: 's12', number: '12', phase: 3, phaseName: phaseNames[3], name: '油漆粉刷站', status: 'coming-soon',
    hook: '白天看很平的牆，晚上開側燈可能完全是另一回事。',
    tool: {
      title: '牆面側光檢查',
      intro: '把補土、打磨與塗刷完成面分開看，用實際光線確認你能接受的表面狀態。',
      points: ['先看轉角與接縫', '用會在家裡出現的光線檢查', '修補範圍要跟現場一起確認'],
    },
    characters: ['intuitive'], sceneKind: 'painting', d1Event: 'map_s12_view', mapPosition: { x: 38, y: 69, island: 5 },
  },
  {
    id: 's13', number: '13', phase: 4, phaseName: phaseNames[4], name: '燈具設備安裝站', status: 'coming-soon',
    hook: '同一個空間，燈光一換，木色、牆色和人的臉都會跟著變。',
    tool: {
      title: '色溫與設備避坑',
      intro: '在暖、自然與偏白的光感之間切換，先看清楚你想要的生活氣氛。',
      points: ['用實際材質一起看色溫', '工作區與休息區可以有不同需求', '安裝前確認尺寸、電源與維修方式'],
    },
    characters: ['worker', 'intuitive'], sceneKind: 'lighting', d1Event: 'map_s13_view', mapPosition: { x: 47, y: 75, island: 5 },
  },
  {
    id: 's14', number: '14', phase: 4, phaseName: phaseNames[4], name: '清潔驗收站', status: 'coming-soon',
    hook: '看起來很乾淨只是第一眼。打開、摸過、照過，才算真的驗。',
    tool: {
      title: '完工驗收自檢',
      intro: '按空間與工種走一輪，把需要修正的地方標清楚，也留下雙方都看得懂的紀錄。',
      points: ['從使用動作開始驗', '側光、開關與排水都要實際操作', '缺失要有位置、照片與狀態'],
    },
    characters: ['defender'], sceneKind: 'handover', d1Event: 'map_s14_view', mapPosition: { x: 62, y: 61.5, island: 6 },
  },
  {
    id: 's15', number: '15', phase: 4, phaseName: phaseNames[4], name: '軟裝家電站', status: 'coming-soon',
    hook: '硬體完工只是空殼。家具、家電進場，家才開始有生活的樣子。',
    tool: {
      title: '軟裝與家電進場清單',
      intro: '從尺寸、插座到進場順序，把家具和家電安排在對的時間、放進對的位置。',
      points: ['大型家具先量尺寸，確認搬得進門、轉得過彎', '家電規格先對照插座與專用迴路', '進場先大件後小件，保護好已完工的地板與牆面'],
    },
    characters: ['resource'], sceneKind: 'furnishing', d1Event: 'map_s15_view', mapPosition: { x: 70.8, y: 61, island: 6 },
  },
  {
    id: 's16', number: '16', phase: 4, phaseName: phaseNames[4], name: '幸福入住站', status: 'coming-soon',
    hook: '房子不是交屋那天就結束。住進去，保固和維護才真正開始。',
    tool: {
      title: '健檢與保固護照',
      intro: '把設備、材料與需要回頭照顧的地方收在一起，日後出現狀況不用重新找線索。',
      points: ['留下設備與材料資料', '把保固聯絡方式整理在同一處', '用生活中的變化更新維護紀錄'],
    },
    characters: ['resource', 'intuitive', 'defender', 'planner', 'solo', 'whale'], sceneKind: 'movein', d1Event: 'map_s16_view', mapPosition: { x: 72.5, y: 64, island: 6 },
  },
];

export const mapPhases = [1, 2, 3, 4].map((phase) => ({
  phase,
  name: phaseNames[phase as keyof typeof phaseNames],
  stations: mapStations.filter((station) => station.phase === phase),
}));
