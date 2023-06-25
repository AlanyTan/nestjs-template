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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { OpenFeatureGuard } from "utils";
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
  sendUpdates(@Res() res: Response): void {
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
    let progress = 0;
    const interval = setInterval(() => {
      progress++;
      res.write(`data: ${JSON.stringify({ progress })}\n\n`);
      this.logger.debug(
        `Sent progress update: ${progress}`,
        "ExampleController:debug"
      );
      if (progress === 100) {
        clearInterval(interval);
        res.write(`event: end\n`);
        res.write(`data: ${JSON.stringify({ progress })}\n\n`);
        res.end();
      }
      this.logger.debug(
        `Sent last progress update: ${progress}`,
        "ExampleController:debug"
      );
    }, 1000);
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
      <div id="output">some data</div>
      <script>
      // Initialize ECharts instance
      const chart = echarts.init(document.getElementById('chart'));

      // Define initial series data
      const seriesData = [];

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
          seriesData.push(parsedData.progress);
        
          // Update x-axis data points
          options.xAxis.data.push(new Date().toLocaleTimeString());
        
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
