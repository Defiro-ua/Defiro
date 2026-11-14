package io.github.defiro.identity.internal;

import java.util.List;
import org.springframework.security.oauth2.core.ClaimAccessor;

/**
 * Who is signed in, as Entra ID says in the token: the id token of a browser sign-in, or the
 * bearer token another client sends. defiro keeps none of it: it is read again
 * at every sign-in. The groups are the object ids of the Entra ID groups this person belongs to.
 * The menu lists the web app's side menu items this person may see.
 */
record Profile(String name, String unit, String jobTitle, String manager, List<String> groups, List<String> menu) {

    // The value of the app role in Entra ID; its display name is «Workflow Manager».
    static final String WORKFLOW_MANAGER = "WorkflowManager";

    private static final List<String> EVERYONE = List.of("new-request", "inbox");
    private static final List<String> WORKFLOW_MANAGERS =
            List.of("create-workflow", "new-request", "inbox", "workflows");

    static Profile of(ClaimAccessor user) {
        List<String> roles = user.getClaimAsStringList("roles");
        boolean workflowManager = roles != null && roles.contains(WORKFLOW_MANAGER);
        List<String> groups = user.getClaimAsStringList("groups");
        return new Profile(
                user.getClaimAsString("name"),
                user.getClaimAsString("department"),
                user.getClaimAsString("jobTitle"),
                user.getClaimAsString("manager"),
                groups == null ? List.of() : groups,
                workflowManager ? WORKFLOW_MANAGERS : EVERYONE);
    }
}
