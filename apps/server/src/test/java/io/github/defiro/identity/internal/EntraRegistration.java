package io.github.defiro.identity.internal;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

/**
 * For slice tests: defiro registered with an Entra ID tenant, as the environment variables do in
 * production. Nothing calls these addresses; they only show up in redirects.
 */
@TestConfiguration(proxyBeanMethods = false)
class EntraRegistration {

    static final String AUTHORIZATION_URI = "https://login.example.test/tenant/oauth2/v2.0/authorize";

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
