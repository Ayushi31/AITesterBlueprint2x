package com.salesforce.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(xpath = "//input[@id='username']")
    private WebElement usernameField;

    @FindBy(xpath = "//input[@id='password']")
    private WebElement passwordField;

    @FindBy(xpath = "//input[@id='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//input[@id='rememberUn']")
    private WebElement rememberMeCheckbox;

    @FindBy(xpath = "//div[@id='error']")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public void enterUsername(String username) throws Exception {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameField)).sendKeys(username);
        } catch (Exception e) {
            throw new Exception("Username field not interactable: " + e.getMessage());
        }
    }

    public void enterPassword(String password) throws Exception {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordField)).sendKeys(password);
        } catch (Exception e) {
            throw new Exception("Password field not interactable: " + e.getMessage());
        }
    }

    public void checkRememberMe() throws Exception {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(rememberMeCheckbox));
            if (!rememberMeCheckbox.isSelected()) {
                rememberMeCheckbox.click();
            }
        } catch (Exception e) {
            throw new Exception("Remember Me checkbox not interactable: " + e.getMessage());
        }
    }

    public void clickLogin() throws Exception {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        } catch (Exception e) {
            throw new Exception("Login button not interactable: " + e.getMessage());
        }
    }

    public void doLogin(String username, String password, boolean rememberMe) throws Exception {
        enterUsername(username);
        enterPassword(password);
        if (rememberMe) {
            checkRememberMe();
        }
        clickLogin();
    }

    public boolean isErrorMessageDisplayed() throws Exception {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).isDisplayed();
        } catch (Exception e) {
            throw new Exception("Error message not displayed: " + e.getMessage());
        }
    }

    public String getErrorMessageText() throws Exception {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (Exception e) {
            throw new Exception("Error message text not readable: " + e.getMessage());
        }
    }
}
