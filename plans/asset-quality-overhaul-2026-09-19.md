# 에셋 품질·사계절·성장 보상 전면 개편 실행 계획

## 목표와 승인 범위

2026-09-19 사용자가 정한 우선순위는 기존 에셋 전수의 확실한 품질 향상, 한국 시골·픽셀 미니어처 콘텐츠 다양화, 기여도가 높은 날짜의 확실한 시각적 보상입니다. 사계절을 작은 화면에서도 뚜렷하게 구별해야 합니다. 사용자는 구현·검증·커밋·푸시·메인 병합·배포와 자신의 GitHub 적용 확인까지 승인했습니다.

- 기준 커밋: `2b608bcfda7746723dd1af30c554e3c944afd32b`.
- 작업 브랜치: `feat/asset-quality-seasons`.
- 기존 변경을 공유해야 하므로 현재 워크트리에 파일 소유권을 나눈 작업자를 배치합니다. 별도 checkout은 만들지 않습니다.
- Orca Run: `run_d21f5910ac79`; 실시간 task/dispatch 정보는 `.orca/asset-overhaul/state.json`에 기록합니다.
- 규모: XL. 경로: 기준 증거 → 원화/설정/성장 병렬 구현 → 픽셀 최종 생성·통합 → 전수 QA·독립 검토 → PR·병합·배포·프로필 확인.

## 조사와 Metis 검토를 반영한 결정

근거는 [기존 리서치](asset-redesign-research-2026-09-19.ko.md), [추가 리서치](asset-quality-followup-research-2026-09-19.ko.md), `.orca/asset-overhaul/metis.md`입니다.

1. 기존 일반 193종과 Wonder 30종, 합계 223종의 ID를 보존하고 모두 개별적으로 개선합니다. 전역 필터·색 교체만으로 완료 처리하지 않습니다.
2. 기본 원화는 포근한 미니어처 SVG입니다. [공통 제작 규칙](asset-art-direction-2026-09-19.md)을 적용합니다. 장면의 16×7 투영·기존 접지점·가능한 기존 bounds를 유지합니다.
3. 문화 축 `style: classic | korean`과 표현 축 `artStyle: miniature | pixel`을 분리합니다. 옛 설정은 miniature로 읽습니다. envelope v1은 유지하고 배치 알고리즘 버전은 변경 사실을 메타데이터에 명시합니다.
4. 높이 정규화의 기존 relative/fixed 동작은 유지합니다. Metis의 새 fixed 기본값 권고는 채택하지 않습니다. 대신 별도 일별 보상 단계를 원본 count로 계산하여 척도나 다른 날짜의 수에 영향을 받지 않도록 합니다. 기존 공유 링크·설정의 의미를 지키면서 P90 포화 이후의 차이도 표시할 수 있습니다.
5. 보상 단계는 0 / 1–4 / 5–9 / 10–24 / 25–49 / 50+로 고정합니다. 제품의 시각 규칙이며 GitHub가 정한 등급이나 코드 품질 점수가 아닙니다. 기여 0은 보상 0입니다. 증가의 보장은 단계와 보장 보상에 대한 것이며 모든 장식·Wonder가 영구히 늘어난다는 의미가 아닙니다.
6. 양수 날짜의 주 에셋을 보장합니다. density·biome·계절·무작위 추첨이 보상 단계를 낮추거나 높은 단계의 주 결과물을 작은 소품으로 바꾸지 못하게 합니다. 낮은 단계에는 자연물, 높은 단계에는 문화/지형에 맞는 발달한 실루엣을 사용합니다. 장식 추첨은 독립 난수 채널입니다.
7. Wonder는 최대 3개·간격·통계 기준을 지키는 추가 발견입니다. 상위 등급 추첨 실패가 이미 성공할 수 있었던 하위 등급을 무조건 없애는 문제를 수정합니다. Wonder가 차지한 날에도 일별 보상 표시는 남기고, 기본 에셋과 무작정 겹쳐 그리지 않습니다.
8. 한국 시골은 기존 4종 개선 외에 `choga`, `jangseung`, `sotdae`, `riceTerrace`, `koreanWatermill`, `hanokGate`, `kimchiGarden`, `stoneBridge`, `hanokEstate` 9종을 추가합니다. 상위 한국풍 결과물은 서양 성당/성으로 치환되지 않게 문화별 계층을 만듭니다. 목표 카탈로그는 일반 202 + Wonder 30 = 232종입니다.
9. 픽셀 에셋은 실제 격자 도형과 제한된 팔레트로 만듭니다. 새 원화를 제작 단계에서 논리 격자에 샘플링·색 역할별 path로 컴파일하는 방식을 사용합니다. 런타임 rasterizer·외부 이미지 의존성이나 crispEdges만 씌운 대체품은 금지합니다. 기존 배치와 날짜 의미는 유지하며 외부 비정수 축소에서 물리 픽셀 정렬까지 보장하지 않습니다.
10. 사계절은 팔레트와 실루엣을 함께 검토합니다. 꽃/새잎, 풍성한 녹음/여름 소품, 단풍/열매/수확물, 눈/앙상한 가지가 구분되어야 합니다. 날짜·남북반구에 맞는 기존 계절 의미를 유지합니다.
11. 기존 Node/npm/tsx/Vitest/ESLint/Prettier를 유지합니다. 새 엔진·유료 도구·원격 에셋 의존성은 추가하지 않습니다.

