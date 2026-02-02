package com.intuit.bqml;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BqMlServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BqMlServiceApplication.class, args);
	}

}
