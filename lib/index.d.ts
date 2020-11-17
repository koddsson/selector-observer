export default class SelectorObserver {
  constructor(rootNode: Node)
  disconnect(): void
  observe: typeof observe
}

export declare function observe<T extends Element>(
  selector: string,
  options: {
    constructor: {new (): T}
  } & Options<T>
): Observer
export declare function observe<T extends Element>(
  options: {
    selector: string
    constructor: {new (): T}
  } & Options<T>
): Observer
export declare function observe<T extends Element>(selector: string, initialize: InitializerCallback<T>): Observer
export declare function observe<T extends Element>(selector: string, options: Options<T>): Observer
export declare function observe<T extends Element>(options: {selector: string} & Options<T>): Observer

type Options<T> = {
  initialize?: InitializerCallback<T>
  add?: AddCallback<T>
  remove?: RemoveCallback<T>
  subscribe?: SubscribeCallback<T>
}

type InitializerCallback<T> = (el: T) => void | InitializerCallbacks<T>
type AddCallback<T> = (el: T) => void
type RemoveCallback<T> = (el: T) => void
type SubscribeCallback<T> = (el: T) => Subscription

type InitializerCallbacks<T> = {
  add?: AddCallback<T>
  remove?: RemoveCallback<T>
}

type Observer = {
  abort(): void
}

interface Subscription {
  unsubscribe(): void
}
