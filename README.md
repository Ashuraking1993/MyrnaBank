## Backend Configuration

The backend uses ASP.NET Core Web API and PostgreSQL.

### 1. Configure appsettings.Development.json

Create the file:

`KwentadorPH.Api/appsettings.Development.json`

Add the following configuration:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_POSTGRESQL_CONNECTION_STRING"
  },
  "DeepSeek": {
    "ApiKey": "YOUR_DEEPSEEK_API_KEY"
  }
}
```

Replace the placeholders with your own credentials.

### 2. Run the Backend

```bash
cd KwentadorPH.Api
dotnet restore
dotnet run --urls "http://0.0.0.0:5070"
```

Swagger:

http://localhost:5070/swagger

### Security

Never commit real API keys, database passwords,
or production credentials to GitHub.
