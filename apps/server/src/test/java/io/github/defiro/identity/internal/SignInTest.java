package io.github.defiro.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.net.URI;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest
@Import({SecurityConfiguration.class, SignInTest.Entra.class})
class SignInTest {

    static final String AUTHORIZATION_URI = "https://login.example.test/tenant/oauth2/v2.0/authorize";

    @Autowired
    MockMvc mvc;

    @Test
    void signingInSendsTheBrowserToTheOrganizationsSignInPage() throws Exception {
        MvcResult result = mvc.perform(get("/oauth2/authorization/entra")).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(302);
        URI location = URI.create(result.getResponse().getHeader("Location"));
        assertThat(location.getScheme() + "://" + location.getAuthority() + location.getPath())
                .isEqualTo(AUTHORIZATION_URI);
        assertThat(location.getQuery()).contains("client_id=defiro-test").contains("response_type=code");
    }

    @Test
    void theApiAnswersUnauthorizedInsteadOfRedirectingToSignIn() throws Exception {
        // The web app calls the API with fetch, which cannot follow a redirect to Microsoft's page.
        MvcResult result = mvc.perform(get("/api/me")).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(401);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Entra {

        @Bean
        ClientRegistrationRepository clientRegistrations() {
            return new InMemoryClientRegistrationRepository(ClientRegistration.withRegistrationId("entra")
                    .clientId("defiro-test")
                    .clientSecret("slice-test-secret")
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                    .scope("openid", "profile")
                    .authorizationUri(AUTHORIZATION_URI)
                    .tokenUri("https://login.example.test/tenant/oauth2/v2.0/token")
                    .jwkSetUri("https://login.example.test/tenant/discovery/v2.0/keys")
                    .userNameAttributeName("sub")
                    .build());
        }
    }
}
