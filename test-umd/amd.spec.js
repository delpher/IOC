define(['../src/container'], function(Container) {

   describe('Container UMD module', function() {

       it('should return Container', function() {
          expect(Container).toBeDefined();
          expect(Container.Singleton).toBeDefined();
          expect(Container.DefaultLifetime).toBeDefined();

          var container = new Container();
          expect(typeof container.registerType).toBe('function');
          expect(typeof container.registerInstance).toBe('function');
          expect(typeof container.registerFactory).toBe('function');
          expect(typeof container.resolve).toBe('function');
       });

   });
});