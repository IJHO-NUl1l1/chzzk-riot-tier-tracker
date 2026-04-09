# 치지직 라이엇 티어 트래커

> 치지직 라이브 채팅창에 시청자의 LoL / TFT 랭크 배지를 실시간으로 표시하는 Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/IJHO-NUl1l1/chzzk-lol-tier)
[![Fastify](https://img.shields.io/badge/Server-Fastify-000000?logo=fastify)](https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-fastify)
[![Next.js](https://img.shields.io/badge/Web-Next.js-000000?logo=next.js)](https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-web)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)](https://railway.app)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://chzzk-riot-tier-tracker-web.vercel.app)

---

## 관련 레포지토리

| 역할 | 레포지토리 | 배포 |
|------|-----------|------|
| Chrome Extension | [chzzk-lol-tier](https://github.com/IJHO-NUl1l1/chzzk-lol-tier) | Chrome 개발자 모드 |
| Fastify 서버 | [chzzk-riot-tier-tracker-fastify](https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-fastify) | Railway |
| Web (랜딩 + OBS 오버레이) | [chzzk-riot-tier-tracker-web](https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-web) | Vercel |

**온보딩 웹**: https://chzzk-riot-tier-tracker-web.vercel.app

---

## 프로젝트 개요

치지직(chzzk.naver.com) 라이브 방송의 채팅창에서 시청자의 닉네임 옆에 Riot Games 랭크 배지를 자동으로 표시하는 Chrome Extension입니다.

익스텐션을 설치한 시청자가 자신의 치지직 계정과 Riot 계정을 연동하면, 해당 채널을 방문하는 모든 시청자의 화면에서 티어 배지가 표시됩니다. 팝업에서 등록·수정·공개설정을 변경하면 Supabase Realtime을 통해 채팅창에 즉시 반영됩니다.

스트리머는 OBS Browser Source를 통해 현재 시청 중인 유저들의 티어 정보를 방송 화면에 오버레이로 표시할 수 있습니다.

---

## 주요 기능

- **채팅 배지 자동 삽입** — MutationObserver로 채팅 DOM을 감지, 닉네임 옆에 LoL / TFT 티어 엠블럼 자동 표시
- **배지 hover 툴팁** — 티어, 랭크, LP, Riot 닉네임을 포함한 상세 정보 표시
- **실시간 즉시 반영** — Supabase Realtime Broadcast로 등록·삭제·공개설정 변경이 채팅창에 즉시 동기화
- **공개 / 비공개 설정** — 게임별(LoL / TFT)로 배지 공개 여부를 개별 제어
- **JWT 인증** — 본인 데이터만 수정 가능하도록 서버 수준 인증 적용
- **OBS Browser Source Overlay** — 시청자 티어 목록 / 티어 통계 차트를 방송 화면에 실시간 표시
- **인터랙티브 온보딩 웹** — 설치 없이 핵심 기능을 체험할 수 있는 5단계 데모

---

## 전체 UX 흐름

### 1. 온보딩 웹에서 미리보기 (설치 전)

https://chzzk-riot-tier-tracker-web.vercel.app 에서 설치 없이 기능을 체험할 수 있습니다.

- **랜딩 페이지** — 기능 소개, 실제 채팅창을 모사한 배지 미리보기
- **인터랙티브 데모** — 5단계 스크롤 잠금 UX로 치지직 계정 연결 → Riot 연동 → 티어 등록 → 채팅창 배지 → OBS 오버레이까지 직접 체험

---

### 2. 익스텐션 설치

Chrome 웹 스토어 또는 개발자 모드로 익스텐션을 설치합니다.
치지직(chzzk.naver.com) 접속 시 content.js가 자동으로 실행됩니다.

---

### 3. 치지직 계정 연결

```
팝업 → "Connect Chzzk" 클릭
  → 브라우저 탭에서 치지직 OAuth 로그인
  → 서버: 인증 코드 → 액세스 토큰 교환 → DB 저장 → JWT 발급
  → background.js: JWT를 chrome.storage.local에 저장
  → 팝업: 연결 완료 상태 표시
```

---

### 4. Riot 계정 연결 및 티어 등록

```
팝업 → Riot 닉네임 + 태그 입력 (예: Faker#KR1)
  → 서버에서 LoL / TFT 티어 데이터 조회 (Riot API 프록시)
  → 팝업: LoL / TFT 티어 카드 표시
  → "Register" 클릭 → 서버 DB에 저장 → Realtime broadcast 전송
  → 채팅창 배지 즉시 활성화
```

> **Riot RSO (OAuth 직접 연동) 구현 예정** — 현재는 닉네임 + 태그 입력 방식으로 동작합니다. Riot Games Production API Key 승인 이후 Riot Sign On(RSO)으로 전환하여 본인 계정을 직접 인증하는 방식으로 변경될 예정입니다.

---

### 5. 채팅창 배지 자동 표시

익스텐션이 설치된 모든 시청자의 화면에서 동작합니다.

```
채팅 메시지 감지 (MutationObserver)
  → 닉네임으로 서버 조회 (GET /api/tier)
  → 서버 LRU 캐시 hit → 즉시 반환 / miss → DB 조회 후 반환
  → 닉네임 옆에 티어 엠블럼 + hover 툴팁 삽입
```

- 클라이언트 캐시(5분 TTL)로 같은 닉네임 반복 채팅 시 서버 요청 없이 즉시 처리
- Debounce(300ms)로 채팅 폭발 시 중복 요청 방지

---

### 6. 실시간 데이터 동기화

팝업에서 데이터를 변경하면 같은 방송을 보고 있는 모든 시청자 화면에 즉시 반영됩니다.

```
팝업에서 등록 / 삭제 / 공개설정 변경
  → 서버 DB 업데이트 + 서버 LRU 캐시 즉시 무효화
  → Supabase Realtime broadcast (tier_updated / tier_deleted / privacy_changed)
  → content.js 수신 → 해당 닉네임 배지만 즉시 재렌더
```

---

### 7. OBS 오버레이 (스트리머용)

```
OBS → 소스 추가 → 브라우저
URL: https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=list
```

- `mode=list` — 시청자 티어 배지 + 닉네임 목록
- `mode=stats` — 티어 분포 통계 바차트
- Supabase Realtime Presence로 현재 시청자를 실시간 추적, 공개 설정된 유저만 표시
- 시청자가 탭을 닫으면 WebSocket 연결 해제 → 자동 제거

> `liveId` = `chzzk.naver.com/live/{liveId}` URL의 고유 ID

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
│                                                             │
│  content.js ──── MutationObserver ──── 채팅 배지 삽입        │
│      │                                                      │
│      └──── Supabase Realtime 구독 (tier_updates:{liveId})   │
│                                                             │
│  popup.js ──── 치지직 / Riot 연동, 등록/삭제/공개설정 토글   │
│      │                                                      │
│      └──── chrome.storage.local (JWT, 연동 정보)            │
│                                                             │
│  background.js ──── OAuth 탭 관리, JWT 캡처 및 저장          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Fastify 서버 (Railway, 상시 구동)               │
│                                                             │
│  GET  /api/tier             ── 닉네임 기반 티어 조회         │
│  POST /api/chzzk/tier-cache ── 티어 등록 (JWT 인증)          │
│  DEL  /api/chzzk/tier-cache ── 티어 삭제 (JWT 인증)          │
│  POST /api/privacy/update   ── 공개설정 변경 (JWT 인증)       │
│  GET  /api/chzzk/auth       ── 치지직 OAuth 시작             │
│  GET  /api/riot/...         ── Riot API 프록시 (LRU 캐시)    │
│                                                             │
│  lib/auth.ts       ── requireSelf() JWT 미들웨어             │
│  lib/tier-store.ts ── 서버 LRU 캐시 (500개, 5분 TTL)        │
│  lib/realtime.ts   ── broadcastToChannel() 헬퍼              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│                                                             │
│  PostgreSQL DB                                              │
│  ├── users          ── 치지직 계정 정보                      │
│  ├── chzzk_tokens   ── 치지직 OAuth 토큰                    │
│  ├── riot_tokens    ── Riot RSO 토큰 (구현 예정)             │
│  └── tier_cache     ── LoL / TFT 티어 데이터                │
│                                                             │
│  Realtime Broadcast ── tier_updates:{liveId} 채널           │
│  Realtime Presence  ── 시청자 추적 (OBS 오버레이용)          │
│  RLS                ── anon key 직접 쓰기 차단               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Web / Next.js (Vercel)                         │
│                                                             │
│  /                 ── 랜딩 페이지                            │
│  /demo             ── 인터랙티브 5단계 데모                  │
│  /overlay/[liveId] ── OBS Browser Source 오버레이           │
└─────────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### Chrome Extension

| 파일 | 역할 |
|------|------|
| `content.js` | 치지직 채팅 DOM 감지, 티어 배지 삽입, Supabase Realtime 구독 |
| `popup.js` | 치지직 / Riot 계정 연동 UI, 티어 등록 / 삭제, 공개설정 토글 |
| `background.js` | OAuth 탭 관리, JWT 캡처 및 chrome.storage 저장 |
| `content.css` | 배지 스타일, hover 툴팁 애니메이션 |
| `manifest.json` | Manifest V3, content_scripts 등록, host_permissions |

**요청 권한**

| 권한 | 용도 |
|------|------|
| `storage` | 연동 정보, JWT 저장 (`chrome.storage.local / session`) |
| `tabs` | OAuth 인증 탭 생성 / 감시 / 닫기 |
| `webRequest` | 요청 모니터링 |

---

### Fastify 서버

Node.js + Fastify로 구축된 백엔드 서버입니다. Railway에 상시 구동(Always On)으로 배포되어 cold start 없이 안정적으로 응답합니다.

**주요 역할**
- 치지직 OAuth 인증 처리 및 JWT 발급
- Riot API 프록시 (API Key 보호, LRU 캐싱)
- tier_cache CRUD + Realtime broadcast 트리거
- JWT 기반 요청 인증 (`requireSelf()` 미들웨어)

**캐싱 구조**

| 레이어 | 위치 | 용량 | TTL |
|--------|------|------|-----|
| 클라이언트 인메모리 | content.js | 닉네임 단위 | 5분 |
| Debounce 배치 | content.js | — | 300ms |
| 서버 LRU (tier) | tier-store.ts | 500개 | 5분 |
| 서버 LRU (Riot API) | riot-api.ts | 1000개 | 5분 |

---

### Supabase

**테이블 구조**

| 테이블 | 설명 |
|--------|------|
| `users` | 치지직 채널 ID / 닉네임. `chzzk_channel_name` 인덱스로 빠른 조회 |
| `chzzk_tokens` | 치지직 OAuth 액세스 / 리프레시 토큰 (users와 1:1) |
| `riot_tokens` | Riot RSO 토큰 (구현 예정, 테이블 선행 생성) |
| `tier_cache` | LoL / TFT 티어 데이터. `(chzzk_channel_id, game_type)` UNIQUE |

**RLS (Row Level Security)**
- 모든 테이블 RLS 활성화
- `tier_cache` — `is_public=true` 행만 공개 SELECT 허용
- 나머지 테이블 — anon / authenticated 전체 차단
- 서버는 `service_role` 키로 RLS 우회, 쓰기는 서버 API 경유만 허용

**Realtime**
- Broadcast 방식 — 서버가 명시적으로 이벤트 push, 클라이언트가 채널 구독으로 수신
- Presence — 동일 채널에서 시청자 실시간 추적 (OBS 오버레이용)
- 채널명: `tier_updates:{liveId}`

---

### Web (Next.js / Vercel)

| 페이지 | 설명 |
|--------|------|
| `/` | 랜딩 페이지. MockChat 컴포넌트로 실제 채팅 배지 미리보기, 기능 소개 |
| `/demo` | 5단계 스크롤 잠금 인터랙티브 데모. 설치 없이 전체 플로우 체험 가능 |
| `/overlay/[liveId]` | OBS Browser Source 전용. Realtime Presence 구독, 배경 투명 |

**MockChat 컴포넌트**
- 실제 배지 스타일을 그대로 재현 (tier 엠블럼, hover 툴팁)
- `createPortal`로 툴팁을 `document.body`에 마운트 — transform 컨텍스트 탈출

---

## 기술적 구현 하이라이트

### MutationObserver + SPA 라우팅 대응

치지직은 React 기반 SPA입니다. 메인 페이지에서 라이브 페이지로 이동할 때 React가 chatWrapper를 unmount/remount하면 기존 MutationObserver가 detached DOM을 계속 감시하는 문제가 발생합니다.

특정 컨테이너 대신 `document.body`를 직접 감시하고 셀렉터로 chatItem만 필터링하는 방식으로 전환하여 React remount에 완전히 독립적인 구조로 해결했습니다.

---

### 3단계 캐싱 + 선택적 무효화

```
채팅 메시지 감지
  → 1단계: 클라이언트 인메모리 캐시 확인 (5분 TTL)
      hit  → 즉시 배지 삽입 (서버 요청 0)
      miss → Debounce 300ms 배치 처리
              → 2단계: 서버 LRU 캐시 확인 (500개, 5분 TTL)
                  hit  → 캐시 반환
                  miss → DB 조회 후 캐시 저장

티어 변경 시:
  → invalidateTierCache() → 서버 LRU 즉시 삭제
  → Realtime broadcast  → content.js 해당 닉네임만 선택적 무효화
```

---

### JWT 인증 구조

서버는 Supabase `service_role` 키를 사용해 RLS를 우회하므로, API 수준의 별도 인증이 필요합니다.

- **발급**: 치지직 OAuth callback 완료 시 서버가 JWT 생성 → redirect URL에 포함 → background.js 캡처 → `chrome.storage.local` 저장
- **만료**: 30일 고정 (치지직 access_token 수명과 무관하게 관리)
- **검증**: `requireSelf()` 미들웨어 — `JWT.sub`와 요청 대상 `chzzkChannelId` 일치 확인
- **자동 갱신**: `withAuth()` 래퍼 — 401 수신 시 refresh 1회 재시도, 실패 시 재로그인 안내

---

### Manifest V3 OAuth 플로우

`chrome.identity.launchWebAuthFlow()`는 쿠키가 격리되어 치지직 로그인 세션을 공유하지 못합니다. 일반 브라우저 탭을 열어 인증하는 방식으로 전환했습니다.

- `background.js`가 `chrome.tabs.create()`로 인증 탭 생성
- `tabs.onUpdated`로 `/auth/success` 리다이렉트 URL 감지 → JWT 파라미터 추출
- service worker 재시작 대비 `authTabId`를 `chrome.storage.session`에 보관

---

## OBS 오버레이 설정 (스트리머용)

1. OBS Studio → 소스 추가 → 브라우저
2. URL 입력

```
# 시청자 티어 배지 + 닉네임 목록
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=list

# 티어 분포 통계 바차트
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=stats
```

3. `{liveId}` = 현재 방송 URL `chzzk.naver.com/live/{liveId}`에서 복사
4. 너비 / 높이 설정 (예: 300 x 600)
5. 배경 투명 체크

> 익스텐션이 설치되어 있고, 치지직 로그인 상태이며, 티어를 공개로 설정한 시청자만 오버레이에 표시됩니다.

---

## 설치 방법

현재 Chrome 웹 스토어 출시 준비 중입니다. 개발자 모드로 직접 설치할 수 있습니다.

```bash
# 1. 레포지토리 클론
git clone https://github.com/IJHO-NUl1l1/chzzk-lol-tier.git

# 2. Chrome 브라우저에서 chrome://extensions 접속

# 3. 우측 상단 "개발자 모드" 활성화

# 4. "압축 해제된 확장 프로그램을 로드합니다" 클릭

# 5. 클론한 폴더 선택
```

---

## Tech Stack

| 영역 | 기술 |
|------|------|
| **Extension** | JavaScript, Chrome Extension API (Manifest V3) |
| **서버** | Node.js, Fastify, TypeScript |
| **DB** | Supabase (PostgreSQL), Supabase Realtime |
| **인증** | 치지직 OAuth, JWT (HS256) |
| **Web** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **외부 API** | Riot Games API (LoL / TFT) |
| **배포** | Railway (서버), Vercel (웹) |

---

## 레포지토리

| 역할 | 링크 |
|------|------|
| Chrome Extension | https://github.com/IJHO-NUl1l1/chzzk-lol-tier |
| Fastify 서버 | https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-fastify |
| Web | https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-web |
