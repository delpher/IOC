(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function () {
            return (root.Container = factory());
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = (root.Container = factory());
    } else {
        root.Container = factory();
    }
}(this, function () {
    function Container(parentContainer) {
        const self = this;
        const registrations = {};

        self.registerInstance = function (name, instance) {
            registrations[name] = {
                resolve: function () {
                    return instance;
                }
            };
        };

        self.registerFactory = function (name, factory, LifeTime) {
            LifeTime = LifeTime || Container.DefaultLifetime;

            registrations[name] = new LifeTime({
                resolve: function () {
                    return factory(self);
                }
            });
        };

        self.registerType = function (name, constructor, LifeTime) {
            LifeTime = LifeTime || Container.DefaultLifetime;

            registrations[name] = new LifeTime({
                resolve: function (args) {
                    const ctor = self.satisfyImports(constructor, args, this.overrides);
                    return new ctor();
                },
                override: function (overrides) {
                    this.overrides = overrides;
                }
            });
        };

        self.registerConstructor = function (name, constructor) {
            registrations[name] = {
                resolve: function () {
                    return self.satisfyImports(constructor, undefined, this.overrides);
                },
                override: function (overrides) {
                    this.overrides = overrides;
                }
            };
        };

        self.registerFactoryFunction = self.registerConstructor;

        self.createChild = function () {
            return new Container(self);
        };

        self.override = function (name, overrides) {
            registrations[name].override(overrides);
        };

        self.resolve = function (name) {
            const registration = registrations[name];
            if (registration) {
                return resolveFrom(registration, arguments);
            }

            if (parentContainer) {
                return parentContainer.resolve(name);
            }

            throw new Error("Missing registration for: '" + name + "'");
        };

        function resolveFrom(registration, argsObject) {
            const args = Array.prototype.slice.call(argsObject, 1);
            return registration.resolve(args);
        }

        self.satisfyImports = function (constructor, constructorArgs, overrides) {
            Ctor.prototype = constructor.prototype;

            return Ctor;

            function Ctor() {
                const resultArgs = [];
                const args = Array.prototype.slice.call(arguments);
                const resolvedImports = (constructor.$imports || []).map(function (dependency) {
                    try {
                        const dependencyName = resolveDependencyName(overrides, dependency);
                        return self.resolve(dependencyName);
                    } catch (error) {
                        throw "Error while resolving '" + constructor + "': '" + error + "'";
                    }
                });

                Array.prototype.push.apply(resultArgs, resolvedImports);
                Array.prototype.push.apply(resultArgs, constructorArgs);
                Array.prototype.push.apply(resultArgs, args);
                return constructor.apply(this, resultArgs);
            }
        };

        function resolveDependencyName(overrides, dependency) {
            return overrides && overrides[dependency]
                ? overrides[dependency]
                : dependency;
        }
    }

    Container.DefaultLifetime = function (registration) {
        this.resolve = function (args) {
            return registration.resolve(args);
        };

        this.override = function (overrides) {
            registration.override(overrides);
        };
    };

    Container.Singleton = function (registration) {
        let instance = null;

        this.resolve = function () {
            if (instance) {
                return instance;
            }
            return (instance = registration.resolve());
        };

        this.override = function (overrides) {
            registration.override(overrides);
        };
    };

    return Container;
}));