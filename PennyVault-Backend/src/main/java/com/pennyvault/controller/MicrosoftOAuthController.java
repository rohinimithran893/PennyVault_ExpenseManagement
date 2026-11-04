package com.pennyvault.controller;

import com.pennyvault.service.MicrosoftOAuthAuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/microsoft/oauth")
@RequiredArgsConstructor
public class MicrosoftOAuthController {

    private final MicrosoftOAuthAuthorizationService authorizationService;

    @GetMapping("/authorize")
    public ResponseEntity<Void> authorize() {

        URI authorizationUri = URI.create(
                authorizationService.buildAuthorizationUrl()
        );

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, authorizationUri.toString())
                .build();
    }
}
