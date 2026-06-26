# 치지직 라이엇 티어 트래커

> 치지직 라이브 채팅창에 시청자의 LoL / TFT 랭크 배지를 실시간으로 표시하는 Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/IJHO-NUl1l1/chzzk-lol-tier)
[![Fastify](https://img.shields.io/badge/Server-Fastify-000000?logo=fastify)](https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-fastify)
[![Next.js](https://img.shields.io/badge/Web-Next.js-000000?logo=next.js)](https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-web)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)](https://railway.app)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://chzzk-riot-tier-tracker-web.vercel.app)

---

## 관련 레포지토리

| 역할 | 링크 |
|------|------|
| Chrome Extension | https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker (current repo) |
| Fastify 서버 | https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-fastify |
| Onboarding Web | https://github.com/IJHO-NUl1l1/chzzk-riot-tier-tracker-web |

---

## 프로젝트 개요

치지직(chzzk.naver.com) 라이브 방송의 채팅창에서 시청자의 닉네임 옆에 Riot Games 랭크 배지를 자동으로 표시하는 Chrome Extension입니다.

익스텐션을 설치한 시청자가 자신의 치지직 계정과 Riot 계정을 연동하면, 해당 채널을 방문하는 모든 시청자의 화면에서 티어 배지가 표시됩니다. 팝업에서 등록·수정·공개설정을 변경하면 Supabase Realtime을 통해 채팅창에 즉시 반영됩니다.

스트리머는 OBS Browser Source를 통해 세 가지 오버레이를 방송 화면에 표시할 수 있습니다.

---

## 주요 기능

- **채팅 배지 자동 삽입** — MutationObserver로 채팅 DOM을 감지, 닉네임 옆에 LoL / TFT 티어 엠블럼 자동 표시
- **배지 hover 툴팁** — 티어, 랭크, LP, Riot 닉네임을 포함한 상세 정보 표시
- **실시간 즉시 반영** — Supabase Realtime Broadcast로 등록·삭제·공개설정 변경이 채팅창에 즉시 동기화
- **공개 / 비공개 설정** — 게임별(LoL / TFT)로 배지 공개 여부를 개별 제어
- **JWT 인증** — 본인 데이터만 수정 가능하도록 서버 수준 인증 적용
- **OBS Browser Source Overlay** — 시청자 티어 목록 / 티어 통계 / 치지직 채팅창을 방송 화면에 실시간 표시
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

OBS Studio → 소스 추가 → 브라우저, 아래 URL 입력:

```
# 시청자 티어 배지 + 닉네임 목록
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=list

# 티어 분포 통계 바차트
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=stats

# 치지직 채팅창 오버레이 (티어 배지 포함)
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=chat
```

`{liveId}` = 현재 방송 URL `chzzk.naver.com/live/{liveId}`에서 복사

**mode=list / stats**
- Supabase Realtime Presence로 현재 시청자를 실시간 추적
- 익스텐션 설치 + 티어 공개 설정 유저만 표시
- 시청자가 탭을 닫으면 자동 제거

**mode=chat**
- 치지직 WebSocket에 직접 연결하여 채팅 수신
- 닉네임 색상: 치지직 원본과 동일하게 재현 (해시 팔레트 40색 / CC·CD·SG·SH·SS 코드)
- 뱃지: 역할 뱃지(스트리머/매니저), 구독 뱃지, 시청자 뱃지, 티어 뱃지 순서로 표시
- 채팅 내 커스텀 이모지 지원
- Supabase Realtime으로 티어 변동 즉시 반영 (비공개 전환 시 뱃지 즉시 제거 포함)
- 컨테이너 하단 고정 레이아웃 — OBS 브라우저 소스 크기 기준으로 아래에서 위로 쌓임

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
│                                                             │
│  content.js ──── MutationObserver ──── 채팅 배지 삽입        │
│      │                                                      │
│      └──── Supabase Realtime 구독 (tier_updates:{liveId})   │
│                                                             │
│  popup.js ──── 치지직 / Riot 연동, 등록/삭제/공개설정 토글     │
│      │                                                      │
│      └──── chrome.storage.local (JWT, 연동 정보)             │
│                                                             │
│  background.js ──── OAuth 탭 관리, JWT 캡처 및 저장           │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Fastify 서버 (Railway, 상시 구동)               │
│                                                             │
│  GET  /api/tier                    ── 닉네임 기반 티어 조회  │
│  POST /api/chzzk/tier-cache        ── 티어 등록 (JWT 인증)  │
│  DEL  /api/chzzk/tier-cache        ── 티어 삭제 (JWT 인증)  │
│  POST /api/privacy/update          ── 공개설정 변경          │
│  GET  /api/chzzk/auth              ── 치지직 OAuth 시작      │
│  GET  /api/chzzk/chat-channel      ── chatChannelId 조회    │
│  GET  /api/chzzk/chat-token        ── WS 액세스 토큰 발급   │
│  GET  /api/chzzk/nickname-color-codes ── 닉네임 색상 코드    │
│  GET  /api/riot/...                ── Riot API 프록시        │
│                                                             │
│  lib/tier-store.ts ── 서버 LRU 캐시 (500개, 5분 TTL)         │
│  lib/realtime.ts   ── broadcastToChannel() 헬퍼             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│                                                             │
│  PostgreSQL DB                                              │
│  ├── users          ── 치지직 계정 정보                      │
│  ├── chzzk_tokens   ── 치지직 OAuth 토큰                     │
│  └── tier_cache     ── LoL / TFT 티어 데이터                 │
│                                                             │
│  Realtime Broadcast ── tier_updates:{liveId} 채널           │
│  Realtime Presence  ── 시청자 추적 (list / stats 오버레이용)  │
│  RLS                ── anon key 직접 쓰기 차단               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Web / Next.js (Vercel)                         │
│                                                             │
│  /                       ── 랜딩 페이지                      │
│  /demo                   ── 인터랙티브 데모 (5단계)           │
│  /overlay/[liveId]?mode=list   ── 시청자 티어 목록 오버레이   │
│  /overlay/[liveId]?mode=stats  ── 티어 분포 통계 오버레이    │
│  /overlay/[liveId]?mode=chat   ── 치지직 채팅창 오버레이      │
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

---

### Fastify 서버

Node.js + Fastify로 구축된 백엔드 서버입니다. Railway에 상시 구동(Always On)으로 배포되어 cold start 없이 안정적으로 응답합니다.

**주요 역할**
- 치지직 OAuth 인증 처리 및 JWT 발급
- Riot API 프록시 (API Key 보호, LRU 캐싱)
- tier_cache CRUD + Realtime broadcast 트리거
- JWT 기반 요청 인증 (`requireSelf()` 미들웨어)
- 치지직 WS 연결용 chatChannelId / 액세스 토큰 발급
- 치지직 닉네임 색상 코드 API 프록시 (CORS 우회, 1시간 서버 캐시)

**캐싱 구조**

| 레이어 | 위치 | 용량 | TTL |
|--------|------|------|-----|
| 클라이언트 인메모리 | content.js / ChatOverlay | 닉네임 단위 | 5분 |
| Debounce 배치 | content.js | — | 300ms |
| 서버 LRU (tier) | tier-store.ts | 500개 | 5분 |
| 서버 LRU (Riot API) | riot-api.ts | 1000개 | 5분 |
| 서버 인메모리 (색상 코드) | nickname-color-codes.ts | 전체 | 1시간 |

---

### Supabase

**테이블 구조**

| 테이블 | 설명 |
|--------|------|
| `users` | 치지직 채널 ID / 닉네임. `chzzk_channel_name` 인덱스로 빠른 조회 |
| `chzzk_tokens` | 치지직 OAuth 액세스 / 리프레시 토큰 (users와 1:1) |
| `tier_cache` | LoL / TFT 티어 데이터. `(chzzk_channel_id, game_type)` UNIQUE |

**RLS (Row Level Security)**
- 모든 테이블 RLS 활성화
- `tier_cache` — `is_public=true` 행만 공개 SELECT 허용
- 나머지 테이블 — anon / authenticated 전체 차단
- 서버는 `service_role` 키로 RLS 우회, 쓰기는 서버 API 경유만 허용

**Realtime**
- Broadcast — 서버가 명시적으로 이벤트 push, 클라이언트가 채널 구독으로 수신
- Presence — 동일 채널에서 시청자 실시간 추적 (list / stats 오버레이용)
- 채널명: `tier_updates:{liveId}`

---

### Web (Next.js / Vercel)

| 페이지 | 설명 |
|--------|------|
| `/` | 랜딩 페이지. MockChat 컴포넌트로 실제 채팅 배지 미리보기 |
| `/demo` | 5단계 스크롤 잠금 인터랙티브 데모 |
| `/overlay/[liveId]?mode=list` | OBS용 시청자 티어 배지 목록. Realtime Presence 구독 |
| `/overlay/[liveId]?mode=stats` | OBS용 티어 분포 통계 바차트. Realtime Presence 구독 |
| `/overlay/[liveId]?mode=chat` | OBS용 치지직 채팅창 완전 재현. Chzzk WS + Realtime Broadcast |

**채팅 오버레이 닉네임 색상 시스템**

치지직 JS 번들에서 역엔지니어링한 색상 로직을 그대로 재현합니다.

| 코드 | 처리 방식 |
|------|----------|
| 없음 / `CC000` | `sum(charCodes(userIdHash + chatChannelId)) % 40` → 40색 다크 팔레트 |
| `CC001~CC020` | `/api/chzzk/nickname-color-codes` API에서 동적으로 조회 |
| `CD001~CD040` | 구독 고정색 (정적 맵) |
| `SG001~SG005` | tier2 그라데이션 — CSS `background-clip: text` |
| `SH001~SH005` | tier2 하이라이트 (solid) |
| `SS001` | tier2 스텔스 (transparent) |

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
  → Realtime broadcast    → content.js / ChatOverlay 해당 닉네임만 선택적 무효화
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
2. 아래 URL 중 원하는 것 입력 (`{liveId}` = 방송 URL에서 복사)

```
# 시청자 티어 목록
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=list

# 티어 분포 통계
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=stats

# 채팅창 (티어 배지 포함)
https://chzzk-riot-tier-tracker-web.vercel.app/overlay/{liveId}?mode=chat
```

3. 너비 / 높이 설정 (채팅 오버레이 권장: 400 x 600 이상)
4. 배경 투명 체크

> list / stats: 익스텐션 설치 + 티어 공개 설정 유저만 표시됩니다.  
> chat: 채팅에 참여한 모든 유저를 표시하며, 익스텐션 연동 유저에게는 티어 배지가 추가됩니다.

---

## 설치 방법

Chrome 웹 스토어에서 다운 받으세요.

https://chromewebstore.google.com/detail/chzzk-riot-tier-tracker/nblnplkaaiadgbagcmolcfbodpjfekgd

---

## Tech Stack

| 영역 | 기술 |
|------|------|
| **Extension** | JavaScript, Chrome Extension API (Manifest V3) |
| **서버** | Node.js, Fastify, TypeScript |
| **DB** | Supabase (PostgreSQL), Supabase Realtime |
| **인증** | 치지직 OAuth, JWT (HS256) |
| **Web** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **외부 API** | Riot Games API (LoL / TFT), 치지직 WebSocket / REST API |
| **배포** | Railway (서버), Vercel (웹) |

---
