import { IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class UpdateRoleDto {
  @ApiProperty({
    example: ['user', 'admin'],
    description: 'Array of roles to assign to user',
    enum: Role,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];
}

