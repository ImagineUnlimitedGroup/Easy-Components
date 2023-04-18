const fs = require('fs');

// Цвета для информационных логов
const errorColor = '\x1b[31m'
const successColor = "\x1b[32m"

// Данная функция делает первую букву строки заглавной
// Так как мы должны писать компоненты с заглавной буквы 
// Во избежание ошибок будем автоматически менять первую букву класса на заглавную
function ucFirst(str) {
  if (!str) return str;

  return str[0].toUpperCase() + str.slice(1);
}

//  Получение имени класса 
const getClassName = (string) => {
  // Так как класс находится внутри выражения class="ИмяКласса"
  // С помощью регулярных выражений получаем содержимое
  let regEx = 'class="(.*)"';

  // Нам могут передать компонент без класса
  // В таком случае мы останавливаем программу и выдаем ошибку
  try {
    let className = string.match(regEx)[1];

    // В компоненте может быть несколько классов
    // поэтому мы удаляем все после пробела 
    // и берем как название первое слово
    className = /^[^ ]+/.exec(className)[0];
    return ucFirst(className)

  } catch (error) {
    // Выдаем ошибку
    console.log(errorColor, `Function Name:  getClassName`)
    console.log(errorColor, `Error: ${string} ClassName not found`)
    process.exit(-1);
  }
}

// Получение тела нужного класса
const getClassHtmlContent = (code, className) => {
  // Делим на строки
  let codeArr = code.split(/\n/)

  // Мы будем вычитать при каждом закрывающем теге и
  // прибавлять при открывающем
  // Дочерние классы в таком случае самоуничтожатся в счетчике и
  // мы сможем найти нужный закрывающий тег
  let openTagId = 0
  let closeTagCounter = 0

  // Переменная для ханенияя результата 
  let classCode = ''

  // Проходим по каждой строке основного кода и ищем нужный класс
  for (let i = 0, len = codeArr.length; i < len; i++) {
    // проверяем строку на содержание какого-либо класса
    if(codeArr[i].includes('class=')) {
      // Получаем название этого класса
      let currentClass = getClassName(codeArr[i])

      // Сравниваем значения и начинаем считать только при абсолютном совпадении
      if (className == currentClass) {
        openTagId = i
        break
      }
    } 
  }

  // Начинаем проходить по массиву с строки нужного класса
  for (let i = openTagId, len = codeArr.length; i < len; i++) {
    // Делим строку на теги
    let stringArr = codeArr[i].split(/(<|>)/)

    // Проходим по каждому тегу
    stringArr.forEach(tag => {
      // Закрывающий тег вычитает 1
      // Открывающий тег прибавляет 1
      // Это поможет нам взаимоуничтожить дочерние классы и 
      // найти конец нужного нам класса
      if (tag.includes("/$")) {
        closeTagCounter -= 1
      } else if (tag.includes("$")) {
        closeTagCounter += 1
      }
    });
    // Так как мы уже в нужном классе
    // Прибавляем строку к коду
    classCode = classCode + codeArr[i] + "\n"
    // При 0 мы найдем закрывающий тег нужного класса
    if(closeTagCounter == 0) {
      closeTagId = i
      break
    }
  }

  // Возвращаем код нужного класса
  return classCode
}

// Создание файла
const createComponentFile = (fileName) => {
  // Файлы могут быть созданы ранее,
  // поэтому мы просто игнорируем ошибки
  // Это позволяет не загрязнять консоль
  fs.open(fileName, 'w', (err) => {
    if(err) {}; // не удалось создать файл
  });
}

// Подсчет табуляции в начале строки
const tabCounter = (code) => {
  // Это нам нужно для html в jsx коде
  // Мы возьмем первую строку и посмотрим сколько там табов
  // В дальнейшем мы сможем найти сколько табов лишние
  // и столько же удалить с каждой последующей строки
  // Все строки получат красивый вид и одинаковую табуляцию 
	// Ищем нужное количество табов чтобы красиво это оформить
	// Делим на строки
	let codeArr = code.split('\n')
	// Получаем первую строку
	let firstString = codeArr[0]
	let id = 0
	let tab = ''
	// Записываем все табы в начале
	while (firstString[id] != '<') {
		tab += firstString[id]
		id++
	}

	return tab 
}

