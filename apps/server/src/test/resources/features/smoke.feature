@smoke
Feature: Smoke check
  After every deployment, defiro must be up and reach its database.

  Scenario: The server is up
    When someone checks the server's health
    Then the server answers that it is up
