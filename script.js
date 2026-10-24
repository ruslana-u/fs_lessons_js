/*
 ДОМАШНЄ ЗАВДАННЯ 19 — «Профіль користувача»

 Задача: крок за кроком зібрати картку користувача
 з «сирих» даних, які прийшли з форми реєстрації.

 Дані вже оголошені нижче — початкові значення не змінювати.
 Код писати під блоком з даними, у тому порядку, у якому йдуть кроки.
 Результат кожного кроку виводити в консоль через console.log().


 КРОК 1. Рік народження — до числа.
 Змінна birthYear — це рядок "1994". Вивести її тип.
 Перетворити значення на число, зберегти в нову змінну, вивести її тип і значення.

 КРОК 2. Вік.
 Порахувати вік користувача на основі currentYear та числового року народження.
 Створити змінну ageIn10Years зі значенням віку та збільшити її на 10.
 Вивести обидва значення.

 КРОК 3. Нормалізація імені та прізвища.
 Дані прийшли «кривими»: "tARAS" і "shevchenko".
 Привести імʼя та прізвище до вигляду «перша літера велика, решта — малі».
 Вивести результат.

 КРОК 4. Повне імʼя.
 Створити змінну fullName у форматі "Імʼя Прізвище".
 Вивести fullName та його довжину.

 КРОК 5. Розбір email на частини.
 Вивести позицію символу "@" у змінній email.
 Отримати логін (усе до "@") та домен (усе після "@"), домен — у нижньому регістрі.
 Вивести логін і домен.

 КРОК 6. Маска email.
 Створити змінну maskedEmail у форматі: перші 2 символи логіна + "***" + "@" + домен.
 Вивести maskedEmail.

 КРОК 7. Перевірка повноліття.
 Створити змінну isAdult — чи є користувач повнолітнім (18 років і більше).
 Вивести її значення та тип.
 Додатково вивести результати трьох виразів:
   - isAdult && isSubscribed
   - isAdult || isSubscribed
   - !isSubscribed

 КРОК 8. Імʼя для показу.
 Змінна nickname оголошена, але не має значення.
 Створити змінну displayName: nickname, а якщо його немає — fullName.
 Вивести displayName.

 КРОК 9. Прожиті дні.
 Порахувати, скільки приблизно днів прожив користувач (вік × 365.25),
 та округлити результат до цілого. Вивести отримане число.

 КРОК 10. Код підтвердження.
 Згенерувати випадкове чотиризначне ціле число від 1000 до 9999 включно.
 Вивести його.

 КРОК 11. Лічильник входів.
 Змінна visits дорівнює 0. Зафіксувати два входи користувача:
 перший — постфіксним інкрементом, другий — префіксним.
 Після кожного вивести і результат самого виразу, і поточне значення visits.

 КРОК 12. Картка користувача.
 Одним багаторядковим шаблонним літералом вивести в консоль підсумкову картку:

 Користувач: Taras Shevchenko
 Показувати як: Taras Shevchenko
 Вік: 32 (через 10 років — 42)
 Email: Ta***@gmail.com
 Повнолітній: true
 Підписка: true
 Входів: 2
 Прожито днів: 11688
 Код підтвердження: 4821

 Усі значення мають підставлятися зі змінних, а не бути вписаними вручну.
 Код підтвердження щоразу буде іншим — це нормально.
*/

// ==== ДАНІ (не змінювати) ====

let firstName = "tARAS";
let lastName = "shevchenko";
let birthYear = "1994";
let email = "Taras.Shevchenko@Gmail.com";
let isSubscribed = true;
let nickname;
let visits = 0;
const currentYear = 2026;

// ==== КОД НИЖЧЕ ====

// КРОК 1
console.log(typeof birthYear);
let birthYearNum = +birthYear;
console.log(typeof birthYearNum, birthYearNum);

// КРОК 2
let age = currentYear - birthYearNum;
console.log(age);
let ageIn10Years = age;
ageIn10Years += 10;
console.log(ageIn10Years);

// КРОК 3
let firstNameCorrect = firstName[0].toLocaleUpperCase() + firstName.slice(1).toLocaleLowerCase();
console.log(firstNameCorrect);
let lastNameCorrect = lastName[0].toLocaleUpperCase() + lastName.slice(1).toLocaleLowerCase();
console.log(lastNameCorrect);

// КРОК 4
let fullName = firstNameCorrect + ' ' + lastNameCorrect;
console.log(fullName, fullName.length);

// КРОК 5
let position = email.indexOf('@');
console.log(position);
let login = email.substring(0, position);
console.log(login);
let domen = email.substring(position + 1).toLocaleLowerCase();
console.log(domen);

// КРОК 6
let maskedEmail = login.slice(0, 2) + "***" + "@" + domen;
console.log(maskedEmail);

// КРОК 7
let isAdult = age >= 18 ? true : false; 
console.log(isAdult, typeof isAdult);
console.log(isAdult && isSubscribed);
console.log(isAdult || isSubscribed);
console.log(!isSubscribed);

// КРОК 8
let displayName = nickname || fullName;
console.log(displayName);

// КРОК 9
let daysOfLife = Math.round(age * 365.25);
console.log(daysOfLife);

// КРОК 10
let verificationCode = Math.floor(Math.random() * 9000) + 1000;
console.log(verificationCode);

// КРОК 11 
let post = visits++;
console.log(post, visits);
let pref = ++visits;
console.log(pref, visits);

// КРОК 12
let userCard = `Користувач: ${fullName}
Показувати як: ${displayName}
Вік: ${age} (через 10 років — ${ageIn10Years})
Email: ${maskedEmail}
Повнолітній: ${isAdult}
Підписка: ${isSubscribed}
Входів: ${visits}
Прожито днів: ${daysOfLife}
Код підтвердження: ${verificationCode}`;
console.log(userCard);