# DI Container

A simple and lightweight DI container for JavaScript.

## Getting started

```npm i ioc-container-js```

### Node

```javascript
const Container = require('ioc-container-js')
const container = new Container();

class MyClass {
    constructor(service) {
        this.service = service;
    }
}

MyClass.$imports = ['service'];

class Service {
}

container.registerType('service', Service);
container.registerType('class', MyClass);

var my = container.resolve('class');
```

### Javascript

```javascript
// Plain
var container = new Container();

// AMD
define(['container'], function (Container) {
    var container = new Container();
});
```

## Major features

- Resolving from instance
- Resolving from factory
- Resolving from constructor
- Singletons
- Hierarchical containers
- Recursive dependency resolution

## Examples

### Register/Resolve instance

```javascript
function MyClass() {
}

var instance = new MyClass();
var container = new Container();

container.registerInstance('my-class', instance);
container.resolve('my-class');
```

### Register/Resolve factory

```javascript
function MyClass() {
}

var container = new Container();
var factory = function (container) {
    return new MyClass();
};

container.registerFactory('my-class', factory);
container.resolve('my-class');
```

### Register/Resolve type

```javascript
function MyClass() {
}

var container = new Container();

container.registerType('my-class', MyClass);
container.resolve('my-class');
```

### Register/Resolve singleton with factory

```javascript
function MyClass() {
}

var container = new Container();
var factory = function (container) {
    return new MyClass();
};

container.registerFactory('my-class', factory, Container.Singleton);
container.resolve('my-class');
```

### Register/Resolve singleton with type

```javascript
function MyClass() {
}

var container = new Container();

container.registerType('my-class', MyClass, Container.Singleton);
container.resolve('my-class');
```

### Hierarchical containers

```javascript
function ClassA() {
}

function ClassB() {
}

var parent = new Container();
parent.registerType('a-class', ClassA);

var child = parent.createChild();
child.registerType('b-class', ClassB);

var a = child.resolve('a-class');
var b = child.resolve('b-class');

parent.resolve('b-class'); // <-- throws error
```

### Recursive resolution

```javascript
function Service() {
}

function Client(svc) {
}

Client.$imports = ['service'];

function ClientOfClient(client) {
}

ClientOfClient.$imports = ['client'];

var container = new Container();

container.registerType('service', Service);
container.registerType('client', Client);
container.registerType('client-of-client', ClientOfClient);

var clientOfClient = container.resolve('client-of-client');
```

### Register/Resolve type with additional parameters

```javascript
function MyClass(dependency, parameter1, parameter2) {
}

MyClass.$imports = ["dependency"];

var container = new Container();

container.registerInstance("dependency", {});
container.registerType("my-class");

container.resolve("my-class", "value 1", "value 2");
```

### Register/Resolve Constructor(Factory Function)
```javascript
function MyClass(dependency, argument) {
}

MyClass.$imports = ["dependency"];

var container = new Container();

container.registerInstance("dependency", {});
container.registerConstructor("my-class-constructor", MyClass);
// container.registerFactoryFunction('my-class-factory-constructor', MyClass);

const MyClassConstructor = container.resolve("my-class-constructor");
new MyClassConstructor("argument value");
```

### Overriding dependencies
```javascript
function MyClass(dependency) {
}

MyClass.$imports = ["dependency"];

var container = new Container();

container.registerInstance("dependency", {});
container.registerInstance("override", {});
container.registerType("my-class");

container.override("my-class", {"dependency": "override"});
```