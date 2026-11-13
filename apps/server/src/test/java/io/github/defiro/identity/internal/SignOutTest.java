package io.github.defiro.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(ProfileController.class)
@Import({SecurityConfiguration.class, EntraRegistration.class})
class SignOutTest {

    @Autowired
    MockMvc mvc;

    @Test
    void signingOutReturnsToTheHomePageWithTheSignedOutNotice() throws Exception {
        MvcResult result =
                mvc.perform(post("/logout").with(oidcLogin()).with(csrf())).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(302);
        assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/?aviso=sessao-terminada");
    }

    @Test
    void theWebAppGetsTheCsrfTokenInACookieItCanRead() throws Exception {
        MvcResult result = mvc.perform(get("/api/me").with(oidcLogin())).andReturn();

        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        assertThat(cookie).isNotNull();
        assertThat(cookie.getValue()).isNotBlank();
        assertThat(cookie.isHttpOnly()).isFalse();
    }

    @Test
    void signingOutIsAcceptedWhenTheWebAppSendsTheCookieTokenBack() throws Exception {
        String token = "4bb1e2c0-6c35-4b5e-9f0d-3d1f2b7a9e11";

        MvcResult result = mvc.perform(post("/logout")
                        .with(oidcLogin())
                        .cookie(new Cookie("XSRF-TOKEN", token))
                        .header("X-XSRF-TOKEN", token))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(302);
    }

    @Test
    void signingOutWithoutTheTokenIsRefused() throws Exception {
        // Another site can make the browser post to /logout, but cannot read the cookie.
        MvcResult result = mvc.perform(post("/logout")
                        .with(oidcLogin())
                        .cookie(new Cookie("XSRF-TOKEN", "4bb1e2c0-6c35-4b5e-9f0d-3d1f2b7a9e11")))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(403);
    }
}
