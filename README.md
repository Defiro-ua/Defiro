<p align="center">
  <a href="https://defiro-ua.github.io/website/"><img src=".github/assets/logo.png" width="320" alt="Defiro"/></a>
</p>

<p align="center">
  <a href="https://github.com/Defiro-ua/defiro/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/Defiro-ua/defiro/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"/></a>
  <a href="https://sonarcloud.io/summary/new_code?id=Defiro-ua_Defiro"><img src="https://img.shields.io/sonar/quality_gate/Defiro-ua_Defiro?server=https%3A%2F%2Fsonarcloud.io&label=quality%20gate&logo=sonarqubecloud" alt="Quality gate"/></a>
  <a href="https://sonarcloud.io/summary/overall?id=Defiro-ua_Defiro"><img src="https://img.shields.io/sonar/coverage/Defiro-ua_Defiro?server=https%3A%2F%2Fsonarcloud.io&logo=sonarqubecloud" alt="Coverage"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-EUPL%201.2-blue" alt="License: EUPL-1.2"/></a>
</p>

<p align="center">
  <b>Build your workflows without writing any code.</b> A fully adaptable workflow automation platform.
</p>

Draw a workflow in the designer: the steps it goes through, the people involved at each step, and the information they need. Once published, it's ready for people to start requests. Defiro takes care of the forms, inboxes, approvals and notifications along the way. Our first case study is municipal administration, starting with reimbursing an employee's travel expenses.

- **Versioned on every publish.** Each time you publish a workflow, Defiro keeps it as a new version.
- **Every request accounted for.** Each request is tracked from step to step, and every change to it is recorded.
- **Extensible by plugins.** Whatever a workflow needs beyond the basics comes as a plugin, loaded at runtime from the Plugin Registry.

**Get started.** Needs JDK 21 and Docker:

```bash
git clone https://github.com/Defiro-ua/defiro.git
cd defiro
./mvnw verify                                 # builds everything and runs the tests
docker compose -f deploy/compose.yaml up -d   # local Postgres on port 5432
java -jar apps/server/target/server-0.1.0-SNAPSHOT.jar
```

That's it: the server answers at <http://localhost:8080/actuator/health>.

