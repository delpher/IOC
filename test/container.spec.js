describe('Container', function() {
    var container;

    beforeEach(function() {
       container = new Container();
    });

    it('should resolve instance from instance registration', function () {
        var instance = {};
        container.registerInstance('Name', instance);
        expect(container.resolve('Name')).toBe(instance);
    });

    // resolve instance from factory registration

    // resolve instance from constructor registration

    // resolve singleton from instance registration

    // resolve singleton from factory registration

    // resolve singleton from constructor registration

    // resolve dependencies recursively

    // resolve from child container

    // satisfy imports no dependencies

    // satisfy imports with dependencies
});