package io.github.defiro.identity.internal;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
class SecurityConfiguration {

    // Health stays public so the app can be probed. Everything else needs a bearer token from
    // the OpenID Connect provider set in spring.security.oauth2.resourceserver.jwt.issuer-uri
    // Any provider works; nothing here is specific to one.
    // Without an issuer there is no way to sign in, so everything else is denied.
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectProvider<JwtDecoder> jwtDecoder) {
        http.authorizeHttpRequests(auth -> auth.requestMatchers("/actuator/health", "/actuator/health/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // CSRF protection is off because credentials only arrive in the Authorization header,
                // which browsers never attach on their own. Turn it back on if the API ever accepts
                // credentials the browser sends automatically: a session or token cookie, HTTP basic
                // or digest authentication, a login form, or client certificates (mTLS).
                // See https://www.baeldung.com/csrf-stateless-rest-api
                .csrf(AbstractHttpConfigurer::disable);
        if (jwtDecoder.getIfAvailable() != null) {
            http.oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
        }
        return http.build();
    }
}
