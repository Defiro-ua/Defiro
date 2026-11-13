package io.github.defiro.identity.internal;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;

/**
 * Who is signed in, as Entra ID says in the id token. defiro keeps none of it: it is read again
 * at every sign-in.
 */
record Profile(String name, String unit, String jobTitle, String manager) {

    static Profile of(OidcUser user) {
        return new Profile(
                user.getClaimAsString("name"),
                user.getClaimAsString("department"),
                user.getClaimAsString("jobTitle"),
                user.getClaimAsString("manager"));
    }
}
