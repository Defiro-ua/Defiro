package io.github.defiro.acceptance.identity;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.ParameterType;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.github.defiro.FakeEntraId;
import io.github.defiro.FakeEntraId.Account;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * UC01. Each scenario is one browser: it keeps defiro's cookies and follows the sign-in redirects by
 * hand, through {@link FakeEntraId}, the way a browser does through Microsoft's sign-in page.
 */
public class IdentitySteps {

    private static final String INBOX = "/caixa-de-tarefas";
    private static final String HOME = "/";
    private static final Pattern MENU_ITEM = Pattern.compile("«([^»]+)»");
    private static final Map<String, String> MENU_ITEMS = Map.of(
            "Criar workflow", "create-workflow",
            "Novo pedido", "new-request",
            "Caixa de tarefas", "inbox",
            "Workflows", "workflows");
    private static final Map<String, String> NOTICES = Map.of("Sessão terminada", "sessao-terminada");

    private final FakeEntraId entraId = FakeEntraId.instance();
    private final Map<String, String> cookies = new HashMap<>();

    @Autowired
    JdbcTemplate jdbc;

    private String person;
    private Response lastResponse;

    @ParameterType("[A-Z][\\p{L}]+ [A-Z][\\p{L}]+")
    public String person(String name) {
        return name;
    }

    @Given("the organization's Entra ID has these accounts")
    public void theOrganizationsEntraIdHasTheseAccounts(DataTable table) {
        entraId.directory(table.asMaps().stream()
                .map(row -> new Account(
                        row.get("name"),
                        row.get("unit"),
                        row.get("job title"),
                        row.get("manager"),
                        blankToNull(row.get("app role"))))
                .toList());
    }

    @When("{person} chooses to sign in")
    public void choosesToSignIn(String name) {
        person = name;
        lastResponse = startSignIn();
    }

    @When("{person} signs in")
    public void signsIn(String name) {
        person = name;
        lastResponse = signIn(name);
    }

    @When("she signs in again")
    public void sheSignsInAgain() {
        lastResponse = signIn(person);
    }

    @Given("{person} is signed in")
    public void isSignedIn(String name) {
        person = name;
        assertLandsOnInbox(signIn(name));
    }

    @Given("{person} signed in and out as {string}")
    public void signedInAndOutAs(String name, String jobTitle) {
        isSignedIn(name);
        assertThat(profile().jsonPath().getString("jobTitle")).isEqualTo(jobTitle);
        assertThat(signOut().statusCode()).isEqualTo(302);
    }

    @Given("IT has since changed her job title in Entra ID to {string}")
    public void itChangedHerJobTitle(String jobTitle) {
        Account account = entraId.account(person);
        entraId.save(new Account(account.name(), account.unit(), jobTitle, account.manager(), account.appRole()));
    }

    @When("she signs out")
    public void sheSignsOut() {
        lastResponse = signOut();
    }

    @Then("she is sent to the organization's sign-in page")
    public void sheIsSentToTheOrganizationsSignInPage() {
        assertThat(lastResponse.statusCode()).isEqualTo(302);
        URI location = URI.create(lastResponse.header("Location"));
        assertThat(location.getScheme() + "://" + location.getAuthority() + location.getPath())
                .isEqualTo(entraId.authorizationEndpoint());
        assertThat(location.getQuery()).contains("client_id=" + FakeEntraId.CLIENT_ID);
    }

    @Then("defiro knows her as {string}, {string} in {string}, managed by {string}")
    public void defiroKnowsHerAs(String name, String jobTitle, String unit, String manager) {
        Response me = profile();
        assertThat(me.statusCode()).isEqualTo(200);
        assertThat(me.jsonPath().getString("name")).isEqualTo(name);
        assertThat(me.jsonPath().getString("jobTitle")).isEqualTo(jobTitle);
        assertThat(me.jsonPath().getString("unit")).isEqualTo(unit);
        assertThat(me.jsonPath().getString("manager")).isEqualTo(manager);
    }

    @Then("defiro knows her job title as {string}")
    public void defiroKnowsHerJobTitleAs(String jobTitle) {
        Response me = profile();
        assertThat(me.statusCode()).isEqualTo(200);
        assertThat(me.jsonPath().getString("jobTitle")).isEqualTo(jobTitle);
    }

