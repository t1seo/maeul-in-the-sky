# Activity analytics: chart and contribution-data decision

확인일: 2026-09-19. 범위: Maeul 분석 메뉴의 차트 선택과 GitHub 기여 데이터 확장입니다. 아래 구현안은 권고이며, 운영 코드·HTML·의존성은 변경하지 않았습니다.

## 권고

기존 TypeScript/SVG로 `Activity` 추이와 월별 `Commit contributions`, `PRs opened` 막대 차트를 구현하는 편을 권합니다. shadcn/ui와 Tremor의 카드·축·툴팁 구성을 참고하되, 현재 앱에 React를 추가할 필요는 없습니다. 새로 GitHub 데이터를 가져올 때 기존 캘린더 쿼리에 기간 요약과 최대 13개의 월별 별칭을 함께 요청하면 실제 분류별 추이를 표시할 수 있습니다. 옛 snapshot과 sample에는 분류별 정보를 만들지 않고 `Not available in this snapshot`을 표시해야 합니다.

## 현재 저장소에서 확인한 연결 지점

| 근거 | 현재 동작과 구현 시 의미 |
| --- | --- |
| [package.json](../package.json), [world session](../src/world/app/session.ts) | React 의존성이 없으며 DOM 기반 컨트롤과 별도 SVG/Three 렌더러를 사용합니다. 분석 UI에도 React 경계가 필요하지 않습니다. |
| [queries.ts](../src/api/queries.ts), [response.ts](../src/api/response.ts) | 응답에는 `contributionsCollection.contributionCalendar`만 남깁니다. scalar를 쿼리에 추가하기만 해서는 브라우저까지 전달되지 않습니다. |
| [client.ts](../src/api/client.ts) | 고정 연도 또는 직전 1년 범위를 요청합니다. 주석의 “52 weeks”와 달리 rolling 범위는 `setFullYear`로 계산합니다. 분석 작업에서 기존 범위를 조용히 바꾸지 않아야 합니다. |
| [snapshot types](../src/core/snapshot-types.ts), [schema](../src/core/settings/snapshot-schema.ts), [parse/create](../src/core/settings/parse.ts), [serialize](../src/core/settings/serialize.ts) | snapshot 변환은 지정된 필드로 객체를 다시 만듭니다. 새 `activity`를 타입에만 추가하면 유실되므로 모든 변환 경로에서 명시적으로 보존해야 합니다. |
| [world document](../src/world/data/document.ts) | 세계 파일은 `sourceSnapshot`을 다시 파싱합니다. 통계를 이 snapshot에 보존하면 세계 파일·재저장에도 같은 경로를 이용할 수 있습니다. |
| [preview server](../src/preview/server.ts), [local client](../src/demo/local-client.ts) | GitHub 토큰은 로컬 서버 환경에 있으며 브라우저는 snapshot을 받습니다. 이 경계를 유지해야 합니다. |
| [old API fixture](../tests/api/response-fixtures.ts), [sample](../src/demo/sample.ts) | 기존 fixture에는 분류별 scalar가 없고 sample은 생성한 일별 총기여입니다. 기존 데이터만으로 커밋·PR을 복원할 수 없습니다. |

## 차트 선택