**Any identity provider.** People sign in through any OpenID Connect provider, such as Microsoft Entra ID, Keycloak or Auth0: [connect yours](#sign-in).

---

## Prerequisites

| Requirement | Minimum | Check | Install |
|---|---|---|---|
| JDK | 21 | `java -version` | [Eclipse Temurin](https://adoptium.net/) |
| Docker | running | `docker info` | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| Node.js *(web app only)* | 22 | `node --version` | [nodejs.org](https://nodejs.org/) |

You don't need to install Maven: the repository includes the Maven wrapper (`./mvnw`, or `mvnw.cmd` in a Windows terminal).

**Windows quick install:**
```powershell
winget install EclipseAdoptium.Temurin.21.JDK Docker.DockerDesktop
```

**macOS quick install (Homebrew):**
```bash
brew install --cask temurin@21 docker-desktop
```

**Ubuntu/Debian:**
```bash
sudo apt install openjdk-21-jdk docker.io
```

> [!IMPORTANT]
> Build with JDK 21. If the formatting check fails with a `NoSuchFieldError` from `com.sun.tools.javac`, Maven is running on a newer JDK that palantir-java-format doesn't support yet.

---

## Run it locally

The quick start is at the top of this README. This section covers the IDE and sign-in.

**In IntelliJ IDEA**, open the folder, set the project SDK to 21 (**File → Project Structure**), and run `DefiroApplication`. To skip the compose step, run `TestDefiroApplication` (in `apps/server/src/test`) instead: it starts its own throwaway Postgres.

### Sign-in

The server accepts tokens from any OpenID Connect provider (Microsoft Entra ID, Keycloak, Auth0 and others). Point it at one with environment variables:

| Variable | Example for Microsoft Entra ID |
|---|---|
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI` | `https://login.microsoftonline.com/<tenant-id>/v2.0` |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_AUDIENCES` | the server's app registration, such as `api://defiro` |

> [!NOTE]
> Without an issuer, nobody can sign in: only `/actuator/health` answers, and every other request is refused.

---

## Project layout

| Path | What it is |
|---|---|
| `apps/server` | The Spring Boot app, split into modules: `designer`, `engine`, `registry`, `identity` |
| `apps/web` | The React web app |
| `packages/spec` | Specification model, plain Java |
| `packages/plugin-sdk` | The interface plugins implement, plain Java |
| `plugins/` | Built-in plugins, loaded at runtime from the Plugin Registry |
| `deploy/compose.yaml` | Local Postgres |

---

## Rules to know before writing code

- **Modules.** Code goes in one of the server's modules. A module's root package is its public API; everything else goes in its sub-packages, which other modules can't use. Each module's `package-info.java` lists the modules it may depend on. `ModularityTests` fails the build if code breaks these rules.
- **Data.** Each module owns one database schema (`designer`, `engine`, `registry`). Flyway migrations go in `apps/server/src/main/resources/db/migration` and always use schema-qualified table names, such as `engine.instance`.
- **Plugins.** The server never depends on a plugin. A plugin's id is `name@version`, generated by `plugins/pom.xml`.
- **Tests.** Name a test after what it needs: `*Test` when a JDK is enough, `*IT` when it starts Docker containers.

---

## Common commands

```bash
./mvnw verify                                 # everything CI runs for the server; needs Docker
./mvnw verify -DskipITs                       # commit stage only: formatting, build and unit tests, no Docker
./mvnw spotless:apply                         # formats the Java code
docker compose -f deploy/compose.yaml up -d   # starts the local Postgres
docker compose -f deploy/compose.yaml down    # stops it; add -v to delete its data
```

---

## Quality checks

Every pull request and every push to `main` runs the CI workflow. Each stage starts only when the one before it is green, and a pull request can merge only when every check passes.

| Stage | Check | What it does |
|---|---|---|
| Commit | **Commit · server** | Checks formatting, builds, and runs the unit tests (`*Test`). Needs no Docker. |
| | **Workflow lint** | Tests the CI scripts and checks every workflow with zizmor. |
| | **Dependency review** | Fails a pull request that adds a dependency with a known vulnerability. |
| Acceptance | **Acceptance** | Runs the integration tests (`*IT`) against PostgreSQL in Testcontainers. |
| Quality | **Quality gate** | Analyses the code in SonarQube Cloud, with the coverage of both test stages. |

The quality gate has two parts:

- **On new code:** no new issues, at least 80% coverage, at most 3% duplication, and every new security hotspot reviewed.
- **On the overall code:** security rating A.

When a check is red, open the run from the pull request: the log names the failing test, and the test reports are in the run's artifacts.

<details>
<summary><b>How the gate is enforced</b> (click to expand)</summary>

SonarQube Cloud's built-in **Sonar way** gate checks coverage, duplication and hotspots, but it judges new issues by ratings, so a few minor code smells would still pass it. Its free plan can't change the gate, so CI adds the other two conditions through SonarQube's API: a pull request fails if it adds any issue, and the gate fails if `main`'s code doesn't have security rating A. An issue you accept in SonarQube Cloud, with the reason, no longer counts as new.

If `main` loses its A (for example when SonarQube adds a rule that finds an issue in existing code), every pull request fails the gate until it's fixed: to merge the fix, a maintainer marks the listed issues as Accepted in SonarQube Cloud, with the reason, and re-runs the gate.

Pull requests from forks can't read the SonarQube token, so the gate fails for them until a maintainer runs the analysis.

</details>

---

## Editor setup

IntelliJ offers to install **palantir-java-format**, so *Reformat Code* gives the same result as CI, and **SonarQube for IDE**, which then offers to bind to the SonarQube Cloud project and flags the same issues while you code.

> [!TIP]
> The repository stores text files with LF line endings. On Windows, if the formatting check reports files you didn't change, your working copy still has CRLF line endings. Commit or stash your work, then refresh it once:
>
> ```bash
> git rm -rq --cached . && git reset -q --hard
> ```

---

## Dependencies

Dependabot opens pull requests for outdated or vulnerable dependencies. Version updates wait 7 days after a release, so a compromised release is usually caught before it reaches us; security updates come straight away.

---

## Contributing

Branch from `main`, named after the story you're working on, such as `UC18-reject-reasons`. Write the tests first, then open a pull request and fill in its template: what changed and why, and the Definition of Done. CI checks everything else, and a pull request merges only when every check is green.

Reviewers read the tests first, and ask what would make them fail.

---

## Contributors

<a href="https://github.com/Defiro-ua/defiro/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Defiro-ua/defiro" alt="Defiro contributors" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

---

## License

Defiro is open source under the [European Union Public Licence v. 1.2](LICENSE) (EUPL-1.2).
