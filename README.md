# DI Container
This is simple and lightweight DI container for JavaScript

## Major features
- Resolving by instance
- Resolving by factory
- Resolving by constructor
- Singletons
- Hierarchical containers
- Recursive dependency resolution

## Examples

### Register/Resolve instance
```javascript
function MyClass() {}
var instance = new MyClass();
var container = new Container();

container.registerInstance('my-class', instance);
container.resolve('my-class');
```

### Register/Resolve factory
```javascript
function MyClass() {}
var container = new Container();
var factory = function(cntnr) { return new MyClass(); }

container.registerFactory('my-class', factory);
container.resolve('my-class');
```

### Register/Resolve type
```javascript
function MyClass() {}
var container = new Container();

container.registerType('my-class', MyClass);
container.resolve('my-class');
```

### Register/Resolve singleton with factory
```javascript
function MyClass() {}
var container = new Container();
var factory = function(cntnr) { return new MyClass(); }

container.registerFactory('my-class', factory, Container.Singleton);
container.resolve('my-class');
```

### Register/Resolve singleton with type
```javascript
function MyClass() {}
var container = new Container();

container.registerType('my-class', MyClass, Container.Singleton);
container.resolve('my-class');
```

### Hierarchical containers
```javascript
function MyClass() {}

var container = new Container();
container.registerType('my-class', MyClass);

var child = container.createChild();
var myClass = child.resolve('my-class');
```
### Satisfy imports
Converts provided constructor into constructor
with filled in arguments
```javascript
function Service() {}

function Client(svc) {}
Client.$imports = ['service'];

function ClientOfClient(client) {}
ClientOfClient.$imports = ['client'];

var container = new Container();

container.registerType('service', Service);
container.registerType('client', Client);

var ctor = container.satisfyImports(ClientOfClient);
var clientOfClient = new ctor();
```