| 후보 | 공식 문서의 근거 | 이 저장소에 대한 판단 |
| --- | --- | --- |
| shadcn/ui Chart | Recharts v3 구성 요소, 별도 chart 설정, CSS 변수, tooltip/legend, `accessibilityLayer`를 제공합니다. [Chart](https://ui.shadcn.com/docs/components/base/chart) | 시각 참고에 적합합니다. Recharts의 브라우저 설치 예제도 React와 ReactDOM을 요구하므로 vanilla 위젯으로 바로 붙이는 구성은 아닙니다. [Recharts installation](https://recharts.github.io/en-US/guide/installation/) |
| tweakcn | shadcn/ui의 색상·타이포그래피·간격을 편집하며, Chart 1–5 색상과 카드·대시보드 미리보기를 제공합니다. [Theme editor](https://tweakcn.com/editor/theme), [Dashboard preview](https://tweakcn.com/editor/theme?p=dashboard) | 별도 차트 엔진이 아닌 시각 테마 참고 도구입니다. 카드 배경·테두리·보조 텍스트와 차트 색상을 일관되게 맞추는 패턴을 적용하되 기존 앱의 종이색·녹색을 유지합니다. |
| Tremor Raw | 현재 설치 문서는 React 18.2+와 Tailwind CSS 4+를 요구합니다. [Installation](https://www.tremor.so/docs/getting-started/installation) | 작은 녹색 대시보드의 시각 참고에 적합합니다. Area/Bar 구현도 React/Recharts 기반입니다. [Area chart](https://www.tremor.so/docs/visualizations/area-chart), [Bar chart](https://www.tremor.so/docs/visualizations/bar-chart) |
| 직접 SVG | SVG는 HTML 안에 삽입할 수 있고 `title`·`desc`와 ARIA를 통한 이름·설명을 지원합니다. [SVG 2](https://www.w3.org/TR/SVG2/struct.html#DescriptionAndTitleElements) | **권장합니다.** 12~13개 월 막대와 52~54개 주 구간에는 단순한 좌표 계산이면 충분하다는 설계 판단입니다. 새 차트 의존성이 없습니다. |
| Observable Plot | 일반 JavaScript에서 생성한 plot을 DOM에 append할 수 있으며 TypeScript 선언도 제공합니다. React는 별도 통합 방식입니다. [Getting started](https://observablehq.com/plot/getting-started) | 차트 종류가 늘어날 때 검토할 SVG 대안입니다. 이번 범위에는 추가 라이브러리의 이점이 작습니다. |
| Chart.js | 일반 JavaScript와 canvas로 동작합니다. [Usage](https://www.chartjs.org/docs/latest/getting-started/usage.html) 접근 가능한 이름·대체 콘텐츠는 앱이 별도로 제공해야 합니다. [Accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html) | React 없이 가능하지만 현재 SVG 처리와 접근성 구현을 함께 고려하면 우선순위가 낮습니다. |

권장 표현은 기존 [world CSS](../docs/demo/world/styles.css)의 `--paper: #f6f4ec`, `--surface: #fffdf7`, `--ink: #253c3e`, `--green: #526f53`, `--line: #dddfd2`를 재사용하는 것입니다. 이는 새 디자인 시스템 도입이 아닌 현행 스타일 연결 제안입니다.

- `Activity`: 저장된 일별 `count`를 주별 또는 월별로 합친 녹색 선/영역 차트입니다. 작은 범위의 확대 없이 0 기준선과 정수 눈금을 사용합니다.
- `Commit contributions`와 `PRs opened`: 월별 막대 또는 지표 선택 버튼으로 표시합니다. 커밋 수가 큰 경우 PR이 보이지 않는 다중 선보다는 각각 읽을 수 있는 구성이 좋습니다. 이슈·리뷰도 같은 컴포넌트를 재사용할 수 있습니다.
- 툴팁은 정확한 `YYYY-MM`, 수치, 실제 집계 기간을 보여주고 터치·키보드로도 열 수 있어야 합니다. 데이터 표를 함께 제공하고 hover만으로 핵심 값을 전달하지 않습니다.
- 누락된 날짜/월은 빈 구간으로 남기고, 확인된 0과 구별합니다. 현재 진행 중인 월에는 `Partial month`를 표시합니다. 선으로 누락 구간을 연결하지 않는 표현은 Tremor의 `connectNulls: false` 기본값과도 맞습니다. [Area chart](https://www.tremor.so/docs/visualizations/area-chart)
- 네 분류를 100% 전체로 보이는 원형 차트나 “생산성 점수”는 이 데이터 계약에 적합하지 않습니다.

## GitHub 필드의 정확한 의미

아래는 현재 공식 schema 설명을 요약한 것입니다. [ContributionsCollection](https://docs.github.com/en/graphql/reference/users#contributionscollection)

| 필드 | 표시 의미 |
| --- | --- |
| `totalCommitContributions` | 기간 내 GitHub 기여로 귀속된 커밋 수입니다. |
| `totalPullRequestContributions` | 사용자가 연 PR의 기여 수입니다. |
| `totalIssueContributions` | 사용자가 연 이슈의 기여 수입니다. |
| `totalPullRequestReviewContributions` | 사용자가 남긴 PR 리뷰의 기여 수입니다. |
| `startedAt`, `endedAt` | 응답 collection의 시작·종료 시각입니다. |
| `restrictedContributionsCount` | 조회자가 볼 수 없는 기여 수이며, 비공개 기여 수 공개 설정 때만 0보다 클 수 있습니다. |
| `hasAnyRestrictedContributions` | 상세가 숨겨진 비공개 기여가 있는지를 나타냅니다. 역시 공개 설정의 영향을 받습니다. |

PR·이슈 totals의 `excludeFirst`와 `excludePopular` 기본값은 모두 false입니다. `pullRequestReviewContributions` 연결은 PR별 최신 제출 리뷰를 반환하지만, total scalar 문서는 원시 리뷰 이벤트와의 일대일 관계나 기간 간 가산성을 보장하지 않습니다. private/internal 포함 조건에는 `read:user` scope가 명시되어 있습니다. [ContributionsCollection](https://docs.github.com/en/graphql/reference/users#contributionscollection)

기여 커밋은 연결된 이메일, fork가 아닌 저장소, 기본 브랜치/`gh-pages` 및 기여 자격 조건을 따릅니다. 프로필에는 author date가 쓰입니다. PR·이슈도 기여 인정 조건이 있고, 공식 문서는 일부 항목의 표시 제한을 언급하지만 수치 한도는 공개하지 않습니다. 따라서 전체 Git 커밋, 모든 브랜치의 커밋, merged PR 또는 원시 이벤트 총량이라고 표시하면 안 됩니다. 저장소 생성·discussion 등 다른 기여도 있으므로 네 수치의 합을 전체 캘린더라고 가정하지 않아야 합니다. [Profile contributions reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference)

설계상 `restrictedContributionsCount = 0`을 “모든 비공개 작업까지 완전히 조회함”으로 해석하지 않습니다. 비공개 수치를 네 분류에 나눠 더하지 않고, 조회 시 권한에 따라 달라질 수 있는 기여 집계라고 설명합니다. 연간 리뷰 요약을 월별 리뷰 합으로 덮어쓰거나 두 값의 일치를 필수 검증식으로 삼지 않는 편이 안전합니다.

## 날짜·범위·한도

- `from`은 포함 시작, `to`도 포함 종료입니다. 생략 시 `from`은 1년 전, `to`는 현재 또는 지정한 `from`의 1년 뒤가 기본값입니다. 시간대 인자는 없습니다. [User.contributionsCollection](https://docs.github.com/en/graphql/reference/users#user)
- `DateTime`은 ISO 8601 UTC, `Date`는 날짜 문자열입니다. 별도 `PreciseDateTime`만 밀리초 정밀도를 명시합니다. [GitHub scalars](https://docs.github.com/en/graphql/reference/other#datetime)
- 프로필 개요는 UTC를 설명하지만 이벤트 기준은 커밋 timestamp의 시간대, 웹에서 연 PR·이슈의 브라우저 시간대 등으로 구분합니다. 앱은 받은 캘린더 날짜를 보존하고 로컬 시간대 변환으로 날짜를 옮기지 않는 편이 맞습니다. “모든 이벤트가 사용자의 현재 시간대 기준”이라는 설명도 피해야 합니다. [Profile overview](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile), [Event times](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference#how-contribution-event-times-are-calculated)
- **권장 앱 제한:** 기본 collection은 기존의 한 해 범위, 월별 collection은 해당 월과 요청 범위의 교집합, 월별 별칭은 최대 13개로 제한합니다. 고정 연도는 12개이고 rolling 한 해는 두 끝의 부분 월 때문에 13개가 될 수 있습니다. 이는 앱의 명시적 상한입니다. 현재 공식 schema 문서에서는 서비스의 최대 범위 오류 조건을 찾지 못했으므로 “문서가 정확히 365일 상한을 보장한다”고 쓰지 않습니다. 윤년과 달력상 1년을 365일 고정값으로 혼동하면 안 됩니다.
- 월말은 다음 달 1일 00:00와 같은 instant를 양쪽에 중복 사용하지 않습니다. 현재 API 어댑터와 맞춘 초 단위 예시는 `2026-01-01T00:00:00Z`~`2026-01-31T23:59:59Z`입니다. 첫·끝 부분 월에는 원래 `from`/`to`를 적용하고 요청·응답 시각을 함께 보존합니다. 서버의 소수초 반올림과 월 경계 실응답은 이번 조사에서 검증하지 않았습니다.

현재 공식 API 한도는 일반 사용자 5,000 points/hour, Actions `GITHUB_TOKEN` 1,000 points/hour/repository이며 예외가 있습니다. 요청은 최소 1 point이고 정확한 비용은 `rateLimit { cost }`로 확인할 수 있습니다. connection의 `first/last`는 1~100, 한 요청의 최대 node 수는 500,000입니다. 서버는 현재 처리 10초 초과 시 timeout을 낼 수 있고 resource limit 때 부분 응답과 errors를 반환할 수 있습니다. 13개 scalar 별칭이 “무료” 또는 항상 성공한다고 보장하지 않아야 합니다. [Rate and query limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)

## 같은 쿼리에 월별 별칭을 넣을지

| 방식 | 얻는 정보 | 판단 |
| --- | --- | --- |
| 기존 캘린더만 | 실제 일별 총활동 및 이로 계산한 추이 | 옛 파일과 sample의 완전한 fallback입니다. 커밋·PR 분류는 표시할 수 없습니다. |
| 기본 collection에 네 totals만 추가 | 전체 요청 기간의 실제 분류별 요약 | 가장 작은 확장입니다. 분류별 월 추이 요구에는 부족합니다. |
| 위 요약 + 같은 `user` 안에 월별 collection 별칭 | 실제 월별 커밋·PR·이슈·리뷰 기여 추이 | **요구에 맞는 권고안입니다.** 12/13개로 제한하고 scalar만 요청합니다. |

GraphQL 별칭은 같은 필드에 다른 인자를 주어 한 요청에서 결과를 구분하는 표준 기능입니다. 날짜·사용자 값은 variables로 전달합니다. [Aliases and variables](https://graphql.org/learn/queries/#aliases)

다음은 형태 설명용이며 실행한 API 쿼리가 아닙니다. 실제 구현은 기존 calendar selection을 그대로 두고 `month00`~`month12` 중 필요한 항목만 생성하면 됩니다.

```graphql
query ContributionsCalendar(
  $username: String!
  $from: DateTime!
  $to: DateTime!
  $month00From: DateTime!
  $month00To: DateTime!
) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      ...ActivityTotals
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount contributionLevel }
        }
      }
    }
    month00: contributionsCollection(from: $month00From, to: $month00To) {
      ...ActivityTotals
    }
  }
}

fragment ActivityTotals on ContributionsCollection {
  startedAt
  endedAt
  totalCommitContributions
  totalPullRequestContributions
  totalIssueContributions
  totalPullRequestReviewContributions
  restrictedContributionsCount
  hasAnyRestrictedContributions
}
```

별칭에는 추가 calendar/저장소/PR 목록을 요청하지 않습니다. 기본 calendar는 한 번만 받습니다. 별칭 개수는 일반적인 alias 서비스 한도가 아니라 Maeul의 비용·크기 상한입니다. 조직 필터는 이번 범위에 추가하지 않습니다.

같은 요청에 넣으면 조회 지연과 요청 횟수는 줄일 수 있지만, 필드 오류·timeout 영향도 공유합니다. GitHub의 non-null collection 오류는 상위 `user`까지 null로 전파될 수 있습니다. 따라서 로컬 schema의 optional만으로 서버 장애가 격리된다고 설명하면 안 됩니다. GraphQL의 이 동작은 [Field errors](https://spec.graphql.org/September2025/#sec-Handling-Execution-Errors)에 따릅니다. 기존 인증·rate-limit·오류 처리는 유지하고 실패한 값을 0으로 만들지 않아야 합니다. summary-only 요청 모드를 유지하면 월별 확장 없이도 데이터를 갱신할 선택지가 됩니다. 자동 fallback을 추가한다면 인증/권한 오류의 은폐나 무한 retry 없이 기존 [30초 누적 요청 예산](../src/api/request.ts) 안에서 처리해야 합니다.

## 신뢰할 수 있는 metadata와 호환성

아래는 새 API 사실이 아니라 구현 계약 권고입니다.

1. `ContributionData`와 `SnapshotV1`에 optional `activity`를 두고, 내부에 자체 `schemaVersion`, provider/metric 의미, `fetchedAt`, 요청 범위와 응답 범위, 기간 요약, 최대 13개의 월 데이터를 넣습니다. 각 월은 `YYYY-MM`, 범위, 네 count와 restricted 정보를 가집니다. 월 데이터는 없어도 기간 요약은 존재할 수 있어야 합니다.
2. field absence는 미수집, 유효한 정수 0은 조회된 0입니다. 일부 key만 있는 불완전한 집계를 완성된 breakdown으로 취급하지 않습니다. malformed 값·중복 월·역전 범위·범위 밖 월·음수/소수/unsafe integer는 검증에서 구별해야 합니다. 누락·실패한 값을 0으로 채우면 안 됩니다.
3. `parseGitHubResponse → fetchContributions → createSnapshot → snapshotSchema → serializeSnapshot → snapshotToContributionData → sourceSnapshot` 경로 전체를 연결합니다. 기존 calendar 구조, 절대 날짜, zero/missing 구분, level, 지형 배치 입력은 그대로 유지합니다.
4. 전체 기간 scalar와 월별 결과는 각각 원본으로 보존합니다. 월별 합을 upstream 요약으로 가장하지 않고, 네 분류와 캘린더의 차이를 임의의 PR·커밋·“기타” 값으로 보정하지 않습니다. 전체 캘린더와 breakdown은 의미가 다른 지표임을 UI에 알려야 합니다.
5. 브라우저에는 집계만 전달합니다. 토큰·인증 헤더·scope credential은 snapshot/URL/localStorage에 넣지 않습니다. GitHub 공식 인증 절차는 서버/CLI 쪽에만 적용합니다. [GraphQL authentication](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql#authenticating-with-graphql)
6. 화면에는 계정, 실제 기간, `Fetched …`, `Sample` 또는 `Imported snapshot`, 제한 기여 안내를 표시합니다. import의 `source.kind: github`는 서명된 진위 보증이 아니므로 “GitHub에서 실시간 검증됨”이라고 바꾸지 않습니다. 요청마다 조회 권한이 달라질 수 있으므로 과거 파일과 새 파일을 비교할 때도 완전 동일한 가시성이라고 가정하지 않습니다.
7. 초기 sample에는 기존 합계 활동 차트만 제공합니다. PR·커밋 차트를 보여주려고 총기여에서 비율을 만들어 나누지 않습니다. legacy fixture는 새 필드가 없더라도 기존과 같은 calendar 결과를 반환해야 합니다. 구버전 앱은 새 optional 필드를 버릴 수 있으므로 옛 앱을 거친 재저장까지 보존된다고 약속하지 않습니다.
8. 세계의 replay cursor가 선택 월 중간을 가리키면 그 월 전체 breakdown을 현재일까지의 수치로 표시하지 않습니다. 분석을 전체 snapshot 기간으로 고정해 표시하거나 완전히 관측된 월까지만 보여주고, 일별 분류를 추정하지 않습니다.

후속 구현에서 확인할 핵심 사례는 기존 fixture/snapshot 무변경 수용, optional 통계의 snapshot·world 왕복 보존, 연도 경계를 걸친 13개월·윤년·부분 월, 진짜 0/미수집/제한 기여 구분, 선택 월 중간 replay, 좁은 화면과 키보드 데이터 열람입니다. 이 문서는 구현 테스트 결과를 대신하지 않습니다.

## 검증 범위

공식 shadcn/ui·Tremor·Recharts·Observable Plot·Chart.js·GitHub·GraphQL·W3C 문서와 로컬 데이터 경로를 읽었습니다. 인증된 GitHub 요청, 실제 계정별 집계 비교, 서버 최대 기간 오류 재현, 차트 bundle 크기 측정은 수행하지 않았습니다. 설치·빌드·커밋·운영 코드 변경도 하지 않았습니다. 서브워커 시작은 Codex 업데이트 프롬프트로 실패하여 종료했고, 문서 조사는 이 워커가 직접 완료했습니다.

## 구현 결정과 후속 확인

조사 이후 구현에서는 기존 snapshot v1에 선택 필드 `activity`를 추가하고, 출처·정확한 요청 범위·최대 13개 월별 집계를 보존합니다. 조회 시각은 기존 `source.fetchedAt`을 재사용합니다. 별도의 연간 scalar 요약은 이번 범위에 포함하지 않으며, 화면의 분류별 요약은 월별 집계의 합입니다. 전체 기여 캘린더와의 합계 일치를 가정하지 않습니다.

2026-09-19에 코디네이터가 인증된 실제 GitHub API로 두 달의 별칭 쿼리를 확인했습니다. 여섯 count 필드가 모두 반환됐고 이 요청의 cost는 1이었습니다. 월말 `23:59:59.999Z` 입력의 `endedAt`은 `23:59:59Z`로 반환됐으며 다음 달 `startedAt`은 정확히 1일 00:00였습니다. 따라서 metadata에는 요청한 범위를 보존하고, 응답 문자열의 소수초가 같은지는 요구하지 않습니다. 이는 해당 실응답의 확인이며 모든 미래 API 응답에 대한 보장은 아닙니다. 현재 연도 전체 범위를 요청했을 때는 1월 1일부터 12월 31일까지 365개 날짜가 반환되는 것도 확인했습니다.

웹 대시보드의 지표 카드, 기간 선택, 빈 상태를 비교하기 위해 Mobbin의 [Mintlify](https://mobbin.com/screens/205aefea-2dfc-4668-9af7-bc4921da1762), [Exa](https://mobbin.com/screens/279d5948-258a-4519-b3e3-c15a746d8b9c), [Obvious](https://mobbin.com/screens/f8d79792-2e5d-4eac-aa5d-6050dce3aebb) 화면도 참고했습니다. 실제 UI는 기존 종이색·녹색 디자인을 유지하며 화면 이미지를 제품 에셋으로 복제하지 않습니다.
