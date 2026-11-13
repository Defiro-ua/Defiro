package io.github.defiro.identity.internal;

import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

/** Where the browser goes after signing in and out. The routes are the web app's. */
final class Landing {

    // The task inbox (UC27). Until UC27 exists, this route of the web app is its placeholder.
    static final String INBOX = "/caixa-de-tarefas";

    // The home page, with the notice «Sessão terminada»; the web app shows the text.
    static final String SIGNED_OUT = "/?aviso=sessao-terminada";

    private Landing() {}

    /** Always the inbox, whatever page was asked for before signing in. */
    static AuthenticationSuccessHandler onInbox() {
        return new SimpleUrlAuthenticationSuccessHandler(INBOX);
    }
}
