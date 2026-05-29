# CRTT — Component Design Reference

> 모든 팝업 CSS 변수는 `popup/popup.css`, 컨텐츠 스크립트 스타일은 `content.css` 기준.  
> 팝업 컴포넌트는 `popup/components/` 아래의 React TSX 파일.

---

## 1. Design Tokens

### Colors (`popup/popup.css` `:root`)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0a0a0f` | Body background |
| `--color-surface` | `#12121a` | Card / nav background |
| `--color-surface-hover` | `#1a1a26` | Hover surface |
| `--color-border` | `rgba(255,255,255,0.06)` | Default border |
| `--color-border-focus` | `rgba(99,102,241,0.5)` | Input focus ring |
| `--color-text` | `#e4e4e7` | Primary text |
| `--color-text-dim` | `#71717a` | Secondary / label text |
| `--color-text-muted` | `#52525b` | Placeholder / hint text |
| `--color-accent` | `#818cf8` | Primary accent (indigo) |
| `--color-accent-bright` | `#a5b4fc` | Lighter accent |
| `--color-accent-dim` | `rgba(99,102,241,0.15)` | Accent fill (bg) |
| `--color-error` | `#f87171` | Error state |
| `--color-success` | `#34d399` | Success / connected |
| `--color-info` | `#60a5fa` | Info state |

### Tier Colors

| Token | Value | Tier |
|---|---|---|
| `--tier-challenger` | `#f4c873` | Challenger |
| `--tier-grandmaster` | `#ef4444` | Grandmaster |
| `--tier-master` | `#9d4dc3` | Master |
| `--tier-diamond` | `#576ace` | Diamond |
| `--tier-emerald` | `#3eb489` | Emerald |
| `--tier-platinum` | `#4fccc6` | Platinum |
| `--tier-gold` | `#f1a64d` | Gold |
| `--tier-silver` | `#7e8183` | Silver |
| `--tier-bronze` | `#b97451` | Bronze |
| `--tier-iron` | `#72767d` | Iron |
| `--tier-unranked` | `#444444` | Unranked |

### Tier Gradients (content script — `content.js` `TIER_GRADIENTS`)

Used for tooltip tier text and left border accent.

| Tier | Start | End |
|---|---|---|
| CHALLENGER | `#f4c873` | `#ffffff` |
| GRANDMASTER | `#ef4444` | `#f97316` |
| MASTER | `#9d4dc3` | `#ec4899` |
| DIAMOND | `#60a5fa` | `#a5f3fc` |
| EMERALD | `#10b981` | `#0ac3a6` |
| PLATINUM | `#00b4d8` | `#90e0ef` |
| GOLD | `#c89b3c` | `#f4c873` |
| SILVER | `#6b7280` | `#d1d5db` |
| BRONZE | `#a16207` | `#d97706` |
| IRON | `#4b5563` | `#9ca3af` |

Gradient applied as: `linear-gradient(135deg, {start} 0%, {end} 100%)`

### Typography

| Token | Value |
|---|---|
| `--font-sans` | `'Noto Sans KR'`, system-ui |
| `--font-display` | `'Rajdhani'` — all-caps labels, tier badges, nav |
| `--font-mono` | `'Orbitron'` — main popup `<h1>` title only |

### Spacing / Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Inputs, small buttons |
| `--radius-md` | `10px` | Tab nav |
| `--radius-lg` | `14px` | Cards, bottom nav |
| `--transition` | `200ms cubic-bezier(0.4,0,0.2,1)` | Default transition |

---

## 2. Content Script Components (`content.css`)

These classes are **injected into Chzzk DOM**. All prefixed with `crtt-` to avoid collisions.

### 2.1 Badge Wrapper — `.crtt-badge-wrapper`

Container that wraps all tier badges for a single chat message.

```
[badge1] [badge2]   {nickname}
└─ .crtt-badge-wrapper ─┘
```

| Property | Value |
|---|---|
| display | `inline-flex` |
| align-items | `center` |
| gap | `2px` |
| vertical-align | `middle` |
| margin-right | `4px` |

