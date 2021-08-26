import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CryptocompareService } from './cryptocompare.service';
import { PriceRequest } from './price.gateway';

@Controller('service')
export class ServiceController {
  constructor(protected readonly service: CryptocompareService) {}

  @UsePipes(new ValidationPipe())
  @Get('price')
  price(@Query() { fsyms, tsyms }: PriceRequest) {
    return this.service.priceMultifull(fsyms, tsyms);
  }
}
