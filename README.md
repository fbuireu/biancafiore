[![Netlify Status](https://api.netlify.com/api/v1/badges/0719dd8b-1088-4561-8df9-64263f7ffbc8/deploy-status)](https://app.netlify.com/sites/biancafiore/deploys)

# Instructions to build it locally

- Use correct Node version (`.nvmrc`) in the root of the project. It's currently working on `v14.17.0` so:
    - Run:
  ```
  nvm install 14.17.0
  ``` 
    - Then:
  ```
  nvm use
  ```
- Install the dependencies with:
  ```
  yarn install
  ```
- Start the develop process locally the project with:
  ```
  yarn start
  ```
- Check http://localhost:8000/en in your browser

If for some reason it breaks or fails at any step, please don't hesitate to contact me. I've tested as well as in
Windows and MacOS and it is supposed to work.

# Cool stuff about the project

As I mentioned this project is under construction and some parts need to be refactored (I'm not it). It
has been a mix between my own testing and a presentation site.
Essentially this site is a portfolio for my girlfriend, who when I started the coding was a content
writer. I'll be happy to dive into technical details. This is not meant to be a Quijote sequel.

The project uses Netlify as a headless CMS, the configuration is completely custom and is
under `/static/admin/config.yml`. Despite the fact that when building it locally you will see
the http://localhost:8000/admin
available, you won't be able to access for security reasons. I'll be happy to show you its insides.

The about (http://localhost:8000/en/about-me/) page includes a fun map that shows where my girlfriend lived, using
Amcharts. The plane moves and changes the position of the slider and viceversa.

More cool stuff can be found in the contact form (http://localhost:8000/en/contact/), which is completely dynamic and
accepts
any kind of field as long as it respects the original structure. For this purpose, I've used a map that holds the type
and the
corresponding component to display, all automated and with validations.
The form, once triggered, shows a cheeky animation and emails me via webhook.

More interesting details can be found in the filter in the blog (http://localhost:8000/en/blog/), project (still
unstyled: http://localhost:8000/en/projects/) and tags (https://biancafiore.me/en/tag/writing-tips/) section which uses
Algolia to refine the results. I've extended the default functionality using some HOC to tweak the default behavior and
adding some extra features like the "reading time" bar.

I think this should cover most of the project. I'll be available for any clarifications

Thanks!
