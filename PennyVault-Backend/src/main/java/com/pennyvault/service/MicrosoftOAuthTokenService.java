package com.pennyvault.service;

import com.pennyvault.config.MicrosoftGraphProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
public class MicrosoftOAuthTokenService {

    private final RestClient.Builder restClientBuilder;
    private final MicrosoftGraphProperties graphProperties;

    public MicrosoftOAuthTokenResponse exchangeAuthorizationCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", graphProperties.clientId());
        form.add("client_secret", graphProperties.clientSecret());
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", graphProperties.redirectUri());
        form.add("scope", graphProperties.scopes().trim());

        return requestTokens(form, "Microsoft authorization-code exchange failed.");
    }

    public MicrosoftOAuthTokenResponse refreshAccessToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Microsoft refresh token must not be blank.");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", graphProperties.clientId());
        form.add("client_secret", graphProperties.clientSecret());
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", refreshToken);
        form.add("scope", graphProperties.scopes().trim());

        return requestTokens(form, "Microsoft access-token refresh failed.");
    }

    private MicrosoftOAuthTokenResponse requestTokens(
            MultiValueMap<String, String> form,
            String failureMessage) {

        String tokenEndpoint = "https://login.microsoftonline.com/"
                + graphProperties.tenant()
                + "/oauth2/v2.0/token";

        try {
            MicrosoftOAuthTokenResponse response = restClientBuilder.build()
                    .post()
                    .uri(tokenEndpoint)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(MicrosoftOAuthTokenResponse.class);

            if (response == null
                    || response.accessToken() == null
                    || response.accessToken().isBlank()) {
                throw new IllegalStateException("Microsoft did not return an access token.");
            }

            return response;
        } catch (RestClientException exception) {
            // Provider error payloads are deliberately not exposed or logged.
            throw new IllegalStateException(failureMessage, exception);
        }
    }
}
