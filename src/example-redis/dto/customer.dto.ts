import { OmitType } from "@nestjs/swagger";

export class CustomerDto {
  customer_uuid: string;
  plants: PlantDto[];
  head_quarter: string;
  default_timezone: string;
  logo_url: string;
  notes: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class PlantDto {
  plant_uuid: string;
  name: string;
  location: string;
  time_zone: string;
  daylight_saving_offset: number;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class CreateCustomerDto extends OmitType(CustomerDto, [
  "customer_uuid",
  "created_at",
  "updated_at",
  "deleted_at",
]) {}
