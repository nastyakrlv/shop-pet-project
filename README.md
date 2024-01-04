# Интернет магазин

[Ссылка на интернет-магазин](http://akor0611.fvds.ru/home)

Интернет магазин, созданный в учебных целях, где пользователи могут просматривать ассортимент товаров, ознакомиться с их описанием, изображениями и ценами, добавить товары в корзину, но не имеют возможности осуществлять фактическую покупку.

<img width="836" alt="image" src="https://github.com/nastyakrlv/shop-pet-project/assets/112975832/e555d238-6197-4f03-a6cf-402797e0f124">

## Содержание

- [Технологии](#технологии)
- [Функциональность](#функциональность)
- [Установка и запуск](#установка-и-запуск)
- [Источники](#источники)

## Технологии

- Angular
- HTML
- SCSS
- TypeScript
- JavaScript
- Node.js
- Express.js
- PostgreSQL

## Функциональность

Проект интернет-магазина включает в себя следующий функционал:

- Регистрация новых пользователей и аутентификация существующих
- Просмотр каталога товаров
- Просмотр подробной информации о каждом продукте
- Добавление товаров в корзину с возможностью выбора их размера и цвета, а также удаление товаров из корзины
- Сохранение корзины покупок в базе данных для авторизованных пользователей, обеспечивающее постоянное хранение информации о выбранных товарах
- Для неавторизованных пользователей предусмотрено использование LocalStorage для сохранения корзины
- При аутентификации происходит автоматический перенос корзины из LocalStorage в базу данны

## Установка и запуск

Для установки и запуска данного интернет-магазина, выполните следующие шаги:

1. Склонируйте репозиторий: `git clone https://github.com/nastyakrlv/shop-pet-project.git`
2. Перейдите в папку проекта: `cd shop-pet-project`
3. Создайте файл .env: `nano .env`
4. Заполните файл .env:
   
```
PORT=порт, на котором запущен сервер
DB_NAME=название базы данных
DB_USER=postgres
DB_PASSWORD=пароль
DB_HOST=postgres
SECRET_KEY=ключ для шифрования токена

SERVER_PORT=порт, на котором запущен сервер
CLIENT_PORT=порт, на котором запущен клиент
DB_PORT=порт, на котором запущена база данных
POSTGRES_DB=название базы данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=пароль
PGUSER=postgres
PGDATABASE=название базы данных
```
5. Запустите Docker Compose: `docker-compose up -d`

## Источники

- [Макет Figma](https://www.figma.com/file/Gz2gyFGhowggdvNwNNDK5o/Online-Shopping-Website-Design---eCommerce-Store-Website---UI-Kit-(Community)?mode=dev)
