package io.github.defiro.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(ProfileController.class)
@Import({SecurityConfiguration.class, EntraRegistration.class})
class ProfileControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void theProfileIsReadFromTheEntraIdToken() throws Exception {
        MvcResult result = mvc.perform(get("/api/me")
                        .with(oidcLogin()
                                .idToken(token -> token.claim("name", "Ana Ferreira")
                                        .claim("department", "Divisão de Obras Municipais")
                                        .claim("jobTitle", "Técnica Superior")
                                        .claim("manager", "Rui Matos"))))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String body = result.getResponse().getContentAsString();
        assertThat((String) JsonPath.read(body, "$.name")).isEqualTo("Ana Ferreira");
        assertThat((String) JsonPath.read(body, "$.unit")).isEqualTo("Divisão de Obras Municipais");
        assertThat((String) JsonPath.read(body, "$.jobTitle")).isEqualTo("Técnica Superior");
        assertThat((String) JsonPath.read(body, "$.manager")).isEqualTo("Rui Matos");
    }

    @Test
    void aBrowserStaysSignedInThroughItsSession() throws Exception {
        // What the sign-in leaves in the session once Entra ID sends the browser back.
        OidcIdToken idToken = OidcIdToken.withTokenValue("id-token")
                .subject("ana")
                .claim("name", "Ana Ferreira")
                .build();
        var authorities = AuthorityUtils.createAuthorityList("OIDC_USER");
        var signedIn = new OAuth2AuthenticationToken(new DefaultOidcUser(authorities, idToken), authorities, "entra");
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, new SecurityContextImpl(signedIn));

        MvcResult result = mvc.perform(get("/api/me").session(session)).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat((String) JsonPath.read(result.getResponse().getContentAsString(), "$.name"))
                .isEqualTo("Ana Ferreira");
    }
}
