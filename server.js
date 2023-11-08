const fs = require('fs')
const WebSocket = require('ws')
const axios = require('axios')

const keywords = {
	'house': ['https://i.ibb.co/B61xCJ0/house.jpg', 'https://i.ibb.co/KzKZvKM/house2.jpg'],
	'cat': ['https://i.ibb.co/Sr5S6rY/Cat.jpg', 'https://i.ibb.co/DDNV2MZ/cat2.jpg'],
	'tv': ['https://i.ibb.co/rHtcczN/tv.jpg', '	https://i.ibb.co/8c7408K/tv2.jpg']
}

const wsServer = new WebSocket.Server({port: 8181})

let MAX_THREADS = 1; 
fs.readFile('config.txt', 'utf8', function(err, value) {
  if (!err) {
    MAX_THREADS = Number(value);
    console.log('Максимальное количество потоков = ', MAX_THREADS);
  } else {
    console.error('Ошибка чтения config.txt', err);
  }
});


wsServer.on('connection', onConnect)
console.log('Сервер запущен. Порт 8080')

function onConnect(wsClient) {
	console.log("Новый пользователь")

	wsClient.on('close', function() {
		console.log("Пользователь отключился")
	})

	wsClient.on('message', function(message) {
		console.log(`Получено сообщение: ${message}`)
		let msg = JSON.parse(message)
		switch(msg.type.toString()) {
			case "url": 
				axios({
				    url: `${msg.data}`,
				    method: 'GET',
				    responseType: 'arraybuffer'
				})
				.then(resp => {
					var base64data = Buffer.from(resp.data, 'binary').toString('base64');
					wsClient.send(JSON.stringify({type: "data", key: `${msg.data}`, data: "data:image/jpeg;base64,"+base64data}))
				});
				break;
			case "text": 
				let url = keywords[msg.data]
				if(url) {
					var message = {type: "text", data: url}
					wsClient.send(JSON.stringify(message))
					console.log("Отправлено сообщение: "+JSON.stringify(message))
				} else {
					var message = {type: "text", data: 'Не найдено ключевое слово'}
					wsClient.send(JSON.stringify(message))
					console.log("Отправлено сообщение: "+JSON.stringify(message))
				}
				break
			default:
				console.log("Неизвестный тип сообщения")
		}
	})


}

