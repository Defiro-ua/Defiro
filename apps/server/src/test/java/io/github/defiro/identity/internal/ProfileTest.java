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

    @Test
    void theGroupsAreTheObjectIdsEntraIdSends() {
        List<String> groups = List.of("8f1c2a5e-0000-4000-8000-000000000001", "8f1c2a5e-0000-4000-8000-000000000002");

        Profile profile = Profile.of(signedIn(List.of(), groups));

        assertThat(profile.groups()).containsExactlyElementsOf(groups);
    }

    @Test
    void someoneWithNoGroupsClaimAtAllBelongsToNoGroup() {
        // Entra ID leaves the groups claim out when the person is in no group.
        Profile profile = Profile.of(signedIn(List.of()));

        assertThat(profile.groups()).isEmpty();
    }

    private static OidcUser signedIn(List<String> roles) {
        return signedIn(roles, null);
    }

    private static OidcUser signedIn(List<String> roles, List<String> groups) {
        OidcIdToken.Builder token =
                OidcIdToken.withTokenValue("id-token").subject("ana").claim("name", "Ana Ferreira");
        if (roles != null) {
            token.claim("roles", roles);
        }
        if (groups != null) {
            token.claim("groups", groups);
        }
        return new DefaultOidcUser(AuthorityUtils.createAuthorityList("OIDC_USER"), token.build());
    }
}
