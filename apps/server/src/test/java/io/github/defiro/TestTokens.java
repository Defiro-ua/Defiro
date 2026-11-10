package io.github.defiro;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * Plays the identity provider in tests. Import {@link TrustedIssuer} and the app trusts tokens signed
 * with {@link #TRUSTED_KEY}; {@link #bearer(RSAKey)} signs real tokens that go through the
 * bearer-token filter and the decoder.
 */
public final class TestTokens {

    public static final RSAKey TRUSTED_KEY = newKey();

    private TestTokens() {}

    /** An {@code Authorization} header value with a token signed by {@code key}. */
    public static String bearer(RSAKey key) {
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

    public static RSAKey newKey() {
        try {
            return new RSAKeyGenerator(2048).keyIDFromThumbprint(true).generate();
        } catch (JOSEException e) {
            throw new IllegalStateException(e);
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    public static class TrustedIssuer {

        @Bean
        JwtDecoder jwtDecoder() throws JOSEException {
            return NimbusJwtDecoder.withPublicKey(TRUSTED_KEY.toRSAPublicKey()).build();
        }
    }
}
