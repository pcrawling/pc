1. `mongod` - запуск  MongoDB
2. `mongo` - запуск mongo shell
   	* `show dbs` - показать все DB
	* `use %name%` - переключиться на DB
	* `show collections` - показать коллекции
	* `db.%collection%.find()` - показать содержимое
	* `db.%collection%.find().pretty()` - показать отформатированное содержимое
	* `db.%base%.drop()` - дропнуть базу
	* `db.%collection%.drop()` - дропнуть коллекцию
	* `db.%collection%.remove(<query>)` - удаление элемента коллекции
3. `node app.js` - dev
4. `node start.js` - with `forever` package
