# 픽셀 자산 생성 및 검증

원화가 확정된 뒤 저장소 루트에서 다음 명령을 실행하시면 됩니다.

```sh
npx tsx scripts/pixel/generate.ts
npx tsx scripts/pixel/generate.ts --check
```

작업 중인 원화에는 `--provisional`을 사용하시면 됩니다. 임시 생성물은 정상 렌더링되지만 `--check`가 완료된 결과로 인정하지 않습니다. 일반 자산은 기존 0·1·2 변형을, Wonders는 원래의 단일 변형을 수집합니다. 새로운 ID도 기존 카탈로그와 렌더러에 등록되면 함께 생성됩니다. 같은 ID 안에서 완전히 같은 변형 데이터만 공유하며 변형 번호는 유지됩니다.

생성 결과는 `src/themes/terrain/pixel/generated/`의 자산별 TypeScript 모듈과 `manifest.json`입니다. 직접 수정하지 말고 원화를 변경한 뒤 재생성해 주세요. 검증 명령은 원화·팔레트·컴파일러·잠금 파일의 SHA-256, 실제 렌더링 내용, 생성된 각 모듈의 해시를 대조합니다. 생성 도중 원화가 바뀌면 결과를 쓰기 전에 중단합니다.

## 변환 방식

- 기존 Resvg 개발 의존성으로 원화를 **0.5 SVG 단위**의 동일한 지역 좌표 격자에 샘플링합니다. 배치 좌표, 원점, 변형 번호와 카탈로그 ID는 변경하지 않습니다.
- premultiplied RGBA를 원래 RGB로 복원하고, alpha 32/255 미만은 비웁니다. 남은 픽셀은 불투명 도형으로 출력합니다. 작은 반딧불도 공통 기준에서 보존되도록 실제 래스터 회귀 검증을 거쳤습니다.
- 검정/흰색 역할 탐침으로 원화에서 사용한 팔레트 역할과 선형 명암 혼합을 추적합니다. 밝은 모드·어두운 모드·진단 팔레트에서 예측 색을 검증하므로 지원하지 않는 비선형 색 변환이나 팔레트에 따른 형상 변경은 오류가 됩니다.
- 세 팔레트의 색상 서명을 함께 비교해 최대 16개의 역할·명암·고유색으로 배정합니다. 원화에 작성된 고유색은 정규화한 RGB 리터럴로 보존하며, 동적인 색은 역할 또는 역할 가중치로 저장합니다. 가장 적게 쓰인 색이 상한을 넘으면 남겨진 의미 있는 색 가운데 가까운 것으로 합칩니다.
- 가로로 이어진 같은 색을 병합하고, 너비가 같은 연속 행은 사각형으로 합칩니다. 색상별 `M/h/v/z` 경로로 저장하므로 픽셀마다 DOM 노드를 만들지 않습니다.

`src/themes/terrain/pixel/`의 인코더와 렌더러는 동기식 순수 TypeScript입니다. Node·Resvg·파일 읽기·외부 이미지·폰트·Canvas·WASM은 런타임 경로에 들어가지 않습니다. `scripts/pixel/`의 오프라인 실행 도구와 검증 도구에만 Node 및 개발 의존성이 필요합니다.

## 공개 연결부

기존 함수의 마지막에 선택적인 `artStyle: 'miniature' | 'pixel'` 인자를 추가했습니다. 기본값은 `miniature`입니다.

- `renderCatalogAsset(type, colors, variant?, artStyle?)`
- `renderCatalogEpic(type, colors, artStyle?)`
- `renderAssetPlacements(placed, palettes, artStyle?)`
- `renderEpicBuildings(placed, palettes, artStyle?)`
- `renderTerrainAssets(...기존 인자, artStyle?)`
- `renderSeasonalTerrainAssets(...기존 인자, artStyle?)`
- `renderDepthLayer(scene, cells, palettes, artStyle = scene.settings.artStyle)`

픽셀 자산에는 움직임과 Wonders의 부드러운 후광을 넣지 않습니다. 스타일 전환은 장면 데이터나 기여 수, 0일의 배치 규칙을 바꾸지 않습니다. 바닥, 하늘, 연결 길, 보상 장식은 각 담당 렌더러의 표현을 따릅니다.

## 시각 검증과 한계

```sh
npx tsx scripts/pixel/evidence.ts
npx tsx scripts/pixel/browser-evidence.ts
npx vitest run tests/themes/pixel-art.test.ts tests/themes/pixel-art-compiler.test.ts tests/themes/pixel-art-fingerprint.test.ts --project unit
```

`.orca/asset-overhaul/lanes/pixel/`에 실제 Resvg PNG, SVG 비교표, 계절별 비교표, Chromium 화면, 자산별 바이트·gzip·노드·사각형 수가 기록됩니다. 브라우저 검증에는 저장소의 Playwright Chromium 설치가 필요합니다.

0.5는 자산의 지역 SVG 단위이며 최종 화면의 CSS 픽셀을 의미하지 않습니다. SVG 1단위당 장치 픽셀 2개 이상, 가능하면 짝수 정수 배율일 때 격자가 가장 일정하게 보입니다. 큰 연간 장면을 작은 README 카드에 맞추면 여러 논리 픽셀이 합쳐지고, 소수 배율에서는 셀 너비가 달라질 수 있습니다. `crispEdges`는 이때 경계 처리를 돕지만 실제 반 단위 경로가 픽셀 형상을 만듭니다.

작은 지붕 선, 꽃잎, 반투명 음영은 양자화 과정에서 단순해집니다. 특히 alpha 기준을 넘은 그림자는 불투명해지므로 원화와 농도가 다를 수 있습니다. 같은 색의 경로를 묶어 노드 수를 줄여도 경계가 복잡한 건물은 원화보다 SVG 바이트가 늘어날 수 있습니다. 비교표의 측정값을 확인해 주세요.
