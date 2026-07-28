export type IslandCommunityStatus = 'coming-soon' | 'open';

export const islandCommunity = {
  status: 'open' as IslandCommunityStatus,
  href: 'https://line.me/ti/g2/yJkYsGqwt4GP6bC9m9AfXWJZJQSG_3vvBPVclw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default',
  title: '裝修新手島免費社群',
  description: '第一次裝修，問題一定很多。進來一起問、一起避坑。',
  comingSoonLabel: 'LINE 社群籌備中',
  openLabel: '用 LINE 加入社群',
  qrSrc: '/island/line-community-qr.png',
  qrHint: '手機點按鈕，電腦掃 QR code',
  passwordLabel: '通關密語',
  passwordHint: '填完診斷書領取',
  diagnosisCtaLabel: '免費做 AI 診斷書',
  diagnosisHref: '/ai-diagnosis?ch=island',
};
