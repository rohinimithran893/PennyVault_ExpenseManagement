package com.pennyvault.service;

import com.pennyvault.config.MicrosoftGraphProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class MicrosoftOAuthAuthorizationService {

    private final MicrosoftGraphProperties graphProperties;
    private final MicrosoftOAuthStateService stateService;

    public String buildAuthorizationUrl() {

        String state = stateService.generateState();

        return UriComponentsBuilder
                .fromUriString("https://login.microsoftonline.com")
                .pathSegment(
                        graphProperties.tenant(),
                        "oauth2",
                        "v2.0",
                        "authorize"
                )
                .queryParam("client_id", graphProperties.clientId())
                .queryParam("response_type", "code")
                .queryParam("redirect_uri", graphProperties.redirectUri())
                .queryParam("response_mode", "query")
                .queryParam("scope", graphProperties.scopes().trim())
                .queryParam("state", state)
                .build()
                .encode()
                .toUriString();
    }
}
