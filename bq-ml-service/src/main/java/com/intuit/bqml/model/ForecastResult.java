package com.intuit.bqml.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ForecastResult {
    private LocalDate forecastMonth;
    private String stockCode;
    private BigDecimal monthlyPredictedSales;

    public ForecastResult() {
    }

    public ForecastResult(LocalDate forecastMonth, String stockCode, BigDecimal monthlyPredictedSales) {
        this.forecastMonth = forecastMonth;
        this.stockCode = stockCode;
        this.monthlyPredictedSales = monthlyPredictedSales;
    }

    public LocalDate getForecastMonth() {
        return forecastMonth;
    }

    public void setForecastMonth(LocalDate forecastMonth) {
        this.forecastMonth = forecastMonth;
    }

    public String getStockCode() {
        return stockCode;
    }

    public void setStockCode(String stockCode) {
        this.stockCode = stockCode;
    }

    public BigDecimal getMonthlyPredictedSales() {
        return monthlyPredictedSales;
    }

    public void setMonthlyPredictedSales(BigDecimal monthlyPredictedSales) {
        this.monthlyPredictedSales = monthlyPredictedSales;
    }

    @Override
    public String toString() {
        return "ForecastResult{" +
                "forecastMonth=" + forecastMonth +
                ", stockCode='" + stockCode + '\'' +
                ", monthlyPredictedSales=" + monthlyPredictedSales +
                '}';
    }
}
