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

[**SVG 마을 스튜디오**](https://t1seo.github.io/maeul-in-the-sky/) · [낮](https://t1seo.github.io/maeul-in-the-sky/?mode=light) · [밤](https://t1seo.github.io/maeul-in-the-sky/?mode=dark) · [빠른 시작](#빠른-시작) · [쇼케이스](../SHOWCASE.md)

</div>

GitHub Contribution Calendar의 하루가 하늘에 떠 있는 Terrain의 일부가 됩니다. 조용한 날에는 물과 빈 땅이 생기고, 활발한 날에는 숲, 농장, 마을, 도시와 희귀한 Wonder가 자랍니다.

기본 화면은 위와 같은 대각선 형태의 애니메이션 SVG 마을입니다. 프로필 결과물은 독립 실행형 SVG 두 개이며, 클라이언트 JavaScript가 필요하지 않습니다. 스튜디오에서 **Day(낮)** 또는 **Night(밤)**를 선택하실 수 있습니다. **README picture**에서는 GitHub 테마 자동 전환이나 낮·밤 고정을 선택하실 수 있습니다. 움직임은 사용자의 모션 축소 설정을 따릅니다.

원래 그림체를 계속 사용하시려면 [SVG 스튜디오의 클래식 버전](https://t1seo.github.io/maeul-in-the-sky/?renderer=classic)을 선택해 주세요. 업데이트 직전의 렌더러를 그대로 사용하며, 설정 화면에서 받는 워크플로도 `05a10eff07575acf2c81adcd66a66bc501507217`에 고정됩니다.

**2.0.0 릴리스**에는 아래의 에셋·사계절·일별 성장·그림체 개선이 포함됩니다. 기본 화면은 기존 달력형 마을이며, 새 지형 실험은 [별도 아카이브](https://github.com/t1seo/maeul-in-the-sky/tree/archive/civilization-terrain-2026-09-21)에 보관되어 있습니다.

**1.x에서 이전하기:** `ContributionData`를 직접 만들 때는 새 필수 통계 필드 네 개가 포함되도록 `stats: computeStats(weeks)`를 사용하세요. 새 장면은 배치 버전 3과 개선된 에셋으로 생성되며, 저장된 버전 1·2 장면도 계속 지원합니다.

## 마을에 포함되는 것

- 100단계 고도를 사용하는 결정론적 아이소메트릭 Terrain
- 잎과 꽃, 실루엣, 재질 색상으로 구별되는 달력 기반 사계절
- 절차적으로 생성되는 강, 연못, 숲, 날씨와 주변 애니메이션; 미니어처 지면 질감·흐르는 물결·하늘섬 아래로 떨어지는 폭포
- 일반 에셋 ID 210개: 클래식 197개와 한국형 13개, 계절형 68개와 전 계절형 142개
- Rare, Epic, Legendary 등급으로 발견하는 Epic Wonders 30종
- 기존 그림 개편, 한국 시골 9종과 자연 경관 8종 추가로 총 240종
- 문화와 독립적인 미니어처/픽셀 그림체, 원본 기여 수에 따른 일별 성장 보상
- 접근 가능한 제목·설명, 모션 축소 설정을 지원하는 다크·라이트 SVG
- 북반구와 남반구 계절 배치
- 기여 기간, 활동일, 연속 기여, 가장 활발한 달, 발견한 Wonder 수
- 배너/카드 레이아웃, 전체/은은함/끔 모션, 정적 PNG, 확대 가능한 브라우저 탐색기
- 버전이 있는 설정·스냅샷, 여러 해 비교, 로컬 인증 미리보기
- SVG 스튜디오에서 바로 여는 Activity 그래프: 기여 추이·요일별 활동과 스냅샷에 포함된 월별 커밋·PR 기록

README 미리보기와 프리셋 이미지 6개는 고정 시드의 **합성 데이터**를 사용하며, **2025-01-05부터 2026-01-03까지 제공된 364일**을 표시합니다. 실제 계정을 가져온 결과나 완전한 2025년 달력이 아닙니다. 희소/최대 미리보기는 별도의 고정 패턴이고, 원래 벤치마크 픽스처는 재현 가능한 비교를 위해 그대로 유지합니다.

## 마을 프리셋 선택

[SVG 스튜디오](https://t1seo.github.io/maeul-in-the-sky/)에서 같은 풍경을 낮과 밤으로 바꿔 보실 수 있습니다.

프리셋은 추가 장식의 구성을 바꿉니다. 기여 수, 고도, 색상, 일별 보상 단계는 바꾸지 않습니다.

|                                                          Nature                                                           |                                                            Balanced                                                             |                                                                Civilization                                                                 |
| :-----------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------: |
| [![Nature 프리셋](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced 프리셋](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization 프리셋](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
|                                                  여백을 살린 가벼운 장식                                                   |                                                     균형 잡힌 경관 장식                                                     |                                                       활동일에 더 풍부한 장식                                                        |
|                                                     `preset: nature`                                                      |                                                       `preset: balanced`                                                        |                                                           `preset: civilization`                                                            |

## 보관된 실험

2D 섬 지도, 3D 세계, 월별 군도, 하나의 큰 섬, 사계절 섬, 원형 섬, 폭포와 3D 프로필 캡처는 **아카이브**로 보존합니다. 기본 SVG 화면과 별도로 제공하며 기존 저장 파일과 공유 링크도 유지합니다.

스튜디오 하단의 **Archive · 3D & island experiments**를 열거나 [보관된 하늘 세계 안내](world-explorer.ko.md)를 참고해 주세요. 기존 연동을 위한 3D 캡처 Action은 남겨 두며, 기본 프로필 설정은 SVG를 생성합니다.

## 빠른 시작

### 1. Action 추가

GitHub 프로필에 사용하려면 사용자명과 같은 이름의 저장소에 `.github/workflows/maeul-sky.yml`을 추가합니다.

예제는 `@v2.0.0`을 고정합니다. 호환되는 업데이트를 받으려면 `@v2`를 사용하세요. `@v1`은 이전 메이저 버전을 유지합니다. 변경되지 않는 참조가 필요하면 검증한 전체 커밋 SHA를 고정해 주세요.

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

      - uses: t1seo/maeul-in-the-sky@v2.0.0
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
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg" />
  <img alt="나의 GitHub 기여 마을" src="./maeul-in-the-sky-dark.svg" width="100%" />
</picture>
```

## Action 입력값

| 입력값           | 설명                                            | 기본값                    |
| ---------------- | ----------------------------------------------- | ------------------------- |
| `username`       | Contribution Calendar를 가져올 GitHub 사용자    | 저장소 소유자             |
| `github_token`   | GitHub GraphQL API 토큰                         | `${{ github.token }}`     |
| `theme`          | Theme 렌더러                                    | `terrain`                 |
| `title`          | SVG 제목                                        | `@username`               |
| `output_dir`     | SVG 두 개를 저장할 폴더                         | `./`                      |
| `year`           | 달력 연도. 생략하면 최근 52주                   | 최근 52주                 |
| `hemisphere`     | 계절 배치: `north` 또는 `south`                 | `north`                   |
| `preset`         | `nature`, `balanced`, `civilization`            | `balanced`                |
| `density`        | 1부터 10까지의 주변 장식 구성 덮어쓰기          | 프리셋 값                 |
| `config`         | 버전 1 설정 JSON 경로                           | 없음                      |
| `input`          | 스냅샷 JSON 경로. 네트워크 요청을 생략          | 없음                      |
| `write_snapshot` | 재사용할 스냅샷 작성: `true` 또는 `false`       | `false`                   |
| `motion`         | `full`, `subtle`, `off`                         | `full`                    |
| `layout`         | `banner` 또는 `card`                            | `banner`                  |
| `village_style`  | 문화: `classic` 또는 `korean`                    | `classic`                 |
| `art_style`      | 문화와 독립적인 그림체: `miniature` 또는 `pixel` | `miniature`               |
| `layout_seed`    | 선택적 결정론적 배치 시드                       | 사용자명/연도/날짜 정체성 |
| `normalization`  | `relative`, `fixed`, 또는 여러 해 전용 `shared` | `relative`                |
| `max_count`      | `fixed`에서 사용하는 양의 최대값                | 없음                      |
| `format`         | `svg`, `png`, `both`                            | `svg`                     |
| `scale`          | 정적 PNG 배율 1부터 4                           | `2`                       |
| `years`          | 서로 다른 연도 2개부터 5개                      | 없음                      |

기본 출력값은 `dark_svg_path`와 `light_svg_path`입니다. 해당 기능을 사용할 때 `dark_png_path`, `light_png_path`, `snapshot_path`, `archive_path`, `comparison_dark_svg_path`, `comparison_light_svg_path`도 제공됩니다.

```yaml
- uses: t1seo/maeul-in-the-sky@v2.0.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    village_style: korean
    art_style: pixel
    hemisphere: south
    title: 'Octocat의 코딩 마을'
```

추가 장식을 세밀하게 조정하려면 1부터 10까지의 `density`를 사용하세요. 주변 장식의 후보 구성을 바꾸며, 실제 변화폭은 여유 공간과 일별 성장 단계에 따라 달라집니다. 일별 보상 단계를 낮추거나 양수 날짜의 주 에셋 보장을 없애지는 않습니다.

## Terrain Generation 원리

높이는 기존처럼 `relative`가 기본값입니다. 양수 기여 수의 P90과 제곱근 매핑으로 레벨 1부터 99를 만들고, 0은 0으로 유지합니다. `fixed`는 지정한 `maxCount`를 사용합니다. 일별 성장은 높이와 별도로 원본 Contribution Calendar 수치로 정합니다. 커밋 수만을 뜻하지 않으며, 정규화된 높이나 밀도를 기준으로 삼지 않습니다.

| 하루 기여 수 | 보상 단계 |
| ------------ | --------- |
| 0            | 0, 보상 없음 |
| 1–4          | 1         |
| 5–9          | 2         |
| 10–24        | 3         |
| 25–49        | 4         |
| 50 이상      | 5         |

기여 수가 양수인 날짜에는 주 에셋 또는 그 자리를 차지하는 Wonder와 함께 단계 표시가 남습니다. 낮은 단계는 자연물, 높은 단계는 문화와 Biome에 맞는 발달한 실루엣으로 표현합니다. Wonder가 놓여도 단계 표시는 사라지지 않습니다. 예를 들어 `fixed` 최대값이 20이면 기여 수 25와 50은 높이가 같지만 보상 단계는 각각 4와 5입니다.

이는 시각적 보상 규칙이며 GitHub 공식 등급이나 코드 품질 점수가 아닙니다. 해당 날짜의 기여 수를 늘려도 단계는 낮아지지 않으며, 다른 날짜의 수치·정규화·밀도에도 영향을 받지 않습니다. 다만 무작위 장면 전체, 추가 장식, 전역 Wonder 선택까지 계속 늘어난다는 뜻은 아닙니다.

기여 수가 지형 높이를 정합니다. 입력 날짜는 부분 주와 누락 구간을 포함해 실제 UTC 요일과 일요일 기준 주에 놓입니다. 누락 날짜는 만들지 않고, 알려진 0회 날짜는 실제 0일로 유지합니다. 장식은 기여 수를 늘리지 않습니다.

### Epic Wonders

활동량이 높은 Terrain에서는 30종의 특별한 랜드마크를 발견할 수 있습니다.

- **Rare 14종:** 후지산, 자이언트 세쿼이아, 콜로세움, 산호초 등
- **Epic 10종:** 오로라, 타지마할, 빙하 봉우리, 생물 발광 연못 등
- **Legendary 6종:** 공중섬, 드래곤 둥지, 세계수, 고대 포털 등

Wonder는 해당 셀의 활동량, 주변 셀의 풍부함, 전체 기여 통계를 함께 고려합니다. 가독성을 위해 간격을 두고 최대 3개까지 배치됩니다.

## 탐색과 설정

[데모](https://t1seo.github.io/maeul-in-the-sky/)에서 프리셋, 사용자명/연도/제목, 반구를 선택할 수 있습니다. 밀도, 모션, 배너/카드, 클래식/한국형 문화, 미니어처/픽셀 그림체, 높이 스케일, 배치 시드도 조정할 수 있습니다. 문화와 그림체는 독립적이므로 두 문화 모두 두 그림체를 사용할 수 있습니다. 샘플 설정을 바꿔도 계정을 가져오지는 않습니다. 실제 수치는 스냅샷을 불러오거나 아래 로컬 서비스를 사용해 주세요.

날짜를 선택하면 수치, 보상 단계, Biome, 배치 항목을 확인할 수 있습니다. 탐색기는 출처, 정확한 날짜 범위, 총합, 활동일, 연속 기여와 높이/계절 범례를 표시합니다. 확대/축소/초기화, 키보드 이동, Escape, 포커스 복귀를 지원합니다. [Wonder 도감](https://t1seo.github.io/maeul-in-the-sky/#wonders)은 발견/잠김 상태와 실제 조건을 보여 줍니다. 조건 충족만으로 선택이 보장되지는 않으며, 간격, 주변 Terrain, 확률, 최대 3개 제한도 적용됩니다.

설정 영역에서는 설정 JSON, 워크플로, README 조각을 내려받을 수 있습니다. 생성한 워크플로는 `t1seo/maeul-in-the-sky@v2.0.0`을 사용해 `output` 브랜치에 게시하며, README 조각도 그 브랜치를 가리킵니다. 버전을 고정하려면 검증한 전체 커밋 SHA로 바꿔 주세요. `${{`가 들어간 제목이나 배치 시드는 GitHub Actions 표현식으로 해석될 수 있어 워크플로로 내보낼 수 없지만 이미지와 JSON에서는 사용할 수 있습니다.

## CLI

Node.js 20 이상이 필요합니다. 아래 명령은 npm에 배포된 2.0.0 CLI를 `npx`로 실행합니다.

<details>
<summary>소스에서 빌드하기 (선택 사항)</summary>

```bash
git clone --branch v2.0.0 https://github.com/t1seo/maeul-in-the-sky.git
cd maeul-in-the-sky
npm ci
npx tsx scripts/pixel/generate.ts --check
npm run build
```

</details>

```bash
GITHUB_TOKEN="$(gh auth token)" npx --package=maeul-in-the-sky@2.0.0 maeul-sky \
  --user octocat --preset civilization --output ./terrain

npx --package=maeul-in-the-sky@2.0.0 maeul-sky --input village.snapshot.json \
  --layout card --village-style korean --art-style pixel --motion off --format both --scale 2 \
  --write-snapshot --output ./terrain

GITHUB_TOKEN="$(gh auth token)" npx --package=maeul-in-the-sky@2.0.0 maeul-sky \
  --user octocat --years 2024,2025 --normalization shared --output ./archive
```

| CLI 플래그                        | 값과 동작                                                 |
| --------------------------------- | --------------------------------------------------------- |
| `--user`, `-u`                    | 계정. 입력/설정에서 추론 가능                             |
| `--token`                         | 생성 토큰. 명시한 `--token`이 `GITHUB_TOKEN`보다 우선     |
| `--theme`, `-t`                   | `terrain`                                                 |
| `--title`                         | 기본값 `@username`                                        |
| `--output`, `-o`                  | 기본값 현재 폴더                                          |
| `--year`, `-y`                    | 달력 연도. 생략하면 최근 52주                             |
| `--years`                         | 쉼표로 구분한 서로 다른 연도 2개부터 5개. `--year`와 충돌 |
| `--preset`                        | `nature`(밀도 2), `balanced`(5), `civilization`(9)        |
| `--density`                       | 정수 1부터 10                                             |
| `--hemisphere`                    | `north` / `south`                                         |
| `--config`                        | 설정 JSON 경로                                            |
| `--input`                         | 스냅샷/아카이브 JSON 경로. 네트워크 없음                  |
| `--write-snapshot [path]`         | 선택 경로에 스냅샷 작성. 기본 꺼짐                        |
| `--motion`                        | `full` / `subtle` / `off`                                 |
| `--layout`                        | `banner`(840×240) / `card`(420×360)                       |
| `--style`, `--village-style`      | `classic` / `korean`                                      |
| `--art-style`                     | `miniature` / `pixel`. 문화와 독립적인 그림체, 기본 `miniature` |
| `--normalization`                 | `relative` / `fixed` / 아카이브 전용 `shared`             |
| `--max-count`                     | 양의 유한 최대값. `fixed`에 필수                          |
| `--layout-seed`                   | 선택적 결정론적 시드 덮어쓰기                             |
| `--format`                        | `svg` / `png` / `both`. 기본 `svg`                        |
| `--scale`                         | PNG 배율 정수 1부터 4. 기본 2                             |
| `--help`, `-h`; `--version`, `-V` | 도움말과 버전 출력                                        |

이 체크아웃의 플래그는 `npx --package=maeul-in-the-sky@2.0.0 maeul-sky --help`, 로컬 서비스는 `npx --package=maeul-in-the-sky@2.0.0 maeul-sky preview --help`에서 확인하세요. 기본값은 `terrain`, `balanced`, 밀도 `5`, `north`, `classic`, `full`, `banner`, 상대 P90, 최근 52주이며 그림체는 `miniature`입니다. 우선순위는 명시한 CLI/Action/UI 값 → 불러온 설정 → 선택한 프리셋 기본값 → 라이브러리 기본값입니다. 단일 렌더에서 `--config`는 스냅샷 설정보다 우선하며 두 설정을 필드별로 합치지 않습니다. 명시한 프리셋만으로 저장된 밀도를 바꾸지는 않습니다. 형식과 PNG 배율은 저장되는 렌더 설정이 아닙니다.

기본 실행은 여전히 `maeul-in-the-sky-{dark,light}.svg` 두 개만 씁니다. PNG와 스냅샷은 요청했을 때만 추가됩니다. `--format png`에서는 SVG 경로 결과가 빈 문자열입니다.

### 내 계정 로컬 미리보기

```bash
GITHUB_TOKEN="$(gh auth token)" npx --package=maeul-in-the-sky@2.0.0 maeul-sky preview --port 4318
```

`http://127.0.0.1:4318/`을 열고 **Fetch contributions**를 선택하세요. 서비스는 루프백에만 바인딩하고 서버 환경의 토큰만 읽습니다. 브라우저 토큰 입력란은 없으며 링크, JSON, 폼에 토큰을 넣으면 안 됩니다. 공개 정적 데모는 JSON만 불러오며 localhost에 접속하지 않습니다. 로컬 프로세스는 계정/연도 응답을 5분 동안 최대 32개 캐시합니다.

## 저장 데이터, 비교, 개인정보

설정(`maeul-settings`), 스냅샷(`maeul-snapshot`), 아카이브(`maeul-archive`)는 `schemaVersion: 1`입니다. 파서는 통계를 다시 계산하고, 지원하지 않는 버전, 중복/잘못된 날짜, 잘못된 수치/옵션을 거부합니다. 가져오기는 2 MiB, 전체 20,000일, 스냅샷 20개로 제한됩니다.

문서 형식 버전은 1을 유지합니다. 문화는 `style: classic | korean`, 그림체는 `artStyle: miniature | pixel`로 저장하며, `artStyle`이 없는 이전 설정은 `miniature`로 읽습니다. 두 선택 모두 설정·스냅샷 가져오기, 공유 링크, 아카이브 생성에 유지됩니다.

한 계정의 2개부터 5개 연도를 비교할 수 있습니다. 기본 공유 스케일은 선택한 스냅샷의 양의 수치를 합쳐 P90을 구하고, 그 최대값을 고정 정규화로 아카이브에 저장합니다. 같은 수치는 같은 레벨과 높이를 가집니다. 명시한 고정 최대값이 우선합니다. CLI 아카이브에는 연도별 이미지/스냅샷, `archive.json`, 세로로 쌓은 다크/라이트 비교 SVG가 들어갑니다.

설정 링크에는 사용자명/제목 등 설정만 있고 수치, 토큰, 스냅샷 본문은 없습니다. 스냅샷과 아카이브에는 토큰으로 볼 수 있었던 일별 날짜와 수치가 있어 비공개 활동 총합을 드러낼 수 있으니 공유 전에 검토하세요. 출처 표시는 암호학적 GitHub 원본 증명이 아닙니다. SVG는 날짜와 수치만 포함하고 저장소명이나 기여 세부 정보, 실행 스크립트, 외부 리소스는 포함하지 않습니다.

## 레이아웃, 모션, 안정성

다크와 라이트는 한 번 준비한 장면을 색칠하므로 지형, 일반 에셋, Wonder의 기하가 일치합니다. 새 장면은 `layoutVersion: 3`를 내보내며 정규화한 사용자명, 선택적 `layoutSeed`, 절대 날짜를 사용합니다. 이전 버전 1·2의 준비된 장면도 렌더링할 수 있습니다. 다시 생성하면 버전 3의 시드로 에셋·지형 생태·Wonder 배치가 바뀝니다. 고정 정규화와 주변 맥락이 같으면 이동한 기간의 내부 겹침 날짜는 지형과 일반 배치를 유지하지만 화면 위치는 바뀝니다. 상대 P90은 높이를 바꿀 수 있고, 이웃과 전역 Wonder 예산은 선택을 바꿀 수 있습니다. 설정, 범위, 배치 버전이 다르면 같은 픽셀을 보장하지 않습니다.

계절은 실제 날짜와 반구를 따릅니다. 봄의 꽃과 새잎, 여름의 풍성한 녹음, 가을의 단풍과 수확물, 겨울의 눈과 앙상한 가지를 실루엣과 재질 색상으로 구분합니다. 한국형은 기존 `hanok`, `pavilion`, `stoneWall`, `onggi`에 `choga`, `jangseung`, `sotdae`, `riceTerrace`, `koreanWatermill`, `hanokGate`, `kimchiGarden`, `stoneBridge`, `hanokEstate`를 더합니다. 높은 단계의 일반 보상은 풍성한 자연 경관과 드문 한국 시골 건축을 섞으며, 조건에 맞는 이웃 건물 사이에는 길이 생깁니다. 기여 수와 Wonder 조건은 바뀌지 않습니다.

자연 경관으로 삼나무 숲, 고목, 야생화 초원, 대나무 덤불, 연꽃 연못, 갈대 습지, 고산 바위, 버드나무 연못을 추가했습니다. 각각 실제 형태가 다른 변형 3개를 제공하며, 건축물과 배는 드문 포인트로 배치합니다. 문화별 변환 후 중복 후보를 제거하고 절대 날짜 기반 공간 분산으로 같은 실루엣의 인접 반복을 줄입니다.

꾸준함 보상은 해당 날짜를 포함한 최근 28일의 실제 활동일이 5·12·20일일 때 계절 이펙트가 풍성해집니다. 제공된 날짜만 계산하고 관측일 수도 별도로 기록합니다. 최대 10개 효과 군집을 활동일에 배치하며 봄 꽃잎, 여름 반딧불, 가을 낙엽, 겨울 서리를 사용합니다. 연속 출석이나 추가 기여 수를 의미하지 않습니다. 일별 0/1/5/10/25/50 단계는 그대로이며, 모션 끔·은은함·축소 설정에서도 정적인 보상 형태가 남습니다.

`artStyle`은 선택된 ID·날짜·기여 수·보상 단계를 유지하면서 그림체를 바꿉니다. 기본 `miniature`는 세밀한 SVG 원화이고, `pixel`은 **논리적 0.5 SVG 단위 격자**에 컴파일한 실제 SVG 경로입니다. 제한된 팔레트의 색상은 계절과 다크/라이트에 맞춰 바뀌며, 픽셀 에셋을 그릴 때 런타임 Resvg나 외부 비트맵이 필요하지 않습니다. 격자는 에셋 도형의 기준입니다. 장면 맞춤 배율이나 외부의 비정수 확대·축소에서는 물리 화면 픽셀 정렬과 또렷한 경계까지 보장하지 않습니다.

배너와 카드 모두 제공된 전체 기간을 유지합니다. `full`은 주변 효과 전체, `subtle`은 느린 구름과 잔잔한 물만, `off`는 CSS 애니메이션/키프레임과 SMIL을 생략합니다. 모션 축소 설정은 완전한 정적 대체 화면을 선택합니다. PNG는 항상 `motion: off`, 불투명 배경, 배율 1부터 4(기본 2)로 다시 렌더링한 정적 이미지입니다.

## JavaScript 및 브라우저 API

Node와 브라우저 API가 포함된 정식 패키지를 설치하세요.

```bash
npm install maeul-in-the-sky@2.0.0
```

패키지를 설치한 프로젝트에 `.mjs` 파일을 만들어 아래 예제를 실행해 주세요.

```js
import { generateArchive, generateTerrain } from 'maeul-in-the-sky';

const result = await generateTerrain({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  preset: 'balanced',
  layout: 'card',
  style: 'korean',
  artStyle: 'pixel',
  motion: 'off',
  format: 'both',
  writeSnapshot: true,
  outputDir: './terrain',
});

console.log(result.darkPath, result.lightPath, result.darkPngPath, result.snapshotPath);

await generateArchive({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  years: [2024, 2025],
  normalization: 'shared',
  outputDir: './archive',
});
```

소스 빌드는 Node용 `dist/lib.js`(ESM)와 `dist/lib.cjs`(CommonJS), 브라우저용 `dist/browser.js`(ESM)를 만듭니다. 브라우저 진입점은 Node 파일 시스템, 토큰 클라이언트, WASM 래스터라이저 없이 `renderTerrain`, `prepareTerrainScene`, `renderTerrainScene`, 파서, 설정, 스냅샷/아카이브 도우미와 카탈로그를 내보냅니다. 브라우저와 Node 입력 모두 `style`과 `villageStyle`을 받으며, 두 값이 다르면 오류를 반환합니다. 문화 설정은 `style`, 그림체는 `artStyle`로 직렬화됩니다. 같은 문서에 장면을 여러 번 인라인할 때는 서로 다른 namespace를 사용하세요.

사용자 정의 Theme의 아카이브 비교는 SVG와 CSS를 로컬에서 해석하며, 네임스페이스 접두사와 문자 참조를 지원합니다. 각 행을 삽입할 때 XML 선언과 DOCTYPE은 제거합니다. 외부 DTD와 사용자 정의 엔티티는 불러오지 않으며, 잘못된 XML이나 지원하지 않는 참조는 아카이브 파일을 쓰기 전에 `InputValidationError`를 반환합니다. 참조에 접두사를 붙인 뒤 값이 충돌해 CSS 속성 선택자의 원래 적용 대상을 구분할 수 없는 경우에도 쓰기 전에 같은 오류로 거부합니다.

로컬 스타일시트의 선택자는 해당 연도 행에만 적용해, 일반 선택자도 자기 행의 색상 참조를 유지합니다. 이 기능은 SVG 합성 기능이며 CSS 전체를 격리하지는 않습니다. 가져온 스타일시트, 키프레임·글꼴 등의 전역 이름, 외부 문서 구조에 의존하는 선택자는 기존 CSS 의미를 따릅니다. 사용자 정의 테마는 이런 이름을 고유하게 정하고 자체적으로 완결된 스타일을 사용해 주세요.

## 카탈로그와 재현 가능한 미리보기

[인터랙티브 카탈로그](https://t1seo.github.io/maeul-in-the-sky/catalog/)는 미니어처/픽셀 선택과 한국형 13개 전체를 제공합니다. 일반 에셋 **210개 = 클래식 197개 + 한국형 13개**, Wonder **30개 = Rare 14개 + Epic 10개 + Legendary 6개**를 따로 집계하며 합계는 **240개**입니다. 일반 에셋 중 68개는 계절형, 142개는 전 계절형입니다. 변형·그림체·배치 인스턴스는 ID 수를 늘리지 않습니다. [온라인 Wonder 도감](https://t1seo.github.io/maeul-in-the-sky/#wonders)에서는 실제 발견 상태와 조건을 볼 수 있습니다.

원화를 수정한 뒤 픽셀 에셋을 다시 생성하고, 테스트와 빌드 전에 `--check`로 원화와 생성물의 일치 여부를 확인해 주세요.

```bash
npx tsx scripts/pixel/generate.ts
npx tsx scripts/pixel/generate.ts --check
npx tsx scripts/generate-preview.ts
npx tsx scripts/generate-demo.ts
npx tsx scripts/generate-examples.ts
npx tsx scripts/generate-cases.ts
npx tsx scripts/generate-catalog.ts docs/demo/catalog
```

생성 스크립트는 고정 시드와 UTC 날짜를 사용합니다. 이전 SVG 최적화 실험에서는 캡처한 파일 6개의 gzip 크기가 16.54~17.06% 줄었고 작은 서브픽셀 차이가 있었습니다. 이 수치는 이번 원화 개편 전의 기록이며 새 에셋의 크기·렌더링 속도·FPS 측정값이 아닙니다. 당시 조건과 한계는 [측정된 렌더링 및 SVG 크기](demo/performance.md)를 확인해 주세요.

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

## 후원

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=taewonseo&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=a0522d)](https://www.buymeacoffee.com/taewonseo)

## 라이선스

[MIT](../LICENSE) © [t1seo](https://github.com/t1seo)
