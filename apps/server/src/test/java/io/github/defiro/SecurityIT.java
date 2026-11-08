package io.github.defiro;

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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.web.servlet.MockMvc;

// Plays the identity provider: the app trusts tokens signed with TRUSTED_KEY, and the tests sign
// real tokens that go through the bearer-token filter and the decoder.
@Import({TestcontainersConfiguration.class, SecurityIT.TrustedIssuer.class})
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIT {

    static final RSAKey TRUSTED_KEY = newKey();
    static final RSAKey OTHER_KEY = newKey();

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

    @Test
    void writeWithoutTokenIsRefusedByCsrfProtection() throws Exception {
        // 403, not 401: the CSRF check runs before authentication. If CSRF protection were
        // turned off, this would be 401.
        mvc.perform(post("/api/anything")).andExpect(status().isForbidden());
    }

    @Test
    void writeWithValidTokenNeedsNoCsrfToken() throws Exception {
        // Spring skips the CSRF check for bearer-token requests, since a browser never attaches
        // that header on its own.
        mvc.perform(post("/api/anything").header(HttpHeaders.AUTHORIZATION, bearer(TRUSTED_KEY)))
                .andExpect(status().isNotFound());
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
    }
}
