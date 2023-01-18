const fs = require('fs')

//  Получение имени класса 
function getClassName(string) {
  let regEx = 'class="(.*)"';
  let className = string.match(regEx)[1];
  return className
}

// Получение тела нужного класса
function getClassContent(code, className) {
  // Делим на строки
  let codeArr = code.split(/\n/)

  let openTagId = 0
  let closeTagCounter = 0
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
      if (tag.includes("/div")) {
        closeTagCounter -= 1
      } else if (tag.includes("div")) {
        closeTagCounter += 1
      }
    });
    // Прибавляем строку к коду
    classCode = classCode + codeArr[i] + "\n"
    // При 0 мы найдем закрывающий тег нужного класса
    if(closeTagCounter == 0) {
      closeTagId = i
      break
    }
  }

  return classCode
}

// Создание файла
function createComponentFile(fileName) {
  fs.open(fileName, 'w', (err) => {
    if(err) {}; // не удалось создать файл
  });
}

// Подсчет табуляции в начале строки
function tabCounter(code) {
	// Ищем нужное количество табов чтобы красиво это оформить
	// Делим на строки
	let codeArr = code.split('\n')
	// Получаем первую строку
	let firstString = codeArr[0]
	let id = 0
	let tab = ''
	// Записываем все табы в начале
	while (firstString[id] != '<') {
		tab = tab + firstString[id]
		id++
	}

	return tab 
}

function makeCodeBeautiful(code) {
	// Я надеюсь вам не придется смотреть и изучать этот участок кода
	// Если ваша программа работает то не читайте эту функцию
	// Это функция отняла у меня кусочек жизни просто ради красивого кода
	// Тут нет ничего особенного, просто я играю  с табами и делаю код красивее
	// Удаляем лишние табы

	// Получаем все что находится до открывающего тега 
	let tabs = tabCounter(code)

	// Ищем количество пробелов
	let tabSum = tabs.match(/\t/g).length

	// Делим на строки
	let codeArr = code.split('\n')
	code = ''

	// Вычитаем 2 так как в нормальном виде там 2 таба в начале
	if (tabSum > 2) {
		tabSum = tabSum - 2
		let unnecessaryTabs = '\t'.repeat(tabSum)
		
		// Проходим по коду и удаляем ненужные табы
		for (let i = 0, len = codeArr.length; i < len; i++) {
			if (codeArr[i] != '') {
				codeArr[i] = codeArr[i].replace(unnecessaryTabs, '')
				if ((i+2) == len) {
					code = code + codeArr[i]
				} else {
					code = code + codeArr[i] + '\n'
				}
			}
		}
	} else if (tabSum <= 2) {
		// Здесь мы наоборот добавляем недостаточную табуляцию
		tabSum = 2 - tabSum
		let tabs = '\t'.repeat(tabSum)
		for (let i = 0, len = codeArr.length; i < len; i++) {
			if (codeArr[i] != '') {
				if ((i+2) == len) {
					code = code + tabs + codeArr[i]
				} else {
					code = code + tabs + codeArr[i] + '\n'
				}
			}
		}
	}

	return code
}

// Находим все компоненты и пишем их импорты
function generateJsImport(code) {
	let codeArr = code.split('\n')

	let importCode = ''

  // Проходим по каждой строке и если она содержит компонент:
  // записываем по шаблону в импорт
	codeArr.forEach(element => {
		if (element.includes('/>')) {
			let regEx = '<(.*)/>';
			let componentName = element.match(regEx)[1];
      // Записываем компонент только в том случае если он встречается первый раз
      if (!importCode.includes(componentName)) {
        importCode = importCode + `import ${componentName} from './${componentName}'\n`
      }
		}
	});

	return importCode
}
// Генерация и запись js файла для компонента
function createJsxCode(fileName, className, classCode) {
	classCode = makeCodeBeautiful(classCode)
	let importCode = generateJsImport(classCode)
  let template = `import './${className}.css';
${importCode}

function ${className}() {
  return (
${classCode}
  );
}

export default ${className};
  `

  fs.writeFileSync(fileName, template)
}

// Создание папки
function createComponentFolder(folderName) {
  try {
    fs.mkdirSync(folderName);
  } catch (err) {}
}

// Создание компонента
function createComponent(componentName, componentCode, parentPath) {
  // Создаем папку и файлы
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
  for (let i = 0, len = componentCodeArr.length; i < len; i++) {

    // Делим строку на теги
    let stringArr = componentCodeArr[i].split(/(<|>)/)

    // Проходим по каждому тегу
    stringArr.forEach(tag => {
      if (tag.includes('/div')) {
        counter -= 1
      } else if (tag.includes('div')) {
        counter += 1
        if (counter == 2) {
          let childComponentName = getClassName(tag)
          let childComponentCode = getClassContent(componentCode, childComponentName)

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
	// Записываем Js файл
  createJsxCode(jsFile, componentName, componentCode)
};

// Первичное чтение файла
function start() {
  // Читаем настройки из json
  let contents = fs.readFileSync("settings.json");
  let jsonContent = JSON.parse(contents);

  // Получаем необходимые данные: 
  //  - имя файла
  //  - класс с котрого надо начать
  //  - папка в которую надо вложить компоненты
  let fileName = jsonContent.htmlPath
  let firstClassName = jsonContent.firstClassName
  let firstFolder = jsonContent.resultPath

  //
  let fileContent = fs.readFileSync(fileName, 'utf8');

  // Получаем тело класса с которого надо начать
  let htmlCode = getClassContent(fileContent, firstClassName)

  // Создание первого компонента
  createComponent(firstClassName, htmlCode, firstFolder)
}

// Запуск программы
start()
