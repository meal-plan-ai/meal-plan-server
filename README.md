node.js version - 18.16.1
npm version - 9.5.1


Steps to run this project:
1. npm i
2. add open-ai api key to .env file (you can get it form https://platform.openai.com/account/api-keys)
3. npm run start:dev



How to send test request:
1. install postman
2. create test GET Request: http://localhost:3001/meal-plan/create-plan
3. send request and check response

note: you should change data you want send to open-ai in the src/meal-plan/meal-plan.service.ts file on the 9 line.
