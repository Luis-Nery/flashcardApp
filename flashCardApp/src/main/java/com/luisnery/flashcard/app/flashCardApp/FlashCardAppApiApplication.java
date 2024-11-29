package com.luisnery.flashcard.app.flashCardApp;

import java.io.IOException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.luisnery.flashcard.app.flashCardApp.Firebase.FirebaseInitialization;

/**
 * Entry point for the FlashCard App API application.
 * Handles initialization of Firebase and application configuration.
 */
@SpringBootApplication
public class FlashCardAppApiApplication {

    /**
     * Main method to run the application.
     * Initializes Firebase and starts the Spring Boot application.
     *
     * @param args Command-line arguments
     */
    public static void main(String[] args) {
        try {
            FirebaseInitialization.initialize();
        } catch (IOException e) {
            e.printStackTrace();
        }
        SpringApplication.run(FlashCardAppApiApplication.class, args);
    }

    /**
     * Configures CORS settings for the API.
     * Allows requests from the specified frontend origin and enables various HTTP methods.
     *
     * @return A WebMvcConfigurer with custom CORS mappings.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173") // Your frontend's origin
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
