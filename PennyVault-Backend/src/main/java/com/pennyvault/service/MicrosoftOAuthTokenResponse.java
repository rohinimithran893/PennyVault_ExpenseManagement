package com.pennyvault.service;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MicrosoftOAuthTokenResponse(
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("scope") String scope,
        @JsonProperty("expires_in") long expiresIn,
        @JsonProperty("ext_expires_in") long extendedExpiresIn,
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken
) {
}
