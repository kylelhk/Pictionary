import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from test.base_test import BaseTestCase

localhost = "http://localhost:5000"

# Define paths - change depending on where the Chrome binary and chromedriver are stored
user_home_dir = os.path.expanduser("~")
chrome_binary_path = os.path.join(user_home_dir, "chrome-linux64", "chrome")
chromedriver_path = os.path.join(user_home_dir, "chromedriver-linux64", "chromedriver")


class SeleniumTests(BaseTestCase):
    def setUp(self):
        super().setUp()

        # Define Chrome options
        self.chrome_options = Options()
        # self.chrome_options.add_argument("--headless") # uncomment to prevent browser window opening

        # Set binary location and service
        self.chrome_options.binary_location = chrome_binary_path
        self.service = Service(chromedriver_path)

        # Initialise Chrome WebDriver
        self.browser = webdriver.Chrome(
            service=self.service, options=self.chrome_options
        )

    def tearDown(self):
        self.browser.quit()  # close the browser
        super().tearDown()

    def test_make_a_correct_guess(self):
        # Navigate to Flask application login page
        self.browser.get(localhost)

        # Login
        self.browser.find_element(By.NAME, "login-username").send_keys("user1")
        self.browser.find_element(By.NAME, "login-password").send_keys("Password1")
        self.browser.find_element(By.CSS_SELECTOR, "input[value='Login']").click()

        # Check that home page has loaded by seeing if an element unique to the home page has loaded
        time.sleep(2)  # wait for the home page to load
        self.assertTrue(
            self.browser.find_element(By.CLASS_NAME, "points-title").is_displayed(),
            "Home page did not load correctly",
        )

        # Navigate to gallery and check that it has loaded
        self.browser.find_element(By.LINK_TEXT, "Guessing Gallery").click()
        time.sleep(2)  # wait for the gallery page to load
        self.assertTrue(
            self.browser.find_element(By.ID, "galleryTable").is_displayed(),
            "Gallery page did not load correctly",
        )

        # Check all drawings shown to user
        drawings = self.browser.find_elements(By.CSS_SELECTOR, "#galleryTableBody tr")
        self.assertGreater(len(drawings), 0, "No drawings found in the gallery")

        # Open the first drawing
        first_drawing_button = drawings[0].find_element(By.CSS_SELECTOR, "button")
        first_drawing_button.click()
        time.sleep(2)  # wait for the guess page to load

        # Make a correct guess
        self.browser.find_element(By.ID, "inputText").send_keys("Cook")
        self.browser.find_element(By.CLASS_NAME, "button-send").click()
        time.sleep(2)  # wait for response after guessing

        # Check if guess correct
        result_message = self.browser.find_element(By.CLASS_NAME, "bubble-light").text
        self.assertIn(
            "You guessed correctly", result_message, "Guess was not marked as correct"
        )
