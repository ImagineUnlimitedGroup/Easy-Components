const fs = require('fs');

//  Получение имени класса 
const getClassName = (string) => {
  let regEx = 'class="(.*)"';
  let className = string.match(regEx)[1];
  return className
}

// Получение тела нужного класса
const getClassHtmlContent = (code, className) => {
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
const createComponentFile = (fileName) => {
  fs.open(fileName, 'w', (err) => {
    if(err) {}; // не удалось создать файл
  });
}

// Получаем все медиазапросы 
// Функция вернет код медиазапроса и код css без медиазапросов 
// Это нужно чтобы обрабатывать их раздельно
const splitCssCode = (code) => {
  // Делим код на строки
  let codeArr = code.split('\n')

  // Здесь будут храниться все медиазапросы
  let mediaRequestsCode = ''
  // Создаем копию кода откуда будем удалять все что принадлежит медиазапросам
  let simpleCssCodeArr = codeArr.slice(0)

  // Статус False показывает, что мы еще не находимся в теле медиазапроса
  let mediaStatus = false

  // Этот счетчик позволит понять когда медиазапрос заканчивается
  let counter = 0

  // Проходим по каждой строке массива
  for (let i = 0, len = codeArr.length; i < len; i++) {

    // Если она содержит медиазапрос то мы открываем статус
    if (codeArr[i].includes('@media')) {
      mediaStatus = true
    }

    // Если это часть медиазапроса - добавляем строку 
    // Проверяем на содержание закрывающего тега
    if (mediaStatus) {
      if (codeArr[i].includes('{')) {
        counter += 1
        mediaRequestsCode += codeArr[i] + '\n'
      } else if (codeArr[i].includes('}')) {
        counter -= 1
        mediaRequestsCode += codeArr[i] + '\n'
      } else {
        mediaRequestsCode += codeArr[i] + '\n'
      }

      // Удаляем эту строку из кода
      simpleCssCodeArr[i] = ''
    }

    // Если наш счетчик снова равен 0, то тело медиазапроса закончилось
    if (counter == 0) {
      mediaStatus = false
    }
  }

  // Удаляем все пустые строки
  // Собираем в текст css код без медиазапросов
  let simpleCssCode = ''
  simpleCssCodeArr.forEach(string => {
    if (string != '') {
      simpleCssCode += string + '\n'
    }
  });

  // Возвращаем медиазапросы и остальной код раздельно
  return [mediaRequestsCode, simpleCssCode]
}

const getSimpleCssCode = (code, cssClassName) => {
  let cssCodeArr = code.split('\n')

  let cssCodeResult = ''

  let openTagStatus = false
  // Проходим по каждой строке обычного кода и ищем нужный класс
  for (let i = 0, len = cssCodeArr.length; i < len; i++) {
    // Проверяем содержит ли строка имя класса
    // Если она его содержит, то нам надо точно уедиться,
    // что  это нужный нам класс так как hello2 через includes 
    // даст положительный ответ для hello

    if (cssCodeArr[i].includes(cssClassName)) {
      let string = cssCodeArr[i]
      let name = ''

      let j = 0
      // Проходим по каждому символу данной строки пока не дойдем до конца имени
      while(string[j] != '{' && string[j] != ':') {
        name += string[j]
        j++
      }

      // Сравниваем точным методом текущее имя с нужным
      // Удаляем из имени лишние пробелы и табы
      name = name.trim()
      if (cssClassName == name) {
        openTagStatus = true
      }
    }

    // Если мы все еще в нужном классе - добавляем строку в общий код
    if (openTagStatus) {
      cssCodeResult += cssCodeArr[i] + '\n'

      // Закрывающий тег означает конец класса
      if(cssCodeArr[i].includes('}')) {
        openTagStatus = false
      }
    }
  }

  // Возвращаем код класса
  return cssCodeResult
}

const getMediaRequestsCode = (code, className) => {
  let mediaRequestsCodeResult = ''
  // Создаем массив из медиазапросов
  let mediaRequestsCode = code.split('@')

  // Проходим по каждому блоку и ищем наш класс
  mediaRequestsCode.forEach(request => {
    if (request.includes(className)) {
      // Получаем код класса
      let simpleCssCode = getSimpleCssCode(request, className)
      
      // Если это точно был наш класс и мы получили код 
      // Записываем его в результат
      if (simpleCssCode != '') {
        let codeArr = ('@' + request).split('\n')
        // Так как медиазапрос имеет только одну вложенность
        // добавляем закрывающий тег и нулевую строчку которая содержит 
        // информацию о медиазапросе
        currentResult = codeArr[0] + '\n' + simpleCssCode + '}' + '\n'
        mediaRequestsCodeResult += currentResult
      }
    }
  });

  // Возвращаем результат
  return mediaRequestsCodeResult
}

// Генерация и запись css файла для компонента
const generateCssCode = (code, cssClassName, fileName) => {
  // Получаем код медиазапросов и код обычного css
  // Мы обрабатываем их отдельно 
  // Это нужно чтобы в случае медиазапросов добавлять нужные параметры
  let mediaAndSimpleCss = splitCssCode(code)
  let wholeMediaReqCode = mediaAndSimpleCss[0]
  let wholeSimpleCssCode = mediaAndSimpleCss[1]

  // Получаем css код нужного нам класса
  let simpleCssCode = getSimpleCssCode(wholeSimpleCssCode, cssClassName)
  let mediaRequestsCode = getMediaRequestsCode(wholeMediaReqCode, cssClassName)

  let result = simpleCssCode + mediaRequestsCode

  fs.writeFileSync(fileName, result)

}

// Подсчет табуляции в начале строки
const tabCounter = (code) => {
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
				if ((i+2) == len) {
					code += tabs + codeArr[i]
				} else {
					code += tabs + codeArr[i] + '\n'
				}
			}
		}
	}

	return code
}

// Находим все компоненты и пишем их импорты
const generateJsImport = (code) => {
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
        importCode += `import ${componentName} from './${componentName}'\n`
      }
		}
	});

	return importCode
}
// Генерация и запись js файла для компонента
const createJsxCode = (fileName, className, classCode) => {
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
const createComponentFolder = (folderName) => {
  try {
    fs.mkdirSync(folderName);
  } catch (err) {}
}

// Создание компонента
const createComponent = (componentName, componentCode, componentCssCode, parentPath) => {
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
          let childComponentCode = getClassHtmlContent(componentCode, childComponentName)

					// Создаем дочерний компонент
          createComponent(childComponentName, childComponentCode, componentCssCode,  folderPath)

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
  let cssComponentName = '.' + componentName
  generateCssCode(componentCssCode, cssComponentName, cssFile)
};

// Первичное чтение файла
const start = () => {
  // Читаем настройки из json
  let contents = fs.readFileSync("settings.json");
  let jsonContent = JSON.parse(contents);

  // Получаем необходимые данные: 
  //  - имя файла
  //  - класс с котрого надо начать
  //  - папка в которую надо вложить компоненты
  let htmlFileName = jsonContent.htmlPath
  let cssFileName = jsonContent.cssPath
  let firstClassName = jsonContent.firstClassName
  let firstFolder = jsonContent.resultPath

  //
  let htmlFileContent = fs.readFileSync(htmlFileName, 'utf8');
  let cssFileContent =  fs.readFileSync(cssFileName, "utf8");

  // Получаем тело класса с которого надо начать
  let htmlCode = getClassHtmlContent(htmlFileContent, firstClassName)
  // Создание первого компонента
  createComponent(firstClassName, htmlCode, cssFileContent, firstFolder)
}

// Запуск программы
start()
