/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Res, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { Response } from "express";

@Controller("metrics")
export class MetricsController extends PrometheusController {
  @Get()
  @Version(VERSION_NEUTRAL)
  async index(@Res() response: Response): Promise<void> {
    await super.index(response);
  }
}
