# BigQuery ML Service

This is a Spring Boot service designed to integrate with GCP BigQuery ML.

## Prerequisites
- Java 17+
- Maven 3.x

## Project Structure
- `src/main/java`: Source code
- `src/main/resources`: Configuration files

## Features
- **Echo Endpoint**: `GET /echo?message=...`
- **Actuator**: Health and Metrics at `/actuator/health` and `/actuator/metrics`

## Running the Application
To run the application, ensure you have Maven installed and run:

```bash
mvn spring-boot:run
```

## Local Development

To run the application locally with your specific GCP configuration:

1.  **Configure Properties**:
    The file `src/main/resources/application-local.properties` has been created for you.
    Update the `gcp.project-id` in that file to match your Google Cloud Project ID.

2.  **Authentication**:
    Ensure you have Google Cloud credentials set up. You can usually do this by running:
    ```sh
    gcloud auth application-default login
    ```
    Alternatively, set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your key file:
    ```sh
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
    ```

3.  **Run the Application**:
    Run the application with the `local` profile active:
    ```sh
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
    ```
    Or if running the jar directly:
    ```sh
    java -jar -Dspring.profiles.active=local target/bq-ml-service-0.0.1-SNAPSHOT.jar
    ```

4.  **Test**:
    Access the endpoint at: `http://localhost:8080/api/forecast`

## Testing
To verify the endpoints:

```bash
# Echo
curl "http://localhost:8080/echo?message=HelloGCP"

# Health
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics
```
