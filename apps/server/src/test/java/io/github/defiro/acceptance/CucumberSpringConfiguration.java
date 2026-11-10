package io.github.defiro.acceptance;

import io.cucumber.java.Before;
import io.cucumber.spring.CucumberContextConfiguration;
import io.github.defiro.TestTokens;
import io.github.defiro.TestcontainersConfiguration;
import io.restassured.RestAssured;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

/**
 * The one Spring context every scenario shares: the whole app on a random port, PostgreSQL in
 * Testcontainers, and an identity provider that trusts {@link TestTokens}. Step definitions go in
 * this package or below it, one sub-package per module, for example {@code acceptance.designer}.
 */
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Import({TestcontainersConfiguration.class, TestTokens.TrustedIssuer.class})
public class CucumberSpringConfiguration {

    @LocalServerPort
    int port;

    @Before
    public void pointRestAssuredAtTheApp() {
        RestAssured.port = port;
    }
}
