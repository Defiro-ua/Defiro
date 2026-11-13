package io.github.defiro.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.net.URI;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest
@Import({SecurityConfiguration.class, EntraRegistration.class})
class SignInTest {

    @Autowired
    MockMvc mvc;

    @Test
    void signingInSendsTheBrowserToTheOrganizationsSignInPage() throws Exception {
        MvcResult result = mvc.perform(get("/oauth2/authorization/entra")).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(302);
        URI location = URI.create(result.getResponse().getHeader("Location"));
        assertThat(location.getScheme() + "://" + location.getAuthority() + location.getPath())
                .isEqualTo(EntraRegistration.AUTHORIZATION_URI);
        assertThat(location.getQuery()).contains("client_id=defiro-test").contains("response_type=code");
    }

    @Test
    void theApiAnswersUnauthorizedInsteadOfRedirectingToSignIn() throws Exception {
        // The web app calls the API with fetch, which cannot follow a redirect to Microsoft's page.
        MvcResult result = mvc.perform(get("/api/me")).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(401);
    }
}
