package io.github.defiro.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;

class LandingTest {

    @Test
    void signingInLandsOnTheInboxEvenWhenAnotherPageWasAskedFirst() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/workflows");
        MockHttpServletResponse response = new MockHttpServletResponse();
        new HttpSessionRequestCache().saveRequest(request, response);

        Landing.onInbox()
                .onAuthenticationSuccess(request, response, new TestingAuthenticationToken("ana", null, "OIDC_USER"));

        assertThat(response.getRedirectedUrl()).isEqualTo("/caixa-de-tarefas");
    }
}
