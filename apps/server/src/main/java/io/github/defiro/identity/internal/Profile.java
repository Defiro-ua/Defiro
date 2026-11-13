package io.github.defiro.identity.internal;

import java.util.List;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

/**
 * Who is signed in, as Entra ID says in the id token. defiro keeps none of it: it is read again
 * at every sign-in. The menu lists the web app's side menu items this person may see.
 */
record Profile(String name, String unit, String jobTitle, String manager, List<String> menu) {

    // The value of the app role in Entra ID; its display name is «Workflow Manager».
    static final String WORKFLOW_MANAGER = "WorkflowManager";

    private static final List<String> EVERYONE = List.of("new-request", "inbox");
    private static final List<String> WORKFLOW_MANAGERS =
            List.of("create-workflow", "new-request", "inbox", "workflows");

    static Profile of(OidcUser user) {
        List<String> roles = user.getClaimAsStringList("roles");
        boolean workflowManager = roles != null && roles.contains(WORKFLOW_MANAGER);
        return new Profile(
                user.getClaimAsString("name"),
                user.getClaimAsString("department"),
                user.getClaimAsString("jobTitle"),
                user.getClaimAsString("manager"),
                workflowManager ? WORKFLOW_MANAGERS : EVERYONE);
    }
}
