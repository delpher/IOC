describe('Container', function() {
    var container;

    beforeEach(function() {
       container = new Container();
    });

    it('should resolve instance from instance registration', function () {
        var instance = {};
        container.registerInstance('name', instance);
        expect(container.resolve('name')).toBe(instance);
    });

    it('should resolve instance from factory registration', function () {
        var instance = {};

        var factory = function(c) {
            expect(c).toBe(container);
            return instance;
        };

        container.registerFactory('name', factory);

        expect(container.resolve('name')).toBe(instance);
    });

    // resolve instance from constructor registration

    // resolve singleton from instance registration

    // resolve singleton from factory registration

    // resolve singleton from constructor registration

    // resolve dependencies recursively

    // resolve from child container

    // satisfy imports no dependencies

    // satisfy imports with dependencies
});