// Украшает код редактируя табуляции
const makeCodeBeautiful = (code) => {
	// Я надеюсь вам не придется смотреть и изучать этот участок кода
	// Если ваша программа работает то не читайте эту функцию
	// Это функция отняла у меня кусочек жизни просто ради красивого кода
	// Тут нет ничего особенного, просто я играю  с табами и делаю код красивее

	// В этой функции мы удаляем лишние табы
  // Если вставить без удаления то к примеру 5ый дочерний тег уже в своем файле
  // Будет с 10 лишними табами спереди
	// Получаем все что находится до открывающего тега 
	let tabs = tabCounter(code)

	// Ищем количество пробелов
  // Я считаю только табы, если вы используете пробелы в своем коде - 
  // идите в ванну, посмотрите в зеркало и подумайте над своим поведением
	let tabSum = tabs.match(/\t/g).length

	// Делим на строки
	let codeArr = code.split('\n')
	code = ''

	// Вычитаем 2 так как в нормальном виде в jsx файле 2 таба в начале
  // После мы получаем разницу к примеру 4 таба и удаляем эти 4 таба из каждой строки
	if (tabSum > 2) {
		tabSum = tabSum - 2
		let unnecessaryTabs = '\t'.repeat(tabSum)
		
		// Проходим по коду и удаляем ненужные табы
		for (let i = 0, len = codeArr.length; i < len; i++) {
			if (codeArr[i] != '') {
				codeArr[i] = codeArr[i].replace(unnecessaryTabs, '')
				if ((i+2) == len) {
					code += codeArr[i]
				} else {
					code += codeArr[i] + '\n'
				}
			}
		}
	} else if (tabSum <= 2) {
		// Здесь мы наоборот добавляем недостаточную табуляцию
		tabSum = 2 - tabSum
		let tabs = '\t'.repeat(tabSum)
		for (let i = 0, len = codeArr.length; i < len; i++) {
			if (codeArr[i] != '') {
        // Не будем добавлять в конце перенос строки так как это некрасиво
				if ((i+2) == len) {
					code += tabs + codeArr[i]
				} else {
					code += tabs + codeArr[i] + '\n'
				}
			}
		}
	}

  // Возвращаем красивый код
	return code
}

// Находим все компоненты и пишем их импорты
const generateJsImport = (code) => {
	let codeArr = code.split('\n')

  // Сделали масивом чтобы потом перебором проверить на дубликаты
	let importCodeArr = []

  // Проходим по каждой строке и если она содержит компонент:
  // записываем по шаблону в импорт
	codeArr.forEach(element => {
		if (element.includes('/>')) {
			let regEx = '<(.*)/>';
			let componentName = element.match(regEx)[1];

      let currentImport = `import ${componentName} from './${componentName}/${componentName}'\n`

      // Проверка на дубликаты
      let dublicate = false
      importCodeArr.forEach(element => {
        if (element == currentImport) {
          dublicate = true
        }
      });

      // Записываем компонент только в том случае если он встречается первый раз
      if (!dublicate) {
        importCodeArr.push(currentImport)
      }
		}
	});

  let importCodeText = ''

  // В результате мы должны получить текст, 
  // поэтому проходим по массиву и записываем все в одну строку
  importCodeArr.forEach(element => {
    importCodeText += element
  });

	return importCodeText
}

// Генерация и запись js файла для компонента
const createJsxCode = (fileName, className, classCode) => {
  // Удаляем ненужные табуляции в начале
	classCode = makeCodeBeautiful(classCode)

  // Генерируем импорты для дочерних тегов
	let importCode = generateJsImport(classCode)

  // Шаблон для создания кода
  // Можно было в отдельный файл, но он слишком маленький и простой
  // Намного быстрее и проще редактировать его здесь
  // Если вам нужен большой шаблон - вынесите в отдельный файл
  let template = `import './${className}.css';
${importCode}

function ${className}() {
  return (
${classCode}
  );
}

export default ${className};
  `

  // Записываем в нужный файл
  fs.writeFileSync(fileName, template)
}

