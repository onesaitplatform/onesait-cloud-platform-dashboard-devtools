# Onesait Platform: Dashboard Engine Dev Tools

Dev tools are the way to develop existing dashboards in local environment without internet connection.

**Requirements:**
* **npm 6.13.4 or later**
* **node v12.14.0 or later**
* **Code editor like Visual Studio Code**
* **Google Chrome Navigator**

First of all, you need to download and existing dashboard model in order to prepare the workspace for develop it.

Steps for preparing workspace:

1. You need to download de dashboard model with the button o api rest for it and put it into "/models/downloaded" folder

    ![GitHub Logo](/images/1.png)


1. Run prepare workspace with it (this prepare your workspace in src folder for local development):
    
        npm run preparews {dashboardname}

    For example:

        npm run preparews Visualize\ OpenFlights\ Data

    ![GitHub Logo](/images/2.png)

1. That's all, you can now run the dashboard engine dev server and go to the index page and select your dashboard in http://localhost:3000

        npm run server

Steps for deploying workspace:

1. Get a final new version of your code working in local enviroment

1. Run build model from workspace:
    
        npm run buildmodel {dashboardname}

    For example:

        npm run buildmodel Visualize\ OpenFlights\ Data
    ![GitHub Logo](/images/3.png)
    
1. Update dashboard in platform with the generated one in "/models/dist" folder
    
At this moment, dev tools only allow you to develop existing templates, you can't develop no-template gadget and you can't move or resize with the ui. You can modify the json file generated but this is not recomended.
