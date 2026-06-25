package com.salesforce.tests;

import com.salesforce.pages.LoginPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import java.time.Duration;

public class ValidLoginTest {

    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeTest
    public void setUp() throws Exception {
        try {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--remote-allow-origins=*");
            driver = new ChromeDriver(options);
            driver.manage().window().maximize();
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(60));
            driver.get("https://login.salesforce.com/?locale=in");
            loginPage = new LoginPage(driver);
        } catch (Exception e) {
            throw new Exception("Configuration failure during WebDriver setup: " + e.getMessage());
        }
    }

    @Test
    public void testValidLogin() throws Exception {
        try {
            loginPage.doLogin("validuser@salesforce.com", "ValidPassword123", true);
            Assert.assertNotEquals(driver.getCurrentUrl(), "https://login.salesforce.com/?locale=in");
        } catch (AssertionError a) {
            throw new AssertionError("Assertion failed: URL did not redirect after valid login. " + a.getMessage());
        } catch (Exception e) {
            throw new Exception("Test execution failed: " + e.getMessage());
        }
    }

    @AfterTest
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
