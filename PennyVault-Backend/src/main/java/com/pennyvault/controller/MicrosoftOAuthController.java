package com.pennyvault.controller;

import com.pennyvault.service.MicrosoftOAuthAuthorizationService;
import com.pennyvault.service.MicrosoftOAuthCallbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/microsoft/oauth")
@RequiredArgsConstructor
public class MicrosoftOAuthController {

    private final MicrosoftOAuthAuthorizationService authorizationService;
    private final MicrosoftOAuthCallbackService callbackService;

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

    @GetMapping("/callback")
    public ResponseEntity<String> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(name = "error", required = false) String error) {

        if (error != null) {
            return ResponseEntity.badRequest()
                    .body("Microsoft authorization was not completed. Please try again.");
        }

        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Invalid Microsoft authorization response. Please try again.");
        }

        try {
            callbackService.completeAuthorization(code, state);
            return ResponseEntity.ok(
                    "Microsoft authorization completed. You may close this window."
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body("Microsoft authorization could not be verified. Please try again.");
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Microsoft authorization could not be completed. Please try again.");
        }
    }
}
