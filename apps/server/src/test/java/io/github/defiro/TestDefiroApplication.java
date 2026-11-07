package io.github.defiro;

import org.springframework.boot.SpringApplication;

public class TestDefiroApplication {

    public static void main(String[] args) {
        SpringApplication.from(DefiroApplication::main)
                .with(TestcontainersConfiguration.class)
                .run(args);
    }
}
