import { TitaniumElementRegistry } from 'vdom/index';

describe('TitaniumElementRegistry', () => {
    let registry: TitaniumElementRegistry;

    beforeEach(() => {
        registry = TitaniumElementRegistry.getInstance();
        registry.registerElement({
            tagName: 'view',
            resolveFactory: () => Ti.UI.createView,
            meta: { typeName: 'Ti.UI.View' }
        });
        registry.registerElement({
            tagName: 'list-view',
            resolveFactory: () => Ti.UI.createListView,
            meta: { typeName: 'Ti.UI.ListView' }
        });
    });

    afterEach(() => {
        (TitaniumElementRegistry as any)._instance = null;
    });

    describe('getInstance', () => {
        it('should return the same instance on consecutive calls', () => {
            const reg = TitaniumElementRegistry.getInstance();
            expect(registry).toBe(reg);
        });
    });

    describe('registerElement', () => {
        it('should register element', () => {
            expect(registry.hasElement('view')).toBeTruthy();
        });
    });

    describe('unregisterElement', () => {
        it('should unregister previously registered element', () => {
            expect(registry.hasElement('view')).toBeTruthy();
            registry.unregisterElement('view');
            expect(registry.hasElement('view')).toBeFalsy();
        });

        it('should throw if element not registerd', () => {
            expect(registry.hasElement('foo')).toBeFalsy();
            expect(() => registry.unregisterElement('foo')).toThrow();
        });
    });

    describe('hasElement', () => {
        it('should find element by tag name', () => {
            expect(registry.hasElement('view')).toBeTruthy();
        });

        it('should normalize tag name', () => {
            expect(registry.hasElement('ListView')).toBeTrue();
            expect(registry.hasElement('list-view')).toBeTrue();
        });

        it('should return false if element not found', () => {
            expect(registry.hasElement('other-view')).toBeFalsy();
        });
    });

    describe('getElement', () => {
        it('should get element by tag name', () => {
            const element = registry.getElement('view');
            expect(element).toBeTruthy();
        });

        it('should normalize tag name', () => {
            expect(registry.getElement('ListView')).toBeTruthy();
            expect(registry.getElement('list-view')).toBeTruthy();
        });

        it('should throw if element not found', () => {
            expect(() => registry.getElement('foo')).toThrow();
        });
    });

    describe('getViewFactory', () => {
        it('should get view factory function by tag name', () => {
            const createFunction = registry.getViewFactory('view');
            expect(createFunction).toBeTruthy();
            expect(createFunction).toEqual(jasmine.any(Function));
        });

        it('should normalize tag name', () => {
            expect(registry.getViewFactory('ListView')).toBeTruthy();
            expect(registry.getViewFactory('list-view')).toBeTruthy();
        });

        it('should throw if element not found', () => {
            expect(() => registry.getViewFactory('foo')).toThrow();
        });
    });

    describe('getViewMetadata', () => {
        it('should get view metadata by tag name', () => {
            const expectedMetadata = {
                typeName: 'Ti.UI.View',
                some: 'data'
            };
            registry.registerElement({
                tagName: 'the-view',
                resolveFactory: () => Ti.UI.createView,
                meta: expectedMetadata
            });
            const actualMetadata = registry.getViewMetadata('the-view');
            expect(actualMetadata).toBeTruthy();
            expect(actualMetadata).toEqual(expectedMetadata);
        });

        it('should normalize tag name', () => {
            expect(registry.getViewMetadata('ListView')).toBeTruthy();
            expect(registry.getViewMetadata('list-view')).toBeTruthy();
        });

        it('should throw if element not found', () => {
            expect(() => registry.getViewMetadata('foo')).toThrow();
        });
    });

    describe('setViewMetadata', () => {
        it('should set view metadata by tag name', () => {
            const expectedMetadata = {
                typeName: 'Ti.UI.View',
                some: 'data'
            };
            registry.setViewMetadata('view', expectedMetadata);
            const actualMetadata = registry.getViewMetadata('view');
            expect(actualMetadata).toBeTruthy();
            expect(actualMetadata).toEqual(expectedMetadata);
        });

        it('should throw if element not found', () => {
            expect(() => registry.setViewMetadata('foo', { typeName: 'Ti.UI.View' })).toThrow();
        });
    });
});
