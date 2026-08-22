# Soohyun's Blog

Astro 기반의 카테고리 중심 개인 블로그입니다.

## 로컬 실행

Node.js 24와 pnpm 10이 필요합니다.

```sh
pnpm install
pnpm dev
```

프로덕션 결과는 `pnpm build` 후 `pnpm preview`로 확인합니다.

글은 `src/content/posts`에 Markdown으로 추가합니다. 각 글의 `category`에는 `src/data/categories.yml`의 안정적인 `id` 하나를 입력합니다. 카테고리 이름이나 위치를 바꾸더라도 기존 `id`는 유지하세요. 태그는 선택 사항입니다.

변경 후 `pnpm validate`, `pnpm test`, `pnpm build`를 실행합니다. `master`에 반영된 코드는 GitHub Actions가 GitHub Pages로 배포합니다.
