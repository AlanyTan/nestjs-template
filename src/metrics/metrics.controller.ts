/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Res, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { Response } from "express";

@Controller("metrics")
export class MetricsController extends PrometheusController {
  @ApiTags("standard")
  @Get()
  @Version(VERSION_NEUTRAL)
  async index(@Res() response: Response): Promise<void> {
    await super.index(response);
  }
}
