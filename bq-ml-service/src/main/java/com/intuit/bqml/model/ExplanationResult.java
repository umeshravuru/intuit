package com.intuit.bqml.model;

public class ExplanationResult {
    private String category;
    private String currentMonth;
    private Double revenueChangePct;
    private String explanation;

    public ExplanationResult(String category, String currentMonth, Double revenueChangePct, String explanation) {
        this.category = category;
        this.currentMonth = currentMonth;
        this.revenueChangePct = revenueChangePct;
        this.explanation = explanation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCurrentMonth() {
        return currentMonth;
    }

    public void setCurrentMonth(String currentMonth) {
        this.currentMonth = currentMonth;
    }

    public Double getRevenueChangePct() {
        return revenueChangePct;
    }

    public void setRevenueChangePct(Double revenueChangePct) {
        this.revenueChangePct = revenueChangePct;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
