import { MessageBody, WebSocketGateway } from '@nestjs/websockets';
import { SubscribeGatewayMessage } from '../gateway.adapter';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CryptocompareService } from './cryptocompare.service';

export class PriceRequest {
  fsyms: string | string[];
  tsyms: string | string[];
}

@WebSocketGateway({
  path: '/service/price',
})
export class PriceGateway {
  constructor(protected readonly service: CryptocompareService) {}

  @UsePipes(new ValidationPipe())
  @SubscribeGatewayMessage
  handleMessage(@MessageBody() { fsyms, tsyms }: PriceRequest): any {
    return this.service.priceMultifull(fsyms, tsyms);
  }
}
