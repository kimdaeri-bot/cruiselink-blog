# 크루즈링크 (CruiseLink)

크루즈 여행 전문 예약 문의 웹사이트.

## 기술 스택
- Jekyll + GitHub Pages
- Vanilla JS
- EmailJS (문의 폼)

## EmailJS 설정
1. https://www.emailjs.com 에서 무료 계정 생성
2. Email Service 추가 (Gmail 등)
3. Email Template 생성
4. `_config.yml`의 `emailjs` 항목에 실제 값 입력
5. `assets/js/main.js`의 `EMAILJS_CONFIG` 객체 업데이트

## 로컬 개발
```bash
bundle install
bundle exec jekyll serve
```
