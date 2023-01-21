# Easy-Components 3.0
Вам больше не придется вручную создавать компоненты. Все что нужно сделать: написать весь нужный вам html в первом файле и весь css во втором.
Программа сама определит структуру компонентов, создаст папки и нужные файлы с учетом вложенности дочерних тегов и сама поместит весь нужный код в необходимые файлы. 
Вам всего лишь необходимо дать ей два файла, имя класса с которого нужно начинать и путь папки в который все нужно положить.

Данный проект еще в разработке, однако его первая версия уже позволит вам сэкономить кучу времени.

### Окончательная цель проекта: 
 * Создание структуры папок
 * Генерация кода для каждого компонента
 * Вставка этого кода в нужный файл
 * Чтение css кода для каждого компонента
 * Вставка css кода в нужный css файл


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
## Версия 3.0
В данной версии программа полностью готова и работоспособна. Явные баги или ошибки в логике пока не выявлены. 
Если у вас возникли какие-либо неполадки — напишите нам на почту imagineunlimitedgroup@gmail.com

----
## Демонстрация работы

#### Шаг №1 - HTML файл
> Она не нуждается в целостном html файле так как сама получает имя и код каждого класса и рекурсивно проходит по DOM дереву. Вы можете дать ей всего лишь текстовый файл с отрывком кода и она все сделает за вас.

<img width="300" alt="Screenshot 2023-01-17 at 23 20 59" src="https://user-images.githubusercontent.com/122586769/213099186-df4ea3d7-abc9-489f-941a-d0f7838a90fe.png">

#### Шаг №2 - Генерация файлов и папок
> При желании можно изменить струтуру файлов, для этого вам нужно добавить переменную типа "путь/имя_файла.расширение" и вызвать функцию createComponentFile() с этой переменной
> Генерация jsx и css происходит в самом начале функции createComponent()

<img width="300" alt="Screenshot 2023-01-17 at 23 23 35" src="https://user-images.githubusercontent.com/122586769/213099577-59bcccaa-08b8-43fc-a74b-2f95738a2af2.png">

#### Шаг №3 - Генерация JSX кода
> Программа сама анализирует код, генерирует красивую табуляцию и пишет все нужные импорты дочерних компонентов. Вы можете изменить шаблон по которому собирается JSX файл, для этого перейдите в функцию createJsxCode() и отредактируйте переменную "template"

<img width="300" alt="Screenshot 2023-01-21 at 10 25 32" src="https://user-images.githubusercontent.com/122586769/213879224-8d5237a8-ac97-44a3-961f-940c2e068841.png">

#### Шаг №4 - Генерация CSS кода
> Программа находит css код нужного компонента и записывает его в нужный файл

<img width="300" alt="Screenshot 2023-01-21 at 10 28 05" src="https://user-images.githubusercontent.com/122586769/213879332-c1615d8c-fa8d-4a50-8499-8c1e9b6c1883.png">


-----

## Поддержка
Если программа выдает какие-либо ошибки:
- Проверьте правильность данных в settings.json
- Проверьте наличие стартового класса
- Проверьте наличие стартовой папки

Если у вас возникли какие-либо неполадки или вопросы — напишите нам на почту imagineunlimitedgroup@gmail.com

Или свяжитесь с нами через [Instagram](https://www.instagram.com/_imagineunlimited_/)

-----
### Стек технологий:
- NodeJs
