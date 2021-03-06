import {
    ProxyFactory,
    TitaniumElementConstructor,
    ViewMetadata
} from '../elements/TitaniumElement';
import { camelize } from '../utils/string';

export type ProxyFactoryResolver<T extends Titanium.Proxy> = () => ProxyFactory<T>;

export interface TitaniumViewElementMeta<T extends Titanium.Proxy> {
    resolveFactory: ProxyFactoryResolver<T>;
    meta: ViewMetadata;
    elementClass?: TitaniumElementConstructor<T>;
}

interface ElementOptions<T extends Titanium.Proxy> extends TitaniumViewElementMeta<T> {
    tagName: string;
}

function normalizeTagName(name: string): string {
    return camelize(name).toLowerCase();
}

export class TitaniumElementRegistry {
    private static _instance: TitaniumElementRegistry;

    public defaultViewMetadata: Partial<ViewMetadata> = {};

    private elements: Map<string, TitaniumViewElementMeta<any>>;

    private constructor() {
        this.elements = new Map();
    }

    public static getInstance(): TitaniumElementRegistry {
        if (!this._instance) {
            this._instance = new TitaniumElementRegistry();
        }

        return this._instance;
    }

    public registerElement<T extends Titanium.Proxy>(options: ElementOptions<T>): void {
        const { meta, resolveFactory, elementClass } = options;
        const tagName = normalizeTagName(options.tagName);
        if (!this.hasElement(tagName)) {
            this.elements.set(tagName.toLowerCase(), {
                resolveFactory,
                meta: Object.assign({}, this.defaultViewMetadata, meta),
                elementClass
            });
        } else if (typeof Ti !== 'undefined') {
            Ti.API.warn(`Element <${tagName}> already registered. Unregister the current one before trying to register it again.`);
        }
    }

    public unregisterElement(tagName: string): void {
        tagName = normalizeTagName(tagName);
        this.ensureElementIsRegistered(tagName);
        this.elements.delete(tagName);
    }

    public getElement<T extends Titanium.Proxy>(tagName: string): TitaniumViewElementMeta<T> {
        tagName = normalizeTagName(tagName);
        this.ensureElementIsRegistered(tagName);
        return this.elements.get(tagName)!;
    }

    public hasElement(tagName: string): boolean {
        tagName = normalizeTagName(tagName);
        return this.elements.has(tagName);
    }

    public getViewFactory<T extends Titanium.Proxy>(tagName: string): ProxyFactory<T> {
        tagName = normalizeTagName(tagName);
        this.ensureElementIsRegistered(tagName);
        return this.getElement<T>(tagName).resolveFactory();
    }

    public getViewMetadata(tagName: string): ViewMetadata {
        return this.getElement(tagName).meta;
    }

    public setViewMetadata(tagName: string, meta: ViewMetadata) {
        this.getElement(tagName).meta = meta;
    }

    private ensureElementIsRegistered(tagName: string): void {
        if (!this.hasElement(tagName)) {
            throw new Error(`No Titanium view registerd for tag ${tagName}`);
        }
    }
}
