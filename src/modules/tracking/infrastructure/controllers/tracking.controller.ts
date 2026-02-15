import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TrackingUseCases } from '../../application/use-cases/tracking.use-cases';
import {
  CreateTrackingEventDto,
  TrackingEventResponseDto,
} from '../../application/dtos/tracking.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { ResponseInterceptor } from '../../../../shared/interceptors/response.interceptor';

@ApiTags('tracking')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@Controller('packages/:packageId/tracking')
export class TrackingController {
  constructor(private readonly trackingUseCases: TrackingUseCases) {}

  @Post()
  @ApiOperation({ summary: 'Registrar evento de seguimiento de un paquete' })
  @ApiParam({ name: 'packageId', description: 'UUID del paquete' })
  @ApiResponse({ status: 201, type: TrackingEventResponseDto })
  @HttpCode(HttpStatus.CREATED)
  registerEvent(
    @Param('packageId', ParseUUIDPipe) packageId: string,
    @Body() dto: CreateTrackingEventDto,
    @CurrentUser() user: any,
  ): Promise<TrackingEventResponseDto> {
    return this.trackingUseCases.registerEvent(packageId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar historial completo de seguimiento de un paquete' })
  @ApiParam({ name: 'packageId', description: 'UUID del paquete' })
  @ApiResponse({ status: 200, type: [TrackingEventResponseDto] })
  getHistory(
    @Param('packageId', ParseUUIDPipe) packageId: string,
  ): Promise<TrackingEventResponseDto[]> {
    return this.trackingUseCases.getHistory(packageId);
  }
}
