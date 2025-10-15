import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { UpdateRoleDto } from '../auth/dto/update-role.dto';
import {
  GetAllUsersDocs,
  GetUserByIdDocs,
  UpdateUserRoleDocs,
  DeleteUserDocs,
} from './users.swagger';

@ApiTags('Utilisateur')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @GetAllUsersDocs()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @GetUserByIdDocs()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @UpdateUserRoleDocs()
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.usersService.updateRole(id, updateRoleDto.roles);
  }

  @Delete(':id')
  @DeleteUserDocs()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

