/**
 * Workflow Engine: runs procedure instances and hosts plugins (architecture §4, §5).
 */
@ApplicationModule(
    displayName = "Workflow Engine",
    allowedDependencies = { "registry", "identity" })
package io.github.defiro.engine;

import org.springframework.modulith.ApplicationModule;