    @Then("defiro has stored no password")
    public void defiroHasStoredNoPassword() {
        assertLandsOnInbox(lastResponse);
        List<String> columns = jdbc.queryForList("""
                select table_schema || '.' || table_name || '.' || column_name
                from information_schema.columns
                where table_schema not in ('pg_catalog', 'information_schema')
                  and (column_name ilike '%pass%' or column_name ilike '%pwd%' or column_name ilike '%secret%')
                """, String.class);
        assertThat(columns).as("columns that could hold a password").isEmpty();
    }

    @Then("she lands on her task inbox")
    public void sheLandsOnHerTaskInbox() {
        assertLandsOnInbox(lastResponse);
    }

    @Then("^her side menu is (.+)$")
    public void herSideMenuIs(String items) {
        List<String> expected = MENU_ITEM
                .matcher(items)
                .results()
                .map(match -> MENU_ITEMS.get(match.group(1)))
                .toList();
        assertThat(expected).doesNotContainNull().isNotEmpty();
        Response me = profile();
        assertThat(me.statusCode()).isEqualTo(200);
        assertThat(me.jsonPath().getList("menu", String.class)).containsExactlyElementsOf(expected);
    }

    @Then("the top bar shows {string} and {string}")
    public void theTopBarShows(String name, String jobTitle) {
        Response me = profile();
        assertThat(me.statusCode()).isEqualTo(200);
        assertThat(me.jsonPath().getString("name")).isEqualTo(name);
        assertThat(me.jsonPath().getString("jobTitle")).isEqualTo(jobTitle);
    }

    @Then("she is no longer signed in to defiro")
    public void sheIsNoLongerSignedIn() {
        assertThat(lastResponse.statusCode()).isEqualTo(302);
        assertThat(profile().statusCode()).isEqualTo(401);
    }

    @Then("^she is back on the home page with the notice «(.+)»$")
    public void sheIsBackOnTheHomePageWithTheNotice(String text) {
        // The web app shows the notice's text for this marker; the browser journey checks the text.
        String notice = NOTICES.get(text);
        assertThat(notice).isNotNull();
        assertThat(lastResponse.statusCode()).isEqualTo(302);
        URI location = URI.create(lastResponse.header("Location"));
        assertThat(location.getPath()).isEqualTo(HOME);
        assertThat(location.getQuery()).isEqualTo("aviso=" + notice);
    }

    /** The first leg: defiro sends the browser to the provider's authorization endpoint. */
    private Response startSignIn() {
        return remember(app().get("/oauth2/authorization/" + FakeEntraId.REGISTRATION_ID));
    }

    /** The whole round trip: defiro, the provider's sign-in, and back to defiro's callback. */
    private Response signIn(String name) {
        entraId.signInAs(name);
        Response toProvider = startSignIn();
        assertThat(toProvider.statusCode())
                .as("defiro sends the browser to Entra ID")
                .isEqualTo(302);
        Response fromProvider =
                given().urlEncodingEnabled(false).redirects().follow(false).get(toProvider.header("Location"));
        assertThat(fromProvider.statusCode())
                .as("Entra ID sends the browser back")
                .isEqualTo(302);
        return remember(app().get(fromProvider.header("Location")));
    }

    /** As the web app does: it reads the CSRF cookie and sends it back in a header. */
    private Response signOut() {
        profile();
        String csrf = cookies.get("XSRF-TOKEN");
        RequestSpecification request = app();
        if (csrf != null) {
            request = request.header("X-XSRF-TOKEN", csrf);
        }
        return remember(request.post("/logout"));
    }

    private Response profile() {
        return remember(app().get("/api/me"));
    }

    private static void assertLandsOnInbox(Response response) {
        assertThat(response.statusCode()).isEqualTo(302);
        assertThat(URI.create(response.header("Location")).getPath()).isEqualTo(INBOX);
    }

    private RequestSpecification app() {
        // Locations come already encoded, so they are sent as they are, like a browser does.
        return given().urlEncodingEnabled(false).redirects().follow(false).cookies(cookies);
    }

    private Response remember(Response response) {
        for (Cookie cookie : response.detailedCookies()) {
            if (cookie.getMaxAge() == 0 || cookie.getValue().isEmpty()) {
                cookies.remove(cookie.getName());
            } else {
                cookies.put(cookie.getName(), cookie.getValue());
            }
        }
        return response;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
