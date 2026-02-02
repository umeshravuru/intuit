package com.intuit.bqml.service;

import com.google.cloud.bigquery.*;
import com.intuit.bqml.model.ForecastResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BigQueryServiceImpl implements BigQueryService {

    private final BigQuery bigQuery;
    private final String projectId;

    public BigQueryServiceImpl(@Value("${gcp.project-id}") String projectId) {
        this.projectId = projectId;
        try {
            this.bigQuery = BigQueryOptions.newBuilder()
                    .setProjectId(projectId)
                    .setCredentials(com.google.auth.oauth2.GoogleCredentials.getApplicationDefault())
                    .build()
                    .getService();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to load Google Cloud credentials", e);
        }
    }

    @Cacheable("forecasts")
    public List<ForecastResult> getForecast(String userId, String timeGrain, int periodCount)
            throws InterruptedException {
        int horizonDays;
        switch (timeGrain.toUpperCase()) {
            case "WEEK":
                horizonDays = periodCount * 7;
                break;
            case "MONTH":
                horizonDays = periodCount * 30;
                break;
            case "YEAR":
                horizonDays = periodCount * 365;
                break;
            default:
                throw new IllegalArgumentException("Invalid timeGrain: " + timeGrain);
        }

        // Dynamically generate SQL with horizon literal
        String sql = ""
                + "WITH last_observed AS (\n"
                + "  SELECT DATE(MAX(InvoiceDate_ts)) AS last_date\n"
                + "  FROM `" + projectId + ".orders_1M.orders`\n"
                + "),\n"
                + "predictions AS (\n"
                + "  SELECT\n"
                + "    f.Description,\n"
                + "    CASE '" + timeGrain + "'\n"
                + "      WHEN 'WEEK'  THEN DATE_TRUNC(DATE(f.forecast_timestamp), WEEK(MONDAY))\n"
                + "      WHEN 'MONTH' THEN DATE_TRUNC(DATE(f.forecast_timestamp), MONTH)\n"
                + "      WHEN 'YEAR'  THEN DATE_TRUNC(DATE(f.forecast_timestamp), YEAR)\n"
                + "    END AS period_start,\n"
                + "    f.forecast_value AS predicted_sales\n"
                + "  FROM ML.FORECAST(\n"
                + "         MODEL `project-732ea066-e72d-45e9-9ce.orders_1M.category_sales_forecast_with_description`,\n"
                + "         STRUCT(" + horizonDays + " AS horizon)\n" // literal horizon
                + "       ) f\n"
                + "  CROSS JOIN last_observed l\n"
                + "  WHERE DATE(f.forecast_timestamp) > l.last_date\n"
                + "),\n"
                + "limited_periods AS (\n"
                + "  SELECT *\n"
                + "  FROM predictions\n"
                + "  WHERE period_start < (\n"
                + "    SELECT\n"
                + "      CASE '" + timeGrain + "'\n"
                + "        WHEN 'WEEK'  THEN DATE_ADD(MIN(period_start), INTERVAL " + periodCount + " WEEK)\n"
                + "        WHEN 'MONTH' THEN DATE_ADD(MIN(period_start), INTERVAL " + periodCount + " MONTH)\n"
                + "        WHEN 'YEAR'  THEN DATE_ADD(MIN(period_start), INTERVAL " + periodCount + " YEAR)\n"
                + "      END\n"
                + "    FROM predictions\n"
                + "  )\n"
                + "),\n"
                + "period_totals AS (\n"
                + "  SELECT period_start, Description, SUM(predicted_sales) AS period_predicted_sales\n"
                + "  FROM limited_periods\n"
                + "  GROUP BY period_start, Description\n"
                + "),\n"
                + "ranked AS (\n"
                + "  SELECT period_start, Description, period_predicted_sales,\n"
                + "         ROW_NUMBER() OVER (PARTITION BY period_start ORDER BY period_predicted_sales DESC) AS rnk\n"
                + "  FROM period_totals\n"
                + ")\n"
                + "SELECT period_start, Description, period_predicted_sales\n"
                + "FROM ranked\n"
                + "WHERE rnk <= 5\n"
                + "ORDER BY period_start, rnk;";

        if (userId.equals("user_395sgaT7JRPQlkQYgZD15iHPheP")) {
            sql = "SELECT\n" +
                    "  DATE_TRUNC(DATE(forecast_timestamp), " + timeGrain + ") AS period_start,\n" +
                    "  Category AS Description,\n" +
                    "  SUM(forecast_value) AS period_predicted_sales\n" +
                    "FROM\n" +
                    "  ML.FORECAST( MODEL `project-732ea066-e72d-45e9-9ce`.`ecommerce`.`category_sales_forecast_model`,\n"
                    +
                    "    STRUCT(" + horizonDays + " AS horizon))\n" +
                    "GROUP BY\n" +
                    "  1,\n" +
                    "  Category\n" +
                    "ORDER BY\n" +
                    "  period_start,\n" +
                    "  period_predicted_sales DESC;";
        }

        QueryJobConfiguration queryConfig = QueryJobConfiguration.newBuilder(sql)
                .addNamedParameter("timeGrain", QueryParameterValue.string(timeGrain.toUpperCase()))
                .addNamedParameter("horizonDays", QueryParameterValue.int64(horizonDays))
                .addNamedParameter("periodCount", QueryParameterValue.int64(periodCount))
                .build();

        JobId jobId = JobId.of(UUID.randomUUID().toString());
        Job queryJob = bigQuery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build());

        queryJob = queryJob.waitFor();

        if (queryJob == null) {
            throw new RuntimeException("Job no longer exists");
        } else if (queryJob.getStatus().getError() != null) {
            throw new RuntimeException(queryJob.getStatus().getError().toString());
        }

        TableResult result = queryJob.getQueryResults();

        List<ForecastResult> results = new ArrayList<>();
        for (FieldValueList row : result.iterateAll()) {
            LocalDate forecastMonth = LocalDate.parse(row.get("period_start").getStringValue());
            String stockCode = row.get("Description").getStringValue();
            // forecast_value is numeric/float. using doubleValue then BigDecimal if needed
            // or just BigDecimal
            // BigQuery returns NUMERIC as BigDecimal usually, but sometimes String or
            // Double depending on the client.
            // safely getting as BigDecimal
            java.math.BigDecimal monthlyPredictedSales = row.get("period_predicted_sales").getNumericValue();

            results.add(new ForecastResult(forecastMonth, stockCode, monthlyPredictedSales));
        }

        return results;
    }
}
