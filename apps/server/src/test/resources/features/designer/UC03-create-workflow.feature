# Draft for team review: the examples come from the acceptance criteria of issue #27 and the
# messages of the web prototype (apps/web/src/domain/designer.ts). No Example Mapping was run yet.
# @wip until the Designer API exists: the pipeline skips it.
@UC03 @wip
Feature: Create workflow
  As a Workflow Manager,
  I want to create a workflow in the designer, one question at a time,
  so that a new type of request can be made without programming.

  Background:
    Given Sofia Almeida is a Workflow Manager
    And she is designing the workflow "Ajudas de custo"

  # Criteria 1, 2, 3 and 8 are about the screens, so they run in the UC03 browser journey.
  # open question: does the Definition of Done accept @browser rules that run only in the nightly journey?
  @browser
  Rule: «Criar workflow» is the main button in the Workflow Manager's side menu

    Scenario: The Workflow Manager starts a workflow from the side menu
      When Sofia Almeida opens defiro
      Then «Criar workflow» is the main button of her side menu

  @browser
  Rule: The designer is a sequence of screens, each with «Passo X de N» and a progress bar

    Scenario: The first screen asks for the name
      When she starts creating a workflow
      Then she sees the screen for the name with «Passo 1 de 6»

  @browser
  Rule: «Anterior» goes back without losing answers, and «Sair» leaves the designer

    Scenario: Going back keeps the answers
      Given she named the workflow and moved on
      When she goes back
      Then the name "Ajudas de custo" is still there

  Rule: Each review step has a name, who handles it, a deadline and its reasons
    # open question (UC06, NXS2608): does the designer only store the deadline, with the 1 to 90 rule in UC06?

    Scenario: A complete review step joins the path
      When she adds the review step "Validação da chefia" handled by "Chefias da unidade do requerente" with a deadline of 5 working days
      Then the path is "Pedido", "Validação da chefia"

  Rule: Each step needs at least one reason, every reason needs a name, and return and reject reasons are separate

    Scenario: A step with no reasons cannot be created
      Given the step "Validação da chefia" has no reasons
      When she creates the workflow
      Then it is refused with "Passo 2 («Validação da chefia»): acrescente pelo menos um motivo para devolver ou rejeitar."

    Scenario: A reason with no name cannot be created
      Given the step "Validação da chefia" has a return reason with no name
      When she creates the workflow
      Then it is refused with "Passo 2 («Validação da chefia»): dê um nome ao motivo 1."

    Scenario: Return and reject reasons are kept apart
      When she gives "Validação da chefia" the return reason "Preenchido incorretamente" and the reject reason "Pedido não autorizado"
      Then "Validação da chefia" can be returned for "Preenchido incorretamente" only
      And it can be rejected for "Pedido não autorizado" only

  Rule: Steps can be edited, moved, removed or added, and the final validation is always last
    # open question: can the request step «Pedido» ever be removed or moved? The prototype says no.

    Scenario: Moving a review step up
      Given the path is "Pedido", "Validação da chefia", "Verificação financeira"
      When she moves "Verificação financeira" up
      Then the path is "Pedido", "Verificação financeira", "Validação da chefia"

    Scenario: Removing a review step
      Given the path is "Pedido", "Validação da chefia", "Verificação financeira"
      When she removes "Verificação financeira"
      Then the path is "Pedido", "Validação da chefia"

    Scenario: The final validation goes last
      Given the path is "Pedido", "Validação da chefia"
      When she adds a final validation step
      Then the path ends with "Validação final"

    Scenario: There is only one final validation
      Given the path ends with "Validação final"
      When she adds a final validation step
      Then the path has one "Validação final"

  Rule: A workflow with a missing or invalid answer is not created, and the error names the field

    Scenario: A workflow with no name
      Given the workflow has no name
      When she creates the workflow
      Then it is refused with "Dê um nome ao workflow." on the workflow's name

  Rule: Creating a complete workflow makes it active, with the notice «Workflow criado»

    Scenario: Creating a complete workflow
      Given the workflow is complete
      When she creates the workflow
      Then "Ajudas de custo" is active as version 1

  Rule: The new workflow appears in «Workflows» and in «Novo pedido» for the people allowed to request it
    # open question: «Novo pedido» belongs to UC13 (Engine); that part is tested once UC13 exists.

    Scenario: The new workflow is listed in «Workflows»
      Given "Ajudas de custo" was created
      When she opens the list of workflows
      Then "Ajudas de custo" is listed