## 검증 전략

새 동작은 실패하는 테스트부터 작성합니다. 아트는 모든 ID의 고정 팔레트 전후 이미지와 구조 차이를 확인합니다. 해시 차이는 커버리지 증거이고, 확대/실제 크기 직접 관찰이 품질 증거입니다. 과거 그림 보존 테스트는 전후 검토 후 새 기준으로 갱신하며 단순 삭제하지 않습니다.

검증 명령은 기존 `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:artifact`, `npm run test:browser`, `npm run benchmark`를 사용합니다. 실행 중인 작업자가 파일을 바꾸는 동안은 해당 파일의 최종 검증이라고 주장하지 않습니다. 전체 검증과 카탈로그 재생성은 통합 담당 한 명이 수행합니다.

기존 성능 예산을 먼저 비교합니다. 새로운 아트의 비용이 기존 +5% 크기·요소 예산을 넘으면 실제 원인과 비용을 기록하고 단순화합니다. 향상된 품질 때문에 최종 기준을 새로 설정하는 경우에도 변경 전후 수치를 함께 공개하며 이전 기준을 통과했다고 주장하지 않습니다. 런타임 속도 향상은 측정 없이 주장하지 않습니다.

## 작업과 소유권

각 작업자는 맡은 파일 외의 변경을 되돌리지 않습니다. 작업 증거는 `.orca/asset-overhaul/lanes/<name>/`에 둡니다. 전체 task spec과 dispatch는 Orca에 기록되어 있습니다.

| 작업 | 소유 범위 | 선행 조건 | 완료 기준과 QA |
| --- | --- | --- | --- |
| R1 추가 조사 | 추가 리서치 Markdown | 없음 | 공식/제작자 자료 인용, 기여와 커밋 구별, 실행 가능한 개선안. 사실·제안·미측정을 구별합니다. |
| R2 Metis | `.orca/asset-overhaul/metis.md` | 없음 | 설정/성장/도감/버전/테스트 경계와 위험 검토. 모호한 단조성 보장과 구버전 입력 사례를 포함합니다. |
| R3 기준 보존 | `.orca/asset-overhaul/baseline/**` | 원화 변경 전 | 고정 HEAD 사본, 223종 지문·카탈로그·mixed/full 출력과 비용. 라이브 파일 변경 중에도 사본으로 재현합니다. |
| F1 설정 계약 | core settings/types, generate, CLI/Action, archive 전달 | R2 검토 | artStyle 기본값·우선순위·구버전 import·왕복·잘못된 값 테스트. artStyle만 지정한 CLI도 전달되고 archive도 보존됩니다. |
| A1 자연물 | grassland-pine, grassland-rabbit, forest-willow renderer | 기준 사본 | 모든 함수/변형 개선, 담당 bounds·정적 표현 검증, 전후 이미지. 낮은 대비의 dark도 확인합니다. |
| A2 물·해안 | water-whale, water-turtle, shore-wetland-rock, biome-blend-reeds | 기준 사본 | 모든 해양/해안 함수 개선. 물 위 접지·정지 상태·모션 범위와 bounds 확인. |
| A3 농장 | farm-* renderer 6개 | 기준 사본 | 동물·농작물·농장 구조물 전수 개선. 작은 크기 종 구별, 변형 bounds 확인. |
| A4 일반 건축·소품 | village-tent, village-shrine, town-city-market, town-city-manor, cross-level-cart | 기준 사본 | 모든 건물/소품 개선. 집·헛간·상위 건물 실루엣 구별, 모션 off에서 완성된 형태. |
| A5 봄 | seasonal-spring-* 4개 | 기준 사본 | 꽃/새잎의 형태와 밝기, 모든 함수/변형. 여름과 구별되고 dark에서 꽃이 읽힙니다. |
| A6 겨울 | seasonal-winter-* 4개 | 기준 사본 | 입체적인 눈 쌓임·앙상한 가지, 모든 함수/변형. 배경과 흰 눈의 대비 및 bounds 확인. |
| A7 여름·가을 | seasonal-summer-* 2개, seasonal-autumn-* 3개 | 기준 사본 | 여름 소품과 가을 단풍/수확 형태 전수 개선. 봄 꽃/겨울 눈과 명확히 구별됩니다. |
| A8 Wonders | epics/renderers/* 5개 | 기준 사본 | 30개 고유 랜드마크/자연/판타지 구조 개선. ID 정체성·static motion·bounds·확대와 실제 크기 검토. |
| C1 한국 시골 | korean-village + 새 rural renderer, registry/catalog/types/classification/style-pool/새 bounds | R2 | 기존 4종 개선+새 9종, 유일 ID·실제 선택 도달성·문화별 상위 계층. classic 모드에 새 한국형이 섞이지 않는 테스트. |
| G1 기여 보상 | assets selection/progression, scene prepare/metadata/types, epics selection, 새 reward renderer, day-details | R2 | count 0→1→5→10→25→50→100에서 0→1→2→3→4→5→5. 모든 density/문화/척도, isolated peak, zero/누락, 순서 변경과 Wonder 공존 검증. |
| P1 픽셀 파이프라인 | scripts/pixel/**, terrain/pixel/**, art rendering facades/depth/options | F1, 마지막 생성은 A*/C1 이후 | 전 카탈로그와 신규 ID의 실제 격자 도형, 역할별 색, dark/light/계절 보존, 원화 변경 drift 검사, browser-safe 동기 렌더. |
| U1 사용 흐름 | demo 설정/URL/폼/workflow, HTML/CSS, 도움말/README | F1/G1 계약 | 그림체와 문화 선택, JSON/공유 URL/workflow 왕복, 날짜별 보상 설명, 사계절 안내, 모바일 키보드 조작과 다운로드. |
| I1 통합·시각 QA | bounds/goldens/catalog scripts/generated assets/palette/scene 연결/QA 도구 | A*/C1/G1/P1/U1 | 기존 223종 전수 변경 대장+새 9종, 잘림 없음, 실제 크기 품질, 모든 조합의 유효 SVG, 비용 비교. |
| V1 최종 검토 | 독립 리뷰 보고서 5개 | I1 및 전체 QA | 목표·코드·보안·직접 사용·변경 맥락을 분리 검토. 실패하면 담당자 수정 후 해당 검증 재수행. |
| D1 배포 | Git feature branch/PR/main/Pages 및 사용자 프로필 적용 | V1 | CI 성공 후 병합, 배포 URL과 실제 SVG/PNG 확인. 프로필 연결·워크플로를 확인하고 필요한 범위만 갱신합니다. |

