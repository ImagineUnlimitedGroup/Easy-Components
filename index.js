const fs = require('fs')

//  Получение имени класса 
function getClassName(string) {
	var regEx = 'class="(.*)"';
	var className = string.match(regEx)[1];
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
	
	createComponentFolder(folderPath)
	// Создаем файл jsx
	createComponentFile(`${folderPath}/${componentName}.jsx`)
	createComponentFile(`${folderPath}/${componentName}.css`)

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
					
					createComponent(childComponentName, childComponentCode, folderPath)
				}
			}
		});
	}
};

// Первичное чтение файла
function start() {
	// Читаем настройки из json
	let contents = fs.readFileSync("settings.json");
	let jsonContent = JSON.parse(contents);

	// Получаем необходимые данные: 
	// 	- имя файла
	// 	- класс с котрого надо начать
	// 	- папка в которую надо вложить компоненты
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