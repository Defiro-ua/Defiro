package io.github.defiro.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

class ProfileTest {

    @Test
    void aWorkflowManagerAlsoGetsTheWorkflowsInTheMenu() {
        Profile profile = Profile.of(signedIn(List.of("WorkflowManager")));

        assertThat(profile.menu()).containsExactly("create-workflow", "new-request", "inbox", "workflows");
    }

    @Test
    void anEmployeeWithoutTheRoleGetsOnlyRequestsAndTheInbox() {
        Profile profile = Profile.of(signedIn(List.of()));

        assertThat(profile.menu()).containsExactly("new-request", "inbox");
    }

    @Test
    void anotherAppRoleDoesNotOpenTheWorkflows() {
        Profile profile = Profile.of(signedIn(List.of("Workflow.Reader")));

        assertThat(profile.menu()).containsExactly("new-request", "inbox");
    }

    @Test
    void someoneWithNoRolesClaimAtAllGetsOnlyRequestsAndTheInbox() {
        // Entra ID leaves the roles claim out when the person has no app role.
        Profile profile = Profile.of(signedIn(null));

        assertThat(profile.menu()).containsExactly("new-request", "inbox");
    }

    private static OidcUser signedIn(List<String> roles) {
        OidcIdToken.Builder token =
                OidcIdToken.withTokenValue("id-token").subject("ana").claim("name", "Ana Ferreira");
        if (roles != null) {
            token.claim("roles", roles);
        }
        return new DefaultOidcUser(AuthorityUtils.createAuthorityList("OIDC_USER"), token.build());
    }
}