### 2.2 Tier Badge — `.crtt-tier-badge`

Individual clickable badge (one per game type).

```html
<span class="crtt-badge-wrapper">
  <span class="crtt-tier-badge" data-game="lol">
    <img src="images/RankedEmblemsLatest/Emblem_Gold.png" width="18" height="18" />
  </span>
</span>
```

| State | Effect |
|---|---|
| default | `display:inline-flex`, `cursor:pointer` |
| `:hover` | `brightness(1.25)`, `drop-shadow` indigo, `scale(1.12)` |
| transition | `filter 0.15s`, `transform 0.15s` |

Badge image: `chrome-extension://{id}/images/RankedEmblemsLatest/Emblem_{Tier}.png`  
Size: `18×18` px (set inline via JS)

### 2.3 Tooltip — `.crtt-tooltip`

Fixed-position tooltip rendered **once** per page, repositioned on hover.

**Structure:**
```html
<div class="crtt-tooltip" id="crtt-tooltip">
  <div class="crtt-tooltip-header">
    <img class="crtt-tooltip-tier-img" />         <!-- 52×52 tier emblem -->
    <div class="crtt-tooltip-info">
      <span class="crtt-tooltip-game crtt-tooltip-game--lol">LOL</span>  <!-- or --tft -->
      <div class="crtt-tooltip-tier-text">GOLD II</div>   <!-- gradient text -->
    </div>
  </div>
  <div class="crtt-tooltip-lp-prestige">
    1234 <span style="font-size:12px;color:#52525b">LP</span>
  </div>
</div>
```

**Container styles:**

| Property | Value |
|---|---|
| position | `fixed` |
| z-index | `99999` |
| background | `linear-gradient(155deg, #0f0f1c, #09090f)` |
| border | `1px solid rgba(129,140,248,0.22)` |
| border-left-width | `3px` (color = tier gradient start + 88 alpha) |
| border-radius | `12px` |
| padding | `14px 16px 14px 14px` |
| min-width | `210px` / max-width `270px` |
| font-family | `'Segoe UI'`, system-ui |

**Visibility states:**

| Class | opacity | transform |
|---|---|---|
| default (hidden) | `0` | `translateY(-5px) scale(0.97)` |
| `.crtt-tooltip--visible` | `1` | `translateY(0) scale(1)` |

Transition: `opacity 0.18s ease`, `transform 0.2s cubic-bezier(0.16,1,0.3,1)`

**Sub-elements:**

| Class | Description |
|---|---|
| `.crtt-tooltip-header` | `display:flex; gap:10px` — image + info side by side |
| `.crtt-tooltip-tier-img` | `52×52`, `drop-shadow` |
| `.crtt-tooltip-info` | flex column, `gap:3px` |
| `.crtt-tooltip-game` | pill badge, `font-size:9px`, uppercase |
| `.crtt-tooltip-game--lol` | indigo background/border/text |
| `.crtt-tooltip-game--tft` | teal/emerald background/border/text |
| `.crtt-tooltip-tier-text` | `15px`, `font-weight:800`, gradient via `background-clip:text` |
| `.crtt-tooltip-lp-prestige` | `20px`, `font-weight:800`, centered, `margin-top:10px` |

**Top shimmer line:** `::before` — `linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)` at `height:1px`

---

## 3. Popup Components (`popup/components/`)

Popup layout: `body (340×570px)` → `#root (flex column)` → `#app (scrollable, padding 20px)` + `.bottom-nav-wrapper (fixed bottom)`

Page animations on load: `slideUp 400ms cubic-bezier(0.16,1,0.3,1)` (app), `fadeSlideIn 300ms` (page/tab transitions).

### 3.1 Bottom Navigation — `BottomNav.tsx`

```
.bottom-nav-wrapper
  └── .bottom-nav
        ├── .nav-bubble   (animated active indicator)
        └── .nav-item × 3  (Home | Search | Settings)
```

