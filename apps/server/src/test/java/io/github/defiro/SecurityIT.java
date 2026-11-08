package io.github.defiro;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

// Plays the identity provider: the app trusts tokens signed with TRUSTED_KEY, and the tests sign
// real tokens that go through the bearer-token filter and the decoder.
@Import({TestcontainersConfiguration.class, SecurityIT.TrustedIssuer.class})
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIT {

    static final RSAKey TRUSTED_KEY = newKey();
    static final RSAKey OTHER_KEY = newKey();

    // A user that HTTP Basic or a login form would accept, if either were ever switched on.
    static final String KNOWN_USER = "ana";
    static final String KNOWN_PASSWORD = "correct-password";

    @Autowired
    MockMvc mvc;

    @Test
    void healthIsPublic() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void requestWithoutTokenIsUnauthorized() throws Exception {
        mvc.perform(get("/api/anything")).andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithValidTokenGetsPastSecurity() throws Exception {
        // 404, not 401: the token was accepted and there is simply no such endpoint yet.
        mvc.perform(get("/api/anything").header(HttpHeaders.AUTHORIZATION, bearer(TRUSTED_KEY)))
                .andExpect(status().isNotFound());
    }

    @Test
    void requestWithTokenSignedByAnotherKeyIsUnauthorized() throws Exception {
        mvc.perform(get("/api/anything").header(HttpHeaders.AUTHORIZATION, bearer(OTHER_KEY)))
                .andExpect(status().isUnauthorized());
    }

    // The next three tests guard what makes it safe to turn CSRF protection off (see
    // SecurityConfiguration): the browser never sends credentials on its own. If any of them
    // fails, turn CSRF protection back on.

    @Test
    void requestWithValidBasicCredentialsIsUnauthorized() throws Exception {
        String basic =
                "Basic " + Base64.getEncoder().encodeToString((KNOWN_USER + ":" + KNOWN_PASSWORD).getBytes(UTF_8));

        mvc.perform(get("/api/anything").header(HttpHeaders.AUTHORIZATION, basic))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginFormIsNotOffered() throws Exception {
        // With a login form, this request would sign in and redirect (302) instead.
        mvc.perform(post("/login").param("username", KNOWN_USER).param("password", KNOWN_PASSWORD))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refusedRequestCreatesNoSession() throws Exception {
        // A bearer-token request never stores its login in a session, so it can't show this. A
        // refused request can: unless the app is stateless, Spring saves it in a new session to
        // replay after login, and that session's cookie is what the browser would then send.
        MvcResult result = mvc.perform(get("/api/anything")).andReturn();

        assertThat(result.getRequest().getSession(false)).isNull();
    }

    static String bearer(RSAKey key) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("test-user")
                .issuedAt(now)
                .expiresAt(now.plus(5, ChronoUnit.MINUTES))
                .build();
        JwsHeader header =
                JwsHeader.with(SignatureAlgorithm.RS256).keyId(key.getKeyID()).build();
        NimbusJwtEncoder encoder = new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
        return "Bearer "
                + encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    static RSAKey newKey() {
        try {
            return new RSAKeyGenerator(2048).keyIDFromThumbprint(true).generate();
        } catch (JOSEException e) {
            throw new IllegalStateException(e);
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class TrustedIssuer {

        @Bean
        JwtDecoder jwtDecoder() throws JOSEException {
            return NimbusJwtDecoder.withPublicKey(TRUSTED_KEY.toRSAPublicKey()).build();
        }

        @Bean
        UserDetailsService knownUser() {
            return new InMemoryUserDetailsManager(User.withUsername(KNOWN_USER)
                    .password("{noop}" + KNOWN_PASSWORD)
                    .roles("USER")
                    .build());
        }
    }
}
