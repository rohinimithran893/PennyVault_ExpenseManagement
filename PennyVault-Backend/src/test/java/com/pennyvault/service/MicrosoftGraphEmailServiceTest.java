package com.pennyvault.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@ExtendWith(MockitoExtension.class)
class MicrosoftGraphEmailServiceTest {

    private static final String SEND_MAIL_ENDPOINT =
            "https://graph.microsoft.com/v1.0/me/sendMail";

    @Mock
    private MicrosoftAccessTokenService accessTokenService;

    private MockRestServiceServer mockServer;
    private MicrosoftGraphEmailService emailService;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        emailService = new MicrosoftGraphEmailService(builder, accessTokenService);
    }

    @Test
    void sendEmailPostsHtmlMessageAndAcceptsGraph202Response() {
        when(accessTokenService.getAccessToken()).thenReturn("test-access-token");

        mockServer.expect(requestTo(SEND_MAIL_ENDPOINT))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer test-access-token"))
                .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().json("""
                        {
                          "message": {
                            "subject": "Household invitation",
                            "body": {
                              "contentType": "HTML",
                              "content": "<p>You are invited.</p>"
                            },
                            "toRecipients": [
                              {
                                "emailAddress": {
                                  "address": "member@example.com"
                                }
                              }
                            ]
                          },
                          "saveToSentItems": true
                        }
                        """))
                .andRespond(withStatus(HttpStatus.ACCEPTED));

        emailService.sendEmail(
                "member@example.com",
                "Household invitation",
                "<p>You are invited.</p>",
                true
        );

        mockServer.verify();
        verify(accessTokenService).getAccessToken();
    }

    @Test
    void sendEmailThrowsSafeExceptionWhenGraphRejectsRequest() {
        when(accessTokenService.getAccessToken()).thenReturn("test-access-token");

        mockServer.expect(requestTo(SEND_MAIL_ENDPOINT))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThrows(IllegalStateException.class, () -> emailService.sendEmail(
                "member@example.com",
                "Test subject",
                "Test body",
                false
        ));

        mockServer.verify();
    }

    @Test
    void sendEmailRejectsBlankRecipientBeforeRequestingAccessToken() {
        assertThrows(IllegalArgumentException.class, () -> emailService.sendEmail(
                " ",
                "Test subject",
                "Test body",
                false
        ));

        verifyNoInteractions(accessTokenService);
        mockServer.verify();
    }
}
