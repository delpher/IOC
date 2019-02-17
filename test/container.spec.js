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
        function MyClass() { invokedTimes++; }

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
        expect(function() { container.resolve('not registered'); })
            .toThrowError('Missing registration for: \'not registered\'');
    });

    it('should satisfy imports with no dependencies', function () {
        function ClientClass() {}

        expect(container.satisfyImports(ClientClass)).toBe(ClientClass);
    });

    // satisfy imports with dependencies

    // resolve dependencies recursively
});