package io.github.defiro.identity.internal;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.ClaimAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProfileController {

    @GetMapping("/api/me")
    Profile me(@AuthenticationPrincipal ClaimAccessor user) {
        return Profile.of(user);
    }
}
