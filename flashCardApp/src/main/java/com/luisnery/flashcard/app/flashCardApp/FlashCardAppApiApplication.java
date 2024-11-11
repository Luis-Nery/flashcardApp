package com.luisnery.flashcard.app.flashCardApp;

import java.io.IOException;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.luisnery.flashcard.app.flashCardApp.Firebase.FirebaseInitialization;

@SpringBootApplication
public class FlashCardAppApiApplication {

	public static void main(String[] args) {
		try {
			FirebaseInitialization.initialize();
		}catch(IOException E) {
			E.printStackTrace();
		}
		SpringApplication.run(FlashCardAppApiApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**").allowedOrigins("http://localhost:5173") // Your frontend's origin
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*")
						.allowCredentials(true);
			}
		};

	}
}
