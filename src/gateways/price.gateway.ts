import { MessageBody, WebSocketGateway } from '@nestjs/websockets';
import { SubscribeGatewayMessage } from '../gateway.adapter';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CryptocompareService } from './cryptocompare.service';
import { IsNotEmpty } from 'class-validator';

export class PriceRequest {
  @IsNotEmpty()
  fsyms: string | string[];
  @IsNotEmpty()
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
