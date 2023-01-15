# Easy-Components 1.0
Вам больше не придется вручную создавать компоненты. Все что нужно сделать: написать весь нужный вам html в первом файле и весь css во втором.
Программа сама определит структуру компонентов, создаст папки и нужные файлы с учетом вложенности дочерних тегов и сама поместит весь нужный код в необходимые файлы. 
Вам всего лишь необходимо дать ей два файла, имя класса с которого нужно начинать и путь папки в который все нужно положить.

Данный проект еще в разработке, однако его первая версия уже позволит вам сэкономить кучу времени.

### Окончательная цель проекта: 
 * Создание структуры папок
 * Генерация кода для каждого компонента
 * Вставка этого кода в нужный файл
 * Чтение css кода для каждого компонента
 * Сортировка css кода на основе [Css-Formatter](https://github.com/ImagineUnlimitedGroup/Css-Formatter)
 * Вставка отсортированного кода в нужный css файл


-----
## Установка и запуск
1. Скачайте данный репозиторий к себе на ПК
2. Откройте эту папку в редакторе кода
3. Запустите терминал в данной папке
4. Введите команду
> npm install
5. Откройте файл settings.json
6. Запишите нужные данные
7. Откройте терминал и введите команду
> node index
8. Готово

-----
## Версия 1.0
В данной версии уже реализовано создание системы папок на основе вашего html

Мы даем программе HTML такого вида:

<img width="484" alt="Screenshot 2023-01-13 at 00 16 59" src="https://user-images.githubusercontent.com/122586769/212260534-860861c5-f4d4-446d-ba3b-a9b61f28948a.png"> 

На выходе мы получаем все нужные папки и файлы:

<img width="253" alt="Screenshot 2023-01-13 at 00 17 29" src="https://user-images.githubusercontent.com/122586769/212260637-0904eefe-7b01-4804-b589-2aa99ead481a.png">

Программа не нуждается в целостном html файле так как сама получает имя и код каждого класса и рекурсивно проходит по DOM дереву. Вы можете дать ей всего лишь текстовый файл с отрывком кода и она все сделает за вас.

-----
### Стек технологий:
- NodeJs
