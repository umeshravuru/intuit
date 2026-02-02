package com.intuit.bqml.controller;

import com.intuit.bqml.model.ForecastResult;
import com.intuit.bqml.service.BigQueryServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api")
public class ForecastController {

    private final BigQueryServiceImpl bigQueryServiceImpl;
    private final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ForecastController.class);

    @Autowired
    public ForecastController(BigQueryServiceImpl bigQueryServiceImpl) {
        this.bigQueryServiceImpl = bigQueryServiceImpl;
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<ForecastResult>> getForecast(
            @RequestParam String timeGrain,
            @RequestParam int periods,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = null;
        if (jwt != null) {
            userId = jwt.getSubject();
            logger.info("Forecast requested by user: {}", userId);
            // You can access other claims like email if needed: jwt.getClaim("email")
        }

        try {
            List<ForecastResult> results = bigQueryServiceImpl.getForecast(userId, timeGrain, periods);
            return ResponseEntity.ok(results);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(500).build();
        } catch (RuntimeException e) {
            logger.error(e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }
}