// Создание папки
const createComponentFolder = (folderName) => {
  // Папки могут быть созданы ранее,
  // поэтому мы просто игнорируем ошибки
  // Это позволяет не загрязнять консоль
  try {
    fs.mkdirSync(folderName);
  } catch (err) {}
}

// Создание компонента
const createComponent = (componentName, componentCode, parentPath) => {
  // Создаем путь к папке
  let folderPath = `${parentPath}/${componentName}`
  
	// Создаем папку
  createComponentFolder(folderPath)
  // Создаем файлы
  let jsFile = `${folderPath}/${componentName}.jsx`
  createComponentFile(jsFile)
  let cssFile = `${folderPath}/${componentName}.css`
  createComponentFile(cssFile)

  // Делим на строки
  let componentCodeArr = componentCode.split('\n')

  let counter = 0
  // Проходим по каждой строке и определяем дочерние классы первого уровня
  // Здесь принцип такой же как и в других функциях 
  // Если что-то непонятно - изучите функцию getClassHtmlContent()
  for (let i = 0, len = componentCodeArr.length; i < len; i++) {

    // Делим строку на теги
    let stringArr = componentCodeArr[i].split(/(<|>)/)

    // Проходим по каждому тегу
    stringArr.forEach(tag => {
      if (tag.includes('/$')) {
        counter -= 1
      } else if (tag.includes('$')) {
        counter += 1
        // Так как в теле класса есть также и родительский
        // дочерние классы первого уровня будут иметь индекс 2
        if (counter == 2) {
          let childComponentName = getClassName(tag)
          let childComponentCode = getClassHtmlContent(componentCode, childComponentName)

					// Создаем дочерний компонент
          createComponent(childComponentName, childComponentCode, folderPath)

					// Считаем табы для добавления красивой структуры
					let tabs = tabCounter(childComponentCode)

					// Заменяем код класса на имя компонента
          componentCode = componentCode.replace(childComponentCode, `${tabs}<${childComponentName}/>\n`)
        }
      }
    });
  }

  // Так как знак $ нам нужен только для обозначения компонентов, 
  // для успешной компиляции проекта мы их удаляем в тегах
  componentCode = componentCode.replace('</$', '</')
  componentCode = componentCode.replace('<$', '<')

  // Записываем Js файл
  createJsxCode(jsFile, componentName, componentCode)
};

// Начало программы
// Первичное чтение файла
const start = () => {
  // Читаем настройки из json
  let contents
  let jsonContent

  try {
    contents = fs.readFileSync("settings.json");
    jsonContent = JSON.parse(contents);
    
  } catch (error) {
    console.log(errorColor, `Error: file settings.json not found`)
    process.exit(-1);
  }

  // Получаем необходимые данные: 
  //  - имя файла с HTML
  let htmlFileName = jsonContent.htmlPath
  //  - класс с котрого надо начать
  let firstClassName = jsonContent.firstClassName
  //  - папка в которую надо вложить компоненты
  let firstFolder = jsonContent.resultPath

  // Получаем содержимое файлов
  try {
    htmlFileContent = fs.readFileSync(htmlFileName, 'utf8');
  } catch (error) {
    console.log(errorColor, `Error: HTML file not found`)
    process.exit(-1);
  }

  // Получаем тело класса с которого надо начать
  try {
    htmlCode = getClassHtmlContent(htmlFileContent, firstClassName)
  } catch (error) {
    console.log(errorColor, `Error: first class not found`)
    process.exit(-1);
  }

  // Создание первого компонента
  createComponent(firstClassName, htmlCode, firstFolder)
  console.log(successColor, 'Success: Components created')
}

// Запуск программы
start()
