# 다음 세션 할 일

이 프로젝트에서 다음 작업을 시작할 때 아래 내용을 사용자에게 먼저 그대로 안내한다.

1. Search가 작동하지 않는 문제
   - 검색어를 입력해도 결과 대신 `Search is available in production preview after pnpm build.` 메시지가 표시됨.
   - 첨부 화면에서는 `논문`을 검색했을 때 위 메시지가 나타났음.

2. 각 카테고리 옆에 아이콘을 삽입할 수 있는 기능 추가
   - 카테고리별로 아이콘을 넣거나 넣지 않을 수 있어야 함.
   - `src/data/categories.yml`에서 관리할 수 있는 방향을 우선 검토.

3. `Projects / DanceBridge`와 DanceBridge 프로젝트의 연동 방식 기획
   - DanceBridge 프로젝트의 진행 상황을 블로그 포스팅 형식으로 간단히 요약·서술할지 검토.
   - 카테고리 또는 링크를 클릭하면 DanceBridge GitHub 주소로 이동하게 만들지 검토.
   - 위 방식을 Codex와 상의해 결정한 후 구현.

4. About 페이지 보강
   - 사용자 정보를 더 자세히 표시.
   - 프로필 등 이미지를 첨부할 수 있도록 구성.
   - Gmail, 네이버 메일, 이화여대 메일 주소를 모두 표시.
   - 확인된 이화여대 메일: `sofiakim@ewha.ac.kr`
   - Gmail과 네이버 메일의 정확한 주소는 구현 전에 사용자에게 확인.
