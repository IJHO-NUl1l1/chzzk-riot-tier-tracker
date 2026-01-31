# Chzzk LoL Tier 크롬 익스텐션

치지직(Chzzk) 채팅창에서 사용자의 리그 오브 레전드 티어 정보를 표시해주는 크롬 익스텐션입니다.

## 기능

- 소환사 이름과 태그라인으로 계정 검색
- 소환사의 랭크 정보 표시 (티어, LP, 승/패, 승률)
- 치지직 채팅창에 티어 배지 표시

## 프로젝트 구조

```
chzzk-lol-tier/
├── js/                     # JavaScript 모듈
│   ├── api/                # API 통신 모듈
│   │   ├── index.js        # API 모듈 통합
│   │   ├── rank.js         # 랭크 정보 API
│   │   └── summoner.js     # 소환사 정보 API
│   ├── proxy/              # 프록시 클라이언트
│   │   ├── client.js       # API 요청 클라이언트
│   │   └── config.js       # 프록시 설정
│   ├── config.js           # 애플리케이션 설정
│   └── storage.js          # 로컬 스토리지 관리
├── popup.html              # 팝업 HTML
├── popup.css               # 팝업 스타일
├── popup.js                # 팝업 로직
├── content.js              # 치지직 페이지 삽입 스크립트
├── background.js           # 백그라운드 스크립트
├── manifest.json           # 익스텐션 매니페스트
└── backup/                 # 백업 파일 (사용하지 않는 UI 컴포넌트)
```

## 스타일 적용 방식

이 프로젝트는 CSS 파일을 직접 사용하여 스타일을 적용합니다. CSS 변수를 활용하여 일관된 스타일을 유지합니다:

```css
:root {
  /* 색상 변수 */
  --color-primary: #bb86fc;
  --color-background: #121212;
  
  /* 그라디언트 변수 */
  --gradient-primary: linear-gradient(135deg, #bb86fc 0%, #9c27b0 100%);
  
  /* 폰트 변수 */
  --font-primary: 'Orbitron', 'Noto Sans KR', sans-serif;
  --font-secondary: 'Rajdhani', 'Noto Sans KR', sans-serif;
}
```

## 서버 연동

이 익스텐션은 Riot API를 프록시하는 서버와 통신합니다. 서버 URL은 `js/proxy/config.js` 파일에서 설정할 수 있습니다:

```javascript
// 개발 환경 (로컬 서버)
development: {
  baseUrl: 'http://localhost:3001/api/riot',
  timeout: 10000 // 10초
},

// 프로덕션 환경 (배포된 서버)
production: {
  baseUrl: 'https://chzzk-lol-tier-server.vercel.app/api/riot',
  timeout: 30000 // 30초
}
```

## 개발 방법

1. 저장소 클론:
   ```
   git clone https://github.com/username/chzzk-lol-tier.git
   ```

2. 크롬 익스텐션으로 로드:
   - 크롬 브라우저에서 `chrome://extensions/` 접속
   - '개발자 모드' 활성화
   - '압축해제된 확장 프로그램 로드' 클릭
   - 프로젝트 폴더 선택

3. 서버 실행:
   - 서버 저장소 클론 및 설정
   - `npm run dev` 명령으로 개발 서버 실행
