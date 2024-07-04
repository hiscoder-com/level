<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/texttree/v-cana">
    <img src="public/vcana-logo-color.svg" alt="Logo" width="200" height="80">
  </a>

<h3 align="center">V-CANA</h3>

  <p align="center">
    App to translate Scripture step by step
    <br />
    <a href="https://github.com/texttree/v-cana"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://v-cana.netlify.app/">View Demo</a>
    ·
    <a href="https://github.com/texttree/v-cana/issues">Report Bug</a>
    ·
    <a href="https://github.com/texttree/v-cana/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>      
    </li>
    <li>
      <a href="#installation-v-cana-online">Installation V-CANA Online</a>      
    </li>
     <li>
      <a href="#installation-v-cana-intranet">Installation V-CANA Intranet</a>      
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

App to translate Scripture step by step


<!-- **Purpose**
- The purpose of this project

**Problem**
- The problem statement

**Scope**
- What's in scope and out of scope for this project?

**Background**
- What led us to this point? How did we get here?

<p align="right">(<a href="#top">back to top</a>)</p> -->



### Built With

* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Supabase](https://supabase.com/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started
There are 2 versions to install: V-CANA Online and V-CANA Intranet.

## Installation V-CANA Online

### Prerequisites

The online version of v-cana consists of 2 parts:
1. The Supabase project, which allows you to store data.
2. The NextJS application.

#### Install Supabase CLI.

[Guide for installation. ](https://supabase.com/docs/guides/cli/getting-started#installing-the-supabase-cli)

  **macOS**

  Install the CLI with Homebrew:

  ```sh
  brew install supabase/tap/supabase
  ```

 **Windows**

  Install the CLI with Scoop:

  ```sh
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  **Linux**

  The CLI is available through Homebrew and Linux packages.
    
  Homebrew

  ```sh
    brew install supabase/tap/supabase
  ```

  Linux packages

  Linux packages are provided in Releases.
  To install, download the .apk/.deb/.rpm file depending on your package manager and run one of the following:

  - `sudo apk add --allow-untrusted <...>.apk`
  - `sudo dpkg -i <...>.deb`
  - `sudo rpm -i <...>.rpm`
### Installation

#### Clone the repo

   ```sh
   git clone https://github.com/texttree/v-cana.git
   ```
#### Go to the v-cana folder

    cd v-cana

#### Install NPM packages
   `npm install `    or   `yarn`

#### Start supabase project
  
   ```sh
   supabase start
   ```
After the previous step is successful, information about the database configuration will appear

  ```sh
  API URL: http://127.0.0.1:64321
  GraphQL URL: http://127.0.0.1:64321/graphql/v1
  DB URL: postgresql://postgres:postgres@127.0.0.1:64322/postgres
  Studio URL: http://127.0.0.1:64323
  Inbucket URL: http://127.0.0.1:64324
  JWT secret: ***
  anon key: ***
  service_role ***
  ```
Create a copy of the env.local.example file and rename it to env.local
    
    cp .env.local.example .env.local

Copy this information to `.env.local`
    
  `API URL` to 
  `SUPABASE_URL and  NEXT_PUBLIC_SUPABASE_URL`

  `anon key` to
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`

  `service_role` to
  `SUPABASE_SERVICE_KEY`

#### Start project localy

  `npm run dev` or `yarn dev`

#### Create user

  Open `http://localhost:3000/users/create` and then create new user with login and email.

#### Sign in

  Authenticate under the created user

  Open `http://localhost:3000` and sign in.

#### Agreements

  After the first login to the site, the agreements page will open.

  After all the agreements are marked, the user's personal account will open.

  The first user is created with administrator rights, so the `Create a project` tab is available to him.

    
#### Create new project   

  Fill in all the fields in the tab "Create a project"

  In field `methods` choose value `cana-bible-eng` or `cana-obs-eng`

  In fields `List of resources` add resources url from git.door43.org.

  For example:
      
  **literal**
  ```sh
  https://git.door43.org/unfoldingWord/en_ult/commit/155ef870f6ea832e568a90ed0c000d3dfc15de6f
   ```
  **simplified**
  ```sh
  https://git.door43.org/unfoldingWord/en_ust/commit/e000eb13414df7a356efc23fd41e81eda2478065
  ```
  **tnotes**
  ```sh
  https://git.door43.org/unfoldingWord/en_tn/commit/5a2ea85b908ddb6c25cbb7978a298babd5c21003
  ```
  **tquestions**
  ```sh
  https://git.door43.org/unfoldingWord/en_tq/commit/4a886af618637e08094f0d1193fb56c345963afa
  ```
  **twords**
  ```sh
  https://git.door43.org/unfoldingWord/en_twl/commit/8534077f7d32743eafa0e98b4088ef75f49027e7
  ```
  or
    
  **obs**
  ```sh
  https://git.door43.org/unfoldingWord/en_obs/commit/07d949fbab7be5e967b385f4da5d034fae1b9b32    
  ```
  **tnotes**
  ```sh
  https://git.door43.org/unfoldingWord/en_obs-tn/commit/9407660e7e453348174843436c1053dd78f26320
  ```
  **tquestions**
  ```sh
  https://git.door43.org/unfoldingWord/en_obs-tq/commit/0ee93b9dbb5f5e89580c8bfa6f9c1d07976536ed
  ```
  **twords**
  ```sh
  https://git.door43.org/unfoldingWord/en_obs-twl/commit/44ebc9fafe8101665f985007d566f5036a2be85b
  ```
  
  Then click `Create project`
#### Start translate

  Choose and add translator.

  Create book in list of books. Then create chapter in list of chapters. Then in assigment page push button `Select all`, then `Assign` and `Start the chapter`.

  After that, a link to the translate will appear in your personal account. 

     
## Installation V-CANA Intranet

  <ol>
    <li>
      <a href="#recommendations-and-system-requirements">Recommendations and system requirements</a>
          </li>
    <li>
      <a href="#installation-of-the-necessary-environment">Installation of the necessary environment</a>      
    </li>
    <li><a href="#installing-the-v-cana-intranet">Installing the V-cana Intranet</a></li>
    <li><a href="#loading-local-resources">Loading local resources</a></li>
    <li><a href="#connecting-to-the-server">Connecting to the server</a></li>
    <li><a href="#creating-users">Creating users</a></li>
    <li><a href="#creating-a-project">Creating a project</a></li>
  </ol>

### Recommendations and system requirements

We recommend installing V-CANA Intranet on a computer with a Linux system (tested on Linux mint 21.3) and at least 16 GB of RAM.

In this instruction, we assume that the installation is carried out on a clean system without previously installed docker images.

If you do have docker images already installed, you may already have some containers running and certain ports are busy. In this case, you may need to customize the files individually `.env` and `docker-compose`.yml.

### Installation of the necessary environment

#### NodeJS

Install nvm. [The latest version](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Example of installing version 0.39.5:

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

Install the stable version of NodeJS

    nvm install --lts
#### Yarn
    npm install --global yarn
#### Caddy
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy
#### Docker
The official instructions differ for different versions of Linux
We recommend contacting here - https://docs.docker.com/engine/install/ 

#### Managing Docker on behalf of a non-root user
This is necessary in order to execute scripts with the docker cli without using sudo.

Instructions - https://docs.docker.com/engine/install/linux-postinstall/

Example:

    sudo groupadd docker
    sudo usermod -aG docker $USER
    newgrp docker
    service docker start

### Installing the V-cana Intranet

In our test, we emulated the installation on a computer that works completely without the Internet.

For successful installation in this case, you need to prepare docker images on a computer with the Internet.

#### Download the [archive](https://github.com/texttree/v-cana/releases/download/v0.1.0/intranet-server.zip)

Unzip it. 

#### Run export-images.sh

    bash export-images.sh

As a result, an archive will be saved in the root of the folder `docker-images.gz`.

From this point on, you can copy the entire folder to the computer prepared for the installation of the V-CANA Intranet.

#### Run install-images.sh

    bash install-images.sh

It will unpack and install all the necessary docker images.

#### Run install-vcana.sh

    bash install-vcana.sh

It will download the latest version of the V-CANA application from github and configure the necessary folders for the server side to work.

#### Run prepare-network.sh

    bash prepare-network.sh

It will help you set up all the files responsible for configuring the server and network.

#### Run the file run.sh

    bash run.sh

The script runs all containers.

Access to V-CANA on the server will be at `http://localhost:4004`

Access to the server emulating dcs will be at `http://localhost:4008`

### Loading local resources

For V-CANA Intranet to work successfully, you need locally downloaded archives of resources from which you will translate:
literal Bible, simplified Bible, tNotes, tWords, tWordsLinks, tQuestions, Greek Bible and Hebrew Bible.

You can download it on the https://git.door43.org.

Then go to the url http://localhost:4008.

Here, in the `owner` field, write the owner of the repo, let's say `unfoldingWord`, and in the `repo` name field, let's say `en_ult`, select the archive and click `Submit`. So you need to download all the resources.

Remember the `owner` and `repo`, they will be useful to you further.

### Connecting to the server

The scheme only works for users within the same network.
Connect all devices to the same network. Then start the server. After successfully launching all containers, need to find out the ip address of the server. This can be found out both from the network properties and in the configuration file, which will be overwritten every time the server is started - `.env`

The received ip address is entered into any client browser with the required port. 

`[BASE_HOST]:4008` - V-CANA application

`[BASE_HOST]:4004` - resource settings and updates page.

### Creating users

Before creating a project, you need to create a user who has the maximum level of access to all pages.

To do this, go to the `[BASE_HOST]:4008/users/create` page, enter your email, username and password and register. Only the first created user gets root rights, all subsequent users will be regular users of the application.

### Creating a project

 Fill in all the fields in the tab "Create a project"

  In field `methods` choose value `cana-bible-eng` or `cana-obs-eng`

  In fields `List of resources` add resources url from `[BASE_HOST]:4008`

  Using the `owner` and `repo` from the step <a href="#loading-local-resources">Loading local resources</a>
     
  **literal**
  ```sh 
  http://192.168.1.12:4008/unfoldingWord/en_ult/src/commit/master
  ```
  **simplified**
  ```sh
  http://192.168.1.12:4008/unfoldingWord/en_ult/src/commit/master
  ```
  **tnotes**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_tn/commit/master
  ```
  **tquestions**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_tq/commit/master
  ```
  **twords**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_twl/commit/master
  ```
  or

  **obs**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_obs/commit/master    
  ```
  **tnotes**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_obs-tn/commit/master
  ```
  **tquestions**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_obs-tq/commit/master
  ```
  **twords**
  ```sh
  https://192.168.1.12:4008/unfoldingWord/en_obs-twl/commit/master
  ```

Then click `Create project`

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage/Integration

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [] Feature 1
- [] Feature 2
- [] Feature 3
    - [] Nested Feature

See the [open issues](https://github.com/texttree/v-cana/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.  [Guidelines for external contributions.](https://forum.door43.org)

You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

If you would like to fork the repo and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See [LICENSE][license-url] for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Discord: [V-CANA](https://discord.com/channels/867746700390563850/943625065415716905)

Project Link: [https://github.com/texttree/v-cana](https://github.com/texttree/v-cana)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/texttree/v-cana.svg?style=for-the-badge
[contributors-url]: https://github.com/texttree/v-cana/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/texttree/v-cana.svg?style=for-the-badge
[forks-url]: https://github.com/texttree/v-cana/network/members
[stars-shield]: https://img.shields.io/github/stars/texttree/v-cana.svg?style=for-the-badge
[stars-url]: https://github.com/texttree/v-cana/stargazers
[issues-shield]: https://img.shields.io/github/issues/texttree/v-cana.svg?style=for-the-badge
[issues-url]: https://github.com/texttree/v-cana/issues
[license-shield]: https://img.shields.io/github/license/texttree/v-cana.svg?style=for-the-badge
[license-url]: https://github.com/texttree/v-cana/blob/master/LICENSE