## 구체적인 통합 시나리오

- **전수 아트:** 기준 223개 ID가 모두 존재하고, 각 ID의 원화가 원본과 실질적으로 다릅니다. 새 9종은 별도 집계합니다. 밝은/어두운 모드, 3변형, 두 표현의 비어 있지 않은 유효 SVG와 실제 alpha bounds를 검사합니다.
- **높은 기여:** 같은 날짜의 count만 0/1/5/10/25/50/100으로 바꾸고 나머지는 고정합니다. stage는 비감소하고 각 경계에서 정적 출력의 형태/구성이 달라야 합니다. 주변을 전부 0으로 만들거나 density를 1로 내려도 고기여 보상이 사라지지 않습니다.
- **정규화:** fixed maxCount 20에서 count 20/25/50/100은 높이가 포화되어도 원본 수와 보상 차이를 보존합니다. relative에서 다른 날짜만 크게 올려도 기준 날짜의 rewardTier는 유지됩니다.
- **데이터 정직성:** 빈 기간, 모두 0, 누락 날짜, 윤년, count 0/level 4 불일치 입력. 가짜 활동·주 보상·Wonder 생성 없이 합계·연속일·날짜가 유지됩니다.
- **문화·계절:** classic/korean × miniature/pixel × north/south. 한국형 상위 날에도 한옥/시골 계열이 나타나며 봄·여름·가을·겨울 실루엣을 전후 이미지로 확인합니다.
- **표현 독립:** artStyle·dark/light·motion을 바꾸어도 날짜별 ID·count·보상 단계가 같습니다. 픽셀 모드의 비정수 축소 한계를 기록하고 화면 밖으로 잘리지 않습니다.
- **실제 사용:** 데모에서 설정 선택 → 날짜 탐색 → 설정 다운로드/재가져오기 → 공유 URL 재방문 → SVG/PNG 다운로드. 390px와 데스크톱에서 수행하고 console/page errors를 확인합니다.
- **발행:** feature PR과 메인 CI, Pages deployment SHA 일치, 배포 페이지와 사용자 프로필이 참조하는 실제 이미지/워크플로 확인. 로컬 코드 성공만으로 배포 완료 처리하지 않습니다.

## 체크포인트

- [x] 사용자 목표·발행 승인·브랜치 확정
- [x] 추가 조사 및 Metis 내용 검토
- [x] 고정 기준 소스 보존
- [x] artStyle 핵심 설정의 RED → GREEN 64개 관련 테스트
- [x] 전수 원화·사계절·한국 시골 개선
- [x] 기여 보상과 픽셀 파이프라인
- [x] 사용 흐름·통합·전후 자료
- [ ] 전체 테스트·실제 브라우저·성능·독립 검토
- [ ] 커밋·푸시·PR·메인 병합
- [ ] Pages 배포와 사용자 GitHub 실제 적용 확인

완료 보고는 실제 적용된 범위와 테스트 수, 비용 변화, 배포 주소, 프로필 링크를 포함합니다. 실패하거나 미완료인 항목을 완료로 표시하지 않습니다.
