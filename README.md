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
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
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

The online version of v-cana consists of 2 parts:
1. The Supabase project, which allows you to store data.
2. The NextJS application.


<!-- ### Prerequisites -->


### Installation/First Steps

1. Install Supabase CLI.
[Guide for installation. ](https://supabase.com/docs/guides/cli/getting-started#installing-the-supabase-cli)

    macOS

    Install the CLI with Homebrew:

    ```sh
    brew install supabase/tap/supabase
    ```

    Windows

    Install the CLI with Scoop:

    ```sh
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
    ```

    Linux

    The CLI is available through Homebrew and Linux packages.
    
    Homebrew
    ```sh
    brew install supabase/tap/supabase
    ```

    Linux packages

    Linux packages are provided in Releases.
    To install, download the .apk/.deb/.rpm file depending on your package manager
    and run one of the following:

    - ```sudo apk add --allow-untrusted <...>.apk```
    - ```sudo dpkg -i <...>.deb```
    - ```sudo rpm -i <...>.rpm```

2. Clone the repo
   ```sh
   git clone https://github.com/texttree/v-cana.git
   ```

3. Install NPM packages
   ```sh
   npm install
   ```
   or if you use yarn 
   ```sh
   yarn
   ```
4. Start supabase project
  
   ```sh
   supabase start
   ```
5. After the previous step is successful, information about the database configuration will appear

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
    You need to copy this information to .env.local
    
    ```API URL``` to 
    ```SUPABASE_URL and  NEXT_PUBLIC_SUPABASE_URL```

    ```anon key``` to
    ```NEXT_PUBLIC_SUPABASE_ANON_KEY```

    ```service_role``` to
    ```SUPABASE_SERVICE_KEY```

6. Start project localy

    ```npm run dev``` or ```yarn dev```

7. Create first user

    Open ```http://localhost:3000/users/create``` and then create new users with login and email.

8. Sign in

    Authenticate under the created user

    Open ```http://localhost:3000``` and sign in.

9. Agreements

    After the first login to the site, the agreements page will open.

    After all the agreements are marked, the user's personal account will open.

    The first user is created with administrator rights, so the ```Create a project``` tab is available to him.

    
9. Create new project   

    Fill in all the fields in the tab "Create a project"

    In field ```methods``` choose value ```cana-bible-eng``` or ```cana-obs-eng```

    In fields ```List of resources``` add resources url from git.door43.org.

    For example:

    ```sh    
    literal: https://git.door43.org/unfoldingWord/en_ult/commit/155ef870f6ea832e568a90ed0c000d3dfc15de6f
    simplified: https://git.door43.org/unfoldingWord/en_ust/commit/e000eb13414df7a356efc23fd41e81eda2478065
    tnotes: https://git.door43.org/unfoldingWord/en_tn/commit/5a2ea85b908ddb6c25cbb7978a298babd5c21003
    tquestions: https://git.door43.org/unfoldingWord/en_tq/commit/4a886af618637e08094f0d1193fb56c345963afa
    twords: https://git.door43.org/unfoldingWord/en_twl/commit/8534077f7d32743eafa0e98b4088ef75f49027e7
    ```
    or

    ```sh    
    obs: https://git.door43.org/unfoldingWord/en_obs/commit/07d949fbab7be5e967b385f4da5d034fae1b9b32    
    tnotes: https://git.door43.org/unfoldingWord/en_obs-tn/commit/9407660e7e453348174843436c1053dd78f26320
    tquestions: https://git.door43.org/unfoldingWord/en_obs-tq/commit/0ee93b9dbb5f5e89580c8bfa6f9c1d07976536ed
    twords: https://git.door43.org/unfoldingWord/en_obs-twl/commit/44ebc9fafe8101665f985007d566f5036a2be85b
    ```
10. Start translate

    Choose and add translator.

    Create book in list of books. Then create chapter in list of chapters. Then in assigment page push button ```Select all```, then ```Assign``` and ```Start the chapter```.

    After that, a link to the translate will appear in your personal account. 

     








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
