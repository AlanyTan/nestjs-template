# Environment Variables for nestjs-example repo

## The ultimate source of truth is...

There are 2 files that are critical for Environment variable settings:

### `src/app.module.ts`

The main (sometimes called root) module file takes in the main configuration (environment variables) in this section:

```
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      load: [config, dbConfig], //dbConfig is a structured config obj, can be accessed like get('database.host')
      expandVariables: true,
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        ...
```

The data type of each environment variable and if they are required is listed here.

and,

### `src/config/db.ts`

## Sample Environment variable settings:

```
LINEPULSE_SVC_PORT=9080
LOG_LEVEL=info
SVC_1_ENDPOINT=https://api.linepulse-dev.ai/health
PINO_PRETTY=true
SWAGGER_ON=true
ENV_KEY=lcl
OPENFEATURE_PROVIDER=ENV
NEW_FEATURE_FLAG=true
NEW_END_POINT=true
AAD_TENANT_ID="7b6440b3-493d-4eb7-9f99-0afc3b8b4ab3"
AAD_CLIENT_ID="4ba65009-f28f-4898-8284-8bcdd56961c3"
DATABASE_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postgres
```

## Local testing

for **local only**, you can create a `.env` file in the project root and make sure the content matches the above.

### Feature Toggle

Please ask Product Managers (SRE as backup) the `local` launch darkly key, and you set `OPENFEATURE_PROVIDER=LD:sdkkey....`

## Kubernetes deployment

The above environment variables should be set in the Kubernets deployment file or the overlays ()
