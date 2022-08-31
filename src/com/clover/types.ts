export {Logger} from "./remote/client/util/Logger";
export {DebugConfig} from "./remote/client/util/DebugConfig";
export {HttpSupport} from "./util/HttpSupport";
export {ImageUtil} from "./util/ImageUtil";

export {CloverConnector} from "./remote/client/CloverConnector";
export {CloverDeviceFactory} from "./remote/client/device/CloverDeviceFactory";
export {CloverDeviceConfiguration} from "./remote/client/device/CloverDeviceConfiguration";

export {WebSocketCloverDeviceConfiguration} from "./remote/client/device/WebSocketCloverDeviceConfiguration";
export {WebSocketPairedCloverDeviceConfiguration, WebSocketPairedCloverDeviceConfigurationBuilder} from "./remote/client/device/WebSocketPairedCloverDeviceConfiguration";
export {WebSocketCloudCloverDeviceConfiguration, WebSocketCloudCloverDeviceConfigurationBuilder} from "./remote/client/device/WebSocketCloudCloverDeviceConfiguration";

export {CloverTransport} from "./remote/client/transport/CloverTransport";
export {CloverTransportObserver} from "./remote/client/transport/CloverTransportObserver";
export {WebSocketCloverTransport} from "./remote/client/transport/websocket/WebSocketCloverTransport";
export {WebSocketState} from "./websocket/WebSocketState";
export {CloverWebSocketInterface} from "./websocket/CloverWebSocketInterface";
export {BrowserWebSocketImpl} from "./websocket/BrowserWebSocketImpl";

export {CloverConnectorFactoryBuilder} from "./remote/client/CloverConnectorFactoryBuilder";
export {ICloverConnectorFactory} from "./remote/client/ICloverConnectorFactory";
export {CloverConnectorFactory} from "./remote/client/CloverConnectorFactory";
export {CardEntryMethods} from "./remote/client/CardEntryMethods";

export * from "remote-pay-cloud-api";

export var CloverID : {
    getNewId(): string;
    isValidBase32Id(id: string): boolean;
    guid(): string;
};

