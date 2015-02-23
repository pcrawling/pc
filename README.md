1. mongod - запуск  MongoDB
2. mongo - запуск mongo shell
	* show dbs - показать все DB
	* use %name% - переключиться на DB
	* show collections - показать коллекции
	* db.%collectionName%.find() - показать содержимое
	* db.%collectionName%.find().pretty() - показать отформатированное содержимое
	* db.%baseName%.drop() - дрогнуть базу
	* db.%collectionName%.drop() - дропнуть коллекцию
3. node app.js - dev
4. node start.js - with `forever` package
