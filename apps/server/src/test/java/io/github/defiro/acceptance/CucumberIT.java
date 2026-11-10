package io.github.defiro.acceptance;

import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

/**
 * Runs every feature file under {@code src/test/resources/features}. The name ends in {@code IT}, so
 * Failsafe runs it in the acceptance stage, with Docker. Settings are in {@code
 * junit-platform.properties}.
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
class CucumberIT {}
