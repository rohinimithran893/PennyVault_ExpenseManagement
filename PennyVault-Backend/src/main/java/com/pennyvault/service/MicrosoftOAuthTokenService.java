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
                    || response.refreshToken() == null) {
                throw new IllegalStateException("Microsoft did not return the required OAuth tokens.");
            }

            return response;
        } catch (RestClientException exception) {
            // Do not propagate provider response details; they may contain sensitive information.
            throw new IllegalStateException("Microsoft token exchange failed.", exception);
        }
    }
}
