package com.pennyvault.controller;

import com.pennyvault.service.MicrosoftOAuthCallbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MicrosoftOAuthCallbackController {

    private final MicrosoftOAuthCallbackService callbackService;

    @GetMapping("/oauth2/callback")
    public ResponseEntity<String> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(name = "error", required = false) String error) {

        if (state == null || state.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Invalid Microsoft authorization response. Please try again.");
        }

        try {
            callbackService.completeAuthorization(code, state, error);
            return ResponseEntity.ok(
                    "Microsoft authorization completed. You may close this window."
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body("Microsoft authorization could not be verified or was cancelled. Please try again.");
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Microsoft authorization could not be completed. Please try again.");
        }
    }
}
