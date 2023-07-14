/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Version,
  Logger,
  UseGuards,
  Headers,
  UseInterceptors,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { OpenFeatureGuard, EnvGuard } from "utils";
import { forwardHeaderAuthInterceptor } from "utils/forward.header.auth";
import { ExampleService } from "./example.service";

@ApiTags("example")
@Controller({ path: "example", version: "1" })
@UseInterceptors(forwardHeaderAuthInterceptor)
export class ExampleController {
  constructor(
    private readonly exampleService: ExampleService,
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleController.name)
  ) {}
  @Get("get_request")
  @Version("1")
  @ApiOperation({ summary: "A feature controlled example message." })
  @ApiResponse({
    status: 200,
    description:
      "Normal run, returns either old or new messages based on the feature flag value.",
  })
  @ApiResponse({
    status: 204,
    description: "No data found for the given query filter.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 500,
    description:
      "The service run into internal trouble, please check error logs for details.",
  })
  async getExample(
    @Headers("customer_uuid") sessionToken?: string
  ): Promise<string> {
    this.logger.log("Calling getExample with info", "ExampleController:info");
    return this.exampleService.getExample();
  }

  @Get("get_request")
  @Version("2")
  @ApiResponse({
    status: 200,
    description: "Normal run, with sample and calculation returned.",
  })
  @ApiResponse({
    status: 204,
    description: "No data found for the given query filter.",
  })
  @ApiResponse({
    status: 400,
    description: "The request sent was invalid or uninterpretable.",
  })
  @ApiResponse({
    status: 404,
    description:
      "The requested resource is not found (i.e. being turned off by the feature flag).",
  })
  @ApiResponse({
    status: 500,
    description:
      "The service run into internal trouble, please check error logs for details.",
  })
  @UseGuards(OpenFeatureGuard("new-end-point"))
  async getNewExample(): Promise<string> {
    this.logger.log("Calling getExample with info", "ExampleController:info");
    return this.exampleService["newFeature2"];
  }

  @Get("updates")
  async sendUpdates(@Res() res: Response): Promise<void> {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    });
    res.flushHeaders();

    this.logger.debug("Sending progress updates", "ExampleController:debug");

    // Now we can send data to the client whenever we want
    res.write(`data: ${JSON.stringify({ progress: 0 })}\n\n`);

    // Just as an example, let's increment the progress every second
    const eventCount = Infinity;
    let progress = 0;
    for (let i = 0; i < eventCount; i++) {
      res.write(`event: message\n`);
      progress++;
      const randonNumber = await this.exampleService.getRandonNumber();
      res.write(`data: ${JSON.stringify({ progress, randonNumber })}\n\n`);
    }
  }

  @Get("progress.html")
  async getHtml(@Res() res: Response): Promise<void> {
    // Your logic to generate dynamic HTML content
    this.logger.verbose("Generating dynamic HTML", "ExampleController:verbose");
    const dynamicHtml = `<!DOCTYPE html>
    <html>
    <head>
      <title>Progress Update</title>
      <!-- Include ECharts library -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.0/echarts.min.js"></script>
    </head>
    <body>
      <h1>Progress Update</h1>
      <div id="chart" style="width: 600px; height: 400px;"></div>
      <progress id="myProgressBar" max="100" value="0"></progress>
      <div id="output">waiting for data...</div>
      <script>
      // Initialize ECharts instance
      const chart = echarts.init(document.getElementById('chart'));
      // Define initial series data
      const seriesData = [];
      const MAX_DATA_POINTS = 30;
      // Set chart options
      const options = {
        xAxis: {
          type: 'category',
          data: [], // x-axis data points
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'line',
            data: seriesData, // initial empty data
          },
        ],
      };
      // Set initial options for the chart
      chart.setOption(options);
        const source = new EventSource('/${this.configService.get(
          "SERVICE_PREFIX"
        )}/v1/example/updates');

        source.onmessage = function logEvents(event) {
          const { data } = event;
          const parsedData = JSON.parse(data);
          console.log('Server sent:', parsedData);
          document.getElementById('output').innerHTML = data;
          myProgressBar.value = parsedData.progress;
          seriesData.push(parsedData.randonNumber);
          while (seriesData.length > MAX_DATA_POINTS) {
            seriesData.shift(); // Remove the oldest element (first in the array)
          }

          // Update x-axis data points
          options.xAxis.data.push(new Date().toLocaleTimeString());
          while (options.xAxis.data.length > MAX_DATA_POINTS) {
            options.xAxis.data.shift(); // Remove the oldest element (first in the array)
          }

          // Update chart options
          chart.setOption(options);

          // Here, you can update your front-end's progress bar
          // For example:
          // myProgressBar.value = parsedData.progress;
        };

        source.addEventListener('end', function(event) {
          console.log('Progress completed');
          source.close();
        }, false);
      </script>
    </body>
    </html>`;
    this.logger.verbose("Sending dynamic HTML", "ExampleController:verbose");

    res.setHeader("Content-Type", "text/html");
    res.send(dynamicHtml);
  }
}

enum Env {
  local = "lcl",
  develop = "dev",
  quality = "qas",
  staging = "stg",
  production = "prd",
  default = "dft",
}
class EnvDto {
  @ApiProperty({ enum: Env })
  env: Env;
}
@ApiTags("example_dev_only")
@UseGuards(EnvGuard)
@Controller({ path: "example_dev_only", version: "1" })
export class ExampleDevOnlyController {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger(ExampleController.name)
  ) {}
  @Get("get_dev_only")
  @Version("1")
  @ApiOperation({ summary: "A env-guard controlled example message." })
  @ApiOkResponse({
    status: 200,
    description: "Normal run, returns current running environment.",
    type: EnvDto,
  })
  @ApiResponse({
    status: 404,
    description: "The end-point is not available.",
  })
  @ApiResponse({
    status: 500,
    description:
      "The service run into internal trouble, please check error logs for details.",
  })
  async getDevOnlyExample(): Promise<EnvDto> {
    this.logger.log(
      "Calling getDevOnlyExample with info",
      "ExampleController:info"
    );
    return { env: this.configService.getOrThrow("ENV_KEY") };
  }
}
