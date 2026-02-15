import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PackageUseCases } from '../../application/use-cases/package.use-cases';
import {
  CreatePackageDto,
  PackageResponseDto,
  UpdatePackageStatusDto,
} from '../../application/dtos/package.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { UserRole } from '../../../users/domain/entities/user.entity';
import { ResponseInterceptor } from '../../../../shared/interceptors/response.interceptor';

@ApiTags('packages')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packageUseCases: PackageUseCases) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo paquete' })
  @ApiResponse({ status: 201, type: PackageResponseDto })
  @HttpCode(HttpStatus.CREATED)
  createPackage(
    @Body() dto: CreatePackageDto,
    @CurrentUser() user: any,
  ): Promise<PackageResponseDto> {
    return this.packageUseCases.createPackage(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los paquetes (admin) o los propios (usuario)' })
  async getPackages(@CurrentUser() user: any): Promise<PackageResponseDto[]> {
    if (user.role === UserRole.ADMIN) {
      return this.packageUseCases.getAllPackages();
    }
    return this.packageUseCases.getMyPackages(user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Ver mis paquetes registrados' })
  getMyPackages(@CurrentUser() user: any): Promise<PackageResponseDto[]> {
    return this.packageUseCases.getMyPackages(user.id);
  }

  @Get('tracking/:trackingCode')
  @ApiOperation({ summary: 'Buscar paquete por código de rastreo' })
  @ApiParam({ name: 'trackingCode', example: 'TRK-20240101-00001' })
  getByTrackingCode(
    @Param('trackingCode') trackingCode: string,
  ): Promise<PackageResponseDto> {
    return this.packageUseCases.getPackageByTrackingCode(trackingCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener datos de un paquete por ID' })
  @ApiParam({ name: 'id', description: 'UUID del paquete' })
  @ApiResponse({ status: 200, type: PackageResponseDto })
  getPackageById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<PackageResponseDto> {
    return this.packageUseCases.getPackageById(id, user.id, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del paquete (admin)' })
  @ApiParam({ name: 'id', description: 'UUID del paquete' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageStatusDto,
  ): Promise<PackageResponseDto> {
    return this.packageUseCases.updateStatus(id, dto);
  }
}
