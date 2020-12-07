# WorKn_Backend

This repository contains WorKn's Node.js backend code, including models, controllers, routes, and server. This repository is for educational purposes, intending to prepare and design a graduate-level proposal for graduation.

This repository is only for the backend, to access the frontend click [here](https://github.com/WorKn/WorKn_Frontend/tree/develop).

## Essentially, what is Workn?
Workn is a web platform, whose main goal is to make a "match" or combination between two people, an employer or job offeror, and a person who is looking to meet this need, the match is made automatically based on variables such as the skill set or occupation of the person and the requirements of the job offer, in this way the most suitable employees are located for the offers. 

In addition to this main functionality, it will also allow the manual search for people and offers. In short, a smart jobs platform.

## The Motivation and Concept

The Workn platform was born as a result of a resident improvement opportunity in the field of platforms for obtaining employment in the Dominican Republic. After the conception of the idea, with a survey, we found out that although there are various applications and sites that meet this objective, none of them meets all the specific objectives.

## Development environment

For our project, we're using `vscode` with `Prettier` and `Cython` for code writing, `mongodb` as our database, and `postman` for testing.

## Running the repository

To start the project you have to:

1. `git clone https://github.com/WorKn/WorKn_Backend.git`
2. `npm install`
3. `npm run start`

If you want to start a development environment, please run instead `npm run start:dev` on step 3.

The server will be running on `127.0.0.1:3000`

## Build options

Once you have your copy of `WorKn_Backend` you'll need to prepare a `.env` file for a proper execution.

1. Create a .env file on the `root` path.
2. Set `PORT=3000`.
3. Create `DATABASE_HOST`, `DATABASE_HOST_LOCAL`, `DATABASE_PASSWORD`, `DATABASE_NAME` variables and
   according to your database, assign values to those variables.

## Layout

- Controllers are in `/controllers`
- Models are in `/models`
- Node routes for endpoints and middleware are in `/routes`
- Local schemas are in `/schemas`
- Auxiliar functions are in `/utils`

## Contribution

Please, make sure you have `Prettier` installed before doing any contribution to avoid any conflict in the future.

To contribute this project, make a change in your local branch then do a pull request into `development` with your changes and how to use the implementation,
then we're gonna evaluate your request.

Your contribution must be in `English`, we're not accepting any request in any nother language. Your contributions are important to us, so please, if you can't write an english request, use a translator.

# Support

Contact Us!
Email: workninfo@gmail.com.
