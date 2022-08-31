import type {WebSocketListener} from './WebSocketListener'
import {WebSocketState} from './WebSocketState';
import {Logger} from '../remote/client/util/Logger';

/**
 * Used to abstract implementation details to allow for NodeJS and
 * Browser usage of the library.
 *
 * WebSocket Clover Interface.  Abstracts the WebSocket implementation so that the library is not tied to a
 * Browser implementation.
 *
 * Interface to connect a websocket implementation to.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 * or https://html.spec.whatwg.org/multipage/web-sockets.html
 */
export abstract class CloverWebSocketInterface {

    private listeners: Array<WebSocketListener>;

    // Create a logger
    private logger: Logger = Logger.create();

    private endpoint: string;

    private webSocket: any;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.listeners = new Array<WebSocketListener>();
    }

    /**
     * For JS impls, we need to abstract out the WebSocket so that the library can be used in
     * browsers and non-browsers.
     *
     * This MUST return immediately!  It cannot use any type of promise or deferral, or the listener
     * will not be properly attached before events begin firing.
     *
     * @param endpoint - the uri to connect to
     * @param accessToken - the access token that is used to ensure the merchant and device are associated to the token
     */
    public abstract createWebSocket(endpoint: string, accessToken): any;

    public connect(accessToken: string): CloverWebSocketInterface {
        this.webSocket = this.createWebSocket(this.endpoint, accessToken);
        if (typeof this.webSocket["addEventListener"] !== "function") {
            this.logger.error("FATAL: The websocket implementation being used must have an 'addEventListener' function.  Either use a supported websocket implementation (https://www.npmjs.com/package/ws) or override the connect method on CloverWebSocketInterface.");
        } else {
            this.webSocket.addEventListener("open", (event) => this.notifyOnOpen(event));
            this.webSocket.addEventListener("message", (event) => this.notifyOnMessage(event));
            this.webSocket.addEventListener("close", (event) => this.notifyOnClose(event));
            this.webSocket.addEventListener("error", (event) => this.notifyOnError(event));
        }
        return this;
    }

    private notifyOnOpen(event: Event): void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                // check event here for any additional data we can see - headers?
                listener.onConnected(this);
            }
            catch (e) {
                this.logger.error(e);
            }
        });
    }

    private notifyOnMessage(event: MessageEvent): void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                listener.onTextMessage(this, event.data);
            }
            catch (e) {
                this.logger.error(e);
            }
        });
    }

    /**
     * A simple error event is passed per the websocket spec - https://www.w3.org/TR/websockets/#concept-websocket-close-fail
     * It doesn't appear that an exact typing for the websocket error event is available, so I am using any.
     *
     * @param {any} event - simple event passed per websocket spec.
     */
    private notifyOnError(event: any): void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                // According to the spec, only CLOSING or OPEN should occur. This is a 'simple' event.
                // check event here for any additional data we can see - headers?
                if (this.getReadyState() == WebSocketState.CONNECTING) {
                    listener.onConnectError(this, event);
                } else if (this.getReadyState() == WebSocketState.CLOSING) {
                    listener.onUnexpectedError(this, event);
                } else if (this.getReadyState() == WebSocketState.CLOSED) {
                    listener.onDisconnected(this, event);
                } else if (this.getReadyState() == WebSocketState.OPEN) {
                    listener.onSendError(this, event);
                }
            }
            catch (e) {
                this.logger.error(e);
            }
        });
    }

    private notifyOnClose(event: CloseEvent): void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                listener.onCloseFrame(this, event.code, event.reason);
            }
            catch (e) {
                this.logger.error(e);
            }
        });
    }

    public sendClose(code?: number, reason?: string): CloverWebSocketInterface {
        this.logger.debug("Close sent code ", code, " reason ", reason);
        try {
            /** 1000 indicates normal closure.  To avoid InvalidAccessErrors if no code is available default to 1000.
             *  Per the websocket spec:
             *    "If the method's first argument is present but is not an integer equal to 1000 or in the range 3000 to 4999,
             *     throw an InvalidAccessError exception and abort these steps."
             */
            this.webSocket.close(code || 1000, reason || "NORMAL_CLOSURE");
        } catch (e) {
            this.logger.error('error disposing of transport.', e);
        }
        return this;
    }

    public sendText(data: string): CloverWebSocketInterface {
        /*
         Exceptions thrown

         INVALID_STATE_ERR
         The connection is not currently OPEN.
         SYNTAX_ERR
         The data is a string that has unpaired surrogates. (???)
         */
        this.webSocket.send(data);
        return this;
    }

    public getState(): WebSocketState {
        return this.getReadyState();
    }

    public isOpen(): boolean {
        return this.getReadyState() == WebSocketState.OPEN;
    }

    /**
     * Browser implementations do not do pong frames
     */
    public abstract sendPong(): CloverWebSocketInterface;

    /**
     * Browser implementations do not do ping frames
     */
    public abstract sendPing(): CloverWebSocketInterface;

    public addListener(listener: WebSocketListener): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: WebSocketListener): boolean {
        var indexOfListener = this.listeners.indexOf(listener);
        if (indexOfListener !== -1) {
            this.listeners.splice(indexOfListener, 1);
            return true;
        }
        return false;
    }

    public getListeners(): Array<WebSocketListener> {
        return this.listeners.slice();
    }

    // Wrapped functionality below
    public getUrl(): String {
        return this.webSocket.url;
    }

    public getReadyState(): WebSocketState {
        return this.webSocket.readyState;
    }

    public getBufferedAmount(): number {
        return this.webSocket.hasOwnProperty("bufferedAmount") ? this.webSocket.bufferedAmount : 0;
    }

    public getProtocol(): string {
        return this.webSocket.protocol;
    }
}
