package io.github.defiro;

import static io.github.defiro.TestTokens.TRUSTED_KEY;
import static io.github.defiro.TestTokens.bearer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nimbusds.jose.jwk.RSAKey;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

// The app trusts tokens signed with TRUSTED_KEY (see TestTokens), and not those signed with OTHER_KEY.
@Import({TestcontainersConfiguration.class, TestTokens.TrustedIssuer.class})
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIT {

    static final RSAKey OTHER_KEY = TestTokens.newKey();

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
}
