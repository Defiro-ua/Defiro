# Entra ID is played by a fake OpenID Connect provider: no test calls Microsoft.
# The values the user sees (menu items, notices) are the ones of the web prototype (apps/web).
@UC01
Feature: Authenticate (SSO Entra ID)
  As a municipal employee,
  I want to sign in with my organization's Microsoft account,
  so that I don't need another password and only see what my role allows.

  Background:
    Given the organization's Entra ID has these accounts
      | name          | unit                        | job title            | manager   | app role         |
      | Ana Ferreira  | Divisão de Obras Municipais | Técnica Superior     | Rui Matos |                  |
      | Sofia Almeida | Modernização Administrativa | Gestora de workflows | Rui Matos | Workflow Manager |

  Rule: The home page has a single «Entrar» button, which opens the organization's sign-in page
    # The button itself is on the screen, so the UC01 browser journey checks it.

    Scenario: Signing in starts on the organization's sign-in page
      When Ana Ferreira chooses to sign in
      Then she is sent to the organization's sign-in page

  Rule: defiro stores no password, and name, unit, job title and manager are read from Entra ID
    # open question: Entra ID does not put job title, unit and manager in the token by default.
    #                Does IT add them as optional claims, or does defiro read them from Microsoft Graph?

    Scenario: The profile comes from Entra ID
      When Ana Ferreira signs in
      Then defiro knows her as "Ana Ferreira", "Técnica Superior" in "Divisão de Obras Municipais", managed by "Rui Matos"

    Scenario: A change made in Entra ID shows at the next sign-in
      Given Ana Ferreira signed in and out as "Técnica Superior"
      And IT has since changed her job title in Entra ID to "Técnica Superior Especialista"
      When she signs in again
      Then defiro knows her job title as "Técnica Superior Especialista"

    Scenario: Signing in stores no password
      When Ana Ferreira signs in
      Then defiro has stored no password

  Rule: The groups the user belongs to are read from Entra ID
    # Departments and units are groups that already exist in Entra ID (UC05, UC28).
    # Entra ID puts each group's object id in the token, not its name.
    # open question: above 200 groups Entra ID leaves the groups out of the token (overage),
    #                and defiro would have to read them from Microsoft Graph.

    Scenario: The groups come from Entra ID
      Given in Entra ID Ana Ferreira belongs to the groups "Divisão de Obras Municipais" and "Finanças"
      When Ana Ferreira signs in
      Then defiro knows her groups as "Divisão de Obras Municipais" and "Finanças"

  Rule: After signing in, the user lands on their task inbox
    # open question: the inbox is UC27. Until it exists, signing in lands on the inbox's route
    #                in the web app, «/caixa-de-tarefas», as a placeholder.

    Scenario: Signing in lands on the inbox
      When Ana Ferreira signs in
      Then she lands on her task inbox

  Rule: The side menu only shows what the user's role allows: «Workflows» and «Criar workflow» appear only for the Workflow Manager

    Scenario: A Workflow Manager also sees the workflows
      When Sofia Almeida signs in
      Then her side menu is «Criar workflow», «Novo pedido», «Caixa de tarefas» and «Workflows»

    Scenario: An employee without the Workflow Manager role does not
      When Ana Ferreira signs in
      Then her side menu is «Novo pedido» and «Caixa de tarefas»

  Rule: The top bar shows the user's name and job title

    Scenario: The top bar shows who is signed in
      When Sofia Almeida signs in
      Then the top bar shows "Sofia Almeida" and "Gestora de workflows"

  Rule: Signing out ends the session and returns to the home page with the notice «Sessão terminada»
    # open question: should signing out of defiro also sign the user out of Microsoft (Outlook, Teams)?

    Scenario: Signing out ends the session
      Given Ana Ferreira is signed in
      When she signs out
      Then she is no longer signed in to defiro

    Scenario: Signing out returns to the home page with the notice
      Given Ana Ferreira is signed in
      When she signs out
      Then she is back on the home page with the notice «Sessão terminada»
