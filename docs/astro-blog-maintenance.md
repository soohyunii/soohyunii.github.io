# Astro 블로그 관리

카테고리는 `src/data/categories.yml` 한 파일에서 관리합니다. 글은 카테고리 이름이 아니라 안정적인 `id`를 참조합니다.

새 최상위 카테고리는 `categories` 배열에 `{ id, name, slug }`를 추가합니다. 자식 카테고리는 부모의 `children` 배열에 같은 형태로 추가하며 깊이 제한은 없습니다. 이름을 바꿀 때는 `name`만 수정하고 `id`는 유지합니다. 이동할 때도 노드를 다른 `children` 배열로 옮기되 `id`는 유지합니다. 삭제 전에는 해당 ID를 사용하는 글이 없는지 확인합니다.

```yaml
- id: projects
  name: Projects
  slug: projects
  children:
    - id: dancebridge
      name: DanceBridge
      slug: dancebridge
```

수정 뒤 `pnpm validate`, `pnpm test`, `pnpm build`를 실행합니다.
