// Sveltia CMS를 unpkg CDN이 아니라 자체 호스팅한다 (A08 — 공급망 신뢰 지점 제거).
// node_modules에 설치된 버전을 그대로 복사만 한다: 코드 수정 없음, npm이 버전을 관리.
import { copyFileSync } from 'node:fs';

const src = 'node_modules/@sveltia/cms/dist/sveltia-cms.js';
const dest = 'public/admin/sveltia-cms.js';

copyFileSync(src, dest);
console.log(`copied ${src} -> ${dest}`);
