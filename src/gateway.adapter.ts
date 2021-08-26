import { WsAdapter } from '@nestjs/platform-ws';
import { MessageMappingProperties, SubscribeMessage } from '@nestjs/websockets';
import { empty, Observable } from 'rxjs';

const DEFAULT_MESSAGE = 'message:default';

/**
 * Implements a simplified version of the default ws adapter.
 * Needed for the application to meet the response example criteria.
 */
export class GatewayAdapter extends WsAdapter {
  bindMessageHandler(
    buffer: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ): Observable<any> {
    try {
      const message = JSON.parse(buffer.data);
      const messageHandler = handlers.find(
        (handler) => handler.message === DEFAULT_MESSAGE,
      );

      // Implement error handling here to make sure websocket
      // is notified about any validation/request error.
      return transform(messageHandler.callback(message));
    } catch {
      return empty();
    }
  }
}

export const SubscribeGatewayMessage: MethodDecorator =
  SubscribeMessage(DEFAULT_MESSAGE);
