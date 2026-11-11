package com.pennyvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PennyVaultBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PennyVaultBackendApplication.class, args);
	}

}
