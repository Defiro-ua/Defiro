package io.github.defiro.acceptance;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.response.Response;

public class SmokeSteps {

    private Response response;

    @When("someone checks the server's health")
    public void someoneChecksTheServersHealth() {
        response = given().get("/actuator/health");
    }

    @Then("the server answers that it is up")
    public void theServerAnswersThatItIsUp() {
        response.then().statusCode(200).body("status", equalTo("UP"));
    }
}