| Element | Key styles |
|---|---|
| `.bottom-nav` | `height:48px`, `background: --color-surface`, `border-radius: --radius-lg` |
| `.nav-bubble` | absolute, animated with `transform` + `width` (spring: `cubic-bezier(0.25,1.3,0.5,1)`) |
| `.nav-item` | flex col, `font-size:9px`, no button shimmer (`::after {display:none}`) |
| `.nav-item.active` | `--color-accent-bright`, icon `drop-shadow` indigo glow |

Icons: 18×18 SVG inline.  
Labels: "Home" / "Search" / "Settings"

### 3.2 Card — generic container

Used by VerifyCard, old info cards.

```html
<div class="card">
  <div class="card-title">Title</div>
  <div class="card-content">…</div>
</div>
```

| Element | Key styles |
|---|---|
| `.card` | `background: --color-surface`, `border-radius: --radius-lg`, `border: 1px --color-border`, `overflow:hidden` |
| `.card::before` | top shimmer line (opacity 0 → 1 on hover) |
| `.card-title` | `font-family: --font-display`, `11px`, `letter-spacing:0.1em`, dim color → `--color-accent-bright` on hover |
| `.card-content` | `padding:14px` |

### 3.3 Auth Card — `.auth-card` (base for ChzzkCard + RiotCard)

Vertically centered flex column. Used for both Chzzk and Riot connection states.

```
.auth-card
  ├── .auth-card-visual          (64×64 orb + icon)
  │     ├── .auth-orb            (radial gradient circle)
  │     └── svg .auth-logo       (36×36)
  ├── .auth-card-body            (label + sublabel/channel)
  ├── [buttons]
  └── [.auth-hint]               (info box, optional)
```

**Visual orb states:**

| Class | Description |
|---|---|
| `.auth-orb` | Default — indigo radial gradient, `border:1px solid rgba(99,102,241,0.1)` |
| `.auth-orb--active` | Green — `rgba(52,211,153)`, pulsing `orbPulse` animation |
| `.auth-orb--riot` | Red — `rgba(220,38,38)`, different gradient |
| `.auth-orb--riot.auth-orb--active` | Red active + `orbPulseRiot` animation |

**Logo states:**

