package com.pennyvault.service;

import com.pennyvault.config.MicrosoftGraphProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MicrosoftOAuthAuthorizationServiceTest {

    @Mock
    private MicrosoftGraphProperties graphProperties;

    @Mock
    private MicrosoftOAuthStateService stateService;

    @InjectMocks
    private MicrosoftOAuthAuthorizationService authorizationService;

    @Test
    void buildAuthorizationUrlIncludesRequiredOAuthParameters() {

        when(graphProperties.tenant()).thenReturn("consumers");
        when(graphProperties.clientId()).thenReturn("test-client-id");
        when(graphProperties.redirectUri())
                .thenReturn("http://localhost:8080/oauth2/callback");
        when(graphProperties.scopes())
                .thenReturn("openid profile offline_access Mail.Send");
        when(stateService.generateState()).thenReturn("test-state-value");

        String authorizationUrl = authorizationService.buildAuthorizationUrl();

        URI uri = URI.create(authorizationUrl);
        Map<String, String> queryParameters = Stream
                .of(uri.getRawQuery().split("&"))
                .map(parameter -> parameter.split("=", 2))
                .collect(Collectors.toMap(
                        parameter -> decode(parameter[0]),
                        parameter -> decode(parameter.length > 1 ? parameter[1] : "")
                ));

        assertEquals(
                "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
                uri.getScheme() + "://" + uri.getAuthority() + uri.getPath()
        );
        assertEquals("test-client-id", queryParameters.get("client_id"));
        assertEquals("code", queryParameters.get("response_type"));
        assertEquals(
                "http://localhost:8080/oauth2/callback",
                queryParameters.get("redirect_uri")
        );
        assertEquals("query", queryParameters.get("response_mode"));
        assertEquals(
                "openid profile offline_access Mail.Send",
                queryParameters.get("scope")
        );
        assertEquals("test-state-value", queryParameters.get("state"));

        verify(stateService).generateState();
    }

    @Test
    void buildAuthorizationUrlEncodesQueryParameterValues() {

        when(graphProperties.tenant()).thenReturn("consumers");
        when(graphProperties.clientId()).thenReturn("client id&value");
        when(graphProperties.redirectUri())
                .thenReturn("http://localhost:8080/oauth2/callback?source=penny vault");
        when(graphProperties.scopes()).thenReturn("openid profile Mail.Send");
        when(stateService.generateState()).thenReturn("state-_value");

        String authorizationUrl = authorizationService.buildAuthorizationUrl();

        URI uri = URI.create(authorizationUrl);
        Map<String, String> queryParameters = Stream
                .of(uri.getRawQuery().split("&"))
                .map(parameter -> parameter.split("=", 2))
                .collect(Collectors.toMap(
                        parameter -> decode(parameter[0]),
                        parameter -> decode(parameter.length > 1 ? parameter[1] : "")
                ));

        // Confirm reserved query delimiters in the client ID remain part of its value.
        assertEquals("client id&value", queryParameters.get("client_id"));
        assertEquals("state-_value", queryParameters.get("state"));
        assertEquals(
                "http://localhost:8080/oauth2/callback?source=penny vault",
                queryParameters.get("redirect_uri")
        );
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
