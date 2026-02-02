package com.intuit.bqml.service;

import com.intuit.bqml.model.ForecastResult;

import java.util.List;

public interface BigQueryService {
    List<ForecastResult> getForecast(String userId, String timeGrain, int periodCount) throws InterruptedException;
}
