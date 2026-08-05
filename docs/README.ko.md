<div align="center">

# Maeul in the Sky · 천공의 마을

**GitHub 기여 기록으로 살아 움직이는 아이소메트릭 마을을 만듭니다.**

[![npm version](https://img.shields.io/npm/v/maeul-in-the-sky?color=cb3837&logo=npm)](https://www.npmjs.com/package/maeul-in-the-sky)
[![CI](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml/badge.svg)](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [中文](README.zh.md)

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../.github/assets/preview-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="../.github/assets/preview-light.svg">
  <img alt="GitHub Contribution Calendar로 만든 아이소메트릭 마을" src="../.github/assets/preview-dark.svg" width="840">
</picture>

[**프리셋 데모 체험**](https://t1seo.github.io/maeul-in-the-sky/) · [빠른 시작](#빠른-시작) · [npm](https://www.npmjs.com/package/maeul-in-the-sky) · [쇼케이스](../SHOWCASE.md)

</div>

GitHub Contribution Calendar의 하루가 하늘에 떠 있는 Terrain의 일부가 됩니다. 조용한 날에는 물과 빈 땅이 생기고, 활발한 날에는 숲, 농장, 마을, 도시와 희귀한 Wonder가 자랍니다.

결과물은 독립 실행형 SVG 두 개입니다. 프로필 README에서 GitHub 색상 모드에 맞춰 전환되며, 클라이언트 JavaScript가 필요하지 않습니다.

## 마을에 포함되는 것

- 100단계 고도를 사용하는 결정론적 아이소메트릭 Terrain
- 달력에 맞춘 사계절과 계절별 에셋 48종
- 절차적으로 생성되는 강, 연못, 숲, 날씨와 주변 애니메이션
- 나무와 농장부터 탑과 동물까지 Terrain 에셋 118종
- Rare, Epic, Legendary 등급으로 발견하는 Epic Wonders 30종
- 접근 가능한 제목·설명, 모션 축소 설정을 지원하는 다크·라이트 SVG
- 북반구와 남반구 계절 배치
- 기여 기간, 활동일, 연속 기여, 가장 활발한 달, 발견한 Wonder 수

## 마을 프리셋 선택

프리셋은 어떤 에셋이 나타날지를 바꿉니다. 기여 수, 고도, 색상은 바꾸지 않습니다.

| Nature | Balanced | Civilization |
|:---:|:---:|:---:|
| [![Nature 프리셋](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced 프리셋](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization 프리셋](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
| 숲과 열린 땅을 더 많이 | 자연, 농장, 마을의 균형 | 평소 활동일에도 건물을 더 많이 |
| `preset: nature` | `preset: balanced` | `preset: civilization` |

## 빠른 시작

### 1. Action 추가

GitHub 프로필에 사용하려면 사용자명과 같은 이름의 저장소에 `.github/workflows/maeul-sky.yml`을 추가합니다.

```yaml
name: Update Maeul in the Sky

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: t1seo/maeul-in-the-sky@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          preset: balanced

      - uses: stefanzweifel/git-auto-commit-action@v7
        with:
          commit_message: 'chore: update Maeul in the Sky'
```

기본 GitHub 사용자명은 저장소 소유자입니다. 다른 사람의 Terrain을 만들 때만 `username`을 지정하시면 됩니다.

### 2. 한 번 실행

**Actions → Update Maeul in the Sky → Run workflow**를 엽니다. 첫 실행에서 다음 파일을 만듭니다.

- `maeul-in-the-sky-dark.svg`
- `maeul-in-the-sky-light.svg`

커밋 단계가 거부되면 **Settings → Actions → General → Workflow permissions**에서 읽기 및 쓰기 권한을 허용해 주세요.

### 3. README에 추가

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg">
  <img alt="나의 GitHub 기여 마을" src="./maeul-in-the-sky-dark.svg" width="100%">
</picture>
```

## Action 입력값

| 입력값 | 설명 | 기본값 |
|---|---|---|
| `username` | Contribution Calendar를 가져올 GitHub 사용자 | 저장소 소유자 |
| `github_token` | GitHub GraphQL API 토큰 | `${{ github.token }}` |
| `theme` | Theme 렌더러 | `terrain` |
| `title` | SVG 제목 | `@username` |
| `output_dir` | SVG 두 개를 저장할 폴더 | `./` |
| `year` | 달력 연도. 생략하면 최근 52주 | 최근 52주 |
| `hemisphere` | 계절 배치: `north` 또는 `south` | `north` |
| `preset` | `nature`, `balanced`, `civilization` | `balanced` |
| `density` | 1부터 10까지의 고급 건물 밀도 덮어쓰기 | 프리셋 값 |

출력값 `dark_svg_path`와 `light_svg_path`에는 생성된 파일 경로가 담깁니다.

```yaml
- uses: t1seo/maeul-in-the-sky@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    hemisphere: south
    title: 'Octocat의 코딩 마을'
```

프리셋보다 세밀한 조정이 필요할 때만 `density`를 사용하세요. 값이 높으면 활동량이 낮은 셀에도 건물이 나타나고, 낮으면 자연이 더 많이 남습니다.

## Terrain Generation 원리

기여 강도는 사용자의 활동 범위 안에서 상대적으로 정규화됩니다. 사람마다 기여 수가 달라도 각자 바빴던 날은 도시가 될 수 있습니다.

| 기여 패턴 | Terrain 결과 |
|---|---|
| 활동 없음 | 물과 빈 공간 |
| 가벼운 활동 | 해안, 풀밭, 작은 식생 |
| 꾸준한 활동 | 숲과 농장 |
| 높은 활동 | 마을과 소도시 |
| 최고 활동 | 도시, 탑, Wonder 후보 |

꾸준함은 섬을 넓히고, 하루의 강도는 개별 셀을 발전시킵니다. 사용자명, Contribution Calendar, 연도, 반구, 밀도가 같으면 배치도 같습니다.

### Epic Wonders

활동량이 높은 Terrain에서는 30종의 특별한 랜드마크를 발견할 수 있습니다.

- **Rare 14종:** 후지산, 자이언트 세쿼이아, 콜로세움, 산호초 등
- **Epic 10종:** 오로라, 타지마할, 빙하 봉우리, 생물 발광 연못 등
- **Legendary 6종:** 공중섬, 드래곤 둥지, 세계수, 고대 포털 등

Wonder는 해당 셀의 활동량, 주변 셀의 풍부함, 전체 기여 통계를 함께 고려합니다. 가독성을 위해 간격을 두고 최대 3개까지 배치됩니다.

## CLI

Node.js 20 이상과 GitHub 토큰이 필요합니다.

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat \
  --preset civilization \
  --output ./terrain
```

모든 옵션은 `npx --yes maeul-in-the-sky --help`에서 확인할 수 있습니다. `--year`를 생략하면 최근 52주를 사용합니다.

## JavaScript API

```bash
npm install maeul-in-the-sky
```

```js
import { generateTerrain } from 'maeul-in-the-sky';

const result = await generateTerrain({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  preset: 'balanced',
  outputDir: './terrain',
});

console.log(result.darkPath, result.lightPath);
```

`fetchContributions`, `computeStats`, Theme 레지스트리, 프리셋 목록도 내보냅니다. ESM과 CommonJS 빌드 모두 TypeScript 선언을 포함합니다.

## 데이터와 접근성

- 실행할 때마다 GitHub GraphQL API에서 기여 데이터를 직접 요청합니다.
- 분석 도구, 사용자 데이터베이스, 텔레메트리 전송 기능이 없습니다.
- SVG에는 집계된 수치와 날짜만 들어가며 저장소명이나 기여 세부 정보는 들어가지 않습니다.
- 볼 수 있는 데이터 범위는 토큰 권한을 따릅니다. 필요한 최소 권한만 사용해 주세요.
- SVG는 `<title>`, `<desc>`, `role="img"`를 포함하며 모션 축소 요청 시 정적으로 표시됩니다.

## 문제 해결

- **SVG가 커밋되지 않음:** 워크플로에 `contents: write`가 있고 저장소 Workflow permissions가 읽기·쓰기를 허용하는지 확인하세요.
- **다른 계정이 표시됨:** `username`을 지정하세요. 예약 실행도 저장소 소유자를 기본값으로 사용합니다.
- **기간이 올해 1월부터가 아님:** 정상입니다. `year`를 생략하면 GitHub 프로필처럼 최근 52주를 사용합니다.
- **애니메이션이 움직이지 않음:** 운영체제의 모션 축소 설정 또는 Markdown 호스트 정책 때문일 수 있습니다. Terrain은 정적 이미지로도 온전히 보입니다.
- **비공개 기여가 빠짐:** 제공된 토큰으로 볼 수 있는 기여만 포함할 수 있습니다.

그 밖의 문제는 [지원 안내](../SUPPORT.md)를 확인하거나 [이슈를 등록](https://github.com/t1seo/maeul-in-the-sky/issues/new/choose)해 주세요.

## 커뮤니티

- [쇼케이스](../SHOWCASE.md)에 프로필 공유
- [기여 가이드](../CONTRIBUTING.md)
- [보안 정책](../SECURITY.md)
- [행동 강령](../CODE_OF_CONDUCT.md)

## 라이선스

[MIT](../LICENSE) © [t1seo](https://github.com/t1seo)
