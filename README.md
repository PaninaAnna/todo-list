[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ab2eb567b184446db8c6d09a8c16482f)](https://app.codacy.com/gh/PaninaAnna/todo-list/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

# Todo Dashboard

Пет-проект — аналог Trello/Jira дашборда. Позволяет создавать доски с колонками и карточками задач, назначать теги, чек-листы, архивировать карточки. Поддерживает авторизацию и персональные доски.

Проект основан на идее [Trello Tribute with Phoenix and React](https://bigardone.dev/blog/2016/01/04/trello-tribute-with-phoenix-and-react-pt-1/), но реализован на современном стеке с расширенной функциональностью.

## Стек

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite + better-sqlite3
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Deployment**: Vercel (фронт), Render (бэкенд)

## Локальный запуск

### Бэкенд

cd backend
npm install
npm run dev

Запустится на http://localhost:3001

### Фронтенд

cd frontend
npm install
npm run dev

Запустится на http://localhost:5173

## Деплой

- **Фронтенд**: https://todo-list-phi-lime-19.vercel.app
- **Бэкенд**: https://todo-list-api-nrtr.onrender.com

## Тестовый аккаунт

- **Email**: test@test.com
- **Пароль**: Test123!
