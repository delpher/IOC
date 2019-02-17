describe('Container', function () {
    var container;

    beforeEach(function () {
        container = new Container();
    });

    it('should resolve instance from instance registration', function () {
        var instance = {};
        container.registerInstance('name', instance);
        expect(container.resolve('name')).toBe(instance);
    });

    it('should resolve instance from factory registration', function () {
        var instance = {};

        var factory = function (c) {
            expect(c).toBe(container);
            return instance;
        };

        container.registerFactory('name', factory);

        expect(container.resolve('name')).toBe(instance);
    });

    it('should resolve instance from constructor registration', function (done) {
        function Constructor() {
            done();
        }

        container.registerType('name', Constructor);

        var instance = container.resolve('name');
        expect(typeof instance).toBe('object');
    });

    it('should resolve singleton from instance registration', function () {
        var instance = {};
        container.registerInstance('name', instance, Container.Singleton);

        var instance1 = container.resolve('name');
        var instance2 = container.resolve('name');

        expect(instance1).toBe(instance);
        expect(instance2).toBe(instance);
    });

    it('should resolve singleton from factory registration', function () {
        var instance = {};

        var factory = jasmine.createSpy('factory');
        factory.and.returnValue(instance);

        container.registerFactory('name', factory, Container.Singleton);

        var instance1 = container.resolve('name');
        var instance2 = container.resolve('name');

        expect(instance1).toBe(instance);
        expect(instance2).toBe(instance);
        expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should resolve singleton from constructor registration', function () {
        var invokedTimes = 0;

        function MyClass() {
            invokedTimes++;
        }

        container.registerType('name', MyClass, Container.Singleton);

        var instance1 = container.resolve('name');
        var instance2 = container.resolve('name');

        expect(instance1).toBe(instance2);
        expect(invokedTimes).toBe(1);
    });

    it('should resolve from parent container', function () {
        var instance1 = {};
        var instance2 = {};
        var instance3 = {};

        container.registerInstance('name1', instance1);

        var childContainer = container.createChild();
        childContainer.registerInstance('name2', instance2);

        var childOfChildContainer = childContainer.createChild();
        childOfChildContainer.registerInstance('name3', instance3);

        expect(childOfChildContainer.resolve('name1')).toBe(instance1);
        expect(childOfChildContainer.resolve('name2')).toBe(instance2);
        expect(childOfChildContainer.resolve('name3')).toBe(instance3);
    });

    it('should throw if no registration', function () {
        expect(function () {
            container.resolve('not registered');
        })
            .toThrowError('Missing registration for: \'not registered\'');
    });

    it('should resolve by constructor with no dependencies', function () {
        var invoked = false;

        function ClientClass() {
            invoked = true;
        }

        container.resolve(ClientClass);

        expect(invoked).toBe(true);
    });

    it('should resolve by constructor with dependencies', function (done) {
        var service1 = {};
        var service2 = {};
        var service3 = {};

        function ClientClass(svc1, svc2, svc3) {
            expect(svc1).toBe(service1);
            expect(svc2).toBe(service2);
            expect(svc3).toBe(service3);
            done();
        }

        ClientClass.$imports = ['service1', 'service2', 'service3'];

        container.registerInstance('service1', service1);
        container.registerInstance('service2', service2);
        container.registerInstance('service3', service3);

        container.resolve(ClientClass);
    });

    it('should resolve by constructor with arguments', function () {
        var service = {};

        function Person(svc, firstName, lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.svc = svc;
        }

        Person.$imports = ['service'];

        container.registerInstance('service', service);

        var person = container.resolve(Person, 'first name', 'last name');

        expect(person.firstName).toBe('first name');
        expect(person.lastName).toBe('last name');
        expect(person.svc).toBe(service);
    });

    it('should throw if neither constructor nor name given to resolve', function () {
        expect(function () {
            container.resolve({})
        })
            .toThrowError('Can not call resolve with object, must be name or constructor');
    });

    it('should resolve dependencies recursively', function (done) {
        var service = {};

        function ClientClass(svc) {
            expect(svc).toBe(service);
            done();
        }

        ClientClass.$imports = ['service'];

        function ClientOfClientClass(client) {
        }

        ClientOfClientClass.$imports = ['client'];

        container.registerInstance('service', service);
        container.registerType('client', ClientClass);

        container.resolve(ClientOfClientClass);
    });
});