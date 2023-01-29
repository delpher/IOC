import Container from "../src/container.js";
import "chai-jasmine";
import {some} from "./some.helper.mjs";

describe("Container", function () {
    let container;

    beforeEach(function () {
        container = new Container();
    });

    it("should resolve instance from instance registration", function () {
        const instance = {};
        container.registerInstance("name", instance);
        expect(container.resolve("name")).toBe(instance);
    });

    it("should resolve instance from factory registration", function () {
        const instance = {};

        const factory = function (c) {
            expect(c).toBe(container);
            return instance;
        };

        container.registerFactory("name", factory);

        expect(container.resolve("name")).toBe(instance);
    });

    it("should resolve instance from type registration", function (done) {
        function Constructor() {
            done();
        }

        container.registerType("name", Constructor);

        const instance = container.resolve("name");
        expect(typeof instance).toBe("object");
    });

    it("should resolve constructor from constructor registration", function (done) {
        const expectedDependency = some("dependency");
        const expectedArgument = some("argument");

        Constructor.$imports = ["dependency"];

        function Constructor(dependency, argument) {
            expect(dependency).toBe(expectedDependency);
            expect(argument).toBe(expectedArgument);
            done();
        }

        container.registerConstructor("constructor", Constructor);
        container.registerInstance("dependency", expectedDependency);

        const constructor = container.resolve("constructor");

        new constructor(expectedArgument);
    });

    it("should not resolve dependencies on constructor registration resolve", function (done) {
        function Dependency() {
            done.fail("Should not be executed on constructor registration resolve");
        }

        Constructor.$imports = ["dependency"];

        function Constructor() {
        }

        container.registerConstructor("constructor", Constructor);
        container.registerType("dependency", Dependency);

        const constructor = container.resolve("constructor");

        expect(constructor).toBeDefined();
        done();
    });

    it("should resolve function from factory function registration", function (done) {
        const expectedDependency = some("dependency");
        const expectedArgument = some("argument");

        FactoryFunction.$imports = ["dependency"];

        function FactoryFunction(dependency, argument) {
            expect(dependency).toBe(expectedDependency);
            expect(argument).toBe(expectedArgument);
            done();
        }

        container.registerFactoryFunction("factory", FactoryFunction);
        container.registerInstance("dependency", expectedDependency);

        const factory = container.resolve("factory");

        factory(expectedArgument);
    });

    it("should not bind context when resolving constructor", function (done) {
        const expectedContext = {id: some("id")};

        function Constructor() {
            expect(this).toBe(expectedContext);
            done();
        }

        container.registerConstructor("constructor", Constructor);

        const constructor = container.resolve("constructor");

        constructor.call(expectedContext);
    });

    it("should preserve prototype when resolving constructor", function () {
        const expectedPrototype = {id: some("id")};
        const name = some("constructor");

        Ctor.$imports = ["some"];

        function Ctor() {
        }

        Ctor.prototype = expectedPrototype;

        container.registerType("some", function () {
        });
        container.registerConstructor(name, Ctor);
        const constructor = container.resolve(name);

        expect(constructor.prototype).toBe(expectedPrototype);
    });

    it("should resolve singleton from instance registration", function () {
        const instance = {};
        container.registerInstance("name", instance, Container.Singleton);

        const instance1 = container.resolve("name");
        const instance2 = container.resolve("name");

        expect(instance1).toBe(instance);
        expect(instance2).toBe(instance);
    });

    it("should resolve singleton from factory registration", function () {
        const instance = {};

        const factory = jasmine.createSpy("factory");
        factory.and.returnValue(instance);

        container.registerFactory("name", factory, Container.Singleton);

        const instance1 = container.resolve("name");
        const instance2 = container.resolve("name");

        expect(instance1).toBe(instance);
        expect(instance2).toBe(instance);
        expect(factory).toHaveBeenCalledTimes(1);
    });

    it("should resolve singleton from type registration", function () {
        let invokedTimes = 0;

        function MyClass() {
            invokedTimes++;
        }

        container.registerType("name", MyClass, Container.Singleton);

        const instance1 = container.resolve("name");
        const instance2 = container.resolve("name");

        expect(instance1).toBe(instance2);
        expect(invokedTimes).toBe(1);
    });

    it("should resolve from parent container", function () {
        const instance1 = {};
        const instance2 = {};
        const instance3 = {};

        container.registerInstance("name1", instance1);

        const childContainer = container.createChild();
        childContainer.registerInstance("name2", instance2);

        const childOfChildContainer = childContainer.createChild();
        childOfChildContainer.registerInstance("name3", instance3);

        expect(childOfChildContainer.resolve("name1")).toBe(instance1);
        expect(childOfChildContainer.resolve("name2")).toBe(instance2);
        expect(childOfChildContainer.resolve("name3")).toBe(instance3);
    });

    it("should override parent container registration", function () {
        const instance1 = {instanceId: Math.random()};
        const instance2 = {instanceId: Math.random()};

        const childContainer = container.createChild();

        container.registerInstance("name", instance1);
        childContainer.registerInstance("name", instance2);

        expect(container.resolve("name")).toBe(instance1);
        expect(childContainer.resolve("name")).toBe(instance2);
    });

    it("should throw if no registration", function () {
        expect(function () {
            container.resolve("not registered");
        })
            .toThrowError("Missing registration for: 'not registered'");
    });

    describe("dependency overrides", function () {

        it("should override dependency for type registration", function () {
            assertDependencyOverride(function (name, what) {
                container.registerType(name, what);
            });
        });

        it("should override dependency for singleton type registration", function () {
            assertDependencyOverride(function (name, what) {
                container.registerType(name, what, Container.Singleton);
            });
        });

        it("should override dependency for constructor registration", function () {
            assertDependencyOverride(function (name, what) {
                container.registerConstructor(name, what);
            }, function (name) {
                return new (container.resolve(name));
            });
        });

        function assertDependencyOverride(registration, resolve) {
            container.registerInstance("original-dep", "original");
            container.registerInstance("overriden-dep", "overriden");
            registration("no-override", TestClass);
            registration("with-override", TestClass);
            container.override("with-override", {"original-dep": "overriden-dep"});

            TestClass.$imports = ["original-dep"];

            function TestClass(dependency) {
                this.dependency = dependency;
            }

            const testClass1 = (resolve || container.resolve)("no-override");
            const testClass2 = (resolve || container.resolve)("with-override");

            expect(testClass1.dependency).toBe("original");
            expect(testClass2.dependency).toBe("overriden");
        }
    });

    it("should resolve dependencies recursively", function (done) {
        const service = {};
        let createdClient;

        function ClientClass(svc) {
            expect(svc).toBe(service);
            createdClient = this;
        }

        ClientClass.$imports = ["service"];

        function ClientOfClientClass(client) {
            expect(client).toBe(createdClient);
            done();
        }

        ClientOfClientClass.$imports = ["client"];

        container.registerInstance("service", service);
        container.registerType("client", ClientClass);
        container.registerType("client-of-client", ClientOfClientClass);

        container.resolve("client-of-client");
    });

    it("should resolve type with arguments", function () {
        function TestClass() {
            this.args = Array.prototype.slice.call(arguments);
        }

        container.registerType("test", TestClass);

        const instance = container.resolve("test", "arg1", 2, 3);

        expect(instance.args).to.deep.eq(["arg1", 2, 3]);
    });

    it("should create instance of correct type", function () {
        ExpectedType.$imports = ["import"];

        function ExpectedType() {
        }

        container.registerType("type", ExpectedType);
        container.registerConstructor("constructor", ExpectedType);
        container.registerInstance("import", some("import"));

        let instance = container.resolve("type");
        expect(instance instanceof ExpectedType).toBe(true);

        const ctor = container.resolve("constructor");
        instance = new ctor();
        expect(instance instanceof ExpectedType).toBe(true);
    });
});
