import { ElementNode, TextNode, TitaniumElement } from 'vdom/index';

import { createElement } from '../../helpers';

describe('TitaniumElement', () => {
    let element: TitaniumElement<any>;
    const topValue = 5;

    beforeEach(() => {
        element = createElement('View');
    });

    describe('lazy proxy creation', () => {
        it('should set attributes and bind event listeners', () => {
            const bgColorValue = '#000000';
            element = createElement('View', { backgroundColor: bgColorValue });
            const spy = jasmine.createSpy('clickEventHander');
            element.on('click', spy);
            const view = element.titaniumView;
            view.fireEvent('click', null);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getAttribute', () => {
        it('should get attribute from element if proxy not created yet', () => {
            spyOn(element, 'getElementAttribute').and.callThrough();
            (element as ElementNode).setAttribute('top', topValue);
            const value = element.getAttribute('top');
            expect(element.getElementAttribute).toHaveBeenCalled();
            expect(value).toEqual(topValue);
        });

        it('should get attribute from proxy if created', () => {
            element = createElement('View', { top: topValue });
            const spy = spyOn(element, 'getElementAttribute');
            // force proxy creation
            const view = element.titaniumView;
            const value = element.getAttribute('top');
            expect(spy).not.toHaveBeenCalled();
            expect(value).toEqual(topValue);
        });
    });

    describe('setAttribute', () => {
        it('should set attribute on element and proxy', () => {
            const view = element.titaniumView;
            element.setAttribute('top', topValue);
            expect(element.getAttribute('top')).toEqual(topValue);
            expect(view.top).toEqual(topValue);
        });

        it('should set namespaced attribute only on running platform', () => {
            element.setAttribute('top', topValue, Ti.Platform.osname);
            expect(element.getAttribute('top')).toEqual(topValue);
            expect(element.titaniumView.top).toEqual(topValue);

            element = createElement('View');
            element.setAttribute('top', topValue, 'non-existing-platform');
            expect(element.getAttribute('top')).toBeUndefined();
        });
    });

    describe('updateText', () => {
        it('should update the matching text property', () => {
            const text = 'text';
            const testConfigs = [{
                element: createElement('Label'),
                textProperty: 'text'
            }, {
                element: createElement('Button'),
                textProperty: 'title'
            }];

            for (const config of testConfigs) {
                element = config.element;
                const updateTextSpy = spyOn(element, 'updateText').and.callThrough();
                const testNode = new TextNode(text);
                element.insertBefore(testNode, null);

                expect(updateTextSpy).toHaveBeenCalled();
                expect((element.titaniumView as any)[config.textProperty]).toEqual(text);
            }
        });
    });

    describe('insertBefore', () => {
        it('should trigger text update if text node inserted', () => {
            element = createElement('Label');
            const updateTextSpy = spyOn(element, 'updateText');
            const testNode = new TextNode('text');
            element.insertBefore(testNode, null);

            expect(updateTextSpy).toHaveBeenCalled();
        });

        it('should not insert detached view into visual tree', () => {
            const parentElement = createElement('View');
            element.meta.detached = true;
            parentElement.appendChild(element);

            expect(parentElement.titaniumView.children.length).toEqual(0);
        });

        it('should not insert view into visual tree if parent detaches children', () => {
            const parentElement = createElement('View');
            parentElement.meta.detachChildren = true;
            parentElement.appendChild(element);

            expect(parentElement.titaniumView.children.length).toEqual(0);
        });

        it('should insert view at matching native position', () => {
            const parentElement = createElement('View');
            const firstChild = createElement('View');
            const lastChild = createElement('View');
            parentElement.appendChild(firstChild);
            parentElement.appendChild(lastChild);
            parentElement.insertBefore(element, lastChild);

            expect(parentElement.childNodes.item(0)).toBe(firstChild);
            expect(parentElement.childNodes.item(1)).toBe(element);
            expect(parentElement.childNodes.item(2)).toBe(lastChild);
            const parentView = parentElement.titaniumView;
            expect(parentView.children.length).toEqual(3);
            expect(parentView.children[0]).toEqual(firstChild.titaniumView);
            expect(parentView.children[1]).toEqual(element.titaniumView);
            expect(parentView.children[2]).toEqual(lastChild.titaniumView);
        });
    });

    describe('removeChild', () => {
        it('should remove view from parent', () => {
            const parentElement = createElement('View');
            expect(parentElement.titaniumView.children.length).toEqual(0);
            parentElement.appendChild(element);
            expect(parentElement.titaniumView.children.length).toEqual(1);
            parentElement.removeChild(element);
            expect(parentElement.titaniumView.children.length).toEqual(0);
        });
    });

    describe('on', () => {
        it('should lazily bind event listener', () => {
            const spy = jasmine.createSpy('clickEventHander');
            element.on('click', spy);
            element.titaniumView.fireEvent('click', null);

            expect(spy).toHaveBeenCalled();
        });

        it('should bind single event listener', () => {
            const spy = jasmine.createSpy('clickEventHander');
            const view = element.titaniumView;
            element.on('click', spy);
            view.fireEvent('click', null);

            expect(spy).toHaveBeenCalled();
        });

        it('should bind multiple event listeners', () => {
            const view = element.titaniumView;
            const spy1 = jasmine.createSpy('clickEventHander1');
            element.on('click', spy1);
            const spy2 = jasmine.createSpy('clickEventHander2');
            element.on('click', spy2);
            view.fireEvent('click', null);

            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
    });

    describe('off', () => {
        it('should remove event listener', () => {
            const view = element.titaniumView;
            const spy1 = jasmine.createSpy('clickEventHander1');
            element.on('click', spy1);
            const spy2 = jasmine.createSpy('clickEventHander2');
            element.on('click', spy2);
            element.off('click', spy2);
            view.fireEvent('click', null);

            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();

            element.off('click', spy1);
            view.fireEvent('click');

            expect(spy1.calls.count()).toEqual(1);
            expect(spy2.calls.count()).toEqual(0);
        });

        it('should remove event listener set for lazy binding', () => {
            const spy = jasmine.createSpy('clickEventHander');
            element.on('click', spy);
            element.off('click', spy);
            element.titaniumView.fireEvent('click', null);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});
