# 크루즈링크 블로그

크루즈 전문 여행사 크루즈링크의 GitHub Pages 블로그입니다.

## 🚀 GitHub Pages 배포 방법

### 1. GitHub 리포지토리 생성
```bash
# GitHub에서 새 리포지토리 생성 (예: cruiselink-blog)
# 또는 username.github.io 형태로 생성
```

### 2. 코드 푸시
```bash
cd cruiselink-blog
git remote add origin https://github.com/YOUR_USERNAME/cruiselink-blog.git
git branch -M main
git push -u origin main
```

### 3. GitHub Pages 활성화
1. GitHub 리포지토리 → **Settings** → **Pages**
2. Source: **GitHub Actions** 선택
3. 또는 Source: **Deploy from a branch** → `main` / `/ (root)` 선택
4. Jekyll 자동 빌드됨

### 4. 커스텀 도메인 (선택)
1. Settings → Pages → Custom domain에 `blog.cruiselink.co.kr` 입력
2. DNS에 CNAME 레코드 추가: `blog.cruiselink.co.kr` → `YOUR_USERNAME.github.io`

## 📁 구조
```
├── _config.yml          # Jekyll 설정
├── _layouts/            # 레이아웃 템플릿
├── _includes/           # 공통 컴포넌트
├── _posts/              # 블로그 포스트 (5개)
├── assets/
│   ├── css/style.css    # 스타일시트
│   └── images/          # 이미지
├── index.html           # 메인 페이지
├── robots.txt           # SEO
└── Gemfile              # Ruby 의존성
```

## 📝 새 포스트 작성
`_posts/` 폴더에 `YYYY-MM-DD-slug.md` 형식으로 파일 생성.

## 🔗 연락처
- 📞 02-3788-9119
- 💬 카카오톡: https://pf.kakao.com/_xgYbJG
- 🌐 https://cruiselink.co.kr
