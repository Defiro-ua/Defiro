/**
 * Identity: the only module that talks to the Identity Provider (architecture §4, §8.1).
 */
@ApplicationModule(
    displayName = "Identity",
    allowedDependencies = {})
package io.github.defiro.identity;

import org.springframework.modulith.ApplicationModule;