| Class | Color |
|---|---|
| `.auth-logo` | `--color-text-muted` (gray) |
| `.auth-logo--active` | `--color-success` (#34d399) + drop-shadow |
| Riot active (`:has(.auth-orb--riot.auth-orb--active)`) | `#ef4444` + drop-shadow |

**Channel display (connected):**
```html
<div class="auth-channel">
  <span class="auth-channel-dot" />         <!-- blinking green dot -->
  <span class="auth-channel-name">닉네임</span>
</div>
```
- `.auth-channel-dot`: `6px` circle, green glow, `dotBlink 2.5s` animation
- `.auth-channel-dot--riot`: red variant

**Badges:**

| Class | Description |
|---|---|
| `.badge-beta` | Yellow gradient pill, `8px`, "BETA" text, inline |

### 3.4 ChzzkCard — `ChzzkCard.tsx`

**States:**

| State | Auth icon | Orb | Buttons |
|---|---|---|---|
| Disconnected | link SVG (gray) | default indigo | `.btn-auth` "Connect" + `.auth-hint` |
| Connected | checkmark (green) | active green pulse | `.btn-disconnect` "Disconnect" |
| Loading | — (none, handled by parent) | — | `.btn-auth.is-loading` |

`.auth-hint`: info box with 3-step instruction, `11px`, icon + text layout.

### 3.5 RiotCard — `RiotCard.tsx`

**States:**

| State | Description |
|---|---|
| `loading` | Spinner in sublabel (`auth-spinner`) |
| `!isRiotConnected` | 2 buttons: disabled "Riot으로 로그인 Coming Soon" + "소환사 검색으로 연결" |
| Connected | `.riot-split` with 2 TierColumns |

Buttons use `.btn-auth--riot` (red gradient) variant.

### 3.6 TierColumn — `TierColumn.tsx`

One column inside `.riot-split`. Shows LoL or TFT tier info.

```
.riot-split-col
  ├── .riot-split-col-header
  │     ├── .riot-split-title    (LOL / TFT)
  │     └── .toggle.toggle--sm  (public/private, only when registered)
  ├── img.riot-split-tier-img   (36×36 tier emblem)
  ├── span.riot-split-value     (summoner name)
  ├── span.riot-split-tier      (tier badge pill)
  └── button                    (.btn-riot-register or .btn-riot-col-unlink)
```

**Button states:**

| Class | Color | Trigger |
|---|---|---|
| `.btn-riot-register` (enabled) | hover → green | not verified or not registered |
| `.btn-riot-register:disabled` | opacity 0.35 | `!isVerifiedSearch \|\| !isChzzkConnected` |
| `.btn-riot-col-unlink` | hover → red | registered |

Verification warning (inline text below register button, only when `hasSearchData && !isVerifiedSearch`): `10px`, `#ef4444`, `⚠ 인증 후 등록할 수 있습니다`

### 3.7 VerifyCard — `VerifyCard.tsx`

Uses `.card` container. Renders inline below SearchResult on SearchPage.

**States:**

| `state` | UI |
|---|---|
| `'idle'` | "소유권 인증" title + "인증 시작" button |
| `'starting'` | button disabled, text "처리 중..." |
| `'pending'` | icon image (64×64 ddragon), "인증 완료" + "취소" buttons |
| `'confirming'` | both buttons disabled, confirm text "확인 중..." |
| `'error'` | `.status-message.error` + retry available |
| `'done'` | `return null` (unmounts) |

Icon image URL: `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/{iconId}.png`

### 3.8 Buttons

#### Primary — `button` (default)
```
background: linear-gradient(135deg, #6366f1, #8b5cf6)
```
- hover: `translateY(-1px)` + indigo glow box-shadow + shimmer (`::after` slide)
- active: `scale(0.98)`
- disabled: `--color-text-muted` bg, `cursor:not-allowed`

#### Auth Connect — `.btn-auth` (Chzzk)
```
background: linear-gradient(135deg, #00c473, #059b54)   /* green */
```
- hover: green glow

#### Auth Riot — `.btn-auth.btn-auth--riot`
```
background: linear-gradient(135deg, #dc2626, #991b1b)   /* red */
```
- hover: red glow

#### Disconnect — `.btn-disconnect`
```
background: transparent
border: 1px solid --color-border
color: --color-text-muted
font-size: 11px
```
- hover: red border + red text + subtle red bg

#### Column Register — `.btn-riot-register`
```
height: ~24px (padding 4px 0)
font-size: 10px
background: rgba(255,255,255,0.06)
```
- hover: green
- disabled: opacity 0.35

#### Column Unlink — `.btn-riot-col-unlink`
Same base as `.btn-riot-register`, hover → red.

**Loading state** (shared): `.is-loading` → `opacity:0.5`, `cursor:wait` or `btnPulse` animation

### 3.9 Toggle Switch — `.toggle`

Used in TierColumn header for public/private and in Settings page.

```html
<label class="toggle toggle--sm">
  <input type="checkbox" />
  <span class="toggle-slider" />
</label>
```

| Variant | Size | Thumb travel |
|---|---|---|
| `.toggle` (default) | `38×20px` | `18px` |
| `.toggle--sm` | `26×14px` | `12px` |

- Off: `--color-text-muted` track
- On: `linear-gradient(135deg, #6366f1, #8b5cf6)` track

### 3.10 Status Message — `.status-message`

```html
<div class="status-message info|success|error">메시지</div>
```

| Variant | BG | Text | Animation |
|---|---|---|---|
| `.info` | `rgba(96,165,250,0.1)` | `--color-info` | `statusPulse` (glow) |
| `.success` | `rgba(52,211,153,0.1)` | `--color-success` | `statusAppear` (slide up) |
| `.error` | `rgba(248,113,113,0.1)` | `--color-error` | `statusShake` (horizontal) |

Default state: `opacity:0`, `translateY(-4px)` — animated in when class applied.

### 3.11 Form Elements

```
.form-group         — label + input/select block
.form-row           — horizontal layout (flex, gap:8px)
.form-group-large   — flex:2
.form-group-small   — flex:1
```

Input/select base: `background: --color-bg`, `border: 1px --color-border`, `border-radius: --radius-sm`  
Focus: `--color-border-focus` border + indigo ring `box-shadow`

Select: custom chevron via `background-image` SVG, `appearance:none`

### 3.12 Settings Page

```
.settings-item      — flex row, space-between, border-bottom
.settings-label     — 12px, --color-text
.settings-select    — auto-width select, min-width 120px
```

About section:
```
.about-info         — flex row, space-between
.about-label        — 12px, --color-text-dim
.about-value        — --font-display, 12px, bold
```

---

## 4. Page Layouts

### HomePage
- `ChzzkCard`
- `RiotCard` (contains `TierColumn × 2`)

### SearchPage
- Search form (`.form-row` — Name + Tag + Region)
- Search button
- `SearchResult` (if result found)
- `VerifyCard` (if result found, not yet verified/registered)

### SettingsPage
- `card` with badge size selector
- `card` with about info (version, etc.)

---

## 5. Key Animation Inventory

| Name | Duration | Usage |
|---|---|---|
| `slideUp` | 400ms spring | App initial load |
| `fadeSlideIn` | 300ms spring | Page/tab transitions |
| `shimmerText` | 3s linear ∞ | `<h1>` logo text |
| `orbPulse` | 3s ease ∞ | Chzzk connected orb |
| `orbPulseRiot` | 3s ease ∞ | Riot connected orb |
| `dotBlink` | 2.5s ease ∞ | Connected channel dot |
| `btnPulse` | 1.5s ease ∞ | Loading buttons |
| `statusPulse` | 2s ease ∞ | Info status message |
| `statusAppear` | 300ms spring | Success message appear |
| `statusShake` | 400ms | Error message shake |
| `authSpin` | 0.8s linear ∞ | Auth loading spinner |
| Tooltip show | 0.18s / 0.2s | `crtt-tooltip--visible` |
| Badge hover | 0.15s | `crtt-tier-badge:hover` |

---

## 6. Tier Image Assets

Located in `images/RankedEmblemsLatest/`:

```
Emblem_Challenger.png
Emblem_Grandmaster.png
Emblem_Master.png
Emblem_Diamond.png
Emblem_Emerald.png
Emblem_Platinum.png
Emblem_Gold.png
Emblem_Silver.png
Emblem_Bronze.png
Emblem_Iron.png
Emblem_Unranked.png  (fallback)
```

Accessed as:
- Content script: `chrome.runtime.getURL('images/RankedEmblemsLatest/Emblem_{Tier}.png')`
- Popup: via `popup/lib/tier.ts` → `getTierImageUrl(tier)`

---

## 7. File Map

| File | Role |
|---|---|
| `content.css` | Content script styles (badge + tooltip) |
| `content.js` | Badge injection, tooltip logic, tier data |
| `popup/popup.css` | All popup styles + design tokens |
| `popup/components/App.tsx` | Root: state management, page routing |
| `popup/components/BottomNav.tsx` | 3-tab nav with animated bubble |
| `popup/components/ChzzkCard.tsx` | Chzzk OAuth connect/disconnect |
| `popup/components/RiotCard.tsx` | Riot account + split tier columns |
| `popup/components/TierColumn.tsx` | Single game type column (LOL/TFT) |
| `popup/components/VerifyCard.tsx` | Icon ownership verification flow |
| `popup/components/SearchResult.tsx` | Search result display |
| `popup/components/pages/HomePage.tsx` | Home layout |
| `popup/components/pages/SearchPage.tsx` | Search form + verify flow |
| `popup/components/pages/SettingsPage.tsx` | Settings |
| `popup/lib/tier.ts` | `getTierColor()`, `getTierImageUrl()` |
| `popup/hooks/useVerify.ts` | Verify state machine |
| `popup/hooks/useRiotAuth.ts` | Register / unlink / toggle privacy |
| `js/api/index.js` | Fetch wrappers for all server endpoints |
