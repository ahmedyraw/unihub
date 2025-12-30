package com.example.unihub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UnihubApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnihubApplication.class, args);
    }
}