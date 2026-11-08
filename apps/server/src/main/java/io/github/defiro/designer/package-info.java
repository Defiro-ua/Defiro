/**
 * Workflow Designer: drafts, validating workflows against every rule, publishing specifications.
 * May use only the Engine's Deployment interface and the Plugin Registry.
 */
@ApplicationModule(
        displayName = "Workflow Designer",
        allowedDependencies = {"engine :: deployment", "registry"})
package io.github.defiro.designer;

import org.springframework.modulith.ApplicationModule;
