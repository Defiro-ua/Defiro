package io.github.defiro.identity.internal;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration(proxyBeanMethods = false)
class SecurityConfiguration {

    // Health stays public so the app can be probed. Everything else needs someone signed in:
    // - with a bearer token from the provider set in spring.security.oauth2.resourceserver.jwt.issuer-uri
    // - or, in the browser, through the provider registered in spring.security.oauth2.client
    //   (Entra ID), which keeps them signed in with a session.
    // Any OpenID Connect provider works; nothing here is specific to one.
    // With neither there is no way to sign in, so everything else is denied.
    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<JwtDecoder> jwtDecoder,
            ObjectProvider<ClientRegistrationRepository> clientRegistrations) {
        http.authorizeHttpRequests(auth -> auth.requestMatchers("/actuator/health", "/actuator/health/**")
                .permitAll()
                .anyRequest()
                .authenticated());
        if (jwtDecoder.getIfAvailable() != null) {
            http.oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
        }
        if (clientRegistrations.getIfAvailable() == null) {
            http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        } else {
            signInInTheBrowser(http);
        }
        return http.build();
    }

    // Browsers sign in through the provider's page; the API still answers 401, since the web app
    // calls it with fetch, which cannot follow a redirect to that page.
    // The session cookie goes with every request, so writes need the CSRF token. The web app reads
    // it from the XSRF-TOKEN cookie and sends it back in the X-XSRF-TOKEN header.
    private static void signInInTheBrowser(HttpSecurity http) {
        http.oauth2Login(login -> login.successHandler(Landing.onInbox()))
                .csrf(csrf -> csrf.spa())
                .logout(logout -> logout.logoutSuccessUrl(Landing.SIGNED_OUT))
                .exceptionHandling(exceptions -> exceptions.defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        PathPatternRequestMatcher.pathPattern("/api/**")));
    }
}
